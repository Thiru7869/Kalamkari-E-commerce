import 'server-only';

import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { site } from '@/content/site';

const GUEST_COOKIE = 'svl_cart';
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 60; // 60 days

export type CartLine = {
  id: string;
  productId: string;
  quantity: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  /** Live stock, so the cart can warn when a one-of-one piece has since sold. */
  stock: number;
  categorySlug: string;
};

export type CartSummary = {
  id: string | null;
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  /** Paise still needed to reach free shipping, or 0. */
  freeShippingGap: number;
};

export const EMPTY_CART: CartSummary = {
  id: null,
  lines: [],
  itemCount: 0,
  subtotal: 0,
  shipping: 0,
  total: 0,
  freeShippingGap: site.shipping.freeAbove,
};

/**
 * Resolve the caller's cart, creating one if needed.
 *
 * `create: false` is used by read paths so that merely viewing a page never
 * writes a row or sets a cookie for a visitor who has not added anything.
 */
export async function resolveCart(opts: { create?: boolean } = {}) {
  const create = opts.create ?? false;
  const session = await auth();
  const jar = await cookies();

  if (session?.user?.id) {
    const userId = session.user.id;
    const existing = await prisma.cart.findUnique({ where: { userId } });

    // A visitor who filled a cart and then signed in must keep it.
    const guestId = jar.get(GUEST_COOKIE)?.value;
    if (guestId) {
      const guestCart = await prisma.cart.findUnique({
        where: { guestId },
        include: { items: true },
      });
      if (guestCart && guestCart.items.length > 0) {
        const target =
          existing ?? (await prisma.cart.create({ data: { userId } }));
        for (const item of guestCart.items) {
          await prisma.cartItem.upsert({
            where: { cartId_productId: { cartId: target.id, productId: item.productId } },
            update: { quantity: { increment: item.quantity } },
            create: {
              cartId: target.id,
              productId: item.productId,
              quantity: item.quantity,
            },
          });
        }
        await prisma.cart.delete({ where: { id: guestCart.id } });
        jar.delete(GUEST_COOKIE);
        return target;
      }
      jar.delete(GUEST_COOKIE);
    }

    if (existing) return existing;
    return create ? prisma.cart.create({ data: { userId } }) : null;
  }

  const guestId = jar.get(GUEST_COOKIE)?.value;
  if (guestId) {
    const cart = await prisma.cart.findUnique({ where: { guestId } });
    if (cart) return cart;
  }

  if (!create) return null;

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

export function computeTotals(lines: CartLine[]) {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const shipping =
    subtotal === 0 || subtotal >= site.shipping.freeAbove ? 0 : site.shipping.flatRate;
  return {
    subtotal,
    itemCount,
    shipping,
    total: subtotal + shipping,
    freeShippingGap: Math.max(0, site.shipping.freeAbove - subtotal),
  };
}

export async function getCart(): Promise<CartSummary> {
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
}

/** Cheap count for the header badge — avoids loading full product rows. */
export async function getCartCount(): Promise<number> {
  const cart = await resolveCart();
  if (!cart) return 0;
  const result = await prisma.cartItem.aggregate({
    where: { cartId: cart.id },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}

export async function getWishlistIds(): Promise<Set<string>> {
  const session = await auth();
  if (!session?.user?.id) return new Set();
  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });
  return new Set(items.map((i) => i.productId));
}
