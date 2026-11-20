import 'server-only';

import { site } from '@/content/site';
import { formatPrice, absoluteUrl } from '@/lib/utils';
import { statusLabel } from '@/lib/orders';
import type { MailMessage } from '@/lib/mail/transport';

/**
 * Email copy.
 *
 * Written to the same rule as the rest of the site: state what happened and
 * what happens next, in plain sentences, and claim nothing that is not true.
 * No promotional footer, no "we're excited", no invented delivery date on a
 * craft where the monsoon genuinely stops work.
 *
 * Every message is composed as text first. The HTML rendering carries the same
 * words in the same order and adds nothing — a customer reading either one has
 * read the whole message.
 */

/* -------------------------------------------------------------------------- */
/* Shared rendering                                                           */
/* -------------------------------------------------------------------------- */

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Wraps plain text as minimal HTML.
 *
 * Deliberately close to a plain document: a system font stack, a readable
 * measure, and nothing that depends on remote loading or on a client that
 * renders modern CSS. Blank lines become paragraphs; a line ending in a colon
 * is treated as a small heading.
 */
function renderHtml(text: string, footer: string): string {
  const blocks = text
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const safe = escapeHtml(block).replace(/\n/g, '<br>');
      return `<p style="margin:0 0 14px">${safe}</p>`;
    })
    .join('');

  return [
    '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;',
    'font-size:15px;line-height:1.65;color:#22201D;max-width:34rem;margin:0 auto;padding:24px 20px">',
    blocks,
    `<hr style="border:0;border-top:1px solid #DDD3C0;margin:26px 0 14px">`,
    `<p style="margin:0;font-size:12px;line-height:1.6;color:#6B655C">${escapeHtml(footer)}</p>`,
    '</div>',
  ].join('');
}

const SIGN_OFF = `${site.name}\n${site.location.town}, ${site.location.district}, ${site.location.state}`;

const FOOTER = `${site.name} · ${site.location.town}, ${site.location.state}. Hand-painted Kalamkari, natural dyes only.`;

function compose(to: string, subject: string, text: string, replyTo?: string): MailMessage {
  const body = `${text.trim()}\n\n—\n${SIGN_OFF}`;
  return { to, subject, text: body, html: renderHtml(body, FOOTER), replyTo };
}

/* -------------------------------------------------------------------------- */
/* Shapes                                                                     */
/* -------------------------------------------------------------------------- */

export type OrderMailLine = { name: string; quantity: number; price: number };

export type OrderMailData = {
  number: string;
  email: string;
  shipName: string;
  shipLine1: string;
  shipLine2: string | null;
  shipCity: string;
  shipState: string;
  shipPostalCode: string;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  items: OrderMailLine[];
};

function itemLines(items: OrderMailLine[]): string {
  return items
    .map((i) => `  ${i.name}${i.quantity > 1 ? ` × ${i.quantity}` : ''} — ${formatPrice(i.price * i.quantity)}`)
    .join('\n');
}

function addressLines(order: OrderMailData): string {
  return [
    order.shipName,
    order.shipLine1,
    order.shipLine2,
    `${order.shipCity}, ${order.shipState} ${order.shipPostalCode}`,
  ]
    .filter(Boolean)
    .join('\n');
}

/* -------------------------------------------------------------------------- */
/* Customer: order received                                                   */
/* -------------------------------------------------------------------------- */

export function orderConfirmation(order: OrderMailData): MailMessage {
  const cod = order.paymentMethod === 'COD';

  const text = `Your order ${order.number} has reached the store in ${site.location.town}.

WHAT YOU ORDERED
${itemLines(order.items)}

  Subtotal — ${formatPrice(order.subtotal)}
  Shipping — ${order.shipping === 0 ? 'included' : formatPrice(order.shipping)}
  Total — ${formatPrice(order.total)}${cod ? ', payable on delivery' : ''}

GOING TO
${addressLines(order)}

WHAT HAPPENS NEXT
${
  cod
    ? 'Someone from the store will call to confirm the order before anything is dispatched. Nothing is charged until the parcel reaches you.'
    : 'Your payment has been received. The piece is now being prepared for dispatch.'
}

Every piece is checked, folded in unbleached muslin and sent from ${site.location.town}. Delivery across India usually takes ${site.shipping.domesticDays}.

Almost everything in this store is the only one of itself, so what you have ordered has now been taken off the catalogue.

You can follow the order at ${absoluteUrl('/orders/track')} using the reference ${order.number} and this email address.`;

  return compose(order.email, `Order ${order.number} received`, text);
}

/* -------------------------------------------------------------------------- */
/* Customer: dispatched                                                       */
/* -------------------------------------------------------------------------- */

export function orderDispatched(
  order: Pick<OrderMailData, 'number' | 'email' | 'shipName'>,
  courier: string | null,
  trackingNumber: string | null,
): MailMessage {
  const carriage =
    courier && trackingNumber
      ? `It is with ${courier}, under tracking number ${trackingNumber}.`
      : courier
        ? `It is with ${courier}.`
        : 'It is with the courier.';

  const text = `Order ${order.number} has left the store.

${carriage}

Delivery across India usually takes ${site.shipping.domesticDays} from dispatch. ${site.shipping.note}

WHEN IT ARRIVES
Naturally dyed cloth is not colourfast in the way a chemical dye is. Wash it alone the first few times, in cold water with a mild soap — never a detergent with bleach or optical brightener — and dry it in shade. The full guide is at ${absoluteUrl('/care')}.

Small variations in line, colour depth and the border repeat are how hand painting is identified. They are not defects. If a piece arrives damaged or is not what was described, write back to this address and we will make it right.

Follow the order at ${absoluteUrl('/orders/track')}.`;

  return compose(order.email, `Order ${order.number} is on its way`, text);
}

/* -------------------------------------------------------------------------- */
/* Customer: cancelled                                                        */
/* -------------------------------------------------------------------------- */

export function orderCancelled(
  order: Pick<OrderMailData, 'number' | 'email'>,
  refunded: boolean,
): MailMessage {
  const text = `Order ${order.number} has been cancelled.

${
  refunded
    ? 'You had paid for this order, so a refund is due to you. The store will start it and write to you again once it has been sent — until you hear that, please do not assume it has been issued. If you have not heard within a few working days, reply to this message.'
    : 'Nothing was charged for this order.'
}

The pieces on it have gone back into the catalogue, so if this was a mistake they may still be there.

If you cancelled because something was wrong rather than because you changed your mind, reply to this message and tell us which — it is the only way the store finds out.`;

  return compose(order.email, `Order ${order.number} cancelled`, text);
}

/* -------------------------------------------------------------------------- */
/* Customer: return requested                                                 */
/* -------------------------------------------------------------------------- */

export function returnRequestReceived(
  order: Pick<OrderMailData, 'number' | 'email'>,
  reason: string,
): MailMessage {
  const text = `We have your message about order ${order.number}.

WHAT YOU TOLD US
${reason}

Someone at the store will read this and reply — usually within a day or two, longer if the workshop is mid-dyeing. Nothing is decided automatically and no return is refused by a system.

Please keep the piece and its wrapping as they arrived until you hear back.`;

  return compose(order.email, `Return request for order ${order.number}`, text);
}

/* -------------------------------------------------------------------------- */
/* Store: new order                                                           */
/* -------------------------------------------------------------------------- */

export function storeOrderNotice(order: OrderMailData): MailMessage {
  const text = `New order ${order.number} — ${formatPrice(order.total)} (${
    order.paymentMethod === 'COD' ? 'cash on delivery' : 'paid online'
  })

${itemLines(order.items)}

TO
${addressLines(order)}
${order.email}

Open it at ${absoluteUrl(`/admin/orders/${order.number}`)}`;

  return compose(order.email, `New order ${order.number}`, text);
}

/* -------------------------------------------------------------------------- */
/* Store: new enquiry and commission                                          */
/* -------------------------------------------------------------------------- */

export function storeEnquiryNotice(enquiry: {
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
}): MailMessage {
  const text = `New enquiry from ${enquiry.name}.

SUBJECT
${enquiry.subject}

MESSAGE
${enquiry.message}

REPLY TO
${enquiry.email}${enquiry.phone ? `\n${enquiry.phone}` : ''}

Mark it handled at ${absoluteUrl('/admin/enquiries')}`;

  return compose('', `Enquiry: ${enquiry.subject}`, text, enquiry.email);
}

export function storeCommissionNotice(commission: {
  attachmentCount?: number;
  name: string;
  email: string;
  phone: string | null;
  pieceType: string;
  fabric: string | null;
  brief: string;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string | null;
}): MailMessage {
  const budget =
    commission.budgetMin != null || commission.budgetMax != null
      ? `${commission.budgetMin != null ? formatPrice(commission.budgetMin) : 'no minimum'} – ${
          commission.budgetMax != null ? formatPrice(commission.budgetMax) : 'no maximum'
        }`
      : 'not given';

  const text = `New commission enquiry from ${commission.name}.

PIECE
${commission.pieceType}${commission.fabric ? ` on ${commission.fabric}` : ''}

BRIEF
${commission.brief}

BUDGET
${budget}

TIMELINE
${commission.timeline || 'not given'}

REFERENCE PICTURES
${commission.attachmentCount ? `${commission.attachmentCount} attached — open the enquiry to see them` : 'none'}

REPLY TO
${commission.email}${commission.phone ? `\n${commission.phone}` : ''}

Open it at ${absoluteUrl('/admin/commissions')}`;

  return compose('', `Commission enquiry from ${commission.name}`, text, commission.email);
}

/* -------------------------------------------------------------------------- */
/* Customer: enquiry and commission acknowledgements                          */
/* -------------------------------------------------------------------------- */

export function enquiryAcknowledgement(enquiry: { name: string; email: string; subject: string }): MailMessage {
  const text = `Thank you — your message reached the store.

We have it under "${enquiry.subject}".

Someone in the family reads these; there is no support desk. A reply usually takes a day or two, occasionally longer when the workshop is mid-dyeing and nobody is at a screen.`;

  return compose(enquiry.email, 'We have your message', text);
}

export function commissionAcknowledgement(commission: {
  name: string;
  email: string;
}): MailMessage {
  const text = `Thank you — your commission enquiry reached the store.

Nothing is committed at this point and no payment has been taken. What happens next is a conversation: whether the subject suits pen Kalamkari, which cloth it should be drawn on, what it would cost and how long it would honestly take.

Two things worth repeating before you hear back. The monsoon stops everything, because every stage of this craft ends with the cloth going into the sun — a timeline agreed in January is far more reliable than one agreed in July. And natural dye is not a colour picker: we can promise madder red, indigo blue and myrobalan gold, but not an exact match to a paint chip.

Expect a reply within a few days.`;

  return compose(commission.email, 'Your commission enquiry', text);
}

/* -------------------------------------------------------------------------- */
/* Store: order status changed by admin                                       */
/* -------------------------------------------------------------------------- */

export function orderStatusChanged(
  order: Pick<OrderMailData, 'number' | 'email'>,
  status: string,
  note: string,
): MailMessage {
  const text = `Order ${order.number} — ${statusLabel(status).toLowerCase()}.

${note}

Follow it at ${absoluteUrl('/orders/track')}.`;

  return compose(order.email, `Order ${order.number}: ${statusLabel(status).toLowerCase()}`, text);
}

/* -------------------------------------------------------------------------- */
/* Store: a payment that arrived for an order that can no longer take it      */
/* -------------------------------------------------------------------------- */

export function storeLatePaymentNotice(payment: {
  orderNumber: string;
  razorpayPaymentId: string;
  amount: number;
}): MailMessage {
  const text = `A payment arrived for order ${payment.orderNumber}, which had already been cancelled.

PAYMENT   ${payment.razorpayPaymentId}
AMOUNT    ${formatPrice(payment.amount)}

The order has NOT been restored and its stock has not been touched. The money has been taken and is owed back to the customer: refund this payment from the Razorpay dashboard, and tell them.

Open the order at ${absoluteUrl(`/admin/orders/${payment.orderNumber}`)}`;

  return compose('', `Refund needed: late payment on ${payment.orderNumber}`, text);
}
