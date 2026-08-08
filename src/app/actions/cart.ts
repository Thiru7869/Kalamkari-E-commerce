'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { resolveCart } from '@/lib/cart';

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

export async function addToCart(productId: string, quantity = 1): Promise<ActionResult> {
  if (!productId) return { ok: false, error: 'Missing product' };

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

  const cart = await resolveCart({ create: true });
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
  if (!session?.user?.id) {
    return { ok: false, error: 'Sign in to save pieces to your wishlist.' };
  }

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
