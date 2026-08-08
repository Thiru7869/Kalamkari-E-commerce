'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import { shopCategories } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * The sticky bar that carries the shop.
 *
 * Two rows, because they answer two different questions and interleaving them
 * makes both harder to find:
 *
 *   1. *What kind of thing* — the five types, plus the filter control.
 *   2. *In what order* — sort, and how many are showing.
 *
 * It sticks under the header rather than at the top of the viewport, so it
 * never covers the header's own controls, and it condenses on scroll: the
 * padding tightens and a rule appears, which is enough to signal that it has
 * left its place in the page without it changing size and pushing the grid.
 *
 * The type rail scrolls horizontally on a phone with the same snap-rail
 * treatment used elsewhere, and the active chip is scrolled into view on load
 * so a visitor landing on /shop/paintings can see where they are.
 */
export function ShopSubnav({
  basePath,
  activeCategory,
  filterSlot,
  sortSlot,
  countSlot,
}: {
  basePath: string;
  /** Category slug, or undefined on /shop. */
  activeCategory?: string;
  /** The filter trigger — supplied by the page so it keeps its own state. */
  filterSlot: React.ReactNode;
  sortSlot: React.ReactNode;
  countSlot: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        // Under the header: 2.25rem announcement + 4rem bar on a phone,
        // 5rem on desktop. Matches the header's own sticky offset.
        'sticky top-[4rem] z-30 -mx-5 border-b border-border bg-background/95 backdrop-blur-md md:top-[5rem] md:mx-0',
      )}
    >
      {/* ---- Row one: what kind of thing --------------------------------- */}
      <div className="flex items-center gap-2 px-5 pt-2.5 md:px-0">
        <nav aria-label="Product types" className="min-w-0 flex-1">
          <ul className="snap-rail -mx-1 px-1 md:flex-wrap">
            {shopCategories.map((category) => {
              const href = `/shop/${category.slug}`;
              const active = activeCategory === category.slug;
              return (
                <li key={category.slug}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'inline-flex h-9 items-center whitespace-nowrap rounded-sm border px-3 text-[0.8125rem] transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/40 hover:text-primary',
                    )}
                  >
                    {category.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0">{filterSlot}</div>
      </div>

      {/* ---- Row two: in what order -------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-2.5 md:px-0">
        {countSlot}
        {sortSlot}
      </div>

      {/* A drawn rule rather than a border, so the bar reads as part of the
          page it belongs to rather than as chrome bolted above it. */}
      <span className="kalam-rule absolute inset-x-0 bottom-0 opacity-60" aria-hidden="true" />

      <span className="sr-only" aria-live="polite">
        {pathname === basePath ? '' : null}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * The filter trigger.
 *
 * Redrawn from the old full-width outline button: it is now a compact control
 * that states what it does and how much it is currently doing, with the active
 * count as a filled counter rather than a badge floating beside the word. At
 * rest it is quiet; with filters applied it takes the primary colour, because
 * "you are looking at a filtered subset" is the single most important thing
 * the bar can tell somebody who has forgotten.
 */
export function FilterTrigger({
  count,
  onClick,
  className,
}: {
  count: number;
  onClick?: () => void;
  className?: string;
}) {
  const active = count > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-sm border px-3 text-[0.8125rem] font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'border-primary bg-primary/[0.08] text-primary'
          : 'border-border hover:border-primary/40 hover:text-primary',
        className,
      )}
    >
      <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
      Filter
      {active && (
        <span className="tabular flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.6875rem] font-semibold text-primary-foreground">
          {count}
        </span>
      )}
      <span className="sr-only">
        {active ? `— ${count} applied` : '— nothing applied'}
      </span>
    </button>
  );
}
