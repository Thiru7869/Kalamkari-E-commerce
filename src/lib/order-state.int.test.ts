import { describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { transitionOrder } from '@/lib/order-state';
import { updateOrderStatus } from '@/app/actions/admin';
import { cancelOrder } from '@/app/actions/account';
import { testState } from '@/test/state';
import { makeOrder, makeProduct, makeUser, orderOf, stockOf } from '@/test/fixtures';

/**
 * The order-state service against a real database, with real concurrency.
 * Unit tests of the transition table are in order-state.test.ts.
 */

async function confirmedOrderWithPiece(over: Parameters<typeof makeOrder>[0] = {}) {
  // Stock 0: the piece is sold. Cancelling is what puts it back.
  const product = await makeProduct({ stock: 0 });
  const order = await makeOrder({
    status: 'CONFIRMED',
    paymentMethod: 'COD',
    lines: [{ productId: product.id, quantity: 1 }],
    ...over,
  });
  return { product, order };
}

describe('concurrent cancellation', () => {
  it('returns stock exactly once when ten admins cancel at the same instant', async () => {
    const { product, order } = await confirmedOrderWithPiece();

    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        transitionOrder({ orderId: order.id, to: 'CANCELLED', actor: 'admin' }),
      ),
    );

    expect(results.filter((r) => r.ok)).toHaveLength(1);
    // Everybody else is told why, rather than being waved through.
    expect(results.filter((r) => !r.ok).every((r) => !r.ok && ['conflict', 'invalid-transition'].includes(r.reason))).toBe(true);
    expect(await stockOf(product.id)).toBe(1);
    expect((await orderOf(order.id)).status).toBe('CANCELLED');

    const events = await prisma.orderEvent.count({ where: { orderId: order.id, status: 'CANCELLED' } });
    expect(events).toBe(1);
  });

  it('returns stock exactly once when a customer and an admin cancel together', async () => {
    const user = await makeUser();
    const { product, order } = await confirmedOrderWithPiece({ userId: user.id });

    const [customer, admin] = await Promise.all([
      transitionOrder({ orderId: order.id, to: 'CANCELLED', actor: 'customer' }),
      transitionOrder({ orderId: order.id, to: 'CANCELLED', actor: 'admin' }),
    ]);

    expect([customer.ok, admin.ok].filter(Boolean)).toHaveLength(1);
    expect(await stockOf(product.id)).toBe(1);
  });

  it('through the real admin action: many clicks, one restore', async () => {
    testState.session = { user: { id: 'admin-1', role: 'ADMIN' } };
    const { product, order } = await confirmedOrderWithPiece();

    const results = await Promise.all(
      Array.from({ length: 6 }, () => updateOrderStatus(order.number, 'CANCELLED')),
    );

    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(await stockOf(product.id)).toBe(1);
  });

  it('through the real customer action: a double-submit restores once', async () => {
    const user = await makeUser();
    testState.session = { user: { id: user.id, role: 'CUSTOMER' } };
    const { product, order } = await confirmedOrderWithPiece({ userId: user.id });

    const form = () => {
      const f = new FormData();
      f.set('number', order.number);
      return f;
    };
    const results = await Promise.all([
      cancelOrder({ status: 'idle' }, form()),
      cancelOrder({ status: 'idle' }, form()),
      cancelOrder({ status: 'idle' }, form()),
    ]);

    expect(results.filter((r) => r.status === 'success')).toHaveLength(1);
    expect(await stockOf(product.id)).toBe(1);
  });

  it('puts back the right quantity of each piece on a multi-line order', async () => {
    const a = await makeProduct({ stock: 0 });
    const b = await makeProduct({ stock: 2 });
    const order = await makeOrder({
      status: 'CONFIRMED',
      paymentMethod: 'COD',
      lines: [
        { productId: a.id, quantity: 1 },
        { productId: b.id, quantity: 3 },
      ],
    });

    await transitionOrder({ orderId: order.id, to: 'CANCELLED', actor: 'admin' });

    expect(await stockOf(a.id)).toBe(1);
    expect(await stockOf(b.id)).toBe(5);
  });
});

describe('invalid transitions are refused and change nothing', () => {
  it('CANCELLED -> CONFIRMED, for an admin and for a payment', async () => {
    const { product, order } = await confirmedOrderWithPiece({
      status: 'CANCELLED',
    });
    const before = await stockOf(product.id);

    for (const actor of ['admin', 'payment'] as const) {
      const result = await transitionOrder({ orderId: order.id, to: 'CONFIRMED', actor });
      expect(result).toMatchObject({ ok: false, reason: 'invalid-transition', from: 'CANCELLED' });
    }

    expect((await orderOf(order.id)).status).toBe('CANCELLED');
    expect(await stockOf(product.id)).toBe(before);
  });

  it('cannot be un-cancelled through the admin action either', async () => {
    testState.session = { user: { id: 'admin-1', role: 'ADMIN' } };
    const { order } = await confirmedOrderWithPiece({ status: 'CANCELLED' });
    const result = await updateOrderStatus(order.number, 'CONFIRMED');
    expect(result.ok).toBe(false);
    expect((await orderOf(order.id)).status).toBe('CANCELLED');
  });

  it('a shipped order cannot be cancelled, and its stock stays out', async () => {
    const { product, order } = await confirmedOrderWithPiece({ status: 'SHIPPED' });
    const result = await transitionOrder({ orderId: order.id, to: 'CANCELLED', actor: 'admin' });
    expect(result.ok).toBe(false);
    expect(await stockOf(product.id)).toBe(0);
  });

  it('a customer cannot cancel once the piece is being painted', async () => {
    const { order } = await confirmedOrderWithPiece({ status: 'IN_PRODUCTION' });
    const result = await transitionOrder({ orderId: order.id, to: 'CANCELLED', actor: 'customer' });
    expect(result.ok).toBe(false);
  });

  it('refuses an unknown order and an unknown status without throwing', async () => {
    expect(await transitionOrder({ orderId: 'nope', to: 'CANCELLED', actor: 'admin' })).toMatchObject({
      ok: false,
      reason: 'not-found',
    });
    const { order } = await confirmedOrderWithPiece();
    expect(await transitionOrder({ orderId: order.id, to: 'BOGUS', actor: 'admin' })).toMatchObject({
      ok: false,
      reason: 'invalid-transition',
    });
  });

  it('an admin cannot confirm an online order that has not been paid', async () => {
    const order = await makeOrder({ status: 'PENDING', paymentMethod: 'RAZORPAY', paymentStatus: 'PENDING' });
    const result = await transitionOrder({ orderId: order.id, to: 'CONFIRMED', actor: 'admin' });
    expect(result).toMatchObject({ ok: false, reason: 'awaiting-payment' });
    expect((await orderOf(order.id)).status).toBe('PENDING');
  });

  it('a non-admin session cannot change a status at all', async () => {
    testState.session = { user: { id: 'someone', role: 'CUSTOMER' } };
    const { order } = await confirmedOrderWithPiece();
    const result = await updateOrderStatus(order.number, 'CANCELLED');
    expect(result).toEqual({ ok: false, error: 'Not authorised.' });
    expect((await orderOf(order.id)).status).toBe('CONFIRMED');
  });
});

describe('refund status is never claimed without a refund', () => {
  it('cancelling a PAID order records REFUND_PENDING, never REFUNDED', async () => {
    const { order } = await confirmedOrderWithPiece({
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'PAID',
      razorpayOrderId: 'order_x',
    });

    const result = await transitionOrder({ orderId: order.id, to: 'CANCELLED', actor: 'admin' });
    expect(result).toMatchObject({ ok: true, refundPending: true });

    const after = await orderOf(order.id);
    expect(after.paymentStatus).toBe('REFUND_PENDING');
    expect(after.paymentStatus).not.toBe('REFUNDED');
  });

  it('the timeline says a refund is due, not that one was made', async () => {
    const { order } = await confirmedOrderWithPiece({ paymentMethod: 'RAZORPAY', paymentStatus: 'PAID' });
    await transitionOrder({ orderId: order.id, to: 'CANCELLED', actor: 'customer' });

    const event = await prisma.orderEvent.findFirstOrThrow({ where: { orderId: order.id, status: 'CANCELLED' } });
    expect(event.message).toMatch(/refund is due/i);
    expect(event.message).not.toMatch(/has been refunded|was refunded|marked for refund/i);
  });

  it('the customer is told the same, through the real action and the real email', async () => {
    const user = await makeUser();
    testState.session = { user: { id: user.id, role: 'CUSTOMER' } };
    const { order } = await confirmedOrderWithPiece({
      userId: user.id,
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'PAID',
    });

    const form = new FormData();
    form.set('number', order.number);
    const result = await cancelOrder({ status: 'idle' }, form);

    expect(result.status).toBe('success');
    expect(result.message).toMatch(/refund is due/i);
    expect(result.message).not.toMatch(/returns by the route|has been refunded/i);

    const mail = testState.sent.find((m) => m.subject.includes('cancelled'));
    expect(mail?.text).toMatch(/refund is due/i);
    expect(mail?.text).toMatch(/do not assume it has been issued/i);
    expect((await orderOf(order.id)).paymentStatus).toBe('REFUND_PENDING');
  });

  it('cancelling an UNPAID order leaves the payment status alone and promises nothing', async () => {
    const { order } = await confirmedOrderWithPiece({ paymentMethod: 'COD', paymentStatus: 'PENDING' });
    const result = await transitionOrder({ orderId: order.id, to: 'CANCELLED', actor: 'admin' });
    expect(result).toMatchObject({ ok: true, refundPending: false });
    expect((await orderOf(order.id)).paymentStatus).toBe('PENDING');
  });

  it('no code path in the app can write REFUNDED', async () => {
    const { readFileSync, readdirSync, statSync } = await import('node:fs');
    const { join } = await import('node:path');
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.tsx?$/.test(name) && !/\.test\.ts$/.test(name)) {
          const text = readFileSync(full, 'utf8');
          // An assignment or update of paymentStatus to REFUNDED.
          if (/paymentStatus\s*[:=]\s*['"]REFUNDED['"]/.test(text)) hits.push(full);
        }
      }
    };
    walk(join(process.cwd(), 'src'));
    expect(hits).toEqual([]);
  });
});
