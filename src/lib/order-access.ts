import 'server-only';

import { cookies } from 'next/headers';
import { getAuthSecret } from '@/lib/env';
import {
  GRANT_TTL_SECONDS,
  MAX_GRANTS,
  readGrants,
  signGrants,
} from '@/lib/order-access-token';

/**
 * Proof that the person looking at an order is the person who placed it.
 *
 * After checkout a guest has no session, so the server hands the browser a
 * short-lived **signed** cookie naming the orders it may read. The signature is
 * the point: see `order-access-token.ts` for why an unsigned cookie was not
 * access control. Putting the email in the redirect URL instead would leak it
 * into history, logs and `Referer`.
 *
 * Signed-in customers and admins do not need it; they are checked by session.
 */

const COOKIE = 'svl_orders';

const now = () => Math.floor(Date.now() / 1000);

/** Grant this browser the right to read `number`. Server Actions only. */
export async function grantOrderAccess(number: string) {
  const secret = getAuthSecret();
  const jar = await cookies();
  const existing = readGrants(jar.get(COOKIE)?.value, secret, now());

  const expiresAt = now() + GRANT_TTL_SECONDS;
  // Newest first, de-duplicated, capped — a cookie is not a database.
  const next = [
    { number: number.toUpperCase(), expiresAt },
    ...existing.filter((g) => g.number !== number.toUpperCase()),
  ].slice(0, MAX_GRANTS);

  jar.set(COOKIE, signGrants(next, secret), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: GRANT_TTL_SECONDS,
  });
}

/** Whether this browser was granted access to `number`. Read-only, safe in render. */
export async function hasOrderAccess(number: string): Promise<boolean> {
  const jar = await cookies();
  const granted = readGrants(jar.get(COOKIE)?.value, getAuthSecret(), now());
  return granted.some((g) => g.number === number.toUpperCase());
}
