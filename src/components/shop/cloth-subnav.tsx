'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * The cloth rail on a type page.
 *
 * Kalamkari is chosen by cloth far more often than by anything else — the same
 * drawing on mulmul and on tussar are two different purchases at two different
 * prices, and a visitor who knows they want Chanderi does not want to read
 * three sections to get there. This puts every variety the store *actually has
 * in this category right now* one tap from the top of the page.
 *
 * Every entry comes from the database with a live count beside it. Nothing here
 * is a hardcoded list of cloths the workshop might in principle paint on: if a
 * fabric has no pieces in this category, it is not in the rail, because a chip
 * that leads to an empty grid is worse than no chip.
 *
 * It sticks under the header, matching `ShopSubnav`'s offsets so the two never
 * disagree about where "under the header" is. On a phone it is one snap rail;
 * from `md` it wraps into rows, since there is room and a wrapped list is
 * easier to scan than a scrolling one.
 */

export type ClothLink = {
  slug: string;
  name: string;
  count: number;
  /** Cotton, silk, blended, sheer. Used for the grouped label on desktop. */
  family: string;
};

export function ClothSubnav({
  category,
  groups,
  familyLabels,
  className,
}: {
  category: string;
  /** Families in display order, each with its cloths. */
  groups: { family: string; cloths: ClothLink[] }[];
  familyLabels: Record<string, string>;
  className?: string;
}) {
  const [stuck, setStuck] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  /*
    Whether the bar has left its place in the page.

    An IntersectionObserver on a zero-height sentinel above it, rather than a
    scroll listener doing arithmetic on every tick — this bar sits on pages
    that are several thousand pixels long and Lenis fires a great many of
    those ticks.
  */
  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { rootMargin: '-140px 0px 0px 0px', threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const total = groups.reduce((n, group) => n + group.cloths.length, 0);
  if (total === 0) return null;

  return (
    <>
      <div ref={sentinel} aria-hidden="true" className="h-px" />

      <nav
        aria-label="Varieties of cloth"
        /*
          The rail's overflow stops here.

          The `<ul>` below is `overflow-x: auto` and does scroll internally, but
          that alone did not stop its 1478px of chips being counted into the
          document's scroll area: every type page scrolled ~990px sideways at
          every phone width, with the rest of the page — including the fixed tab
          bar — dragged along with it. Measured, not guessed: hiding a single
          chip moved `documentElement.scrollWidth`.

          `clip` rather than `hidden` on purpose. `hidden` would make this bar a
          scroll container, and this bar is `position: sticky`; `clip` cuts the
          overflow without creating one, so the sticky behaviour, the rail's own
          scrolling and `scrollIntoView` all keep working. Vertical is left
          visible so the focus ring on a chip is never sliced.
        */
        style={{ overflowX: 'clip', overflowY: 'visible' }}
        // `data-subnav` — stickiness and the offset come from globals.css, so
        // this rail follows the header up and down instead of being pinned
        // under where the header used to be. See the note in shop-subnav.tsx.
        data-subnav=""
        className={cn(
          'z-30 border-y border-border bg-background/95 backdrop-blur-md',
          'transition-shadow duration-300',
          stuck && 'shadow-[0_10px_30px_-24px_rgb(0_0_0/0.7)]',
          className,
        )}
      >
        <div className="container">
          <div
            className={cn(
              'flex items-center gap-3 transition-[padding] duration-300',
              stuck ? 'py-2' : 'py-2.5 md:py-3',
            )}
          >
            <p className="hidden shrink-0 font-inscription text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground lg:block">
              By cloth
            </p>

            {/* One rail on a phone, wrapped rows from md. */}
            <ul className="snap-rail -mx-5 min-w-0 flex-1 px-5 md:mx-0 md:flex-wrap md:px-0">
              <li>
                <Link
                  href={`/shop/${category}`}
                  className={cn(chipClass, 'border-border hover:border-primary/40 hover:text-primary')}
                >
                  All
                </Link>
              </li>

              {groups.flatMap((group) =>
                group.cloths.map((cloth) => (
                  <li key={cloth.slug}>
                    <Link
                      href={`/shop/${category}?fabric=${cloth.slug}`}
                      className={cn(
                        chipClass,
                        'border-border hover:border-primary/40 hover:text-primary',
                      )}
                    >
                      {cloth.name}
                      <span className="tabular ml-1.5 text-muted-foreground">{cloth.count}</span>
                      {/* The family is on screen only from lg, where the label
                          above gives it context; it is always available here. */}
                      <span className="sr-only">
                        {` — ${familyLabels[cloth.family] ?? cloth.family}, ${cloth.count} ${
                          cloth.count === 1 ? 'piece' : 'pieces'
                        }`}
                      </span>
                    </Link>
                  </li>
                )),
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

const chipClass =
  'inline-flex h-9 items-center whitespace-nowrap rounded-sm border px-3 text-[0.8125rem] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
