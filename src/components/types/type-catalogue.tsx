'use client';

import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/shop/product-card';
import { cn } from '@/lib/utils';
import type { ProductCardData } from '@/lib/queries';

const PAGE_SIZE = 8;

export type CatalogueCloth = { slug: string; name: string; family: string };

/** Page numbers with gaps collapsed: 1 … 4 5 6 … 12. */
function pageList(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

/**
 * Every piece of one kind, filtered by cloth and numbered in pages of eight.
 *
 * The whole category arrives once, already as card data, and filtering and
 * paging happen here — a catalogue of this size does not need a round trip per
 * page, and changing the cloth or the page never reloads or navigates.
 *
 * The cloth control is a native `<select>`, grouped by family. It is the most
 * accessible dropdown there is, it works on every phone's own picker, and it
 * needs no keyboard handling written here.
 *
 * Changing the cloth returns to page 1. Changing the page scrolls the list's
 * own heading into view, so the numbers never leave the reader looking at the
 * bottom of a grid that has just been replaced.
 */
export function TypeCatalogue({
  products,
  cloths,
  familyLabels,
  wishlistIds,
  label,
  initialCloth,
}: {
  products: ProductCardData[];
  cloths: CatalogueCloth[];
  familyLabels: Record<string, string>;
  wishlistIds: string[];
  label: string;
  initialCloth?: string;
}) {
  const [choice, setChoice] = useState(initialCloth ?? 'all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);
  const wished = useMemo(() => new Set(wishlistIds), [wishlistIds]);

  const familyOf = useMemo(() => new Map(cloths.map((c) => [c.slug, c.family])), [cloths]);

  const counts = useMemo(() => {
    const byCloth = new Map<string, number>();
    const byFamily = new Map<string, number>();
    for (const p of products) {
      const slug = p.fabric?.slug;
      if (!slug) continue;
      byCloth.set(slug, (byCloth.get(slug) ?? 0) + 1);
      const family = familyOf.get(slug);
      if (family) byFamily.set(family, (byFamily.get(family) ?? 0) + 1);
    }
    return { byCloth, byFamily };
  }, [products, familyOf]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (availableOnly && p.stock < 1) return false;
      if (choice === 'all') return true;
      const slug = p.fabric?.slug;
      if (choice.startsWith('family:')) return slug != null && familyOf.get(slug) === choice.slice(7);
      return slug === choice;
    });
  }, [products, choice, availableOnly, familyOf]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const families = [...new Set(cloths.map((c) => c.family))];

  function goTo(next: number) {
    setPage(next);
    topRef.current?.scrollIntoView({ block: 'start' });
  }

  return (
    <div>
      <div
        ref={topRef}
        className="scroll-mt-28 flex flex-col gap-4 border-y border-border py-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="sm:w-80">
          <label htmlFor="cloth-select" className="text-sm font-medium">
            Cloth
          </label>
          <select
            id="cloth-select"
            value={choice}
            onChange={(e) => {
              setChoice(e.target.value);
              setPage(1);
            }}
            className="mt-1.5 h-11 w-full rounded-sm border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All {label.toLowerCase()} ({products.length})</option>
            {families.map((family) => (
              <optgroup key={family} label={familyLabels[family] ?? family}>
                <option value={`family:${family}`}>
                  All {(familyLabels[family] ?? family).toLowerCase()} ({counts.byFamily.get(family) ?? 0})
                </option>
                {cloths
                  .filter((c) => c.family === family)
                  .map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name} ({counts.byCloth.get(c.slug) ?? 0})
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        <label className="flex min-h-[2.75rem] cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => {
              setAvailableOnly(e.target.checked);
              setPage(1);
            }}
            className="h-4 w-4 accent-primary"
          />
          Available now only
        </label>
      </div>

      <p role="status" className="tabular mt-4 text-sm text-muted-foreground">
        {filtered.length === 0
          ? 'Nothing matches this choice.'
          : `Showing ${(current - 1) * PAGE_SIZE + 1}–${(current - 1) * PAGE_SIZE + visible.length} of ${filtered.length}`}
      </p>

      {visible.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
          {visible.map((product) => (
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
              <button
                type="button"
                onClick={() => goTo(current - 1)}
                disabled={current === 1}
                className="inline-flex h-11 min-w-[2.75rem] items-center justify-center rounded-sm border border-border px-2 text-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Previous page</span>
              </button>
            </li>
            {pageList(current, pageCount).map((p, i) =>
              p === 'gap' ? (
                <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-muted-foreground">
                  …
                </li>
              ) : (
                <li key={p}>
                  <button
                    type="button"
                    onClick={() => goTo(p)}
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
                  </button>
                </li>
              ),
            )}
            <li>
              <button
                type="button"
                onClick={() => goTo(current + 1)}
                disabled={current === pageCount}
                className="inline-flex h-11 min-w-[2.75rem] items-center justify-center rounded-sm border border-border px-2 text-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Next page</span>
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
