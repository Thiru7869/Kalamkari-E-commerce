import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  createRazorpayOrder,
  fetchRazorpayPayment,
  isRazorpayConfigured,
  verifyRazorpaySignature,
} from '@/lib/payments';
import { confirmOrderPaid } from '@/lib/order-payment';
import { hasOrderAccess } from '@/lib/order-access';
import { orderNumberSchema } from '@/lib/schemas/order-number';
import { limitByIp, tooManyRequests } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createSchema = z.object({
  action: z.literal('create'),
  orderNumber: orderNumberSchema,
});

const verifySchema = z.object({
  action: z.literal('verify'),
  orderNumber: orderNumberSchema,
  razorpayOrderId: z.string().min(1).max(64),
  razorpayPaymentId: z.string().min(1).max(64),
  signature: z.string().min(1).max(256),
});

/**
 * Razorpay create + verify.
 *
 * The amount charged is read from the order row on the server. It is never
 * taken from the request body — a client-supplied amount is the single most
 * common way payment integrations are exploited.
 *
 * `create` is **idempotent**: an order gets one Razorpay order, once. The
 * previous version overwrote `razorpayOrderId` on every call, which meant a
 * second tab — or anybody who knew an order number — could replace the id
 * under a payment that was already in flight, and the payment would then be
 * rejected as belonging to a different order: money taken, order stuck.
 */
export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: 'Online payment is not configured.' },
      { status: 503 },
    );
  }

  const limited = await limitByIp('payment');
  if (!limited.ok) return tooManyRequests(limited);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const create = createSchema.safeParse(body);
  if (create.success) return handleCreate(create.data.orderNumber);

  const verify = verifySchema.safeParse(body);
  if (verify.success) return handleVerify(verify.data);

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}

async function handleCreate(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { number: orderNumber },
    select: {
      id: true,
      number: true,
      userId: true,
      total: true,
      status: true,
      paymentMethod: true,
      paymentStatus: true,
      razorpayOrderId: true,
    },
  });

  // Not found and not yours look the same: this endpoint must not confirm
  // which order numbers exist.
  const session = await auth();
  const entitled =
    order !== null &&
    ((session?.user?.id && order.userId === session.user.id) ||
      session?.user?.role === 'ADMIN' ||
      (await hasOrderAccess(order.number)));
  if (!order || !entitled) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  if (order.paymentStatus === 'PAID') {
    return NextResponse.json({ error: 'Already paid.' }, { status: 409 });
  }
  // Only an online order that is still waiting for its payment can be started.
  // A cancelled order must never gain a live payment.
  if (
    order.paymentMethod !== 'RAZORPAY' ||
    order.status !== 'PENDING' ||
    !['PENDING', 'FAILED'].includes(order.paymentStatus)
  ) {
    return NextResponse.json({ error: 'This order cannot be paid online.' }, { status: 409 });
  }

  try {
    let razorpayOrderId = order.razorpayOrderId;

    if (!razorpayOrderId) {
      const created = await createRazorpayOrder({
        amountInPaise: order.total,
        receipt: order.number,
        notes: { orderNumber: order.number },
      });

      // Conditional: only the first writer sets it. A concurrent request that
      // lost the race adopts the winner's id; its own Razorpay order is simply
      // never used.
      const claimed = await prisma.order.updateMany({
        where: { id: order.id, razorpayOrderId: null, status: 'PENDING' },
        data: { razorpayOrderId: created.id },
      });

      if (claimed.count === 1) {
        razorpayOrderId = created.id;
      } else {
        const fresh = await prisma.order.findUnique({
          where: { id: order.id },
          select: { razorpayOrderId: true },
        });
        razorpayOrderId = fresh?.razorpayOrderId ?? null;
      }
    }

    if (!razorpayOrderId) {
      return NextResponse.json({ error: 'This order cannot be paid online.' }, { status: 409 });
    }

    return NextResponse.json({
      razorpayOrderId,
      // From the order row, always.
      amount: order.total,
      currency: 'INR',
      // The key id is public by design; reading it from the same variable the
      // server authenticates with means the two cannot drift apart.
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation failed', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Could not start payment.' }, { status: 502 });
  }
}

async function handleVerify(data: z.infer<typeof verifySchema>) {
  const valid = verifyRazorpaySignature({
    razorpayOrderId: data.razorpayOrderId,
    razorpayPaymentId: data.razorpayPaymentId,
    signature: data.signature,
  });

  if (!valid) {
    // Do not reveal which part failed.
    return NextResponse.json({ error: 'Payment could not be verified.' }, { status: 400 });
  }

  // The signature says this payment belongs to this Razorpay order. It does
  // not say how much was paid or whether it was captured, so ask Razorpay.
  let payment;
  try {
    payment = await fetchRazorpayPayment(data.razorpayPaymentId);
  } catch (error) {
    // The webhook will still confirm the order; the browser can look again.
    console.error('Razorpay payment lookup failed', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Could not confirm the payment yet.' }, { status: 502 });
  }

  if (payment.id !== data.razorpayPaymentId || payment.order_id !== data.razorpayOrderId) {
    return NextResponse.json({ error: 'Payment does not match this order.' }, { status: 400 });
  }

  if (payment.status !== 'captured') {
    // Authorised but not yet captured: not money in hand. The webhook confirms
    // on capture.
    return NextResponse.json({ ok: true, pending: true }, { status: 202 });
  }

  // Both this and the webhook confirm through the same idempotent path, so
  // whichever arrives first wins and the second is a no-op. See
  // lib/order-payment.ts.
  const result = await confirmOrderPaid({
    orderNumber: data.orderNumber,
    razorpayOrderId: data.razorpayOrderId,
    razorpayPaymentId: data.razorpayPaymentId,
    amount: payment.amount,
    currency: payment.currency,
    source: 'browser',
  });

  switch (result.outcome) {
    case 'not-found':
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    case 'mismatched-order':
    case 'amount-mismatch':
      return NextResponse.json({ error: 'Payment does not match this order.' }, { status: 400 });
    case 'late-payment':
    case 'not-eligible':
      // Recorded for the store to refund. The customer is not told "paid".
      return NextResponse.json(
        { error: 'This order can no longer be completed. The store will be in touch about your payment.' },
        { status: 409 },
      );
    default:
      // 'confirmed', or 'already-paid' — the webhook simply got there first.
      return NextResponse.json({ ok: true });
  }
}
