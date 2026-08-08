import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ProductGrid } from '@/components/shop/product-card';
import { ShopFilters } from '@/components/shop/shop-filters';
import { AppliedFilters } from '@/components/shop/applied-filters';
import { ShopSort } from '@/components/shop/shop-sort';
import { Pagination } from '@/components/shop/pagination';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import {
  getProducts,
  getCategories,
  getCategoryBySlug,
  getFilterOptions,
  collections,
  isCollection,
  PAGE_SIZE,
} from '@/lib/queries';
import { getWishlistIds } from '@/lib/cart';
import { shopCategories } from '@/content/site';

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
    minPrice: asNumber(sp.min),
    maxPrice: asNumber(sp.max),
    sort: typeof sp.sort === 'string' ? sp.sort : undefined,
    q: typeof sp.q === 'string' ? sp.q : undefined,
    page: asNumber(sp.page) ?? 1,
  };

  const [{ items, total, page, pageCount }, categories, options, wishlistIds] =
    await Promise.all([
      getProducts(filters),
      getCategories(),
      getFilterOptions(categorySlug),
      getWishlistIds(),
    ]);

  const basePath = categorySlug ? `/shop/${categorySlug}` : '/shop';
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <>
      <header className="border-b border-border bg-cotton-100 pb-10 pt-12 md:pb-14 md:pt-16 dark:bg-card">
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

          {/* Category switcher — a horizontal rail on phones. */}
          <nav aria-label="Categories" className="mt-8">
            <ul className="snap-rail -mx-5 px-5 md:mx-0 md:flex-wrap md:px-0">
              <li>
                <Link
                  href="/shop"
                  aria-current={!categorySlug ? 'page' : undefined}
                  className={`inline-flex h-10 items-center whitespace-nowrap rounded-sm border px-4 text-sm transition-colors ${
                    !categorySlug
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-foreground/40'
                  }`}
                >
                  Everything
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/shop/${c.slug}`}
                    aria-current={categorySlug === c.slug ? 'page' : undefined}
                    className={`inline-flex h-10 items-center whitespace-nowrap rounded-sm border px-4 text-sm transition-colors ${
                      categorySlug === c.slug
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-foreground/40'
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <div className="container py-8 md:py-12">
        <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
          <ShopFilters
            options={options}
            basePath={basePath}
            selected={{ fabrics: filters.fabrics, motifs: filters.motifs }}
          />

          <div>
            <AppliedFilters
              basePath={basePath}
              fabrics={options.fabrics}
              motifs={options.motifs}
              className="mb-4 lg:mb-5"
            />

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
                {total === 0 ? (
                  'No pieces match these filters'
                ) : (
                  <>
                    Showing <span className="tabular">{from}</span>–
                    <span className="tabular">{to}</span> of{' '}
                    <span className="tabular">{total}</span>{' '}
                    {total === 1 ? 'piece' : 'pieces'}
                  </>
                )}
              </p>
              <ShopSort current={filters.sort} />
            </div>

            {items.length > 0 ? (
              <>
                <div className="pt-8">
                  <ProductGrid products={items} wishlistIds={wishlistIds} />
                </div>
                <Pagination page={page} pageCount={pageCount} />
              </>
            ) : (
              <div className="py-20 text-center">
                <h2 className="font-display text-2xl">Nothing matches that combination</h2>
                <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                  The store holds a small number of pieces at any time, because each one
                  takes weeks. Try widening the filters — or ask us to paint what you had
                  in mind.
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
    </>
  );
}
