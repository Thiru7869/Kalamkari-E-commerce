import { ProductCard } from './product-card';
import { readRecentlyViewed } from '@/lib/recently-viewed';
import { getRecentlyViewed } from '@/lib/queries';
import { getWishlistIds } from '@/lib/cart';
import { cn } from '@/lib/utils';

/**
 * The pieces this visitor has already opened.
 *
 * Non-intrusive by construction: it renders **nothing at all** until there are
 * at least two pieces to show. One card is not a history, it is the page you
 * just came from, and a section heading over a single thumbnail is furniture.
 *
 * It earns its place on a catalogue like this one specifically because almost
 * every piece is one of one. On a shop with stock, going back to something you
 * liked is a search away. Here the thing you liked may be gone by the time you
 * come back for it, and there is no second one — so the cheapest possible path
 * back to it is worth a strip at the foot of the page.
 *
 * A rail on a phone and a grid from `sm`, using the same snap behaviour the
 * rest of the site's horizontal strips use.
 */
export async function RecentlyViewed({
  excludeId,
  className,
}: {
  /** The piece currently being read — never shown in its own history. */
  excludeId?: string;
  className?: string;
}) {
  const ids = await readRecentlyViewed();
  const products = await getRecentlyViewed(ids, excludeId);

  if (products.length < 2) return null;

  const wishlistIds = await getWishlistIds();

  return (
    <section
      aria-labelledby="recently-viewed-heading"
      className={cn('border-t border-border section-y', className)}
    >
      <div className="container">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="recently-viewed-heading" className="text-display-sm">
            Pieces you have opened
          </h2>
          <p className="text-sm text-muted-foreground">
            Kept on this device for a month. Nothing here is reserved.
          </p>
        </div>

        {/*
          The second line above is not a disclaimer, it is the fact that
          matters most on this particular catalogue: looking at a one-of-one
          piece holds nothing, and somebody returning to a rail like this a
          week later needs to know that before they assume otherwise.
        */}

        <ul className="snap-rail mt-6 -mx-5 px-5 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-x-3.5 sm:gap-y-7 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {products.map((product) => (
            <li key={product.id} className="flex w-[46vw] max-w-[11rem] sm:w-auto sm:max-w-none">
              <ProductCard
                product={product}
                wishlisted={wishlistIds.has(product.id)}
                className="w-full"
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 24vw, 46vw"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
