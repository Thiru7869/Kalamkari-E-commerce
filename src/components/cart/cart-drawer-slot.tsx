import { getCart } from '@/lib/cart';
import { CartDrawer } from './cart-drawer';

/**
 * Reads the bag on the server and hands it to the drawer.
 *
 * `getCart` is wrapped in `React.cache`, so this costs no extra query on pages
 * that read the bag anyway. Rendered inside <Suspense> in the root layout, like
 * the header's badge, so it never delays a page.
 */
export async function CartDrawerSlot() {
  const cart = await getCart();
  return <CartDrawer cart={cart} />;
}
