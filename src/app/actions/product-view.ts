'use server';

import { prisma } from '@/lib/prisma';
import { recordRecentlyViewed } from '@/lib/recently-viewed';

/**
 * Record that somebody opened a piece.
 *
 * Two things happen and they are for different readers: `viewCount` goes up on
 * the row, which is the store's figure, and the id goes to the front of this
 * visitor's history cookie, which is theirs. Until now `viewCount` was a column
 * nothing ever wrote to.
 *
 * Called from an effect on the product page rather than during its render,
 * because this sets a cookie and a Server Component render may not — the same
 * rule that shapes `src/lib/cart.ts`.
 *
 * Note this file exports only async functions. A `'use server'` module that
 * exports a constant is a runtime error that takes down every action in the
 * module graph; see CLAUDE.md.
 */
export async function recordProductView(productId: string) {
  /*
    `updateMany`, not `update`.

    The id arrives from the browser. `update` throws when the row is absent,
    so a stale bookmark or a hand-edited request would turn a fire-and-forget
    counter into an unhandled rejection. `updateMany` matching zero rows is
    simply zero rows, and its count is also how we know the id is real.

    Scoped to ACTIVE so a draft or archived piece cannot be counted or land in
    somebody's history.
  */
  const { count } = await prisma.product.updateMany({
    where: { id: productId, status: 'ACTIVE' },
    data: { viewCount: { increment: 1 } },
  });

  if (count === 0) return;

  await recordRecentlyViewed(productId);
}
