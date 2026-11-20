import 'server-only';

import { prisma } from '@/lib/prisma';
import { notifyOrderPlaced, notifyLatePayment } from '@/lib/mail';
import { transitionOrder } from '@/lib/order-state';

/**
 * Marking an online order paid.
 *
 * Two independent things report a successful payment: the browser, when the
 * checkout widget hands back a signature, and Razorpay's webhook, which arrives
 * server-to-server. Either can be first, either can be the only one to arrive —
 * a customer who closes the tab the instant the payment clears produces the
 * webhook and nothing else.
 *
 * So both routes come through here, and this is safe to call any number of
 * times, concurrently. The claim is a conditional update inside the order-state
 * service: the database decides who won, and only the winner sends the receipt.
 *
 * Three further rules, each learned the hard way by reading what the previous
 * version did not check:
 *
 *  - **Only a PENDING order can become CONFIRMED by a payment.** The old claim
 *    was "not already paid", which a CANCELLED order satisfies — so a payment
 *    that landed after cancellation re-confirmed the order, after its stock had
 *    gone back on sale and been sold again. Two buyers, one piece.
 *  - **The amount and currency must match the order.** Razorpay enforces the
 *    amount for the order it created, but this site should not depend on that
 *    being the only line of defence for what it ships.
 *  - **A payment that cannot be applied is recorded, not lost.** It is flagged
 *    `LATE_PAID` on the order and the store is told, so the money can be
 *    refunded by a person. Nothing is silently dropped, and nothing is
 *    "confirmed" that cannot be honoured.
 */

export type ConfirmResult =
  | { outcome: 'confirmed' }
  | { outcome: 'already-paid' }
  | { outcome: 'not-found' }
  | { outcome: 'mismatched-order' }
  | { outcome: 'amount-mismatch' }
  /** The order was already cancelled. Recorded for refund; order untouched. */
  | { outcome: 'late-payment' }
  | { outcome: 'not-eligible' };

/** Payment states in which money has been taken and is already accounted for. */
const SETTLED = ['PAID', 'REFUND_PENDING', 'LATE_PAID', 'REFUNDED'];

export async function confirmOrderPaid(params: {
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  /** What was actually paid, in paise, as reported by Razorpay. */
  amount: number;
  currency: string;
  /** How the news arrived — recorded on the timeline so support can tell. */
  source: 'browser' | 'webhook';
}): Promise<ConfirmResult> {
  const order = await prisma.order.findUnique({
    where: { number: params.orderNumber },
    select: {
      id: true,
      number: true,
      email: true,
      razorpayOrderId: true,
      total: true,
      shipName: true,
      shipLine1: true,
      shipLine2: true,
      shipCity: true,
      shipState: true,
      shipPostalCode: true,
      subtotal: true,
      shipping: true,
      paymentMethod: true,
      items: { select: { name: true, quantity: true, price: true } },
    },
  });

  if (!order) return { outcome: 'not-found' };

  // The signature proves the payment is genuine; this proves it belongs to
  // *this* order rather than a cheaper one the caller also paid for.
  if (!order.razorpayOrderId || order.razorpayOrderId !== params.razorpayOrderId) {
    return { outcome: 'mismatched-order' };
  }

  if (params.amount !== order.total || params.currency !== 'INR') {
    console.error('[payment] amount or currency does not match the order', {
      orderNumber: order.number,
      expected: order.total,
      received: params.amount,
      currency: params.currency,
    });
    return { outcome: 'amount-mismatch' };
  }

  const result = await prisma.$transaction((tx) =>
    transitionOrder(
      {
        orderId: order.id,
        to: 'CONFIRMED',
        actor: 'payment',
        note:
          params.source === 'webhook'
            ? 'Payment confirmed by the payment provider. Order confirmed at the store in Srikalahasti.'
            : 'Payment received. Order confirmed at the store in Srikalahasti.',
        // Only an order that has not been paid. The status guard (PENDING) is
        // the transition table's; this is the payment column's.
        guard: { paymentStatus: { notIn: SETTLED }, razorpayOrderId: params.razorpayOrderId },
        data: { paymentStatus: 'PAID', razorpayPaymentId: params.razorpayPaymentId },
      },
      tx,
    ),
  );

  if (result.ok) {
    await notifyOrderPlaced({
      number: order.number,
      email: order.email,
      shipName: order.shipName,
      shipLine1: order.shipLine1,
      shipLine2: order.shipLine2,
      shipCity: order.shipCity,
      shipState: order.shipState,
      shipPostalCode: order.shipPostalCode,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      paymentMethod: order.paymentMethod,
      items: order.items,
    });
    return { outcome: 'confirmed' };
  }

  // The claim did not succeed. Work out why from the order as it is now.
  const current = await prisma.order.findUnique({
    where: { id: order.id },
    select: { status: true, paymentStatus: true },
  });
  if (!current) return { outcome: 'not-found' };

  if (SETTLED.includes(current.paymentStatus)) return { outcome: 'already-paid' };

  if (current.status === 'CANCELLED') {
    const recorded = await recordLatePayment({
      orderId: order.id,
      orderNumber: order.number,
      razorpayPaymentId: params.razorpayPaymentId,
      amount: params.amount,
    });
    return recorded ? { outcome: 'late-payment' } : { outcome: 'already-paid' };
  }

  return { outcome: 'not-eligible' };
}

/**
 * A payment that arrived for a cancelled order.
 *
 * The order is left exactly as it is — CANCELLED, its stock already released —
 * and only the payment is recorded against it, so the refund phase can find
 * every such case with `paymentStatus = 'LATE_PAID'`. Conditional, so a
 * redelivered webhook records it once and alerts the store once.
 *
 * Returns whether this call was the one that recorded it.
 */
async function recordLatePayment(params: {
  orderId: string;
  orderNumber: string;
  razorpayPaymentId: string;
  amount: number;
}): Promise<boolean> {
  const claimed = await prisma.$transaction(async (tx) => {
    const flagged = await tx.order.updateMany({
      where: {
        id: params.orderId,
        status: 'CANCELLED',
        paymentStatus: { notIn: SETTLED },
      },
      data: { paymentStatus: 'LATE_PAID', razorpayPaymentId: params.razorpayPaymentId },
    });
    if (flagged.count === 0) return false;

    await tx.orderEvent.create({
      data: {
        orderId: params.orderId,
        status: 'CANCELLED',
        message:
          'A payment arrived after this order was cancelled. The order has not been restored; the payment is awaiting refund by the store.',
      },
    });
    return true;
  });

  if (claimed) {
    console.error('[payment] late payment recorded for a cancelled order', {
      orderNumber: params.orderNumber,
    });
    await notifyLatePayment({
      orderNumber: params.orderNumber,
      razorpayPaymentId: params.razorpayPaymentId,
      amount: params.amount,
    });
  }
  return claimed;
}

/**
 * A payment the provider reports as failed.
 *
 * The order is left PENDING rather than cancelled: the customer may simply
 * retry. Only the record of the attempt is written, and only while the order is
 * still waiting — a failure event must never overwrite a payment that later
 * succeeded, or an order that has moved on.
 */
export async function recordPaymentFailure(params: {
  razorpayOrderId: string;
  reason: string;
}): Promise<void> {
  const order = await prisma.order.findFirst({
    where: { razorpayOrderId: params.razorpayOrderId },
    select: { id: true },
  });
  if (!order) return;

  await prisma.$transaction(async (tx) => {
    const flagged = await tx.order.updateMany({
      where: { id: order.id, status: 'PENDING', paymentStatus: 'PENDING' },
      data: { paymentStatus: 'FAILED' },
    });
    if (flagged.count === 0) return;

    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        status: 'PENDING',
        message: `Payment attempt did not complete (${params.reason}). Nothing has been charged; the order can be paid again.`,
      },
    });
  });
}
