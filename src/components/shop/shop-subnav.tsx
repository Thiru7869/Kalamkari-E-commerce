'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
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
      /*
        `data-subnav` carries the stickiness now — see `globals.css`.

        The offset used to be hard-coded here as `top-[4rem] md:top-[5rem]`,
        which is right only while the header is on screen. The header hides on
        scroll-down, and a rail pinned 4rem below a header that is no longer
        there leaves a band of moving page above it. The attribute opts this
        element into `top: var(--subnav-top)`, which the header drives: it
        becomes the top of the window going down, and steps back under the
        header coming up.
      */
      data-subnav=""
      className={cn(
        'z-30 -mx-5 border-b border-border bg-background/95 backdrop-blur-md md:mx-0',
      )}
    >
      {/* ---- Row one: the filter, above the types ------------------------- */}
      <div className="px-5 pt-2.5 md:px-0">{filterSlot}</div>

      {/* ---- Row two: what kind of thing --------------------------------- */}
      <div className="flex items-center gap-2 px-5 pt-2.5 md:px-0">
        <ScrollRail label="Product types">
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
                      'inline-flex h-9 items-center whitespace-nowrap rounded-sm border px-3 text-sm transition-colors',
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
        </ScrollRail>
      </div>

      {/* ---- Row three: in what order -------------------------------------- */}
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
        'inline-flex h-9 items-center gap-2 rounded-sm border px-3 text-sm font-medium transition-colors',
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
        <span className="tabular flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-label font-semibold text-primary-foreground">
          {count}
        </span>
      )}
      <span className="sr-only">
        {active ? `— ${count} applied` : '— nothing applied'}
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * A horizontally scrolling rail that says so.
 *
 * The type chips scroll sideways on a phone with the scrollbar hidden, so the
 * last chip simply stops at the screen edge and nothing says there are more.
 * This adds three cues, each shown only while it is true:
 *
 *   - a fade on whichever edge still has content beyond it;
 *   - a chevron button on that edge that scrolls the rail by most of its width;
 *   - a thin progress bar under the rail showing how far along it is.
 *
 * From `md` the rail wraps instead of scrolling, nothing overflows, and all
 * three cues disappear on their own. The chevrons are real buttons with
 * labels; the fades and bar are decoration and are hidden from assistive
 * technology.
 */
function ScrollRail({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState({ left: false, right: false, progress: 0 });

  // The scroller is the list inside the nav (`.snap-rail` owns the overflow),
  // not the nav itself.
  const scroller = () => ref.current?.firstElementChild as HTMLElement | null | undefined;

  useEffect(() => {
    const el = scroller();
    if (!el) return;

    const measure = () => {
      const max = el.scrollWidth - el.clientWidth;
      setState({
        left: el.scrollLeft > 2,
        right: max > 2 && el.scrollLeft < max - 2,
        progress: max > 2 ? el.scrollLeft / max : 0,
      });
    };

    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller();
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: reduce ? 'auto' : 'smooth' });
  };

  const scrollable = state.left || state.right;

  return (
    <div className="relative min-w-0 flex-1">
      <nav ref={ref} aria-label={label}>
        {children}
      </nav>

      {state.left && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent"
          />
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            className="absolute left-0 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Show earlier types</span>
          </button>
        </>
      )}

      {state.right && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent"
          />
          <button
            type="button"
            onClick={() => scrollBy(1)}
            className="absolute right-0 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Show more types</span>
          </button>
        </>
      )}

      {scrollable && (
        <span
          aria-hidden="true"
          className="mt-1.5 block h-0.5 rounded-full bg-border md:hidden"
        >
          <span
            className="block h-full w-1/3 rounded-full bg-primary/70"
            style={{ marginLeft: `${state.progress * 66.6667}%` }}
          />
        </span>
      )}
    </div>
  );
}
