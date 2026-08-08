import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import {
  computeTotals,
  EMPTY_CART,
  type CartLine,
  type CartSummary,
} from '@/lib/totals';

// Re-exported so existing call sites keep one import for everything cart-shaped.
// The arithmetic itself lives in lib/totals.ts, free of the auth stack.
export { computeTotals, EMPTY_CART };
export type { CartLine, CartSummary };

const GUEST_COOKIE = 'svl_cart';
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 60; // 60 days

/**
 * Resolve the caller's cart **without writing anything**.
 *
 * This is the version every read path uses, and the distinction is load-bearing
 * rather than stylistic: Next only permits cookie mutation inside a Server
 * Action or a Route Handler. A `cookies().set()` or `.delete()` reached during
 * a Server Component render throws, and because the header renders a cart badge
 * on every page, that would have taken down the whole site for any signed-in
 * visitor who still carried a guest cookie.
 *
 * So nothing here creates a row, sets a cookie, or claims a guest cart. Guest
 * carts are merged once, in the Auth.js `signIn` event (see `mergeGuestCart`),
 * which runs inside a route handler where mutation is legal.
 *
 * Wrapped in `cache` so the several components that need the cart in one render
 * — the header badge, its screen-reader label, the page body — share a single
 * session lookup and a single query.
 */
export const resolveCart = cache(async () => {
  const session = await auth();
  const jar = await cookies();

  if (session?.user?.id) {
    return prisma.cart.findUnique({ where: { userId: session.user.id } });
  }

  const guestId = jar.get(GUEST_COOKIE)?.value;
  if (!guestId) return null;
  return prisma.cart.findUnique({ where: { guestId } });
});

/**
 * Resolve the caller's cart, creating one if needed.
 *
 * **Only callable from a Server Action or Route Handler** — it may set the
 * guest cookie. Read paths must use `resolveCart` instead.
 */
export async function resolveCartForWrite() {
  const session = await auth();
  const jar = await cookies();

  if (session?.user?.id) {
    const userId = session.user.id;
    const existing = await prisma.cart.findUnique({ where: { userId } });
    if (existing) return existing;
    return prisma.cart.create({ data: { userId } });
  }

  const guestId = jar.get(GUEST_COOKIE)?.value;
  if (guestId) {
    const cart = await prisma.cart.findUnique({ where: { guestId } });
    if (cart) return cart;
  }

  const newGuestId = randomUUID();
  const cart = await prisma.cart.create({ data: { guestId: newGuestId } });
  jar.set(GUEST_COOKIE, newGuestId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: GUEST_COOKIE_MAX_AGE,
  });
  return cart;
}

/**
 * Move a guest cart onto a user account, then drop the guest cookie.
 *
 * Called from the Auth.js `signIn` event — a route handler context, so the
 * cookie deletion here is legal. A visitor who filled a bag and then signed in
 * to pay must not lose it.
 *
 * Quantities are incremented rather than replaced, and capped at live stock so
 * a merge can never leave someone holding two of a one-of-one piece.
 */
export async function mergeGuestCart(userId: string) {
  const jar = await cookies();
  const guestId = jar.get(GUEST_COOKIE)?.value;
  if (!guestId) return;

  // Whatever happens below, the cookie has served its purpose.
  jar.delete(GUEST_COOKIE);

  const guestCart = await prisma.cart.findUnique({
    where: { guestId },
    include: { items: { include: { product: { select: { stock: true } } } } },
  });
  if (!guestCart) return;

  if (guestCart.items.length > 0) {
    const target =
      (await prisma.cart.findUnique({ where: { userId } })) ??
      (await prisma.cart.create({ data: { userId } }));

    for (const item of guestCart.items) {
      const existing = await prisma.cartItem.findUnique({
        where: { cartId_productId: { cartId: target.id, productId: item.productId } },
      });
      const merged = (existing?.quantity ?? 0) + item.quantity;
      const quantity = Math.min(merged, item.product.stock);
      if (quantity < 1) continue;

      await prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: target.id, productId: item.productId } },
        update: { quantity },
        create: { cartId: target.id, productId: item.productId, quantity },
      });
    }
  }

  await prisma.cart.delete({ where: { id: guestCart.id } });
}

export const getCart = cache(async (): Promise<CartSummary> => {
  const cart = await resolveCart();
  if (!cart) return EMPTY_CART;

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    orderBy: { createdAt: 'asc' },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true,
          stock: true,
          status: true,
          category: { select: { slug: true } },
        },
      },
    },
  });

  const { primaryImage } = await import('@/lib/serialize');

  const lines: CartLine[] = items
    // A piece archived after being added should disappear rather than block checkout.
    .filter((item) => item.product.status === 'ACTIVE')
    .map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      name: item.product.name,
      slug: item.product.slug,
      image: primaryImage(item.product.images),
      price: item.product.price,
      stock: item.product.stock,
      categorySlug: item.product.category.slug,
    }));

  return { id: cart.id, lines, ...computeTotals(lines) };
});

/**
 * Cheap count for the header badge — avoids loading full product rows.
 *
 * Cached: the header renders both a visual badge and a separate screen-reader
 * label from this, and neither should cost its own query.
 */
export const getCartCount = cache(async (): Promise<number> => {
  const cart = await resolveCart();
  if (!cart) return 0;
  const result = await prisma.cartItem.aggregate({
    where: { cartId: cart.id },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
});

export const getWishlistIds = cache(async (): Promise<Set<string>> => {
  const session = await auth();
  if (!session?.user?.id) return new Set();
  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });
  return new Set(items.map((i) => i.productId));
});
