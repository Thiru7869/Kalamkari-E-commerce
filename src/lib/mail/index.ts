import 'server-only';

import { sendMail, storeInbox, type MailResult } from '@/lib/mail/transport';
import * as templates from '@/lib/mail/templates';

/**
 * The notification layer.
 *
 * Call sites use these rather than composing messages themselves, so that the
 * decision about *who* is told about an event lives in one file next to the
 * decision about *what* they are told.
 *
 * Everything here is fire-and-forget from the caller's point of view: each
 * function resolves to a result and never rejects. A checkout that succeeded
 * must not be reported as failed because a mail host was unreachable.
 */

export type { MailResult };
export { isMailConfigured, willDeliver } from '@/lib/mail/transport';

/** Send to the store's own inbox, if one is configured. */
async function toStore(message: ReturnType<typeof templates.storeEnquiryNotice>): Promise<MailResult> {
  const inbox = storeInbox();
  if (!inbox) {
    // Previewed rather than dropped: on a deployment with no store address
    // configured, the console is the only record that this arrived.
    return sendMail({ ...message, to: '' });
  }
  return sendMail({ ...message, to: inbox });
}

/* -------------------------------------------------------------------------- */
/* Orders                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * A new order: receipt to the customer, notice to the store.
 *
 * Sent in parallel and awaited together, because the caller has already
 * committed the order and is only waiting to redirect.
 */
export async function notifyOrderPlaced(order: templates.OrderMailData) {
  const [customer, store] = await Promise.all([
    sendMail(templates.orderConfirmation(order)),
    toStore(templates.storeOrderNotice(order)),
  ]);
  return { customer, store };
}

export async function notifyOrderDispatched(
  order: { number: string; email: string; shipName: string },
  courier: string | null,
  trackingNumber: string | null,
) {
  return sendMail(templates.orderDispatched(order, courier, trackingNumber));
}

export async function notifyOrderCancelled(
  order: { number: string; email: string },
  refunded: boolean,
) {
  return sendMail(templates.orderCancelled(order, refunded));
}

export async function notifyOrderStatus(
  order: { number: string; email: string },
  status: string,
  note: string,
) {
  return sendMail(templates.orderStatusChanged(order, status, note));
}

export async function notifyReturnRequested(
  order: { number: string; email: string },
  reason: string,
) {
  const [customer, store] = await Promise.all([
    sendMail(templates.returnRequestReceived(order, reason)),
    toStore(
      templates.storeEnquiryNotice({
        name: order.email,
        email: order.email,
        phone: null,
        subject: `Return request — order ${order.number}`,
        message: reason,
      }),
    ),
  ]);
  return { customer, store };
}

/* -------------------------------------------------------------------------- */
/* Forms                                                                      */
/* -------------------------------------------------------------------------- */

export async function notifyEnquiry(enquiry: {
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
}) {
  const [store, customer] = await Promise.all([
    toStore(templates.storeEnquiryNotice(enquiry)),
    sendMail(templates.enquiryAcknowledgement(enquiry)),
  ]);
  return { store, customer };
}

export async function notifyCommission(commission: {
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
}) {
  const [store, customer] = await Promise.all([
    toStore(templates.storeCommissionNotice(commission)),
    sendMail(templates.commissionAcknowledgement(commission)),
  ]);
  return { store, customer };
}
