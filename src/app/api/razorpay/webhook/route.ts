import { createHash } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRazorpayWebhook } from '@/lib/payments';
import { confirmOrderPaid, recordPaymentFailure } from '@/lib/order-payment';
import { razorpayEnv } from '@/lib/env';

/**
 * Razorpay webhook.
 *
 * This is the authoritative record of a payment. The browser callback in
 * ../route.ts is a convenience — it makes the confirmation page appear
 * immediately — but it only fires if the customer's tab survives long enough
 * to send it. This does not depend on the customer at all.
 *
 * Four properties matter here:
 *
 *  1. **The raw body is verified before it is parsed.** The signature covers
 *     the exact bytes Razorpay sent; re-serialising a parsed object produces
 *     different bytes and a signature that never matches. So the body is read
 *     as text, checked, and only then turned into JSON.
 *  2. **Every delivery is written down before it is acted on**, keyed by
 *     Razorpay's event id with a unique constraint. A redelivery cannot insert
 *     a second row, so it cannot be processed as if it were new. A delivery
 *     that failed halfway has no `processedAt` and *is* processed again —
 *     Razorpay retries precisely so that happens.
 *  3. **Handling is idempotent anyway.** The event log stops replays; the
 *     conditional claim in `confirmOrderPaid` is what makes the handler safe
 *     if two deliveries race past it. Two layers, deliberately.
 *  4. **Anything understood returns 200.** A non-2xx makes Razorpay retry, and
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
        amount?: number;
        currency?: string;
        status?: string;
        error_description?: string;
        error_reason?: string;
        notes?: Record<string, string>;
      };
    };
  };
};

/**
 * Razorpay's own id for this delivery. When a request carries none — which
 * Razorpay's documentation says it always does — the digest of the body stands
 * in, so identical redeliveries still collapse into one row.
 */
function eventIdOf(request: Request, raw: string): string {
  const header = request.headers.get('x-razorpay-event-id')?.trim();
  if (header) return header.slice(0, 128);
  return `body:${createHash('sha256').update(raw).digest('hex')}`;
}

export async function POST(request: Request) {
  // Checked first, and loudly. Without a secret nothing can be verified, so
  // every delivery would be refused — and the shop would still be taking
  // payments. The site stops offering online payment in this state
  // (`isRazorpayConfigured`); this makes the reason visible in the logs.
  const env = razorpayEnv();
  if (!env.configured && env.missing.includes('RAZORPAY_WEBHOOK_SECRET')) {
    console.error('[razorpay webhook] RAZORPAY_WEBHOOK_SECRET is not set; refusing delivery');
    return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 503 });
  }

  const signature = request.headers.get('x-razorpay-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });
  }

  // Read as text. See note 1 above — this must be the bytes as sent.
  const raw = await request.text();

  if (!verifyRazorpayWebhook(raw, signature)) {
    // Covers a forged payload; it should not be told which part was wrong.
    return NextResponse.json({ error: 'Signature could not be verified.' }, { status: 401 });
  }

  let body: RazorpayWebhookBody;
  try {
    body = JSON.parse(raw) as RazorpayWebhookBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const event = body.event;
  const eventId = eventIdOf(request, raw);

  /* Write the delivery down before acting on it. */
  let logId: string;
  try {
    const row = await prisma.webhookEvent.create({
      data: { provider: 'razorpay', eventId, type: event ?? 'unknown' },
      select: { id: true },
    });
    logId = row.id;
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
      console.error('[razorpay webhook] could not record delivery', error);
      return NextResponse.json({ error: 'Could not record event.' }, { status: 500 });
    }

    // Seen before.
    const previous = await prisma.webhookEvent.findUnique({
      where: { provider_eventId: { provider: 'razorpay', eventId } },
      select: { id: true, processedAt: true },
    });
    if (previous?.processedAt) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    // It arrived but never finished — process it again.
    if (!previous) return NextResponse.json({ error: 'Could not record event.' }, { status: 500 });
    await prisma.webhookEvent.update({
      where: { id: previous.id },
      data: { attempts: { increment: 1 } },
    });
    logId = previous.id;
  }

  try {
    const response = await handle(body);
    await prisma.webhookEvent.update({
      where: { id: logId },
      data: { processedAt: new Date(), lastError: null },
    });
    return response;
  } catch (error) {
    // A database failure while recording a real payment is exactly the case
    // that should be retried, so this is the one path that returns 5xx. The
    // row keeps no `processedAt`, so the retry is processed rather than skipped.
    console.error('[razorpay webhook] failed to record event', event, error);
    await prisma.webhookEvent
      .update({
        where: { id: logId },
        data: { lastError: (error instanceof Error ? error.message : 'unknown').slice(0, 300) },
      })
      .catch(() => undefined);
    return NextResponse.json({ error: 'Could not record event.' }, { status: 500 });
  }
}

async function handle(body: RazorpayWebhookBody): Promise<NextResponse> {
  const event = body.event;
  const payment = body.payload?.payment?.entity;

  // Acknowledged and ignored: events this store does not act on.
  if (!event || !payment?.order_id) {
    return NextResponse.json({ received: true, handled: false });
  }

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

    // Money is only money once it is captured.
    if (payment.status !== undefined && payment.status !== 'captured') {
      return NextResponse.json({ received: true, handled: false });
    }

    // Amount and currency come from the signed payload. A payload without them
    // cannot be checked, and an unchecked payment is not confirmed.
    const result = await confirmOrderPaid({
      orderNumber,
      razorpayOrderId: payment.order_id,
      razorpayPaymentId: payment.id ?? '',
      amount: typeof payment.amount === 'number' ? payment.amount : -1,
      currency: payment.currency ?? '',
      source: 'webhook',
    });

    if (
      result.outcome === 'not-found' ||
      result.outcome === 'mismatched-order' ||
      result.outcome === 'amount-mismatch'
    ) {
      // Not retryable — retrying will not make the order appear or match. It
      // is logged for a person: money was taken that this store did not apply.
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

  return NextResponse.json({ received: true, handled: false });
}
