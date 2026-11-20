import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { trustedProxyHops, upstashEnv } from '@/lib/env';

/**
 * Rate limiting that holds across serverless instances.
 *
 * The limiters this replaces were a `Map` per process. On a serverless host
 * every invocation may be a fresh process, so the effective limit was
 * "per instance, per cold start" — a script simply outran it. These counters
 * live in Upstash Redis, so every instance sees the same window.
 *
 * This file is free of `server-only` and of `next/headers` so the edge
 * middleware can use it; request-scoped helpers are in `rate-limit.ts`.
 *
 * **Failure behaviour.** If Upstash is unconfigured, errors, or times out, the
 * check falls back to a per-instance limiter with the *same* limits and logs
 * it. That is weaker than the shared one but it is not "off", and an Upstash
 * outage does not take checkout down with it. `@upstash/ratelimit` on its own
 * would answer a timeout with `success: true`; that case is detected and
 * routed to the fallback rather than waved through.
 */

type Window = { limit: number; seconds: number };

/**
 * One entry per kind of operation, sized to the cost of getting it wrong.
 * Generous enough that no real visitor meets them; tight enough to stop a loop.
 */
export const LIMITS = {
  // Cart
  cartWrite: { limit: 40, seconds: 60 },
  guestCart: { limit: 10, seconds: 3600 },
  wishlist: { limit: 60, seconds: 60 },
  productView: { limit: 120, seconds: 60 },
  // Orders and payment
  checkout: { limit: 6, seconds: 600 },
  checkoutEmail: { limit: 5, seconds: 3600 },
  payment: { limit: 20, seconds: 600 },
  track: { limit: 10, seconds: 600 },
  trackNumber: { limit: 10, seconds: 3600 },
  // Anything that sends the store (or the visitor) an email
  enquiry: { limit: 5, seconds: 3600 },
  commission: { limit: 3, seconds: 3600 },
  newsletter: { limit: 5, seconds: 3600 },
  review: { limit: 10, seconds: 3600 },
  returnRequest: { limit: 5, seconds: 3600 },
  signin: { limit: 6, seconds: 600 },
  // Reads that cost money or walk the catalogue
  assistant: { limit: 12, seconds: 60 },
  search: { limit: 90, seconds: 60 },
} as const satisfies Record<string, Window>;

export type LimitName = keyof typeof LIMITS;

export type RateLimitResult = {
  ok: boolean;
  retryAfterSeconds: number;
  /** True when the shared limiter was unavailable and the local one answered. */
  degraded: boolean;
};

/* -------------------------------------------------------------------------- */
/* Client address                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The caller's address, without believing the caller.
 *
 * `X-Forwarded-For` is a list each proxy appends to. Everything the *client*
 * sent is at the left, so taking the first entry — what the old limiters did —
 * lets anyone choose their own bucket by sending a header. The entry that
 * counts is the one appended by our own edge: `TRUSTED_PROXY_HOPS` places from
 * the right (default 1, correct on Vercel and Render).
 */
export function clientIp(headers: Headers): string {
  const hops = trustedProxyHops();
  if (hops > 0) {
    const chain = (headers.get('x-forwarded-for') ?? '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    const entry = chain[chain.length - hops];
    if (entry) return entry;
    const real = headers.get('x-real-ip')?.trim();
    if (real) return real;
  }
  return 'unknown';
}

/* -------------------------------------------------------------------------- */
/* Per-instance fallback                                                      */
/* -------------------------------------------------------------------------- */

const local = new Map<string, number[]>();

function localCheck(name: LimitName, identifier: string): RateLimitResult {
  const { limit, seconds } = LIMITS[name];
  const windowMs = seconds * 1000;
  const now = Date.now();
  const key = `${name}:${identifier}`;

  const recent = (local.get(key) ?? []).filter((t) => now - t < windowMs);
  const ok = recent.length < limit;
  if (ok) recent.push(now);
  local.set(key, recent);

  if (local.size > 5000) {
    for (const [k, times] of local) {
      if (times.every((t) => now - t >= windowMs)) local.delete(k);
    }
  }

  const oldest = recent[0] ?? now;
  return {
    ok,
    retryAfterSeconds: ok ? 0 : Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    degraded: true,
  };
}

/* -------------------------------------------------------------------------- */
/* Shared limiter                                                             */
/* -------------------------------------------------------------------------- */

let redis: Redis | null = null;
const limiters = new Map<LimitName, Ratelimit>();
const warned = new Set<string>();

function warnOnce(key: string, message: string, error?: unknown) {
  if (warned.has(key)) return;
  warned.add(key);
  // The message names the problem, never a credential.
  console.error(`[rate-limit] ${message}`, error instanceof Error ? error.message : '');
}

function limiterFor(name: LimitName): Ratelimit | null {
  const env = upstashEnv();
  if (!env) {
    warnOnce(
      'unconfigured',
      'UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set — using a per-instance limiter, which does not hold across serverless instances.',
    );
    return null;
  }

  redis ??= new Redis({ url: env.url, token: env.token });

  let limiter = limiters.get(name);
  if (!limiter) {
    const { limit, seconds } = LIMITS[name];
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${seconds} s`),
      prefix: `svl:rl:${name}`,
      // Bounded wait: a slow Redis must not hang a checkout. A timeout is
      // detected below and handled by the fallback, not treated as a pass.
      timeout: 1500,
      analytics: false,
    });
    limiters.set(name, limiter);
  }
  return limiter;
}

export async function checkRateLimit(
  name: LimitName,
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = limiterFor(name);
  if (!limiter) return localCheck(name, identifier);

  try {
    const result = await limiter.limit(identifier);
    // Fire-and-forget bookkeeping must not become an unhandled rejection.
    Promise.resolve(result.pending).catch(() => undefined);

    if (result.reason === 'timeout') {
      warnOnce(`timeout:${name}`, `Upstash timed out on "${name}" — using the per-instance limiter.`);
      return localCheck(name, identifier);
    }

    return {
      ok: result.success,
      retryAfterSeconds: result.success
        ? 0
        : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
      degraded: false,
    };
  } catch (error) {
    warnOnce(`error:${name}`, `Upstash failed on "${name}" — using the per-instance limiter.`, error);
    return localCheck(name, identifier);
  }
}

/** Test seam: forget memoised clients and counters. */
export function resetRateLimitState() {
  redis = null;
  limiters.clear();
  local.clear();
  warned.clear();
}
