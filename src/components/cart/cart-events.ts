/**
 * A one-way "open the bag" signal from the add-to-bag button to the drawer.
 *
 * It carries no cart data. The cart itself is always read on the server and
 * arrives through `router.refresh()`, exactly as before; this only says "show
 * it now". `detail.handled` lets the sender know whether a drawer was actually
 * listening, so it can fall back to its toast when none is (on /cart and
 * /checkout, for instance).
 */
export const CART_OPEN_EVENT = 'svl:cart-open';

export type CartOpenDetail = { handled: boolean };

/** Returns true if a drawer took the signal. */
export function requestCartDrawer(): boolean {
  if (typeof window === 'undefined') return false;
  const detail: CartOpenDetail = { handled: false };
  window.dispatchEvent(new CustomEvent<CartOpenDetail>(CART_OPEN_EVENT, { detail }));
  return detail.handled;
}
