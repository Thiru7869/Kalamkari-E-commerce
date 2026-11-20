/**
 * The guest wishlist: a short list of product ids in a cookie.
 *
 * Kept free of `server-only`, `next/headers` and the database so that every
 * rule about it can be unit-tested. The cookie itself is read and written in
 * `lib/cart.ts` and `app/actions/cart.ts`, under the same read/write split the
 * cart follows: reading may happen anywhere, including during render; writing
 * only inside a Server Action or a Route Handler.
 *
 * Nothing here is trusted. The cookie is whatever the browser sends, so a
 * value is parsed rather than believed, and an id is only a *candidate* until
 * the database has confirmed the product exists.
 */

export const GUEST_WISHLIST_COOKIE = 'svl_wish';

/** The most pieces a guest can hold. Signed-in wishlists are not capped here. */
export const GUEST_WISHLIST_CAP = 50;

export const GUEST_WISHLIST_MAX_AGE = 60 * 60 * 24 * 60; // 60 days, like the bag.

/** Product ids are cuids: letters and digits only, and short. */
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * Read the cookie value into a list, newest first, with duplicates, anything
 * malformed and anything beyond the cap dropped.
 */
export function parseGuestWishlist(raw: string | null | undefined): string[] {
  if (!raw) return [];

  const seen = new Set<string>();
  const ids: string[] = [];

  for (const part of raw.split(',')) {
    const id = part.trim();
    if (!ID_PATTERN.test(id) || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
    if (ids.length === GUEST_WISHLIST_CAP) break;
  }

  return ids;
}

export function serializeGuestWishlist(ids: readonly string[]): string {
  return ids.join(',');
}

export type GuestToggle =
  | { ok: true; ids: string[]; wishlisted: boolean }
  | { ok: false; reason: 'full' | 'invalid' };

/**
 * Add the piece if it is absent, remove it if present.
 *
 * Adding puts it first, so the list reads newest-saved first like the signed-in
 * wishlist. When the list is full an add is refused rather than silently
 * pushing out something the visitor chose to keep; removing always works.
 */
export function toggleGuestWishlist(current: readonly string[], productId: string): GuestToggle {
  if (!ID_PATTERN.test(productId)) return { ok: false, reason: 'invalid' };

  if (current.includes(productId)) {
    return { ok: true, ids: current.filter((id) => id !== productId), wishlisted: false };
  }

  if (current.length >= GUEST_WISHLIST_CAP) return { ok: false, reason: 'full' };

  return { ok: true, ids: [productId, ...current], wishlisted: true };
}
