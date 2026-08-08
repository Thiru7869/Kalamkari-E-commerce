import 'server-only';

import { prisma } from '@/lib/prisma';
import { notifyOrderPlaced } from '@/lib/mail';

/**
 * Marking an online order paid.
 *
 * Two independent things report a successful payment: the browser, when the
 * checkout widget hands back a signature, and Razorpay's webhook, which arrives
 * server-to-server. Either can be first, either can be the only one to arrive —
 * a customer who closes the tab the instant the payment clears produces the
 * webhook and nothing else, and before this existed that order stayed PENDING
 * forever with the money already taken.
 *
 * So both routes come through here, and this is written to be safe to call
 * twice. The guard is a conditional `updateMany`, the same technique the
 * checkout uses for stock: the database decides who won, not the application.
 * Only the caller that actually flipped the row sends the receipt, so a
 * duplicate webhook delivery cannot produce a duplicate email.
 */

export type ConfirmResult =
  | { outcome: 'confirmed' }
  | { outcome: 'already-paid' }
  | { outcome: 'not-found' }
  | { outcome: 'mismatched-order' };

export async function confirmOrderPaid(params: {
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
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
      paymentStatus: true,
      shipName: true,
      shipLine1: true,
      shipLine2: true,
      shipCity: true,
      shipState: true,
      shipPostalCode: true,
      subtotal: true,
      shipping: true,
      total: true,
      paymentMethod: true,
      items: { select: { name: true, quantity: true, price: true } },
    },
  });

  if (!order) return { outcome: 'not-found' };

  // The signature proves the payment is genuine; this proves it belongs to
  // *this* order rather than a cheaper one the caller also paid for.
  if (order.razorpayOrderId !== params.razorpayOrderId) {
    return { outcome: 'mismatched-order' };
  }

  // Atomic claim. Whichever of the two routes gets here first flips the row;
  // the other sees count === 0 and stops without re-sending anything.
  const claimed = await prisma.order.updateMany({
    where: { id: order.id, paymentStatus: { not: 'PAID' } },
    data: {
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      confirmedAt: new Date(),
      razorpayPaymentId: params.razorpayPaymentId,
    },
  });

  if (claimed.count === 0) return { outcome: 'already-paid' };

  await prisma.orderEvent.create({
    data: {
      orderId: order.id,
      status: 'CONFIRMED',
      message:
        params.source === 'webhook'
          ? 'Payment confirmed by the payment provider. Order confirmed at the store in Srikalahasti.'
          : 'Payment received. Order confirmed at the store in Srikalahasti.',
    },
  });

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

/**
 * A payment the provider reports as failed.
 *
 * The order is left PENDING rather than cancelled: the customer may simply
 * retry, and cancelling would return stock that nobody else can buy yet
 * anyway. Only the record of the attempt is written.
 */
export async function recordPaymentFailure(params: {
  razorpayOrderId: string;
  reason: string;
}): Promise<void> {
  const order = await prisma.order.findFirst({
    where: { razorpayOrderId: params.razorpayOrderId },
    select: { id: true, paymentStatus: true },
  });
  if (!order || order.paymentStatus === 'PAID') return;

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'FAILED' },
    }),
    prisma.orderEvent.create({
      data: {
        orderId: order.id,
        status: 'PENDING',
        message: `Payment attempt did not complete (${params.reason}). Nothing has been charged; the order can be paid again.`,
      },
    }),
  ]);
}
