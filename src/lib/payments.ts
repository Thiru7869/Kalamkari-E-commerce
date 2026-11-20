import 'server-only';

import crypto from 'crypto';
import { razorpayEnv } from '@/lib/env';

/**
 * Razorpay integration — wired end to end, but inert without keys.
 *
 * The store can launch on cash on delivery alone and switch payments on later
 * by setting three environment variables. Nothing here fabricates a successful
 * payment: with no keys, the online option is simply not offered.
 */

/**
 * Online payment is offered only when everything it needs is present — the
 * webhook secret included. Without it every webhook is rejected, so a customer
 * who pays and closes the tab is never confirmed: money taken, nothing matched.
 * Better not to offer the option than to offer one that cannot finish.
 */
export function isRazorpayConfigured() {
  return razorpayEnv().configured;
}

/** Names of the variables still needed, for logs and the health surface. Never values. */
export function razorpayMissingVariables(): string[] {
  const env = razorpayEnv();
  return env.configured ? [] : env.missing;
}

function requireRazorpay() {
  const env = razorpayEnv();
  if (!env.configured) {
    throw new Error(`Razorpay is not configured (missing: ${env.missing.join(', ')})`);
  }
  return env.config;
}

type RazorpayOrder = { id: string; amount: number; currency: string; status: string };

/**
 * Creates an order with Razorpay. Called from the server only — the key secret
 * must never reach the browser.
 */
export async function createRazorpayOrder(params: {
  amountInPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const config = requireRazorpay();
  const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64');

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: params.amountInPaise,
      currency: 'INR',
      receipt: params.receipt,
      notes: params.notes ?? {},
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Razorpay order creation failed (${response.status}): ${detail}`);
  }

  return response.json() as Promise<RazorpayOrder>;
}

/**
 * Verifies the signature Razorpay returns to the browser after checkout.
 *
 * This is the only thing standing between a real payment and a forged one, so
 * it uses a timing-safe comparison and is always run server-side before an
 * order is marked paid.
 */
/** A payment as Razorpay itself reports it. The amount is in paise. */
export type RazorpayPayment = {
  id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  status: string;
};

/**
 * Asks Razorpay what a payment actually is.
 *
 * The browser's signature proves that a payment id and an order id belong
 * together. It says nothing about how much was paid or whether the money has
 * been captured, and the browser is the party with a reason to lie about both.
 * So the amount, currency and status are read from Razorpay, not the caller.
 */
export async function fetchRazorpayPayment(paymentId: string): Promise<RazorpayPayment> {
  const config = requireRazorpay();
  const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64');

  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
    { headers: { Authorization: `Basic ${auth}` } },
  );
  if (!response.ok) {
    throw new Error(`Razorpay payment lookup failed (${response.status})`);
  }
  return response.json() as Promise<RazorpayPayment>;
}

export function verifyRazorpaySignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!secret) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest('hex');

  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(params.signature, 'utf8');
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}

/**
 * Verifies a Razorpay webhook payload against the shared webhook secret.
 * Separate from the checkout signature above — different secret, different
 * message format.
 */
export function verifyRazorpayWebhook(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret) return false;

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}
