import 'server-only';

import { cookies } from 'next/headers';

/**
 * Proof that the person looking at an order is the person who placed it.
 *
 * The problem this solves: after checkout the customer has to be shown their
 * own order, but they are usually a guest, so there is no session to check
 * against. The obvious fix — putting the email in the redirect URL — leaks it
 * into browser history, into any access log the response passes through, and
 * into the `Referer` header of every outbound link on the page. An email
 * address is exactly the second factor that stops an order number alone from
 * exposing a home address and a phone number, so it must not be published in
 * the one place a shoulder-surfer can read it.
 *
 * Instead the checkout action writes a short-lived httpOnly cookie naming the
 * orders that browser is entitled to read. No secret is involved and nothing
 * has to be signed: the cookie is unreadable and unwritable from JavaScript,
 * scoped to this site, and expires within the hour — the window in which
 * somebody actually looks at a confirmation page.
 *
 * Signed-in customers and admins do not need it; they are checked by session.
 */

const COOKIE = 'svl_orders';
const MAX_AGE = 60 * 60; // One hour.
const MAX_TRACKED = 10;

/** Grant this browser the right to read `number`. Server Actions only. */
export async function grantOrderAccess(number: string) {
  const jar = await cookies();
  const existing = readGranted(jar.get(COOKIE)?.value);
  // Newest first, de-duplicated, capped — a cookie is not a database.
  const next = [number, ...existing.filter((n) => n !== number)].slice(0, MAX_TRACKED);

  jar.set(COOKIE, next.join(','), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

function readGranted(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((n) => n.trim().toUpperCase())
    .filter((n) => /^SVL-[A-Z0-9]{6}$/.test(n));
}

/** Whether this browser was granted access to `number`. Read-only, safe in render. */
export async function hasOrderAccess(number: string): Promise<boolean> {
  const jar = await cookies();
  return readGranted(jar.get(COOKIE)?.value).includes(number.toUpperCase());
}
