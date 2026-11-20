import { getCartCount } from '@/lib/cart';

/**
 * The bag's item count, for the phone tab bar.
 *
 * A server component passed into the (client) tab bar as a slot, for the same
 * reason the header's badge is one: the count comes from the cart, which is
 * read on the server. `getCartCount` is wrapped in `React.cache`, so rendering
 * it here as well as in the header costs no second query.
 *
 * Renders nothing for an empty bag — a "0" badge is noise, and no count is
 * shown that the cart does not actually hold.
 */
export async function BagCount() {
  const count = await getCartCount();
  if (count === 0) return null;

  return (
    <span className="tabular absolute -right-2.5 -top-1.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-semibold leading-none text-primary-foreground">
      <span aria-hidden="true">{count > 9 ? '9+' : count}</span>
      <span className="sr-only">{count === 1 ? '1 item in bag' : `${count} items in bag`}</span>
    </span>
  );
}
