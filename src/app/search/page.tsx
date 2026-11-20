import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import { resolveSearchDestination } from '@/lib/search-routing';

import { ProductGrid } from '@/components/shop/product-card';
import { SearchForm } from '@/components/shop/search-form';
import { PageHeader } from '@/components/layout/page-header';
import { getProducts } from '@/lib/queries';
import { getWishlistIds } from '@/lib/cart';
import { shopCategories } from '@/content/site';
import { NarrativeNote } from '@/components/shop/narrative-note';
import { narrativeMotifs, narrativeMotifNames } from '@/content/catalogue';

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

  /*
    A query that names a section is a navigation, not a search.

    `src/middleware.ts` catches these before rendering begins and answers with a
    real 307, which is what visitors actually get. This is the backstop for the
    paths middleware does not see — most importantly a client-side soft
    navigation from the search overlay, which never touches the edge.

    It has to be a backstop rather than the only check. Calling `redirect()`
    here, once the root layout has begun streaming, cannot change a status code
    that is already on the wire: Next falls back to emitting
    `<meta http-equiv="refresh" content="1;url=…">`, so the visitor watches an
    empty shell for a full second before moving. Correct, but not acceptable as
    the common path.
  */
  const destination = resolveSearchDestination(query);
  if (destination) redirect(destination);

  // Did the visitor ask for one of the four narrative traditions by name? If
  // so, whatever the grid returns, the honest answer is that these are drawn
  // to order — so say it above the results rather than after the
  // disappointment.
  const askedFor = narrativeMotifs.find((slug) => {
    const name = narrativeMotifNames[slug].toLowerCase();
    const q = query.toLowerCase();
    return q.includes(name) || name.split(' ').some((word) => word.length > 4 && q.includes(word));
  });

  const [{ items, total }, wishlistIds] = await Promise.all([
    query ? getProducts({ q: query }) : Promise.resolve({ items: [], total: 0, page: 1, pageCount: 1 }),
    getWishlistIds(),
  ]);

  return (
    <div className="container section-y-sm">
      <PageHeader
        eyebrow="The store"
        title="Search"
        description="By name, story, cloth or motif."
      />

      <SearchForm defaultValue={query} autoFocus={!query} className="mt-6 max-w-xl" />

      {!query ? (
        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-14">
          <div>
          <p className="eyebrow">Try one of these</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <Link
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className="inline-flex min-h-[2.75rem] items-center rounded-sm border border-border bg-card px-4 text-sm transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
          </div>

          <div>
            <p className="eyebrow">Or browse by category</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {shopCategories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/shop/${c.slug}`}
                    className="inline-flex min-h-[2.75rem] items-center rounded-sm border border-border bg-card px-4 text-sm transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : askedFor && total >= 0 ? (
        <>
          <NarrativeNote
            variant="inline"
            matched={narrativeMotifNames[askedFor]}
            className="mt-8"
          />
          {total === 0 ? (
            <div className="py-16 text-center">
              <SearchIcon className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <h2 className="mt-5 font-display text-2xl">
                No {narrativeMotifNames[askedFor]} pieces finished right now
              </h2>
              <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted-foreground">
                These are the hardest drawing the workshop does and they sell as they are
                finished. A piece of your own starts with a conversation about the episode,
                the cloth and a realistic timeline.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/custom"
                  className="inline-flex h-11 items-center justify-center rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-chay-700"
                >
                  Commission one
                </Link>
                <Link
                  href="/"
                  className="inline-flex h-11 items-center justify-center rounded-sm border border-foreground/25 px-5 text-sm font-medium transition-colors hover:bg-foreground/5"
                >
                  See everything
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-6 text-sm text-muted-foreground" role="status" aria-live="polite">
                <span className="tabular">{total}</span>{' '}
                {total === 1 ? 'piece' : 'pieces'} for “{query}”
              </p>
              <div className="mt-6">
                <ProductGrid products={items} wishlistIds={wishlistIds} />
              </div>
            </>
          )}
        </>
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
                  className="inline-flex min-h-[2.75rem] items-center rounded-sm border border-border bg-card px-4 text-sm transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
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
