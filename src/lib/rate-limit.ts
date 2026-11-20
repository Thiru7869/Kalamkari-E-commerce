import 'server-only';

import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  checkRateLimit,
  clientIp,
  type LimitName,
  type RateLimitResult,
} from '@/lib/rate-limit-core';

/**
 * Request-scoped rate limiting for server actions and route handlers.
 * The limits and the failure behaviour are documented in `rate-limit-core.ts`.
 */

export const RATE_LIMITED_MESSAGE =
  'Too many requests from this connection. Please wait a little and try again.';

/** Limit by the caller's network address. For server actions and handlers alike. */
export async function limitByIp(name: LimitName): Promise<RateLimitResult> {
  return checkRateLimit(name, clientIp(await headers()));
}

/** Limit by an arbitrary key, such as a user id. */
export async function limitByKey(name: LimitName, key: string): Promise<RateLimitResult> {
  return checkRateLimit(name, key);
}

/**
 * Limit by something personal — an email address — without storing it.
 * Redis keys are visible to anyone with dashboard access; a digest is not.
 */
export async function limitByPrivateKey(
  name: LimitName,
  value: string,
): Promise<RateLimitResult> {
  const digest = createHash('sha256').update(value.trim().toLowerCase()).digest('hex').slice(0, 32);
  return checkRateLimit(name, `h:${digest}`);
}

/** The 429 a route handler returns. */
export function tooManyRequests(
  result: RateLimitResult,
  body: unknown = { error: RATE_LIMITED_MESSAGE },
) {
  return NextResponse.json(body, {
    status: 429,
    headers: { 'Retry-After': String(result.retryAfterSeconds) },
  });
}

/**
 * Gate for sending a sign-in link.
 *
 * A link is an email to whatever address was typed, so an unthrottled form is a
 * way to fill a stranger's inbox. Limited by caller *and* by recipient, so
 * neither one script nor many scripts can drown one address. Throws, which
 * Auth.js turns into an error on the sign-in page rather than a "check your
 * email" for a message that was never sent.
 */
export async function assertSignInAllowed(identifier: string): Promise<void> {
  const [byCaller, byRecipient] = await Promise.all([
    limitByIp('signin'),
    limitByPrivateKey('signin', identifier),
  ]);
  if (!byCaller.ok || !byRecipient.ok) {
    throw new Error('Too many sign-in attempts. Please wait a few minutes and try again.');
  }
}
