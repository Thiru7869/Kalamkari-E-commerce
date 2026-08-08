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

/**
 * What is physically happening to the cloth at each stage.
 *
 * The status labels above name a state; these say what the state *is* for
 * somebody who has never watched this being made. It matters most at
 * IN_PRODUCTION, where a customer is otherwise looking at a progress bar that
 * has not moved for three weeks and has no way to know that is normal.
 *
 * Every line describes a real operation from the twenty-three steps, in the
 * order they actually occur. Nothing here promises a date.
 */
export const STATUS_NARRATIVES: Partial<Record<OrderStatus, string>> = {
  CONFIRMED:
    'The piece is set aside under your name. Nothing else in the store is the same drawing, so once it is yours it comes off the catalogue immediately.',
  IN_PRODUCTION:
    'Cloth is being prepared with myrobalan and buffalo milk, then drawn in fermented iron black before any colour arrives. Between stages it goes into the river and into the sun — most of the twenty-three steps are washing rather than painting, and the monsoon stops all of them.',
  PACKED:
    'It has had its final wash and sunning, been checked line by line, and folded into unbleached muslin. Nothing is wrapped in plastic.',
  SHIPPED:
    'On the road from Srikalahasti. Naturally dyed cloth travels well, but wash it alone the first few times when it reaches you.',
  DELIVERED:
    'It should soften and settle with washing — that is the cloth behaving correctly, not fading. The care guide explains what to expect over the first year.',
};

export function statusNarrative(status: string): string | null {
  return STATUS_NARRATIVES[status as OrderStatus] ?? null;
}

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
