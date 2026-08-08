import type { Metadata } from 'next';
import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import { ProductGrid } from '@/components/shop/product-card';
import { SearchForm } from '@/components/shop/search-form';
import { getProducts } from '@/lib/queries';
import { getWishlistIds } from '@/lib/cart';
import { shopCategories } from '@/content/site';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search hand-painted Kalamkari by motif, cloth, story or name.',
  robots: { index: false, follow: true },
};

type Search = Promise<{ q?: string }>;

const SUGGESTIONS = [
  'Ramayana',
  'Tree of Life',
  'Tussar silk',
  'Indigo',
  'Peacock',
  'Cotton saree',
  'Krishna',
];

export default async function SearchPage({ searchParams }: { searchParams: Search }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  const [{ items, total }, wishlistIds] = await Promise.all([
    query ? getProducts({ q: query }) : Promise.resolve({ items: [], total: 0, page: 1, pageCount: 1 }),
    getWishlistIds(),
  ]);

  return (
    <div className="container py-10 md:py-14">
      <h1 className="text-display-lg">Search</h1>

      <SearchForm defaultValue={query} className="mt-6 max-w-xl" />

      {!query ? (
        <div className="mt-10">
          <p className="text-sm text-muted-foreground">Try one of these:</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <Link
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className="inline-flex h-9 items-center rounded-sm border border-border px-3 text-sm transition-colors hover:border-foreground/40"
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12">
            <p className="text-sm text-muted-foreground">Or browse by category:</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {shopCategories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/shop/${c.slug}`}
                    className="inline-flex h-9 items-center rounded-sm border border-border px-3 text-sm transition-colors hover:border-foreground/40"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : total === 0 ? (
        <div className="py-20 text-center">
          <SearchIcon className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-5 font-display text-2xl">
            Nothing here matches “{query}”
          </h2>
          <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted-foreground">
            The store holds a small number of pieces at any time, because each one is weeks
            of hand-work. Search reads the name, the story, the cloth and the motif — so a
            term like “indigo”, “Ramayana” or “tussar” will usually find more than a full
            title will.
          </p>

          <ul className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <Link
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className="inline-flex h-9 items-center rounded-sm border border-border px-3 text-sm transition-colors hover:border-foreground/40"
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center justify-center rounded-sm border border-foreground/25 px-5 text-sm font-medium transition-colors hover:bg-foreground/5"
            >
              See everything
            </Link>
            <Link
              href="/custom"
              className="inline-flex h-11 items-center justify-center rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-chay-700"
            >
              Commission it
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-muted-foreground" role="status" aria-live="polite">
            <span className="tabular">{total}</span> {total === 1 ? 'piece' : 'pieces'} matching
            “{query}”
          </p>
          <div className="mt-8">
            <ProductGrid products={items} wishlistIds={wishlistIds} />
          </div>
        </>
      )}
    </div>
  );
}
