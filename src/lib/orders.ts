/**
 * The order lifecycle, written for a store that paints to order rather than
 * picks from a warehouse. IN_PRODUCTION is a real state here, not decoration —
 * a commissioned piece genuinely sits in it for weeks.
 *
 * Deliberately free of `server-only` and of any database import: the admin
 * status controls are a client component and need these labels too.
 */

export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'IN_PRODUCTION',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Awaiting payment',
  CONFIRMED: 'Confirmed',
  IN_PRODUCTION: 'Being painted',
  PACKED: 'Packed',
  SHIPPED: 'On its way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  PENDING: 'We are waiting for payment to complete before anything moves.',
  CONFIRMED: 'Received at the store in Srikalahasti. Someone will call you before dispatch.',
  IN_PRODUCTION:
    'Your piece is being painted. This is the long part — the cloth has to dry in the sun between stages, and there is no way to hurry it.',
  PACKED: 'Checked, folded in unbleached muslin, and ready to leave the store.',
  SHIPPED: 'Dispatched from Srikalahasti and with the courier.',
  DELIVERED: 'Delivered. We would genuinely like to know how the cloth feels in the hand.',
  CANCELLED: 'This order was cancelled. Nothing further will be charged.',
};

/** The steps shown on the tracking timeline, in order. Cancelled is not a step. */
export const TRACKING_STEPS: OrderStatus[] = [
  'CONFIRMED',
  'IN_PRODUCTION',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
];

export function statusIndex(status: string): number {
  const index = TRACKING_STEPS.indexOf(status as OrderStatus);
  // PENDING sits before the first tracked step.
  return index === -1 ? -1 : index;
}

export function isCancelled(status: string) {
  return status === 'CANCELLED';
}

export function statusLabel(status: string) {
  return STATUS_LABELS[status as OrderStatus] ?? status;
}

export function statusDescription(status: string) {
  return STATUS_DESCRIPTIONS[status as OrderStatus] ?? '';
}
