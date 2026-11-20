'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { resolveCart, resolveCartForWrite } from '@/lib/cart';
import { addQuantitySchema, idSchema, setQuantitySchema } from '@/lib/schemas/cart';
import { isRateLimitedError } from '@/lib/errors';
import { limitByIp, limitByKey, RATE_LIMITED_MESSAGE } from '@/lib/rate-limit';
import { cookies } from 'next/headers';
import {
  GUEST_WISHLIST_CAP,
  GUEST_WISHLIST_COOKIE,
  GUEST_WISHLIST_MAX_AGE,
  parseGuestWishlist,
  serializeGuestWishlist,
  toggleGuestWishlist,
} from '@/lib/guest-wishlist';

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

export async function addToCart(productId: string, quantity = 1): Promise<ActionResult> {
  // Server actions are public endpoints; the types above bind the component
  // that calls this and nobody else. A quantity of -5 used to sail through and
  // put a negative line in the bag. Validate what actually arrived.
  const id = idSchema.safeParse(productId);
  const qty = addQuantitySchema.safeParse(quantity);
  if (!id.success) return { ok: false, error: 'Missing product' };
  if (!qty.success) return { ok: false, error: 'That quantity is not valid.' };
  productId = id.data;
  quantity = qty.data;

  if (!(await limitByIp('cartWrite')).ok) return { ok: false, error: RATE_LIMITED_MESSAGE };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, stock: true, status: true, name: true },
  });

  if (!product || product.status !== 'ACTIVE') {
    return { ok: false, error: 'This piece is no longer available.' };
  }
  if (product.stock < 1) {
    return { ok: false, error: 'This piece has sold. We can paint another — ask about a commission.' };
  }

  let cart;
  try {
    cart = await resolveCartForWrite();
  } catch (error) {
    if (isRateLimitedError(error)) return { ok: false, error: RATE_LIMITED_MESSAGE };
    throw error;
  }
  if (!cart) return { ok: false, error: 'Could not open a cart. Please try again.' };

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  // Almost everything here is a single unique piece, so the cap is real.
  const desired = (existing?.quantity ?? 0) + quantity;
  if (desired > product.stock) {
    return {
      ok: false,
      error:
        product.stock === 1
          ? 'This is a one-of-a-kind piece — only one exists.'
          : `Only ${product.stock} of these are available.`,
    };
  }

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: desired },
    create: { cartId: cart.id, productId, quantity },
  });

  revalidatePath('/cart');
  revalidatePath('/', 'layout');
  return { ok: true, message: `${product.name} added to your bag` };
}

export async function updateCartItem(itemId: string, quantity: number): Promise<ActionResult> {
  const id = idSchema.safeParse(itemId);
  const qty = setQuantitySchema.safeParse(quantity);
  if (!id.success) return { ok: false, error: 'That item is no longer in your bag.' };
  // Zero removes the line, which the stepper relies on. Negatives, fractions,
  // NaN and absurd values are refused rather than stored.
  if (!qty.success) return { ok: false, error: 'That quantity is not valid.' };
  itemId = id.data;
  quantity = qty.data;

  if (!(await limitByIp('cartWrite')).ok) return { ok: false, error: RATE_LIMITED_MESSAGE };

  const cart = await resolveCart();
  if (!cart) return { ok: false, error: 'Your bag is empty.' };

  // Scoped by cartId so one visitor can never mutate another's cart item.
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { product: { select: { stock: true } } },
  });
  if (!item) return { ok: false, error: 'That item is no longer in your bag.' };

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    if (quantity > item.product.stock) {
      return { ok: false, error: `Only ${item.product.stock} available.` };
    }
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
  }

  revalidatePath('/cart');
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function removeCartItem(itemId: string): Promise<ActionResult> {
  const id = idSchema.safeParse(itemId);
  if (!id.success) return { ok: false, error: 'That item is no longer in your bag.' };
  itemId = id.data;

  const cart = await resolveCart();
  if (!cart) return { ok: false, error: 'Your bag is empty.' };

  const deleted = await prisma.cartItem.deleteMany({
    where: { id: itemId, cartId: cart.id },
  });
  if (deleted.count === 0) return { ok: false, error: 'That item is no longer in your bag.' };

  revalidatePath('/cart');
  revalidatePath('/', 'layout');
  return { ok: true, message: 'Removed' };
}

export async function toggleWishlist(
  productId: string,
): Promise<ActionResult & { wishlisted?: boolean }> {
  const session = await auth();

  const id = idSchema.safeParse(productId);
  if (!id.success) return { ok: false, error: 'That piece is no longer listed.' };
  productId = id.data;

  if (!session?.user?.id) return toggleGuestWishlistItem(productId);

  if (!(await limitByKey('wishlist', session.user.id)).ok) {
    return { ok: false, error: RATE_LIMITED_MESSAGE };
  }

  // Wishlisting something that does not exist is a foreign-key failure, not a
  // state the visitor can reach honestly.
  const exists = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!exists) return { ok: false, error: 'That piece is no longer listed.' };

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath('/wishlist');
    return { ok: true, wishlisted: false, message: 'Removed from wishlist' };
  }

  await prisma.wishlistItem.create({ data: { userId: session.user.id, productId } });
  revalidatePath('/wishlist');
  return { ok: true, wishlisted: true, message: 'Saved to your wishlist' };
}

/**
 * The wishlist for somebody who has not signed in: a cookie of ids.
 *
 * It lives here, in a Server Action, because this is where a cookie may be
 * written. The piece is checked against the database first, so the cookie only
 * ever holds ids of real, listed products, and the request is rate limited by
 * address because there is no account to key it on.
 *
 * Removing is always allowed, even for a piece that has since gone; adding past
 * the cap is refused rather than silently dropping something already saved.
 * When the visitor signs in, `mergeGuestWishlist` carries the list across.
 */
async function toggleGuestWishlistItem(
  productId: string,
): Promise<ActionResult & { wishlisted?: boolean }> {
  if (!(await limitByIp('wishlist')).ok) return { ok: false, error: RATE_LIMITED_MESSAGE };

  const jar = await cookies();
  const current = parseGuestWishlist(jar.get(GUEST_WISHLIST_COOKIE)?.value);

  if (!current.includes(productId)) {
    const exists = await prisma.product.findFirst({
      where: { id: productId, status: 'ACTIVE' },
      select: { id: true },
    });
    if (!exists) return { ok: false, error: 'That piece is no longer listed.' };
  }

  const next = toggleGuestWishlist(current, productId);
  if (!next.ok) {
    return {
      ok: false,
      error:
        next.reason === 'full'
          ? `You have saved ${GUEST_WISHLIST_CAP} pieces, which is as many as can be kept without an account. Remove one, or sign in to save more.`
          : 'That piece is no longer listed.',
    };
  }

  jar.set(GUEST_WISHLIST_COOKIE, serializeGuestWishlist(next.ids), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: GUEST_WISHLIST_MAX_AGE,
  });

  revalidatePath('/wishlist');
  return {
    ok: true,
    wishlisted: next.wishlisted,
    message: next.wishlisted ? 'Saved to your wishlist' : 'Removed from wishlist',
  };
}
