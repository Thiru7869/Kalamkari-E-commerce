import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { RecentlyViewed } from '@/components/shop/recently-viewed';
import { ProductGrid } from '@/components/shop/product-card';
import { ShopFilters } from '@/components/shop/shop-filters';
import { AppliedFilters } from '@/components/shop/applied-filters';
import { ShopSort } from '@/components/shop/shop-sort';
import { Pagination } from '@/components/shop/pagination';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { ShopSubnav } from '@/components/shop/shop-subnav';
import {
  getProducts,
  getCategoryBySlug,
  getFilterOptions,
  collections,
  isCollection,
  PAGE_SIZE,
} from '@/lib/queries';
import { getWishlistIds } from '@/lib/cart';
import { shopCategories } from '@/content/site';
import { absoluteUrl } from '@/lib/utils';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type Params = Promise<{ category?: string[] }>;

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

export async function generateStaticParams() {
  return [{ category: [] }, ...shopCategories.map((c) => ({ category: [c.slug] }))];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category } = await params;
  const slug = category?.[0];

  if (!slug) {
    return {
      title: 'Shop hand-painted Kalamkari',
      description:
        'Sarees, dupattas, blouse pieces, paintings and home decor — every piece drawn freehand in Srikalahasti with natural dyes only.',
      alternates: { canonical: '/shop' },
    };
  }

  const found = await getCategoryBySlug(slug);
  if (!found) return {};

  return {
    title: `${found.name} — hand-painted Kalamkari`,
    description: `${found.tagline} ${found.description}`.slice(0, 300),
    alternates: { canonical: `/shop/${found.slug}` },
  };
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { category } = await params;
  const sp = await searchParams;

  // /shop and /shop/<one-category> only — anything deeper is a bad URL.
  if (category && category.length > 1) notFound();

  const categorySlug = category?.[0];
  const activeCategory = categorySlug ? await getCategoryBySlug(categorySlug) : null;
  if (categorySlug && !activeCategory) notFound();

  const collectionKey = typeof sp.collection === 'string' && isCollection(sp.collection)
    ? sp.collection
    : undefined;
  const activeCollection = collectionKey ? collections[collectionKey] : null;

  const filters = {
    category: categorySlug,
    collection: collectionKey,
    inStockOnly: sp.available === '1',
    fabrics: asArray(sp.fabric),
    motifs: asArray(sp.motif),
    dyes: asArray(sp.dye),
    minPrice: asNumber(sp.min),
    maxPrice: asNumber(sp.max),
    sort: typeof sp.sort === 'string' ? sp.sort : undefined,
    q: typeof sp.q === 'string' ? sp.q : undefined,
    page: asNumber(sp.page) ?? 1,
  };

  // The category rail now lives in the sticky sub-navbar, which reads the five
  // types from the content layer, so the page no longer needs to load them.
  const [{ items, total, page, pageCount }, options, wishlistIds] = await Promise.all([
    getProducts(filters),
    getFilterOptions(categorySlug),
    getWishlistIds(),
  ]);

  const basePath = categorySlug ? `/shop/${categorySlug}` : '/shop';
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <>
      {/* Tightened about a fifth. This block holds a breadcrumb, a heading and
          two lines of prose, and at `pt-16 md:pb-14` it was reserving the air
          of a section that carries an image. */}
      <header className="border-b border-border bg-cotton-100 pb-8 pt-10 md:pb-11 md:pt-12 dark:bg-card">
        <div className="container">
          <Breadcrumbs
            trail={
              activeCategory
                ? [
                    { label: 'Shop', href: '/shop' },
                    { label: activeCategory.name },
                  ]
                : [{ label: 'Shop' }]
            }
          />

          <h1 className="mt-5 text-display-lg">
            {activeCollection
              ? activeCollection.title
              : activeCategory
                ? activeCategory.name
                : 'The store'}
            {!activeCollection && activeCategory?.teluguName && (
              <span className="ml-3 font-telugu text-2xl text-muted-foreground">
                {activeCategory.teluguName}
              </span>
            )}
          </h1>

          <p className="mt-4 max-w-2xl text-body-lg text-muted-foreground">
            {activeCollection
              ? activeCollection.blurb
              : activeCategory
                ? activeCategory.description
                : 'Everything finished and ready to send. Each piece was drawn once, freehand, and coloured with dyes made from iron, root, bark and flower. Nothing here is reprinted.'}
          </p>

          {activeCollection && (
            <Link
              href={basePath}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              ← Back to everything in the store
            </Link>
          )}

        </div>
      </header>

      <div className="container section-y-sm">
        <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
          {/* Desktop keeps the inline sidebar; the sheet trigger inside this
              component is hidden above lg. */}
          <ShopFilters
            options={options}
            basePath={basePath}
            selected={{ fabrics: filters.fabrics, motifs: filters.motifs, dyes: filters.dyes }}
            price={{ min: filters.minPrice, max: filters.maxPrice }}
          />

          <div>
            <ShopSubnav
              basePath={basePath}
              activeCategory={categorySlug}
              filterSlot={
                <div className="lg:hidden">
                  <ShopFilters
                    options={options}
                    basePath={basePath}
                    selected={{
                      fabrics: filters.fabrics,
                      motifs: filters.motifs,
                      dyes: filters.dyes,
                    }}
                    price={{ min: filters.minPrice, max: filters.maxPrice }}
                    triggerOnly
                  />
                </div>
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
                      <span className="tabular">{total}</span>{' '}
                      {total === 1 ? 'piece' : 'pieces'}
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
                {/*
                  `id` and `scroll-mt`: this is the anchor the "choose by
                  cloth" cards jump to, and the offset clears the sticky
                  header. Without it a jump lands with the first row of cards
                  hidden underneath the header, which reads as having scrolled
                  to the wrong place.
                */}
                <div id="pieces" className="scroll-mt-28 pt-6 md:scroll-mt-32">
                  <ProductGrid products={items} wishlistIds={wishlistIds} groupEvery={10} />
                </div>
                <Pagination page={page} pageCount={pageCount} />
              </>
            ) : (
              <div className="py-20 text-center">
                <h2 className="font-display text-2xl">Nothing matches that combination</h2>
                <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                  The store holds a small number of pieces at any time, because each one
                  takes weeks. Try widening the filters &mdash; or ask us to paint what you
                  had in mind.
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
      </div>

      {/* Below the grid and the pagination: this is a way back, not a way in. */}
      <Suspense fallback={null}>
        <RecentlyViewed />
      </Suspense>

      {/*
        The grid, as structured data.

        Product pages already describe themselves; the listing that leads to
        them described nothing, so a crawler had to discover every piece by
        following links and had no idea which page it came from or in what
        order. An `ItemList` of the current page of results is what search
        engines read to build a carousel of pieces under the store's result.

        Only the visible page is listed, in the order shown, with positions
        1-based from the offset — claiming all 43 pieces on a page that shows 12
        would be a misrepresentation of the page, and the pagination links
        already lead to the rest.
      */}
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
