import { NextResponse } from 'next/server';
import { verifyRazorpayWebhook } from '@/lib/payments';
import { confirmOrderPaid, recordPaymentFailure } from '@/lib/order-payment';

/**
 * Razorpay webhook.
 *
 * This is the authoritative record of a payment. The browser callback in
 * ../route.ts is a convenience — it makes the confirmation page appear
 * immediately — but it only fires if the customer's tab survives long enough
 * to send it. This does not depend on the customer at all.
 *
 * Three properties matter here:
 *
 *  1. **The raw body is verified before it is parsed.** The signature covers
 *     the exact bytes Razorpay sent; re-serialising a parsed object produces
 *     different bytes and a signature that never matches. So the body is read
 *     as text, checked, and only then turned into JSON.
 *  2. **Delivery is at-least-once, so handling is idempotent.** Razorpay
 *     retries until it gets a 2xx. `confirmOrderPaid` claims the order with a
 *     conditional update, so a redelivered event is a no-op rather than a
 *     second confirmation email.
 *  3. **Anything understood returns 200.** A non-2xx makes Razorpay retry, and
 *     retrying an event this store has no handler for accomplishes nothing but
 *     noise. Only a genuinely failed attempt to record a real payment is worth
 *     a 500, because that one *should* be retried.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** The subset of the payload this store acts on. */
type RazorpayWebhookBody = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        error_description?: string;
        error_reason?: string;
        notes?: Record<string, string>;
      };
    };
  };
};

export async function POST(request: Request) {
  const signature = request.headers.get('x-razorpay-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });
  }

  // Read as text. See note 1 above — this must be the bytes as sent.
  const raw = await request.text();

  if (!verifyRazorpayWebhook(raw, signature)) {
    // Covers both a forged payload and a deployment with no webhook secret
    // configured; neither should be told which.
    return NextResponse.json({ error: 'Signature could not be verified.' }, { status: 401 });
  }

  let body: RazorpayWebhookBody;
  try {
    body = JSON.parse(raw) as RazorpayWebhookBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const event = body.event;
  const payment = body.payload?.payment?.entity;

  // Acknowledged and ignored: events this store does not act on.
  if (!event || !payment?.order_id) {
    return NextResponse.json({ received: true, handled: false });
  }

  try {
    if (event === 'payment.captured' || event === 'order.paid') {
      // The order number is carried in the notes set at creation time. It is
      // cross-checked against razorpayOrderId inside confirmOrderPaid, so a
      // forged note cannot redirect a payment onto another order.
      const orderNumber = payment.notes?.orderNumber;
      if (!orderNumber) {
        console.error('[razorpay webhook] captured payment carried no order number', {
          razorpayOrderId: payment.order_id,
        });
        return NextResponse.json({ received: true, handled: false });
      }

      const result = await confirmOrderPaid({
        orderNumber,
        razorpayOrderId: payment.order_id,
        razorpayPaymentId: payment.id ?? '',
        source: 'webhook',
      });

      if (result.outcome === 'not-found' || result.outcome === 'mismatched-order') {
        // Not retryable — retrying will not make the order appear or match.
        console.error(`[razorpay webhook] ${result.outcome}`, {
          orderNumber,
          razorpayOrderId: payment.order_id,
        });
        return NextResponse.json({ received: true, handled: false });
      }

      return NextResponse.json({ received: true, handled: true, outcome: result.outcome });
    }

    if (event === 'payment.failed') {
      await recordPaymentFailure({
        razorpayOrderId: payment.order_id,
        reason: payment.error_description ?? payment.error_reason ?? 'declined',
      });
      return NextResponse.json({ received: true, handled: true });
    }
  } catch (error) {
    // A database failure while recording a real payment is exactly the case
    // that should be retried, so this is the one path that returns 5xx.
    console.error('[razorpay webhook] failed to record event', event, error);
    return NextResponse.json({ error: 'Could not record event.' }, { status: 500 });
  }

  return NextResponse.json({ received: true, handled: false });
}
