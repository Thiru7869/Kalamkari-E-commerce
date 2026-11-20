/**
 * Environment access with validation.
 *
 * Deliberately lazy. Nothing here runs at import time: `next build` evaluates
 * modules with `NODE_ENV=production` and none of the runtime secrets, and a
 * check that threw on import would fail every build. Each getter validates
 * when something actually needs the value, and fails loudly then.
 *
 * Free of `server-only` so the edge middleware can read the Upstash settings.
 */

const DEV_AUTH_SECRET = 'development-only-secret-never-used-in-production-0000';

/** The signing secret. Required, and strong, in production. */
export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret) {
    if (process.env.NODE_ENV === 'production' && secret.length < 32) {
      throw new Error('AUTH_SECRET must be at least 32 characters in production.');
    }
    return secret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET is not set. It signs sessions and order-access cookies.');
  }
  return DEV_AUTH_SECRET;
}

export type RazorpayConfig = {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
};

/**
 * Everything online payment needs, or the list of what is missing.
 *
 * The webhook secret is part of "configured". Without it every webhook is
 * rejected, so a customer who pays and closes the tab is never confirmed —
 * offering online payment in that state takes money the store cannot match.
 */
export function razorpayEnv():
  | { configured: true; config: RazorpayConfig }
  | { configured: false; missing: string[] } {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();

  const missing: string[] = [];
  if (!keyId) missing.push('RAZORPAY_KEY_ID');
  if (!keySecret) missing.push('RAZORPAY_KEY_SECRET');
  if (!webhookSecret) missing.push('RAZORPAY_WEBHOOK_SECRET');

  if (missing.length > 0) return { configured: false, missing };
  return {
    configured: true,
    config: { keyId: keyId!, keySecret: keySecret!, webhookSecret: webhookSecret! },
  };
}

/** True when some, but not all, of the payment variables are set. */
export function razorpayPartiallyConfigured(): boolean {
  const env = razorpayEnv();
  return !env.configured && env.missing.length < 3;
}

export function upstashEnv(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  return url && token ? { url, token } : null;
}

/**
 * How many proxies sit between the internet and this app, each appending to
 * `X-Forwarded-For`. The client address is the entry that many places from the
 * right: everything to its left was supplied by the client and means nothing.
 * Vercel and Render are both one hop.
 */
export function trustedProxyHops(): number {
  const text = process.env.TRUSTED_PROXY_HOPS?.trim();
  // An empty variable (`TRUSTED_PROXY_HOPS=`) is "not set", not zero: `Number('')`
  // is 0, which would silently stop trusting any proxy and put every visitor in
  // one shared bucket.
  if (!text) return 1;
  const raw = Number(text);
  return Number.isInteger(raw) && raw >= 0 && raw <= 5 ? raw : 1;
}
