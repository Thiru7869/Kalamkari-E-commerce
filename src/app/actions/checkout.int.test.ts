import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { addToCart, removeCartItem, toggleWishlist, updateCartItem } from '@/app/actions/cart';
import { placeOrder } from '@/app/actions/checkout';
import { submitCommission, submitEnquiry, subscribeNewsletter } from '@/app/actions/forms';
import { hasOrderAccess } from '@/lib/order-access';
import { RATE_LIMITED_MESSAGE } from '@/lib/rate-limit';
import { runAs, testState, TestRedirect } from '@/test/state';
import { makeOrder, makeProduct, makeUser, stockOf } from '@/test/fixtures';

/**
 * Cart and checkout through the real server actions and a real database:
 * hostile quantities, the COD and online paths, and many shoppers racing for
 * one piece.
 */

const initial = { status: 'idle' as const };

function checkoutForm(over: Record<string, string> = {}) {
  const form = new FormData();
  const fields: Record<string, string> = {
    fullName: 'Asha Rao',
    email: `asha-${Math.random().toString(36).slice(2)}@example.test`,
    phone: '9876543210',
    line1: '12 Temple Street',
    city: 'Srikalahasti',
    state: 'Andhra Pradesh',
    postalCode: '517644',
    country: 'India',
    paymentMethod: 'COD',
    ...over,
  };
  for (const [k, v] of Object.entries(fields)) form.set(k, v);
  return form;
}

/** Runs placeOrder and returns where it redirected, or the error state it returned. */
async function place(over: Record<string, string> = {}) {
  try {
    const state = await placeOrder(initial, checkoutForm(over));
    return { state, redirect: null as string | null };
  } catch (error) {
    if (error instanceof TestRedirect) return { state: null, redirect: error.url };
    throw error;
  }
}

const cartRows = async (productId: string) =>
  prisma.cartItem.findMany({ where: { productId } });

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

/* -------------------------------------------------------------------------- */

describe('hostile cart quantities', () => {
  const hostile: [string, number][] = [
    ['negative', -5],
    ['minus one', -1],
    ['zero', 0],
    ['fractional', 1.5],
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['negative Infinity', Number.NEGATIVE_INFINITY],
    ['absurdly large', 1e9],
    ['beyond float precision', 1e21],
    ['just over the cap', 11],
  ];

  it.each(hostile)('addToCart refuses a %s quantity and stores nothing', async (_label, quantity) => {
    const product = await makeProduct({ stock: 5 });

    const result = await addToCart(product.id, quantity);

    expect(result.ok).toBe(false);
    expect(await prisma.cartItem.count({ where: { productId: product.id } })).toBe(0);
    expect(await stockOf(product.id)).toBe(5);
    // Not even an empty cart is created for a request that was never valid.
    expect(testState.cookies.has('svl_cart')).toBe(false);
  });

  it('refuses non-numbers smuggled past the types', async () => {
    const product = await makeProduct({ stock: 5 });
    for (const bad of ['2', null, undefined, {}, [], true] as unknown[]) {
      // `undefined` takes the default of 1, which is legitimate; the rest are not.
      const result = await addToCart(product.id, bad as number);
      if (bad === undefined) expect(result.ok).toBe(true);
      else expect(result.ok).toBe(false);
    }
  });

  it('a negative add cannot turn into a discount or extra stock at checkout', async () => {
    const real = await makeProduct({ stock: 1, price: 500_000 });
    const cheap = await makeProduct({ stock: 1, price: 100 });

    expect((await addToCart(real.id, 1)).ok).toBe(true);
    expect((await addToCart(cheap.id, -5)).ok).toBe(false);

    const { state, redirect } = await place();
    expect(state).toBeNull();
    const order = await prisma.order.findFirstOrThrow({
      where: { items: { some: { productId: real.id } } },
      include: { items: true },
    });
    expect(redirect).toBe(`/checkout/confirmation/${order.number}`);
    expect(order.items).toHaveLength(1);
    expect(order.subtotal).toBe(500_000);
    expect(await stockOf(cheap.id)).toBe(1); // not 6
    expect(await stockOf(real.id)).toBe(0);
  });

  it('updateCartItem refuses negatives and fractions, and the line is left as it was', async () => {
    const product = await makeProduct({ stock: 5 });
    await addToCart(product.id, 2);
    const [line] = await cartRows(product.id);
    expect(line.quantity).toBe(2);

    for (const bad of [-1, -50, 1.5, Number.NaN, 1e9, 11]) {
      const result = await updateCartItem(line.id, bad);
      expect(result.ok).toBe(false);
      expect((await prisma.cartItem.findUniqueOrThrow({ where: { id: line.id } })).quantity).toBe(2);
    }
  });

  it('updateCartItem still lets the stepper set a valid quantity and remove with zero', async () => {
    const product = await makeProduct({ stock: 5 });
    await addToCart(product.id, 1);
    const [line] = await cartRows(product.id);

    expect((await updateCartItem(line.id, 3)).ok).toBe(true);
    expect((await prisma.cartItem.findUniqueOrThrow({ where: { id: line.id } })).quantity).toBe(3);

    expect((await updateCartItem(line.id, 0)).ok).toBe(true);
    expect(await prisma.cartItem.count({ where: { id: line.id } })).toBe(0);
  });

  it('refuses more than the stock holds', async () => {
    const product = await makeProduct({ stock: 1 });
    expect((await addToCart(product.id, 1)).ok).toBe(true);
    const again = await addToCart(product.id, 1);
    expect(again.ok).toBe(false);
    expect((await cartRows(product.id))[0].quantity).toBe(1);
  });

  it('refuses malformed ids without throwing', async () => {
    expect((await addToCart('', 1)).ok).toBe(false);
    expect((await addToCart('x'.repeat(500), 1)).ok).toBe(false);
    expect((await updateCartItem('', 1)).ok).toBe(false);
    expect((await removeCartItem('')).ok).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */

describe('cash on delivery checkout', () => {
  it('still works end to end', async () => {
    const product = await makeProduct({ stock: 1, price: 500_000 });
    await addToCart(product.id, 1);

    const { state, redirect } = await place({ paymentMethod: 'COD' });

    expect(state).toBeNull();
    const order = await prisma.order.findFirstOrThrow({
      where: { items: { some: { productId: product.id } } },
      include: { items: true, events: true },
    });
    expect(redirect).toBe(`/checkout/confirmation/${order.number}`);
    expect(order).toMatchObject({ status: 'CONFIRMED', paymentMethod: 'COD', paymentStatus: 'PENDING' });
    expect(order.confirmedAt).not.toBeNull();
    expect(order.total).toBe(500_000 + order.shipping);
    expect(order.events).toHaveLength(1);
    expect(await stockOf(product.id)).toBe(0);
    expect(await prisma.cartItem.count({ where: { productId: product.id } })).toBe(0);
    // Receipt to the customer, notice to the store.
    expect(testState.sent.filter((m) => m.subject.includes(order.number))).toHaveLength(2);
  });

  it('gives the new order an eight-character number and grants this browser access to it', async () => {
    const product = await makeProduct({ stock: 1 });
    await addToCart(product.id, 1);
    const { redirect } = await place();

    const number = redirect!.split('/').pop()!;
    expect(number).toMatch(/^SVL-[A-Z0-9]{8}$/);
    expect(await hasOrderAccess(number)).toBe(true);
    expect(testState.cookies.get('svl_orders')).toMatch(/^v1\./); // signed, not plaintext
  });

  it('prices from the database and ignores any price or total the caller sends', async () => {
    const product = await makeProduct({ stock: 1, price: 500_000 });
    await addToCart(product.id, 1);

    await place({ total: '1', subtotal: '1', price: '1', shipping: '0', discount: '999999' });

    const order = await prisma.order.findFirstOrThrow({ where: { items: { some: { productId: product.id } } } });
    expect(order.subtotal).toBe(500_000);
    expect(order.discount).toBe(0);
  });

  it('refuses an empty bag', async () => {
    const { state } = await place();
    expect(state?.message).toMatch(/empty/i);
  });

  it('reports a piece that sold before the order, and creates nothing', async () => {
    const product = await makeProduct({ stock: 1 });
    await addToCart(product.id, 1);
    await prisma.product.update({ where: { id: product.id }, data: { stock: 0 } });

    const { state } = await place();

    expect(state?.status).toBe('error');
    expect(await prisma.orderItem.count({ where: { productId: product.id } })).toBe(0);
    expect(await stockOf(product.id)).toBe(0);
  });
});

describe('online (Razorpay) checkout', () => {
  const configure = () => {
    vi.stubEnv('RAZORPAY_KEY_ID', 'rzp_test_id');
    vi.stubEnv('RAZORPAY_KEY_SECRET', 'secret');
    vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', 'hook');
  };

  it('creates a pending order, holds the piece, and does not claim payment', async () => {
    configure();
    const product = await makeProduct({ stock: 1 });
    await addToCart(product.id, 1);

    const { redirect } = await place({ paymentMethod: 'RAZORPAY' });

    const order = await prisma.order.findFirstOrThrow({ where: { items: { some: { productId: product.id } } } });
    expect(redirect).toBe(`/checkout/confirmation/${order.number}`);
    expect(order).toMatchObject({ status: 'PENDING', paymentMethod: 'RAZORPAY', paymentStatus: 'PENDING' });
    expect(order.confirmedAt).toBeNull();
    expect(await stockOf(product.id)).toBe(0);
    // No receipt until the payment clears.
    expect(testState.sent).toHaveLength(0);
    expect(await hasOrderAccess(order.number)).toBe(true);
  });

  it('is refused, with nothing created, when online payment is not fully configured', async () => {
    vi.stubEnv('RAZORPAY_KEY_ID', 'rzp_test_id');
    vi.stubEnv('RAZORPAY_KEY_SECRET', 'secret');
    vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', ''); // the half-configured case
    const product = await makeProduct({ stock: 1 });
    await addToCart(product.id, 1);

    const { state } = await place({ paymentMethod: 'RAZORPAY' });

    expect(state?.message).toMatch(/not available/i);
    expect(await stockOf(product.id)).toBe(1);
    expect(await prisma.orderItem.count({ where: { productId: product.id } })).toBe(0);
  });

  it('COD is unaffected by Razorpay being unconfigured', async () => {
    const product = await makeProduct({ stock: 1 });
    await addToCart(product.id, 1);
    const { redirect } = await place({ paymentMethod: 'COD' });
    expect(redirect).toMatch(/^\/checkout\/confirmation\/SVL-/);
  });
});

/* -------------------------------------------------------------------------- */

describe('many shoppers, one piece', () => {
  it('sells a one-of-one piece to exactly one of eight simultaneous buyers', async () => {
    const product = await makeProduct({ stock: 1 });

    // Eight separate visitors — own cookies, own address — each with the piece
    // in their bag, built through the real action.
    const jars = await Promise.all(
      Array.from({ length: 8 }, async (_, i) => {
        const cookies = new Map<string, string>();
        await runAs({ cookies, headers: { 'x-forwarded-for': `198.51.100.${i + 1}` } }, () =>
          addToCart(product.id, 1),
        );
        return { cookies, ip: `198.51.100.${i + 1}` };
      }),
    );
    expect(jars.every((j) => j.cookies.has('svl_cart'))).toBe(true);

    const outcomes = await Promise.all(
      jars.map(({ cookies, ip }) =>
        runAs({ cookies, headers: { 'x-forwarded-for': ip } }, async () => {
          try {
            return { state: await placeOrder(initial, checkoutForm()), redirect: null };
          } catch (error) {
            if (error instanceof TestRedirect) return { state: null, redirect: error.url };
            throw error;
          }
        }),
      ),
    );

    expect(outcomes.filter((o) => o.redirect)).toHaveLength(1);
    expect(outcomes.filter((o) => o.state?.status === 'error')).toHaveLength(7);
    expect(await prisma.orderItem.count({ where: { productId: product.id } })).toBe(1);
    expect(await stockOf(product.id)).toBe(0);
  });

  it('never oversells a piece with several in stock', async () => {
    const product = await makeProduct({ stock: 3 });
    const jars = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const cookies = new Map<string, string>();
        const ip = `203.0.113.${i + 20}`;
        await runAs({ cookies, headers: { 'x-forwarded-for': ip } }, () => addToCart(product.id, 1));
        return { cookies, ip };
      }),
    );

    const outcomes = await Promise.all(
      jars.map(({ cookies, ip }) =>
        runAs({ cookies, headers: { 'x-forwarded-for': ip } }, () =>
          placeOrder(initial, checkoutForm()).then(
            () => 'no-redirect',
            (e: unknown) => (e instanceof TestRedirect ? 'sold' : 'error'),
          ),
        ),
      ),
    );

    expect(outcomes.filter((o) => o === 'sold')).toHaveLength(3);
    expect(await stockOf(product.id)).toBe(0);
    expect(await prisma.orderItem.count({ where: { productId: product.id } })).toBe(3);
  });

  it('two orders sharing pieces in opposite cart order do not deadlock', async () => {
    const a = await makeProduct({ stock: 5 });
    const b = await makeProduct({ stock: 5 });

    const forward = new Map<string, string>();
    const backward = new Map<string, string>();
    await runAs({ cookies: forward, headers: { 'x-forwarded-for': '198.51.100.201' } }, async () => {
      await addToCart(a.id, 1);
      await addToCart(b.id, 1);
    });
    await runAs({ cookies: backward, headers: { 'x-forwarded-for': '198.51.100.202' } }, async () => {
      await addToCart(b.id, 1);
      await addToCart(a.id, 1);
    });

    const results = await Promise.all(
      [
        [forward, '198.51.100.201'],
        [backward, '198.51.100.202'],
      ].map(([cookies, ip]) =>
        runAs({ cookies: cookies as Map<string, string>, headers: { 'x-forwarded-for': ip as string } }, () =>
          placeOrder(initial, checkoutForm()).catch((e: unknown) => e),
        ),
      ),
    );

    expect(results.every((r) => r instanceof TestRedirect)).toBe(true);
    expect(await stockOf(a.id)).toBe(3);
    expect(await stockOf(b.id)).toBe(3);
  });
});

/* -------------------------------------------------------------------------- */

describe('rate limits on public mutations', () => {
  it('limits order placement per address, before doing any work', async () => {
    const messages: (string | undefined)[] = [];
    for (let i = 0; i < 7; i += 1) messages.push((await place({ fullName: '' })).state?.message);
    expect(messages.slice(0, 6).every((m) => m !== RATE_LIMITED_MESSAGE)).toBe(true);
    expect(messages[6]).toBe(RATE_LIMITED_MESSAGE);
  });

  it('limits order placement per email address, whoever is asking', async () => {
    const email = 'victim@example.test';
    const messages: (string | undefined)[] = [];
    for (let i = 0; i < 6; i += 1) {
      const state = await runAs({ headers: { 'x-forwarded-for': `192.0.2.${i + 1}` } }, async () =>
        (await place({ email })).state,
      );
      messages.push(state?.message);
    }
    expect(messages.slice(0, 5).every((m) => /empty/i.test(m ?? ''))).toBe(true);
    expect(messages[5]).toBe(RATE_LIMITED_MESSAGE);
  });

  it('limits guest cart creation, so the cart table cannot be filled for free', async () => {
    const product = await makeProduct({ stock: 50 });
    const before = await prisma.cart.count();
    const results: boolean[] = [];

    for (let i = 0; i < 12; i += 1) {
      // A new visitor each time (no cookie), all from one address.
      const result = await runAs({ cookies: new Map(), headers: { 'x-forwarded-for': '192.0.2.99' } }, () =>
        addToCart(product.id, 1),
      );
      results.push(result.ok);
    }

    expect(results.filter(Boolean)).toHaveLength(10);
    expect(await prisma.cart.count()).toBe(before + 10);
  });

  it('limits add-to-cart per address', async () => {
    const product = await makeProduct({ stock: 50 });
    const outcomes: boolean[] = [];
    for (let i = 0; i < 45; i += 1) outcomes.push((await addToCart(product.id, 1)).ok);
    // Plenty of room for a real shopper, then a wall.
    expect(outcomes.slice(0, 10).every(Boolean)).toBe(true);
    expect(outcomes.at(-1)).toBe(false);
  });

  it('limits enquiries, commissions and newsletter sign-ups', async () => {
    const enquiry: (string | undefined)[] = [];
    for (let i = 0; i < 6; i += 1) enquiry.push((await submitEnquiry(initial, new FormData())).message);
    expect(enquiry[5]).toBe(RATE_LIMITED_MESSAGE);
    expect(enquiry[4]).not.toBe(RATE_LIMITED_MESSAGE);

    const commission: (string | undefined)[] = [];
    for (let i = 0; i < 4; i += 1) commission.push((await submitCommission(initial, new FormData())).message);
    expect(commission[3]).toBe(RATE_LIMITED_MESSAGE);
    expect(commission[2]).not.toBe(RATE_LIMITED_MESSAGE);

    const newsletter: (string | undefined)[] = [];
    for (let i = 0; i < 6; i += 1) newsletter.push((await subscribeNewsletter(initial, new FormData())).message);
    expect(newsletter[5]).toBe(RATE_LIMITED_MESSAGE);
  });

  it('keeps one visitor\'s limit from blocking another', async () => {
    for (let i = 0; i < 7; i += 1) {
      await runAs({ headers: { 'x-forwarded-for': '192.0.2.50' } }, () => submitEnquiry(initial, new FormData()));
    }
    const other = await runAs({ headers: { 'x-forwarded-for': '192.0.2.51' } }, () =>
      submitEnquiry(initial, new FormData()),
    );
    expect(other.message).not.toBe(RATE_LIMITED_MESSAGE);
  });

  it('cannot be escaped by sending a different X-Forwarded-For first', async () => {
    // The edge appends the real address on the right; the client chooses the left.
    const results: (string | undefined)[] = [];
    for (let i = 0; i < 7; i += 1) {
      const res = await runAs(
        { headers: { 'x-forwarded-for': `10.9.8.${i}, 192.0.2.77` } },
        () => submitEnquiry(initial, new FormData()),
      );
      results.push(res.message);
    }
    expect(results[6]).toBe(RATE_LIMITED_MESSAGE);
  });

  it('refuses a wishlist entry for a piece that does not exist, instead of throwing', async () => {
    const user = await makeUser();
    testState.session = { user: { id: user.id, role: 'CUSTOMER' } };
    const result = await toggleWishlist('does-not-exist');
    expect(result.ok).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */

describe('order-access cookie (guest order lookups)', () => {
  const granted = async () => {
    const order = await makeOrder({ status: 'CONFIRMED', paymentMethod: 'COD' });
    return order;
  };

  afterEach(() => vi.useRealTimers());

  it('lets the browser that was granted access read that order, and only that order', async () => {
    const { grantOrderAccess } = await import('@/lib/order-access');
    const order = await granted();
    const other = await granted();
    await grantOrderAccess(order.number);
    expect(await hasOrderAccess(order.number)).toBe(true);
    expect(await hasOrderAccess(other.number)).toBe(false);
  });

  it('a hand-written cookie naming an order grants nothing', async () => {
    const order = await granted();
    for (const forged of [
      order.number,
      `${order.number},SVL-AAAAAAAA`,
      `v1.${Buffer.from(JSON.stringify([[order.number, 9_999_999_999]])).toString('base64url')}.AAAA`,
      '',
    ]) {
      testState.cookies.set('svl_orders', forged);
      expect(await hasOrderAccess(order.number)).toBe(false);
    }
  });

  it('a stolen signature cannot be re-pointed at a different order', async () => {
    const { grantOrderAccess } = await import('@/lib/order-access');
    const mine = await granted();
    const theirs = await granted();
    await grantOrderAccess(mine.number);

    const [version, , signature] = testState.cookies.get('svl_orders')!.split('.');
    const body = Buffer.from(JSON.stringify([[theirs.number, Math.floor(Date.now() / 1000) + 3600]])).toString('base64url');
    testState.cookies.set('svl_orders', `${version}.${body}.${signature}`);

    expect(await hasOrderAccess(theirs.number)).toBe(false);
  });

  it('stops working when it expires', async () => {
    const { grantOrderAccess } = await import('@/lib/order-access');
    const order = await granted();
    await grantOrderAccess(order.number);
    expect(await hasOrderAccess(order.number)).toBe(true);

    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(Date.now() + 61 * 60 * 1000);
    expect(await hasOrderAccess(order.number)).toBe(false);
  });

  it('is not honoured under a different signing secret', async () => {
    const { grantOrderAccess } = await import('@/lib/order-access');
    const order = await granted();
    await grantOrderAccess(order.number);
    process.env.AUTH_SECRET = 'a-completely-different-secret-0123456789';
    expect(await hasOrderAccess(order.number)).toBe(false);
  });

  it('keeps earlier grants when another order is added', async () => {
    const { grantOrderAccess } = await import('@/lib/order-access');
    const first = await granted();
    const second = await granted();
    await grantOrderAccess(first.number);
    await grantOrderAccess(second.number);
    expect(await hasOrderAccess(first.number)).toBe(true);
    expect(await hasOrderAccess(second.number)).toBe(true);
  });
});
