import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  createRazorpayOrder,
  isRazorpayConfigured,
  verifyRazorpaySignature,
} from '@/lib/payments';
import { confirmOrderPaid } from '@/lib/order-payment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createSchema = z.object({
  action: z.literal('create'),
  orderNumber: z.string().regex(/^SVL-[A-Z0-9]{6}$/),
});

const verifySchema = z.object({
  action: z.literal('verify'),
  orderNumber: z.string().regex(/^SVL-[A-Z0-9]{6}$/),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  signature: z.string().min(1),
});

/**
 * Razorpay create + verify.
 *
 * The amount charged is read from the order row on the server. It is never
 * taken from the request body — a client-supplied amount is the single most
 * common way payment integrations are exploited.
 */
export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: 'Online payment is not configured.' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const create = createSchema.safeParse(body);
  if (create.success) {
    const order = await prisma.order.findUnique({
      where: { number: create.data.orderNumber },
      select: { id: true, number: true, total: true, paymentStatus: true },
    });

    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ error: 'Already paid.' }, { status: 409 });
    }

    try {
      const razorpayOrder = await createRazorpayOrder({
        amountInPaise: order.total,
        receipt: order.number,
        notes: { orderNumber: order.number },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: razorpayOrder.id },
      });

      return NextResponse.json({
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      });
    } catch (error) {
      console.error('Razorpay order creation failed', error);
      return NextResponse.json({ error: 'Could not start payment.' }, { status: 502 });
    }
  }

  const verify = verifySchema.safeParse(body);
  if (verify.success) {
    const valid = verifyRazorpaySignature({
      razorpayOrderId: verify.data.razorpayOrderId,
      razorpayPaymentId: verify.data.razorpayPaymentId,
      signature: verify.data.signature,
    });

    if (!valid) {
      // Do not reveal which part failed.
      return NextResponse.json({ error: 'Payment could not be verified.' }, { status: 400 });
    }

    // Both this and the webhook confirm through the same idempotent path, so
    // whichever arrives first wins and the second is a no-op. See
    // lib/order-payment.ts.
    const result = await confirmOrderPaid({
      orderNumber: verify.data.orderNumber,
      razorpayOrderId: verify.data.razorpayOrderId,
      razorpayPaymentId: verify.data.razorpayPaymentId,
      source: 'browser',
    });

    if (result.outcome === 'not-found') {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    if (result.outcome === 'mismatched-order') {
      return NextResponse.json({ error: 'Payment does not match this order.' }, { status: 400 });
    }

    // 'already-paid' is success from the browser's point of view — the webhook
    // simply got there first.
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}
