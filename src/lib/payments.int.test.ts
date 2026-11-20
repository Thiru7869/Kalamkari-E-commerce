import { createHmac } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { confirmOrderPaid, recordPaymentFailure } from '@/lib/order-payment';
import { grantOrderAccess } from '@/lib/order-access';
import { isRazorpayConfigured } from '@/lib/payments';
import { POST as razorpayRoute } from '@/app/api/razorpay/route';
import { POST as webhookRoute } from '@/app/api/razorpay/webhook/route';
import { testState } from '@/test/state';
import { makeOrder, makeProduct, makeUser, orderOf, stockOf } from '@/test/fixtures';

/**
 * Payment confirmation, the Razorpay routes and the webhook, against a real
 * database. Razorpay's own HTTP API is the only thing faked, because it is the
 * only thing that is not ours.
 */

const KEY_ID = 'rzp_test_keyid';
const KEY_SECRET = 'rzp-key-secret-for-tests';
const HOOK_SECRET = 'rzp-webhook-secret-for-tests';

function configureRazorpay(over: Partial<Record<'id' | 'secret' | 'hook', string>> = {}) {
  vi.stubEnv('RAZORPAY_KEY_ID', over.id ?? KEY_ID);
  vi.stubEnv('RAZORPAY_KEY_SECRET', over.secret ?? KEY_SECRET);
  vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', over.hook ?? HOOK_SECRET);
}

/* ------------------------------ fake Razorpay ----------------------------- */

type FakePayment = { id: string; order_id: string; amount: number; currency: string; status: string };
let rzpOrdersCreated = 0;
let rzpPayments = new Map<string, FakePayment>();

function installFakeRazorpay() {
  rzpOrdersCreated = 0;
  rzpPayments = new Map();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/v1/orders') && init?.method === 'POST') {
        rzpOrdersCreated += 1;
        const payload = JSON.parse(String(init.body));
        return Response.json({
          id: `order_fake${rzpOrdersCreated}`,
          amount: payload.amount,
          currency: payload.currency,
          status: 'created',
        });
      }
      const payment = /\/v1\/payments\/([^/?]+)/.exec(url)?.[1];
      if (payment && rzpPayments.has(payment)) return Response.json(rzpPayments.get(payment));
      return new Response('not found', { status: 404 });
    }),
  );
}

const post = (url: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(`http://localhost${url}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const browserSignature = (orderId: string, paymentId: string) =>
  createHmac('sha256', KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');

function webhookRequest(
  body: object,
  opts: { eventId?: string; secret?: string; signature?: string } = {},
) {
  const raw = JSON.stringify(body);
  const signature =
    opts.signature ?? createHmac('sha256', opts.secret ?? HOOK_SECRET).update(raw).digest('hex');
  return post('/api/razorpay/webhook', raw, {
    'x-razorpay-signature': signature,
    ...(opts.eventId ? { 'x-razorpay-event-id': opts.eventId } : {}),
  });
}

const capturedEvent = (o: {
  orderNumber: string;
  rzpOrderId: string;
  payId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  event?: string;
}) => ({
  event: o.event ?? 'payment.captured',
  payload: {
    payment: {
      entity: {
        id: o.payId ?? 'pay_1',
        order_id: o.rzpOrderId,
        amount: o.amount ?? 500_000,
        currency: o.currency ?? 'INR',
        status: o.status ?? 'captured',
        notes: { orderNumber: o.orderNumber },
      },
    },
  },
});

let seq = 0;
const unique = (prefix: string) => `${prefix}_${Date.now()}_${(seq += 1)}`;

/** A pending online order for a piece that is already sold (stock 0). */
async function pendingOnlineOrder(over: { total?: number } = {}) {
  const product = await makeProduct({ stock: 0 });
  const rzpOrderId = unique('order');
  const order = await makeOrder({
    status: 'PENDING',
    paymentMethod: 'RAZORPAY',
    paymentStatus: 'PENDING',
    razorpayOrderId: rzpOrderId,
    total: over.total ?? 500_000,
    lines: [{ productId: product.id, quantity: 1 }],
  });
  return { product, order, rzpOrderId };
}

const receiptsFor = (number: string) =>
  testState.sent.filter((m) => m.subject.includes(number) && /order/i.test(m.subject));

beforeEach(() => {
  configureRazorpay();
  installFakeRazorpay();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/* -------------------------------------------------------------------------- */

describe('confirmOrderPaid', () => {
  const pay = (order: { number: string }, rzpOrderId: string, over: Record<string, unknown> = {}) =>
    confirmOrderPaid({
      orderNumber: order.number,
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: 'pay_1',
      amount: 500_000,
      currency: 'INR',
      source: 'webhook',
      ...over,
    });

  it('confirms a pending order, exactly once, with a receipt to customer and store', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();

    expect(await pay(order, rzpOrderId)).toEqual({ outcome: 'confirmed' });

    const after = await orderOf(order.id);
    expect(after).toMatchObject({ status: 'CONFIRMED', paymentStatus: 'PAID', razorpayPaymentId: 'pay_1' });
    expect(after.confirmedAt).not.toBeNull();
    expect(receiptsFor(order.number)).toHaveLength(2);
  });

  it('eight simultaneous confirmations produce one confirmation, one event, two emails', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();

    const results = await Promise.all(Array.from({ length: 8 }, () => pay(order, rzpOrderId)));

    expect(results.filter((r) => r.outcome === 'confirmed')).toHaveLength(1);
    expect(results.filter((r) => r.outcome === 'already-paid')).toHaveLength(7);
    expect(await prisma.orderEvent.count({ where: { orderId: order.id, status: 'CONFIRMED' } })).toBe(1);
    expect(receiptsFor(order.number)).toHaveLength(2);
  });

  it('a second delivery after the first is a harmless no-op', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    await pay(order, rzpOrderId);
    testState.sent.length = 0;

    expect(await pay(order, rzpOrderId)).toEqual({ outcome: 'already-paid' });
    expect(testState.sent).toHaveLength(0);
  });

  describe('amount and currency', () => {
    it.each([
      ['less than the total', { amount: 100 }],
      ['more than the total', { amount: 900_000 }],
      ['zero', { amount: 0 }],
      ['negative', { amount: -500_000 }],
      ['a different currency', { currency: 'USD' }],
      ['no currency', { currency: '' }],
    ])('does not confirm a payment of %s', async (_label, over) => {
      const { order, rzpOrderId } = await pendingOnlineOrder();

      expect(await pay(order, rzpOrderId, over)).toEqual({ outcome: 'amount-mismatch' });

      expect(await orderOf(order.id)).toMatchObject({ status: 'PENDING', paymentStatus: 'PENDING' });
      expect(receiptsFor(order.number)).toHaveLength(0);
    });
  });

  describe('wrong order', () => {
    it('does not confirm against a different Razorpay order id', async () => {
      const { order } = await pendingOnlineOrder();
      expect(await pay(order, 'order_SOMEONE_ELSES')).toEqual({ outcome: 'mismatched-order' });
      expect((await orderOf(order.id)).status).toBe('PENDING');
    });

    it('does not confirm an order that never started an online payment', async () => {
      const order = await makeOrder({ status: 'PENDING', razorpayOrderId: null });
      expect(await pay(order, 'order_anything')).toEqual({ outcome: 'mismatched-order' });
    });

    it('reports an unknown order', async () => {
      expect(await pay({ number: 'SVL-ZZZZZZZZ' }, 'order_x')).toEqual({ outcome: 'not-found' });
    });
  });

  describe('a payment that arrives after the order was cancelled', () => {
    it('never restores the order or touches the stock that was released', async () => {
      const { product, order, rzpOrderId } = await pendingOnlineOrder();

      // The customer cancels: the piece goes back on sale, and somebody buys it.
      const { transitionOrder } = await import('@/lib/order-state');
      await transitionOrder({ orderId: order.id, to: 'CANCELLED', actor: 'customer' });
      expect(await stockOf(product.id)).toBe(1);
      await prisma.product.update({ where: { id: product.id }, data: { stock: 0 } }); // sold again

      // Then the first customer's payment lands.
      expect(await pay(order, rzpOrderId)).toEqual({ outcome: 'late-payment' });

      const after = await orderOf(order.id);
      expect(after.status).toBe('CANCELLED');
      expect(after.paymentStatus).toBe('LATE_PAID');
      expect(after.razorpayPaymentId).toBe('pay_1');
      expect(await stockOf(product.id)).toBe(0); // the second buyer's piece is untouched
    });

    it('records it for refund and tells the store, once', async () => {
      const { order, rzpOrderId } = await pendingOnlineOrder();
      const { transitionOrder } = await import('@/lib/order-state');
      await transitionOrder({ orderId: order.id, to: 'CANCELLED', actor: 'admin' });
      testState.sent.length = 0;

      await pay(order, rzpOrderId);
      await pay(order, rzpOrderId); // redelivery
      await pay(order, rzpOrderId);

      const alerts = testState.sent.filter((m) => m.subject.startsWith('Refund needed'));
      expect(alerts).toHaveLength(1);
      expect(alerts[0].to).toBe('store@example.test');
      expect(alerts[0].text).toContain('pay_1');
      // And the customer is not sent an "order confirmed" receipt for it.
      expect(testState.sent.filter((m) => /confirm/i.test(m.subject))).toHaveLength(0);
      expect(
        await prisma.orderEvent.count({ where: { orderId: order.id, message: { contains: 'after this order was cancelled' } } }),
      ).toBe(1);
    });

    it('a repeat of the late payment is reported as already handled', async () => {
      const { order, rzpOrderId } = await pendingOnlineOrder();
      const { transitionOrder } = await import('@/lib/order-state');
      await transitionOrder({ orderId: order.id, to: 'CANCELLED', actor: 'admin' });
      await pay(order, rzpOrderId);
      expect(await pay(order, rzpOrderId)).toEqual({ outcome: 'already-paid' });
    });
  });

  it('survives cancel and payment racing each other, in either order, without corrupting stock', async () => {
    const { transitionOrder } = await import('@/lib/order-state');
    const outcomes = new Set<string>();

    for (let i = 0; i < 20; i += 1) {
      const { product, order, rzpOrderId } = await pendingOnlineOrder();

      await Promise.all([
        pay(order, rzpOrderId),
        transitionOrder({ orderId: order.id, to: 'CANCELLED', actor: 'customer' }),
      ]);

      const after = await orderOf(order.id);
      const stock = await stockOf(product.id);
      outcomes.add(`${after.status}/${after.paymentStatus}`);

      if (after.status === 'CONFIRMED') {
        // Payment won: it is a paid order and the piece stays sold.
        expect(after.paymentStatus).toBe('PAID');
        expect(stock).toBe(0);
      } else {
        // Cancellation won: the piece is back on sale exactly once, and the
        // payment that missed it is recorded for refund. (Cancel can also
        // lose the race to a payment and be refused; that is the branch above.)
        expect(after.status).toBe('CANCELLED');
        expect(after.paymentStatus).toBe('LATE_PAID');
        expect(stock).toBe(1);
      }
    }
    expect(outcomes.size).toBeGreaterThan(0);
  });
});

describe('recordPaymentFailure', () => {
  it('marks a waiting order as failed and says so on the timeline', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    await recordPaymentFailure({ razorpayOrderId: rzpOrderId, reason: 'declined' });
    expect((await orderOf(order.id)).paymentStatus).toBe('FAILED');
  });

  it('can never overwrite a payment that succeeded', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    await confirmOrderPaid({
      orderNumber: order.number,
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: 'pay_1',
      amount: 500_000,
      currency: 'INR',
      source: 'webhook',
    });
    await recordPaymentFailure({ razorpayOrderId: rzpOrderId, reason: 'a late failure event' });
    expect((await orderOf(order.id)).paymentStatus).toBe('PAID');
  });

  it('does not touch an order that has moved on', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    const { transitionOrder } = await import('@/lib/order-state');
    await transitionOrder({ orderId: order.id, to: 'CANCELLED', actor: 'admin' });
    await recordPaymentFailure({ razorpayOrderId: rzpOrderId, reason: 'x' });
    expect((await orderOf(order.id)).paymentStatus).toBe('PENDING');
  });
});

/* -------------------------------------------------------------------------- */

describe('POST /api/razorpay — create', () => {
  const create = (orderNumber: string) => razorpayRoute(post('/api/razorpay', { action: 'create', orderNumber }));

  /** A fresh online order with no Razorpay order yet, and this browser entitled to it. */
  async function startable() {
    const product = await makeProduct({ stock: 0 });
    const order = await makeOrder({
      status: 'PENDING',
      paymentMethod: 'RAZORPAY',
      razorpayOrderId: null,
      lines: [{ productId: product.id, quantity: 1 }],
    });
    await grantOrderAccess(order.number);
    return order;
  }

  it('creates one Razorpay order and reuses it on every later call', async () => {
    const order = await startable();

    const first = await (await create(order.number)).json();
    const second = await (await create(order.number)).json();
    const third = await (await create(order.number)).json();

    expect(first.razorpayOrderId).toMatch(/^order_fake/);
    expect(second.razorpayOrderId).toBe(first.razorpayOrderId);
    expect(third.razorpayOrderId).toBe(first.razorpayOrderId);
    expect(rzpOrdersCreated).toBe(1);
    expect((await orderOf(order.id)).razorpayOrderId).toBe(first.razorpayOrderId);
  });

  it('five simultaneous calls end with one stored id, and everyone is told that one', async () => {
    const order = await startable();

    const bodies = await Promise.all(
      Array.from({ length: 5 }, async () => (await create(order.number)).json()),
    );

    const stored = (await orderOf(order.id)).razorpayOrderId;
    expect(stored).not.toBeNull();
    expect(new Set(bodies.map((b) => b.razorpayOrderId))).toEqual(new Set([stored]));
  });

  it('charges the amount on the order, never one supplied by the caller', async () => {
    const order = await startable();
    const response = await razorpayRoute(
      post('/api/razorpay', { action: 'create', orderNumber: order.number, amount: 1, total: 1 }),
    );
    const body = await response.json();
    expect(body.amount).toBe(order.total);
    expect(body.currency).toBe('INR');
    expect(body.keyId).toBe(KEY_ID);
    const sent = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));
    expect(sent.amount).toBe(order.total);
  });

  it('never overwrites an id that already exists, even if asked again after a payment started', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    await grantOrderAccess(order.number);

    const body = await (await create(order.number)).json();

    expect(body.razorpayOrderId).toBe(rzpOrderId);
    expect(rzpOrdersCreated).toBe(0);
    expect((await orderOf(order.id)).razorpayOrderId).toBe(rzpOrderId);
  });

  describe('who may start a payment', () => {
    it('refuses a stranger who only knows the order number, and reveals nothing', async () => {
      const order = await makeOrder({ status: 'PENDING', paymentMethod: 'RAZORPAY' });
      const response = await create(order.number);
      expect(response.status).toBe(404);
      expect(rzpOrdersCreated).toBe(0);
      expect((await orderOf(order.id)).razorpayOrderId).toBeNull();
    });

    it('answers an order that does not exist exactly as it answers one that is not yours', async () => {
      const real = await makeOrder({ status: 'PENDING', paymentMethod: 'RAZORPAY' });
      const a = await create(real.number);
      const b = await create('SVL-ZZZZZZZZ');
      expect(a.status).toBe(b.status);
      expect(await a.json()).toEqual(await b.json());
    });

    it('refuses a hand-written cookie claiming the order', async () => {
      const order = await makeOrder({ status: 'PENDING', paymentMethod: 'RAZORPAY' });
      testState.cookies.set('svl_orders', order.number);
      expect((await create(order.number)).status).toBe(404);
    });

    it("lets the order's signed-in owner start it", async () => {
      const user = await makeUser();
      const order = await makeOrder({ status: 'PENDING', paymentMethod: 'RAZORPAY', userId: user.id });
      testState.session = { user: { id: user.id, role: 'CUSTOMER' } };
      expect((await create(order.number)).status).toBe(200);
    });

    it("does not let a different signed-in user start somebody else's", async () => {
      const owner = await makeUser();
      const other = await makeUser();
      const order = await makeOrder({ status: 'PENDING', paymentMethod: 'RAZORPAY', userId: owner.id });
      testState.session = { user: { id: other.id, role: 'CUSTOMER' } };
      expect((await create(order.number)).status).toBe(404);
    });
  });

  describe('orders that must not gain a live payment', () => {
    it.each([
      ['cancelled', { status: 'CANCELLED' }],
      ['already paid', { status: 'CONFIRMED', paymentStatus: 'PAID' }],
      ['cash on delivery', { status: 'CONFIRMED', paymentMethod: 'COD' as const }],
      ['past pending', { status: 'IN_PRODUCTION', paymentStatus: 'PENDING' }],
    ])('refuses an order that is %s', async (_label, over) => {
      const order = await makeOrder({ paymentMethod: 'RAZORPAY', ...over });
      await grantOrderAccess(order.number);
      const response = await create(order.number);
      expect(response.status).toBe(409);
      expect(rzpOrdersCreated).toBe(0);
    });
  });

  describe('configuration', () => {
    it('is unavailable without the webhook secret', async () => {
      vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', '');
      expect(isRazorpayConfigured()).toBe(false);
      const order = await startable();
      expect((await create(order.number)).status).toBe(503);
      expect(rzpOrdersCreated).toBe(0);
    });

    it('is unavailable without keys', async () => {
      vi.stubEnv('RAZORPAY_KEY_ID', '');
      vi.stubEnv('RAZORPAY_KEY_SECRET', '');
      expect((await create('SVL-ZZZZZZZZ')).status).toBe(503);
    });
  });

  it('rejects malformed input before touching anything', async () => {
    expect((await razorpayRoute(post('/api/razorpay', { action: 'create', orderNumber: 'nope' }))).status).toBe(400);
    expect((await razorpayRoute(post('/api/razorpay', '{not json'))).status).toBe(400);
    expect((await razorpayRoute(post('/api/razorpay', { action: 'explode' }))).status).toBe(400);
  });

  it('is rate limited, with a Retry-After', async () => {
    const order = await startable();
    let last: Response | null = null;
    for (let i = 0; i < 21; i += 1) last = await create(order.number);
    expect(last?.status).toBe(429);
    expect(Number(last?.headers.get('retry-after'))).toBeGreaterThan(0);
  });
});

/* -------------------------------------------------------------------------- */

describe('POST /api/razorpay — verify', () => {
  const verify = (o: { number: string }, rzpOrderId: string, payId: string, sig?: string) =>
    razorpayRoute(
      post('/api/razorpay', {
        action: 'verify',
        orderNumber: o.number,
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: payId,
        signature: sig ?? browserSignature(rzpOrderId, payId),
      }),
    );

  const registerPayment = (id: string, rzpOrderId: string, over: Partial<FakePayment> = {}) =>
    rzpPayments.set(id, { id, order_id: rzpOrderId, amount: 500_000, currency: 'INR', status: 'captured', ...over });

  it('confirms a genuine, captured payment of the right amount', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    registerPayment('pay_ok', rzpOrderId);

    const response = await verify(order, rzpOrderId, 'pay_ok');

    expect(response.status).toBe(200);
    expect(await orderOf(order.id)).toMatchObject({ status: 'CONFIRMED', paymentStatus: 'PAID' });
  });

  it('rejects a forged signature and changes nothing', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    registerPayment('pay_forged', rzpOrderId);
    const response = await verify(order, rzpOrderId, 'pay_forged', 'deadbeef'.repeat(8));
    expect(response.status).toBe(400);
    expect((await orderOf(order.id)).status).toBe('PENDING');
  });

  it('rejects a payment of the wrong amount even with a valid signature', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    registerPayment('pay_cheap', rzpOrderId, { amount: 100 });
    const response = await verify(order, rzpOrderId, 'pay_cheap');
    expect(response.status).toBe(400);
    expect((await orderOf(order.id)).status).toBe('PENDING');
  });

  it('rejects a payment in the wrong currency', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    registerPayment('pay_usd', rzpOrderId, { currency: 'USD' });
    expect((await verify(order, rzpOrderId, 'pay_usd')).status).toBe(400);
    expect((await orderOf(order.id)).status).toBe('PENDING');
  });

  it('does not confirm a payment that is only authorised, not captured', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    registerPayment('pay_auth', rzpOrderId, { status: 'authorized' });
    const response = await verify(order, rzpOrderId, 'pay_auth');
    expect(response.status).toBe(202);
    expect((await response.json()).pending).toBe(true);
    expect((await orderOf(order.id)).status).toBe('PENDING');
  });

  it("rejects a payment that Razorpay says belongs to a different order", async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    registerPayment('pay_other', 'order_a_different_one');
    // The caller signs the pairing they *claim*; Razorpay's record disagrees.
    const response = await verify(order, rzpOrderId, 'pay_other');
    expect(response.status).toBe(400);
    expect((await orderOf(order.id)).status).toBe('PENDING');
  });

  it('refuses to apply a payment to a cancelled order, and records it for refund', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    const { transitionOrder } = await import('@/lib/order-state');
    await transitionOrder({ orderId: order.id, to: 'CANCELLED', actor: 'admin' });
    registerPayment('pay_late', rzpOrderId);

    const response = await verify(order, rzpOrderId, 'pay_late');

    expect(response.status).toBe(409);
    const after = await orderOf(order.id);
    expect(after.status).toBe('CANCELLED');
    expect(after.paymentStatus).toBe('LATE_PAID');
  });

  it('is safe to call twice', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    registerPayment('pay_twice', rzpOrderId);
    expect((await verify(order, rzpOrderId, 'pay_twice')).status).toBe(200);
    expect((await verify(order, rzpOrderId, 'pay_twice')).status).toBe(200);
    expect(receiptsFor(order.number)).toHaveLength(2);
  });

  it('asks again later when Razorpay cannot be reached, rather than guessing', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    // No payment registered: the fake answers 404.
    const response = await verify(order, rzpOrderId, 'pay_unknown');
    expect(response.status).toBe(502);
    expect((await orderOf(order.id)).status).toBe('PENDING');
  });
});

/* -------------------------------------------------------------------------- */

describe('POST /api/razorpay/webhook', () => {
  const rows = (eventId: string) =>
    prisma.webhookEvent.findMany({ where: { provider: 'razorpay', eventId } });

  it('confirms a captured payment and writes the delivery down', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    const eventId = unique('evt');

    const response = await webhookRoute(
      webhookRequest(capturedEvent({ orderNumber: order.number, rzpOrderId }), { eventId }),
    );

    expect(response.status).toBe(200);
    expect(await orderOf(order.id)).toMatchObject({ status: 'CONFIRMED', paymentStatus: 'PAID' });
    const [row] = await rows(eventId);
    expect(row.type).toBe('payment.captured');
    expect(row.processedAt).not.toBeNull();
    expect(row.attempts).toBe(1);
  });

  it('a replayed delivery is acknowledged and ignored, however many times it comes', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    const eventId = unique('evt');
    const make = () => webhookRequest(capturedEvent({ orderNumber: order.number, rzpOrderId }), { eventId });

    const first = await (await webhookRoute(make())).json();
    expect(first.handled).toBe(true);
    for (let i = 0; i < 5; i += 1) {
      const replay = await webhookRoute(make());
      expect(replay.status).toBe(200);
      expect((await replay.json()).duplicate).toBe(true);
    }

    expect(await rows(eventId)).toHaveLength(1);
    expect(receiptsFor(order.number)).toHaveLength(2);
    expect(await prisma.orderEvent.count({ where: { orderId: order.id, status: 'CONFIRMED' } })).toBe(1);
  });

  it('six identical deliveries arriving at once confirm the order once', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    const eventId = unique('evt');

    const responses = await Promise.all(
      Array.from({ length: 6 }, () =>
        webhookRoute(webhookRequest(capturedEvent({ orderNumber: order.number, rzpOrderId }), { eventId })),
      ),
    );

    expect(responses.every((r) => r.status === 200)).toBe(true);
    expect(await rows(eventId)).toHaveLength(1);
    expect(await prisma.orderEvent.count({ where: { orderId: order.id, status: 'CONFIRMED' } })).toBe(1);
    expect(receiptsFor(order.number)).toHaveLength(2);
    expect((await orderOf(order.id)).paymentStatus).toBe('PAID');
  });

  it('dedupes on the event id: a processed event is not run again even if the order could take it', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    const eventId = unique('evt');
    await prisma.webhookEvent.create({
      data: { eventId, type: 'payment.captured', processedAt: new Date() },
    });

    const response = await webhookRoute(
      webhookRequest(capturedEvent({ orderNumber: order.number, rzpOrderId }), { eventId }),
    );

    expect((await response.json()).duplicate).toBe(true);
    expect((await orderOf(order.id)).status).toBe('PENDING');
  });

  it('retries an event that arrived but never finished', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    const eventId = unique('evt');
    await prisma.webhookEvent.create({ data: { eventId, type: 'payment.captured' } });

    const response = await webhookRoute(
      webhookRequest(capturedEvent({ orderNumber: order.number, rzpOrderId }), { eventId }),
    );

    expect(response.status).toBe(200);
    expect((await orderOf(order.id)).status).toBe('CONFIRMED');
    const [row] = await rows(eventId);
    expect(row.processedAt).not.toBeNull();
    expect(row.attempts).toBe(2);
  });

  it('returns 500 when recording the payment fails, leaves the event unfinished, and succeeds on retry', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    const eventId = unique('evt');
    const make = () => webhookRequest(capturedEvent({ orderNumber: order.number, rzpOrderId }), { eventId });

    const spy = vi.spyOn(prisma.order, 'findUnique').mockRejectedValueOnce(new Error('database went away'));
    const failed = await webhookRoute(make());
    spy.mockRestore();

    expect(failed.status).toBe(500);
    const [afterFailure] = await rows(eventId);
    expect(afterFailure.processedAt).toBeNull();
    expect(afterFailure.lastError).toMatch(/database went away/);
    expect((await orderOf(order.id)).status).toBe('PENDING');

    const retried = await webhookRoute(make());
    expect(retried.status).toBe(200);
    expect((await orderOf(order.id)).status).toBe('CONFIRMED');
  });

  it('falls back to a digest of the body when no event id header is sent, so replays still collapse', async () => {
    const { order, rzpOrderId } = await pendingOnlineOrder();
    const make = () => webhookRequest(capturedEvent({ orderNumber: order.number, rzpOrderId }));
    await webhookRoute(make());
    const replay = await (await webhookRoute(make())).json();
    expect(replay.duplicate).toBe(true);
    expect(receiptsFor(order.number)).toHaveLength(2);
  });

  describe('signature and configuration', () => {
    it('rejects a bad signature, and leaves no trace in the event log', async () => {
      const { order, rzpOrderId } = await pendingOnlineOrder();
      const eventId = unique('evt');
      const response = await webhookRoute(
        webhookRequest(capturedEvent({ orderNumber: order.number, rzpOrderId }), {
          eventId,
          signature: 'a'.repeat(64),
        }),
      );
      expect(response.status).toBe(401);
      expect(await rows(eventId)).toHaveLength(0);
      expect((await orderOf(order.id)).status).toBe('PENDING');
    });

    it('rejects a body signed with the wrong secret', async () => {
      const { order, rzpOrderId } = await pendingOnlineOrder();
      const response = await webhookRoute(
        webhookRequest(capturedEvent({ orderNumber: order.number, rzpOrderId }), { secret: 'not-the-secret' }),
      );
      expect(response.status).toBe(401);
      expect((await orderOf(order.id)).status).toBe('PENDING');
    });

    it('rejects a body altered after signing', async () => {
      const { order, rzpOrderId } = await pendingOnlineOrder();
      const original = JSON.stringify(capturedEvent({ orderNumber: order.number, rzpOrderId, amount: 100 }));
      const signature = createHmac('sha256', HOOK_SECRET).update(original).digest('hex');
      const tampered = original.replace('"amount":100', '"amount":500000');
      const response = await webhookRoute(
        post('/api/razorpay/webhook', tampered, { 'x-razorpay-signature': signature }),
      );
      expect(response.status).toBe(401);
      expect((await orderOf(order.id)).status).toBe('PENDING');
    });

    it('rejects a request with no signature at all', async () => {
      const response = await webhookRoute(post('/api/razorpay/webhook', { event: 'payment.captured' }));
      expect(response.status).toBe(400);
    });

    it('refuses everything when the webhook secret is not configured, and says why in the log', async () => {
      vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', '');
      const { order, rzpOrderId } = await pendingOnlineOrder();
      // Signed with an empty key: if the empty secret were accepted this would verify.
      const raw = JSON.stringify(capturedEvent({ orderNumber: order.number, rzpOrderId }));
      const signature = createHmac('sha256', '').update(raw).digest('hex');

      const response = await webhookRoute(post('/api/razorpay/webhook', raw, { 'x-razorpay-signature': signature }));

      expect(response.status).toBe(503);
      expect((await orderOf(order.id)).status).toBe('PENDING');
      expect(vi.mocked(console.error).mock.calls.flat().join(' ')).toMatch(/RAZORPAY_WEBHOOK_SECRET/);
    });
  });

  describe('what it will and will not act on', () => {
    it('does not confirm a payment whose amount does not match', async () => {
      const { order, rzpOrderId } = await pendingOnlineOrder();
      const response = await webhookRoute(
        webhookRequest(capturedEvent({ orderNumber: order.number, rzpOrderId, amount: 1 }), { eventId: unique('evt') }),
      );
      expect(response.status).toBe(200); // not retryable, so acknowledged
      expect((await response.json()).handled).toBe(false);
      expect((await orderOf(order.id)).status).toBe('PENDING');
    });

    it('does not confirm a payment with no amount in it', async () => {
      const { order, rzpOrderId } = await pendingOnlineOrder();
      const event = capturedEvent({ orderNumber: order.number, rzpOrderId });
      delete (event.payload.payment.entity as { amount?: number }).amount;
      await webhookRoute(webhookRequest(event, { eventId: unique('evt') }));
      expect((await orderOf(order.id)).status).toBe('PENDING');
    });

    it('does not treat an authorised-only payment as money', async () => {
      const { order, rzpOrderId } = await pendingOnlineOrder();
      await webhookRoute(
        webhookRequest(capturedEvent({ orderNumber: order.number, rzpOrderId, status: 'authorized' }), { eventId: unique('evt') }),
      );
      expect((await orderOf(order.id)).status).toBe('PENDING');
    });

    it('a note cannot redirect a payment to another order', async () => {
      const a = await pendingOnlineOrder();
      const b = await pendingOnlineOrder();
      // Genuine payment for A, but the note names B.
      await webhookRoute(
        webhookRequest(capturedEvent({ orderNumber: b.order.number, rzpOrderId: a.rzpOrderId }), { eventId: unique('evt') }),
      );
      expect((await orderOf(a.order.id)).status).toBe('PENDING');
      expect((await orderOf(b.order.id)).status).toBe('PENDING');
    });

    it('a payment.failed event cannot undo a payment that succeeded', async () => {
      const { order, rzpOrderId } = await pendingOnlineOrder();
      await webhookRoute(webhookRequest(capturedEvent({ orderNumber: order.number, rzpOrderId }), { eventId: unique('evt') }));
      await webhookRoute(
        webhookRequest(
          capturedEvent({ orderNumber: order.number, rzpOrderId, event: 'payment.failed', status: 'failed' }),
          { eventId: unique('evt') },
        ),
      );
      expect(await orderOf(order.id)).toMatchObject({ status: 'CONFIRMED', paymentStatus: 'PAID' });
    });

    it('a payment landing on a cancelled order is recorded for refund, and the store is told once', async () => {
      const { order, rzpOrderId } = await pendingOnlineOrder();
      const { transitionOrder } = await import('@/lib/order-state');
      await transitionOrder({ orderId: order.id, to: 'CANCELLED', actor: 'customer' });
      testState.sent.length = 0;
      const make = (eventId: string) =>
        webhookRequest(capturedEvent({ orderNumber: order.number, rzpOrderId }), { eventId });

      await webhookRoute(make(unique('evt')));
      await webhookRoute(make(unique('evt'))); // a *different* delivery of the same payment

      const after = await orderOf(order.id);
      expect(after).toMatchObject({ status: 'CANCELLED', paymentStatus: 'LATE_PAID' });
      expect(testState.sent.filter((m) => m.subject.startsWith('Refund needed'))).toHaveLength(1);
    });

    it('acknowledges events it has no use for', async () => {
      const response = await webhookRoute(webhookRequest({ event: 'settlement.processed' }, { eventId: unique('evt') }));
      expect(response.status).toBe(200);
      expect((await response.json()).handled).toBe(false);
    });
  });
});
