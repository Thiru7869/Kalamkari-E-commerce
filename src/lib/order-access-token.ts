import { createHmac, timingSafeEqual } from 'node:crypto';
import { ORDER_NUMBER_PATTERN } from '@/lib/schemas/order-number';

/**
 * The signed capability behind a guest's right to read their own order.
 *
 * What it replaces: a plaintext cookie holding order numbers. `httpOnly` keeps
 * *page scripts* from touching a cookie; it does nothing about a person with
 * curl or devtools, who can send `Cookie: svl_orders=SVL-ANYTHING` and be
 * treated as that order's owner. The cookie was an assertion made by the
 * client about itself.
 *
 * Now the server signs what it grants (HMAC-SHA256 over the grant list, keyed
 * by `AUTH_SECRET`) and checks the signature on the way back, so the only
 * orders a browser can claim are the ones this server handed it, for as long
 * as the server said.
 *
 * Pure functions with the secret and clock passed in, so every rejection path
 * is unit-testable without a request.
 *
 * Wire format: `v1.<base64url(json)>.<base64url(hmac)>`.
 */

const VERSION = 'v1';
/** Domain separation: this key is never valid for anything else the secret signs. */
const CONTEXT = 'svl.order-access.v1';

export const MAX_GRANTS = 10;
export const GRANT_TTL_SECONDS = 60 * 60;

export type Grant = { number: string; expiresAt: number };

function mac(secret: string, body: string): Buffer {
  return createHmac('sha256', secret).update(`${CONTEXT}.${body}`).digest();
}

export function signGrants(grants: Grant[], secret: string): string {
  const body = Buffer.from(
    JSON.stringify(grants.slice(0, MAX_GRANTS).map((g) => [g.number, g.expiresAt])),
  ).toString('base64url');
  return `${VERSION}.${body}.${mac(secret, body).toString('base64url')}`;
}

/**
 * The grants this value legitimately carries at `nowSeconds`.
 *
 * Returns an empty list — never throws — for anything wrong with the value: not
 * the expected shape, wrong version, bad signature, unparseable payload. An
 * expired individual grant is dropped while the rest survive.
 */
export function readGrants(
  value: string | undefined | null,
  secret: string,
  nowSeconds: number,
): Grant[] {
  if (!value) return [];

  const parts = value.split('.');
  if (parts.length !== 3 || parts[0] !== VERSION) return [];
  const [, body, signature] = parts;

  const expected = mac(secret, body);
  let given: Buffer;
  try {
    given = Buffer.from(signature, 'base64url');
  } catch {
    return [];
  }
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const grants: Grant[] = [];
  for (const entry of parsed.slice(0, MAX_GRANTS)) {
    if (!Array.isArray(entry) || entry.length !== 2) continue;
    const [number, expiresAt] = entry;
    if (typeof number !== 'string' || !ORDER_NUMBER_PATTERN.test(number)) continue;
    if (typeof expiresAt !== 'number' || !Number.isFinite(expiresAt)) continue;
    if (expiresAt <= nowSeconds) continue;
    grants.push({ number, expiresAt });
  }
  return grants;
}
