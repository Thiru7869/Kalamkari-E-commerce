import { site } from '@/content/site';

/**
 * Cart arithmetic.
 *
 * Split out from lib/cart.ts deliberately. That module resolves the caller's
 * cart, which means it reaches for the session and the cookie jar and drags in
 * the whole auth stack behind it. This file is the part that decides what
 * somebody is charged, and it depends on nothing but the shipping rules — so
 * it can be read, reasoned about and unit-tested on its own.
 *
 * Every figure here is integer paise, as everywhere else in this codebase.
 * Nothing in this file divides by 100; that happens once, in `formatPrice`,
 * at the moment a number becomes text.
 */

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

export function computeTotals(lines: CartLine[]) {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  // An empty bag is never charged shipping; a full one is free at or above the
  // threshold, which is what "free above" says on the shipping page.
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
