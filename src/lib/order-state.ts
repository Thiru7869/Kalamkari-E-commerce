import 'server-only';

import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { statusDescription } from '@/lib/orders';

/**
 * The only code allowed to change `Order.status`.
 *
 * Before this, three places did it — the admin action, the customer's cancel
 * action, and the payment confirmation — each with its own rules. The admin
 * one read the order *outside* its transaction, accepted any status from any
 * status, and put stock back whenever the new status was CANCELLED and the old
 * one was not. Two clicks both passed that check and both returned the stock;
 * and `CANCELLED → CONFIRMED` was legal, so a sold piece could come back to
 * life with no stock behind it.
 *
 * Three rules make that impossible here:
 *
 *  1. **The legal moves are a table**, below, and a move not in it is refused.
 *  2. **The change is a conditional update** — `WHERE id = ? AND status = <the
 *     status we validated against>`. The database lets exactly one of any set
 *     of concurrent callers through; the rest get `conflict`. Nothing is
 *     decided on a value that might have changed since it was read.
 *  3. **Side effects ride on the winner.** Stock goes back to the catalogue,
 *     and the timeline event is written, inside the same transaction as the
 *     claim — so they happen once, for the one caller that actually moved the
 *     order.
 */

export type OrderActor = 'admin' | 'customer' | 'payment' | 'system';

/**
 * Who may move an order from one status to another.
 *
 * Forward moves may skip a step (a piece collected in person is never
 * "shipped"); a move back is one step only, for correcting a mistaken click.
 * A delivered order does not go back — reviews and returns hang off it — and
 * a cancelled one never moves again, which is what keeps cancelled stock
 * from being sold twice.
 *
 * Cancelling stops at PACKED. Once a parcel is with the courier, returning its
 * stock to the catalogue would sell a piece that is in transit.
 */
const TRANSITIONS: Record<string, Record<string, readonly OrderActor[]>> = {
  PENDING: {
    CONFIRMED: ['payment', 'admin'],
    CANCELLED: ['customer', 'admin', 'system'],
  },
  CONFIRMED: {
    IN_PRODUCTION: ['admin'],
    PACKED: ['admin'],
    SHIPPED: ['admin'],
    DELIVERED: ['admin'],
    CANCELLED: ['customer', 'admin'],
  },
  IN_PRODUCTION: {
    CONFIRMED: ['admin'],
    PACKED: ['admin'],
    SHIPPED: ['admin'],
    DELIVERED: ['admin'],
    CANCELLED: ['admin'],
  },
  PACKED: {
    IN_PRODUCTION: ['admin'],
    SHIPPED: ['admin'],
    DELIVERED: ['admin'],
    CANCELLED: ['admin'],
  },
  SHIPPED: {
    PACKED: ['admin'],
    DELIVERED: ['admin'],
  },
  DELIVERED: {},
  CANCELLED: {},
};

/** Statuses an order never leaves. */
const TERMINAL = new Set(['CANCELLED', 'DELIVERED']);

export function isTerminalStatus(status: string): boolean {
  return TERMINAL.has(status);
}

export function canTransition(from: string, to: string, actor: OrderActor): boolean {
  return TRANSITIONS[from]?.[to]?.includes(actor) ?? false;
}

/** Statuses a given actor could move an order to, for building honest UI later. */
export function allowedTargets(from: string, actor: OrderActor): string[] {
  return Object.entries(TRANSITIONS[from] ?? {})
    .filter(([, actors]) => actors.includes(actor))
    .map(([to]) => to);
}

export type TransitionInput = {
  orderId?: string;
  orderNumber?: string;
  to: string;
  actor: OrderActor;
  /** Timeline message. Defaults to the status's standard description. */
  note?: string;
  /**
   * Extra conditions the claim must satisfy, e.g. "and not already paid".
   * Must not mention `status`; that is the service's to set.
   */
  guard?: Prisma.OrderWhereInput;
  /** Extra columns to write in the same update, e.g. the payment fields. */
  data?: Prisma.OrderUncheckedUpdateManyInput;
};

/** The order as it was when the move was validated. */
export type OrderBefore = {
  id: string;
  number: string;
  email: string;
  shipName: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  courier: string | null;
  trackingNumber: string | null;
};

export type TransitionResult =
  | {
      ok: true;
      from: string;
      to: string;
      before: OrderBefore;
      /** True when a paid order was cancelled and money is owed back. */
      refundPending: boolean;
    }
  | {
      ok: false;
      reason: 'not-found' | 'invalid-transition' | 'awaiting-payment' | 'conflict';
      from?: string;
    };

/**
 * Move an order to a new status, once, safely.
 *
 * Pass `tx` to join a transaction the caller already holds (the payment path
 * does, so the status and the payment columns commit together); otherwise one
 * is opened.
 */
export async function transitionOrder(
  input: TransitionInput,
  tx?: Prisma.TransactionClient,
): Promise<TransitionResult> {
  if (!tx) {
    return prisma.$transaction((inner) => transitionOrder(input, inner));
  }

  const order = await tx.order.findUnique({
    where: input.orderId ? { id: input.orderId } : { number: input.orderNumber },
    include: { items: { select: { productId: true, quantity: true } } },
  });
  if (!order) return { ok: false, reason: 'not-found' };

  const from = order.status;
  if (!canTransition(from, input.to, input.actor)) {
    return { ok: false, reason: 'invalid-transition', from };
  }

  // An online order is not an order until it is paid. An admin must not be
  // able to move one forward by clicking; only the payment path may.
  if (
    from === 'PENDING' &&
    input.to === 'CONFIRMED' &&
    input.actor === 'admin' &&
    order.paymentMethod !== 'COD' &&
    order.paymentStatus !== 'PAID'
  ) {
    return { ok: false, reason: 'awaiting-payment', from };
  }

  const now = new Date();
  const cancelling = input.to === 'CANCELLED';
  const refundPending = cancelling && order.paymentStatus === 'PAID';

  /*
    Cancelling a paid order owes the customer money. The honest record of that
    is REFUND_PENDING — "a refund is due and has not happened" — never
    REFUNDED, which would assert that money moved. Nothing in this codebase
    calls Razorpay's refund API yet; until it does, REFUNDED is not a state
    anything may write.
  */
  const claim = await tx.order.updateMany({
    where: {
      AND: [
        { id: order.id, status: from },
        // On a cancel, also pin the payment status we read. If a payment landed
        // between the read and the claim, the claim fails and the caller retries
        // against the true state rather than cancelling a paid order as unpaid.
        ...(cancelling ? [{ paymentStatus: order.paymentStatus }] : []),
        ...(input.guard ? [input.guard] : []),
      ],
    },
    data: {
      ...input.data,
      status: input.to,
      // Timestamps are only ever set, never cleared, so the history of an
      // order stays readable even if it moves backwards through statuses.
      ...(input.to === 'CONFIRMED' && !order.confirmedAt ? { confirmedAt: now } : {}),
      ...(input.to === 'SHIPPED' && !order.shippedAt ? { shippedAt: now } : {}),
      ...(input.to === 'DELIVERED' && !order.deliveredAt ? { deliveredAt: now } : {}),
      ...(cancelling && !order.cancelledAt ? { cancelledAt: now } : {}),
      ...(refundPending ? { paymentStatus: 'REFUND_PENDING' } : {}),
    },
  });

  if (claim.count === 0) return { ok: false, reason: 'conflict', from };

  // From here this caller is the only one who moved the order, so these happen
  // exactly once.
  await tx.orderEvent.create({
    data: {
      orderId: order.id,
      status: input.to,
      message:
        (input.note?.trim() || statusDescription(input.to) || input.to) +
        (refundPending
          ? ' A refund is due on this payment; the store will start it and confirm by email once it has.'
          : ''),
    },
  });

  if (cancelling) {
    // In a fixed order, so two orders returning overlapping pieces cannot
    // take locks in opposite orders and deadlock.
    const lines = order.items
      .filter((item): item is { productId: string; quantity: number } => Boolean(item.productId))
      .sort((a, b) => a.productId.localeCompare(b.productId));
    for (const line of lines) {
      await tx.product.update({
        where: { id: line.productId },
        data: { stock: { increment: line.quantity } },
      });
    }
  }

  return {
    ok: true,
    from,
    to: input.to,
    refundPending,
    before: {
      id: order.id,
      number: order.number,
      email: order.email,
      shipName: order.shipName,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      courier: order.courier,
      trackingNumber: order.trackingNumber,
    },
  };
}
