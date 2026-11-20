import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { SectionHeader } from '@/components/layout/section-header';
import { ProductGrid } from '@/components/shop/product-card';
import { Pagination } from '@/components/shop/pagination';
import { getProducts, getSoldProducts } from '@/lib/queries';
import { getWishlistIds } from '@/lib/cart';

/**
 * The sold archive: every piece that has found a home, kept apart from the shop.
 *
 * The shop lists only what can be bought. These pieces keep their pages — the
 * drawing is evidence of what the workshop does — but they are not in the
 * grid beside available work. Each is one of one, so the page also offers
 * pieces that are still available, taken from the live catalogue and nothing
 * else.
 */

export const metadata: Metadata = {
  title: 'Sold archive',
  description:
    'Pieces drawn once and already sold. Each keeps its page; none will be reprinted. See what is still available, or commission something similar.',
  alternates: { canonical: '/archive' },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ArchivePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const requested = Number(raw);
  const pageNumber = Number.isInteger(requested) && requested > 0 ? requested : 1;

  const [sold, available, wishlistIds] = await Promise.all([
    getSoldProducts(pageNumber),
    getProducts({ inStockOnly: true, sort: 'newest', page: 1 }),
    getWishlistIds(),
  ]);

  const stillAvailable = available.items.slice(0, 4);

  return (
    <>
      <header className="border-b border-border bg-cotton-100 pb-10 pt-10 md:pb-14 md:pt-12 dark:bg-card">
        <div className="container">
          <Breadcrumbs trail={[{ label: 'Shop', href: '/' }, { label: 'Sold archive' }]} />
          <SectionHeader
            as="h1"
            size="lg"
            eyebrow="Already found a home"
            title="Sold archive"
            lead="Each of these was drawn once and is now with its owner. They stay here as a record of the work. If one of them was the piece you wanted, a sibling can be drawn on purpose."
            className="mt-5"
          />
          <p className="mt-5">
            <Link
              href="/custom"
              className="inline-flex min-h-[2.75rem] items-center text-sm font-medium text-primary underline underline-offset-4"
            >
              Commission something similar
            </Link>
          </p>
        </div>
      </header>

      {stillAvailable.length > 0 && (
        <section className="section-y-sm border-b border-border" aria-labelledby="available-heading">
          <div className="container">
            <SectionHeader
              as="h2"
              size="sm"
              id="available-heading"
              eyebrow="Still available"
              title="Newest pieces you can buy now"
              action={{ label: 'See the whole shop', href: '/' }}
            />
            <div className="mt-6">
              <ProductGrid products={stillAvailable} wishlistIds={wishlistIds} />
            </div>
          </div>
        </section>
      )}

      <section className="container section-y-sm" aria-labelledby="sold-heading">
        <h2 id="sold-heading" className="sr-only">
          Sold pieces
        </h2>
        {sold.items.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground" role="status">
              <span className="tabular">{sold.total}</span>{' '}
              {sold.total === 1 ? 'piece' : 'pieces'} in the archive
            </p>
            <div className="pt-6">
              <ProductGrid products={sold.items} wishlistIds={wishlistIds} priorityCount={0} />
            </div>
            <Pagination page={sold.page} pageCount={sold.pageCount} />
          </>
        ) : (
          <div className="py-16 text-center">
            <h2 className="font-display text-2xl">Nothing has gone yet</h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Every piece in the shop is still available.
            </p>
            <Link href="/" className="mt-6 inline-block text-primary underline underline-offset-4">
              Back to the shop
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
