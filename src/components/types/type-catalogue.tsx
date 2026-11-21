import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/shop/product-card';
import { ClothSelect, type ClothGroup } from './cloth-select';
import { PagerLink } from './pager-link';
import { TYPE_PAGE_SIZE, type ProductCardData } from '@/lib/queries';
import { catalogueHref, fabricValue, pageList, type CatalogueState } from '@/lib/type-catalogue';
import { cn } from '@/lib/utils';

const arrow =
  'inline-flex h-11 min-w-[2.75rem] items-center justify-center rounded-sm border border-border px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/**
 * Every available piece of one kind, by cloth, eight to a page.
 *
 * Rendered on the server from the URL (`?fabric=…&page=…`), so a catalogue of a
 * few hundred pieces sends eight cards, not all of them plus a script that hides
 * most. Each page is a link that can be shared, bookmarked and crawled; the
 * cloth control is a form that works without script.
 *
 * Changing the page returns to the top of this list (the `#catalogue-top`
 * anchor) so the numbers never leave the reader looking at the bottom of a grid
 * that has just been replaced.
 */
export function TypeCatalogue({
  basePath,
  label,
  products,
  wishlistIds,
  groups,
  allCount,
  state,
  total,
  pageCount,
}: {
  basePath: string;
  label: string;
  products: ProductCardData[];
  wishlistIds: string[];
  groups: ClothGroup[];
  /** Available pieces of this kind across every cloth. */
  allCount: number;
  /** What the URL asked for, already validated and with the page clamped. */
  state: CatalogueState;
  /** Pieces matching the filter, across all pages. */
  total: number;
  pageCount: number;
}) {
  const wished = new Set(wishlistIds);
  const current = state.page;
  const from = (current - 1) * TYPE_PAGE_SIZE + 1;
  const href = (page: number) => catalogueHref(basePath, state, page);

  return (
    <div>
      <div
        id="catalogue-top"
        className="scroll-mt-28 flex flex-col gap-4 border-y border-border py-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <ClothSelect
          basePath={basePath}
          value={fabricValue(state)}
          allLabel={`All ${label.toLowerCase()} (${allCount})`}
          groups={groups}
        />
      </div>

      <p role="status" className="tabular mt-4 text-sm text-muted-foreground">
        {total === 0
          ? 'Nothing matches this choice.'
          : `Showing ${from}–${from + products.length - 1} of ${total}`}
      </p>

      {products.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
          {products.map((product) => (
            <li key={product.id} className="flex">
              <ProductCard
                product={product}
                wishlisted={wished.has(product.id)}
                className="w-full"
                sizes="(min-width: 1024px) 23vw, (min-width: 768px) 31vw, 48vw"
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
          Nothing on this cloth is finished at the moment. Each piece is one of one and takes
          weeks, so a cloth empties and fills again — choose another, or have one painted.
        </p>
      )}

      {pageCount > 1 && (
        <nav aria-label={`${label} pages`} className="mt-10">
          <ul className="flex flex-wrap items-center justify-center gap-1.5">
            <li>
              {current > 1 ? (
                <PagerLink href={href(current - 1)} className={cn(arrow, 'hover:border-primary/50')}>
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Previous page</span>
                </PagerLink>
              ) : (
                <span className={cn(arrow, 'opacity-40')} aria-hidden="true">
                  <ChevronLeft className="h-4 w-4" />
                </span>
              )}
            </li>
            {pageList(current, pageCount).map((p, i) =>
              p === 'gap' ? (
                <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-muted-foreground">
                  …
                </li>
              ) : (
                <li key={p}>
                  <PagerLink
                    href={href(p)}
                    aria-current={p === current ? 'page' : undefined}
                    aria-label={`Page ${p}`}
                    className={cn(
                      'tabular inline-flex h-11 min-w-[2.75rem] items-center justify-center rounded-sm border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      p === current
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50',
                    )}
                  >
                    {p}
                  </PagerLink>
                </li>
              ),
            )}
            <li>
              {current < pageCount ? (
                <PagerLink href={href(current + 1)} className={cn(arrow, 'hover:border-primary/50')}>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Next page</span>
                </PagerLink>
              ) : (
                <span className={cn(arrow, 'opacity-40')} aria-hidden="true">
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
