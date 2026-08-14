import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';

/**
 * The pieces this visitor has opened, most recent first.
 *
 * **Why a cookie and not `Product.viewCount`.** `viewCount` is a single
 * integer on the row — it counts how many times *anybody* opened a piece. It
 * can answer "what is the store looking at" and it cannot answer "what was
 * *this* person looking at", because it does not know who anybody is. A rail
 * built on it would show the same six pieces to every visitor and call them
 * "recently viewed", which is a plain untruth of the kind the rest of this
 * site goes to some trouble to avoid. So history is per-visitor and lives
 * here; `viewCount` is still incremented alongside it (see
 * `src/app/actions/product-view.ts`) and is now a real popularity figure that
 * something could later be built on.
 *
 * The read/write split is the same one `src/lib/cart.ts` carries, and for the
 * same load-bearing reason: Next only permits cookie mutation inside a Server
 * Action or a Route Handler. `readRecentlyViewed` is reached during render on
 * both `/shop` and every product page, so it must never write.
 */

const COOKIE = 'svl_seen';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * How many to remember.
 *
 * Twelve is two full rows of the rail and about 320 bytes of cookie, which is
 * sent on every request to this origin including images. It is a deliberate
 * ceiling rather than a round number: this is a catalogue of a few dozen
 * one-of-one pieces, and a visitor who has opened more than twelve of them is
 * better served by the shop grid than by a longer strip of history.
 */
const MAX = 12;

/**
 * cuid, and nothing else.
 *
 * The cookie is attacker-controlled. These ids only ever reach Prisma as a
 * parameterised `in` list so there is no injection to have, but an unbounded
 * cookie is still a way to make the server do arbitrary work and to have
 * arbitrary text echoed back through this module. Anything that is not
 * plausibly one of our own ids is dropped rather than queried.
 */
const ID = /^[a-z0-9]{20,32}$/;

function parse(raw: string | undefined): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  for (const part of raw.split(',')) {
    const id = part.trim();
    if (ID.test(id)) seen.add(id);
    if (seen.size >= MAX) break;
  }
  return [...seen];
}

/**
 * Read-only. Safe anywhere, including render.
 *
 * Cached for the request: the product page renders the rail and could later
 * grow a second consumer, and two reads of one cookie should not be two
 * parses.
 */
export const readRecentlyViewed = cache(async (): Promise<string[]> => {
  const jar = await cookies();
  return parse(jar.get(COOKIE)?.value);
});

/**
 * Push a piece to the front of the history.
 *
 * **Only callable from a Server Action or Route Handler** — it sets a cookie.
 *
 * Moves rather than appends: opening a piece you already opened should bring
 * it back to the front, not leave it buried where it was and add a duplicate.
 */
export async function recordRecentlyViewed(productId: string) {
  if (!ID.test(productId)) return;

  const jar = await cookies();
  const current = parse(jar.get(COOKIE)?.value);
  const next = [productId, ...current.filter((id) => id !== productId)].slice(0, MAX);

  jar.set(COOKIE, next.join(','), {
    // Nothing here needs to be readable by client script, and a cookie that
    // is not readable is a cookie that cannot be rewritten by anything running
    // on the page.
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}
