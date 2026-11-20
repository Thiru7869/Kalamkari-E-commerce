import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { RecentlyViewed } from '@/components/shop/recently-viewed';
import { ProductGrid } from '@/components/shop/product-card';
import { ShopFilters } from '@/components/shop/shop-filters';
import { AppliedFilters } from '@/components/shop/applied-filters';
import { ShopSort } from '@/components/shop/shop-sort';
import { Pagination } from '@/components/shop/pagination';
import { ShopSubnav } from '@/components/shop/shop-subnav';
import { GridStory } from '@/components/shop/grid-story';
import { CollectionCards } from '@/components/home/collection-cards';
import { ModuleCard } from '@/components/heritage/module-card';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { SectionHeader } from '@/components/layout/section-header';
import {
  getProducts,
  getCategoryBySlug,
  getFilterOptions,
  collections,
  isCollection,
  PAGE_SIZE,
} from '@/lib/queries';
import { getWishlistIds } from '@/lib/cart';
import { homeCollectionCards } from '@/content/catalogue';
import { heritageModules } from '@/content/heritage-modules';
import { absoluteUrl } from '@/lib/utils';

export type ShopSearchParams = Record<string, string | string[] | undefined>;

/** Query params arrive as string | string[] | undefined; normalise once. */
function asArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : value.split(',').filter(Boolean);
}

function asNumber(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** Where the first story card sits: after a whole row at two, three and four across. */
const STORY_AFTER = 6;

const linkClass =
  'inline-flex min-h-[2.75rem] items-center text-primary underline-offset-4 hover:underline';

/**
 * The shop: the home page at `/` and the category pages at `/shop/<category>`.
 *
 * It lists what can be bought. Sold pieces are not in this grid — they live in
 * the archive at `/archive`, so a card here is always something a visitor can
 * act on. The sold archive, the premium collection and the commission page are
 * linked from the header block below rather than mixed into the run of pieces.
 *
 * On the unfiltered first page it also carries the doors to the rest of the
 * site (collections and two heritage modules). Anything narrower than that —
 * a category, a filter, a second page — is somebody mid-search, and gets the
 * grid and nothing after it.
 */
export async function ShopView({
  categorySlug,
  searchParams: sp,
}: {
  categorySlug?: string;
  searchParams: ShopSearchParams;
}) {
  const activeCategory = categorySlug ? await getCategoryBySlug(categorySlug) : null;
  if (categorySlug && !activeCategory) notFound();

  const collectionKey =
    typeof sp.collection === 'string' && isCollection(sp.collection) ? sp.collection : undefined;
  const activeCollection = collectionKey ? collections[collectionKey] : null;

  const filters = {
    category: categorySlug,
    collection: collectionKey,
    // Always: the sold ones are in the archive, not here.
    inStockOnly: true,
    fabrics: asArray(sp.fabric),
    motifs: asArray(sp.motif),
    dyes: asArray(sp.dye),
    minPrice: asNumber(sp.min),
    maxPrice: asNumber(sp.max),
    sort: typeof sp.sort === 'string' ? sp.sort : undefined,
    q: typeof sp.q === 'string' ? sp.q : undefined,
    page: asNumber(sp.page) ?? 1,
  };

  const [{ items, total, page, pageCount }, options, wishlistIds] = await Promise.all([
    getProducts(filters),
    getFilterOptions(categorySlug),
    getWishlistIds(),
  ]);

  const isHome = !categorySlug;
  const isPlainHome =
    isHome &&
    !activeCollection &&
    page === 1 &&
    !filters.fabrics.length &&
    !filters.motifs.length &&
    !filters.dyes.length &&
    filters.minPrice == null &&
    filters.maxPrice == null &&
    !filters.q;

  const basePath = categorySlug ? `/shop/${categorySlug}` : '/';
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const heading = activeCollection
    ? activeCollection.title
    : activeCategory
      ? activeCategory.name
      : 'Hand-drawn Kalamkari, from Srikalahasti';

  const lede = activeCollection
    ? activeCollection.blurb
    : activeCategory
      ? activeCategory.description
      : 'Everything finished and ready to send. Each piece was drawn once, freehand, and coloured with dyes made from iron, root, bark and flower. Nothing here is reprinted.';

  const showStory = items.length > STORY_AFTER;
  const first = showStory ? items.slice(0, STORY_AFTER) : items;
  const rest = showStory ? items.slice(STORY_AFTER) : [];

  const bands = ['saree-making', 'our-heritage']
    .map((id) => heritageModules.find((m) => m.id === id))
    .filter((m): m is (typeof heritageModules)[number] => Boolean(m));

  return (
    <>
      <header className="border-b border-border bg-cotton-100 pb-7 pt-8 md:pb-9 md:pt-10 dark:bg-card">
        <div className="container">
          {!isHome && (
            <Breadcrumbs
              trail={
                activeCategory
                  ? [{ label: 'Shop', href: '/' }, { label: activeCategory.name }]
                  : [{ label: 'Shop' }]
              }
            />
          )}

          <h1 className={isHome ? 'text-display-md' : 'mt-5 text-display-lg'}>
            {heading}
            {!activeCollection && activeCategory?.teluguName && (
              <span className="ml-3 font-telugu text-2xl text-muted-foreground">
                {activeCategory.teluguName}
              </span>
            )}
          </h1>

          <p className="mt-3 max-w-2xl text-body-lg text-muted-foreground">{lede}</p>

          {activeCollection ? (
            <Link
              href={basePath}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              ← Back to everything in the store
            </Link>
          ) : (
            <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <Link href="/collections/featured-sarees" className={linkClass}>
                Featured sarees
              </Link>
              <Link href="/collections/premium" className={linkClass}>
                Best works
              </Link>
              <Link href="/archive" className={linkClass}>
                Sold archive
              </Link>
              <Link href="/custom" className={linkClass}>
                Commission a piece
              </Link>
            </p>
          )}
        </div>
      </header>

      <div className="container section-y-sm">
        <div>
          <ShopSubnav
            basePath={basePath}
            activeCategory={categorySlug}
            filterSlot={
              <ShopFilters
                options={options}
                basePath={basePath}
                selected={{
                  fabrics: filters.fabrics,
                  motifs: filters.motifs,
                  dyes: filters.dyes,
                }}
                price={{ min: filters.minPrice, max: filters.maxPrice }}
              />
            }
            sortSlot={<ShopSort current={filters.sort} />}
            countSlot={
              <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
                {total === 0 ? (
                  'No pieces match these filters'
                ) : (
                  <>
                    Showing <span className="tabular">{from}</span>&ndash;
                    <span className="tabular">{to}</span> of{' '}
                    <span className="tabular">{total}</span> {total === 1 ? 'piece' : 'pieces'}
                  </>
                )}
              </p>
            }
          />

          <AppliedFilters
            basePath={basePath}
            fabrics={options.fabrics}
            motifs={options.motifs}
            dyes={options.dyes}
            className="mt-4"
          />

          {items.length > 0 ? (
            <>
              {/* `id` and `scroll-mt`: the anchor the "choose by cloth" links
                  jump to; the offset clears the sticky header. */}
              <div id="pieces" className="scroll-mt-28 pt-6 md:scroll-mt-32">
                <h2 className="sr-only">Pieces available</h2>
                <ProductGrid products={first} wishlistIds={wishlistIds} />
                {showStory && (
                  <>
                    <GridStory page={page} />
                    <ProductGrid products={rest} wishlistIds={wishlistIds} priorityCount={0} />
                  </>
                )}
              </div>
              <Pagination page={page} pageCount={pageCount} />
            </>
          ) : (
            <div className="py-20 text-center">
              <h2 className="font-display text-2xl">Nothing matches that combination</h2>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                The store holds a small number of pieces at any time, because each one takes weeks.
                Try widening the filters &mdash; look in the{' '}
                <Link href="/archive" className="text-primary underline underline-offset-4">
                  sold archive
                </Link>{' '}
                &mdash; or ask us to paint what you had in mind.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href={basePath}
                  className="inline-flex h-11 items-center justify-center rounded-sm border border-foreground/25 px-5 text-sm font-medium transition-colors hover:bg-foreground/5"
                >
                  Clear all filters
                </Link>
                <Link
                  href="/custom"
                  className="inline-flex h-11 items-center justify-center rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-chay-700"
                >
                  Commission a piece
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {isPlainHome && (
        <>
          <section className="section-y border-t border-border" aria-labelledby="collections-heading">
            <div className="container">
              <SectionHeader
                eyebrow="Collections"
                title="Ways into the store"
                action={{ label: 'All collections', href: '/collections' }}
                id="collections-heading"
              />
              <div className="mt-8">
                <CollectionCards cards={homeCollectionCards} />
              </div>
            </div>
          </section>

          <section className="section-y border-t border-border bg-cotton-100 dark:bg-card">
            <div className="container">
              <SectionHeader
                eyebrow="The craft"
                title="Made slowly, by hand"
                action={{ label: 'Heritage of Kalamkari', href: '/heritage' }}
              />
              <ul className="mt-8 grid gap-5 md:grid-cols-2">
                {bands.map((m) => (
                  <li key={m.id}>
                    <ModuleCard module={m} compact />
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-muted-foreground">
                <Link
                  href="/archive"
                  className="inline-flex items-center gap-1.5 py-3 -my-3 text-primary underline underline-offset-4"
                >
                  See pieces that have already found a home
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </p>
            </div>
          </section>
        </>
      )}

      {/* Below the grid: a way back, not a way in. */}
      <Suspense fallback={null}>
        <RecentlyViewed />
      </Suspense>

      {/* The current page of results, as structured data (visible page only). */}
      {items.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: activeCollection
                ? activeCollection.title
                : (activeCategory?.name ?? 'The store'),
              numberOfItems: items.length,
              itemListElement: items.map((product, i) => ({
                '@type': 'ListItem',
                position: from + i,
                url: absoluteUrl(`/product/${product.slug}`),
                name: product.name,
              })),
            }),
          }}
        />
      )}
    </>
  );
}
