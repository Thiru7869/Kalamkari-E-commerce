'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { ProductCardData } from '@/lib/queries';
import { bestWorks, groundFor } from '@/content/best-works';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { formatPrice, cn } from '@/lib/utils';

/**
 * Best works — one plate at a time, mounted on a colour from the workshop.
 *
 * This replaces "By the numbers", and the replacement is an argument rather
 * than a restyle. Six counted figures told a visitor that forty artisans work
 * in the cluster and that the black ferments for twenty-one days; both true,
 * both abstract, and neither answers the question somebody is actually holding
 * at this point in the page — *can these people draw?* One piece, large, with
 * what it is beside it, answers it.
 *
 * ---------------------------------------------------------------------------
 * The shape, and why it is this shape
 * ---------------------------------------------------------------------------
 *
 * A grid of six would have been easier and is the wrong tool twice over. It
 * costs three times the height for the same information — this section sits
 * eight blocks down a long landing page and had to get *shorter*, not longer —
 * and six thumbnails side by side invite comparison, which is precisely what a
 * one-of-one catalogue does not want. Each of these is the only one of itself.
 *
 * So: one plate, next and previous, and the whole section takes the colour of
 * whatever is showing. The ground is doing real work rather than decorating —
 * changing the colour of the room is the strongest possible signal that the
 * thing on the wall has changed, and it costs no vertical space at all.
 *
 * ---------------------------------------------------------------------------
 * Legibility
 * ---------------------------------------------------------------------------
 *
 * Every ground states its own `ink`, and every piece of text reads from that
 * one value through the `tone` ladder below — the same ladder solved for
 * `TwoCrafts`, where eight tone-on-ground pairs were found under AA. The six
 * grounds here are checked by `scripts/ink-check.mjs` alongside the eight dye
 * floods, so a ground that cannot carry text cannot be added to
 * `src/content/best-works.ts` without the check failing.
 *
 * ---------------------------------------------------------------------------
 * "95% visibility"
 * ---------------------------------------------------------------------------
 *
 * The plate is `object-contain` at 95% of its frame, not `object-cover`. A
 * cover crop of a nine-yard saree shows a band of its middle — which is the one
 * part of a Kalamkari piece that is *least* characteristic, because the pallu
 * and the border are where the drawing is. Containing it means the whole piece
 * is on screen, and the 5% margin lets the ground show as a mount around it.
 */

const AUTO_ADVANCE_MS = 7000;

export function BestWorks({ works }: { works: ProductCardData[] }) {
  const [index, setIndex] = useState(0);
  /** Set by any deliberate press, and never unset. See the effect below. */
  const [engaged, setEngaged] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  const total = works.length;
  const go = useCallback(
    (next: number) => {
      if (total === 0) return;
      setEngaged(true);
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  /*
    A slow auto-advance, which stops the moment the reader touches anything.

    The rail is the only thing in this section, so a visitor who does not press
    a button would otherwise see exactly one of six pieces — and the argument
    the section makes is the range. Seven seconds is long enough to read the
    description beside the plate.

    It stops permanently on first interaction rather than pausing: somebody who
    has pressed "next" is reading at their own pace, and a carousel that resumes
    and moves the thing they are looking at is worse than one that never moved.
    It also never runs under reduced motion, and never while the tab is hidden.
  */
  useEffect(() => {
    if (engaged || total < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setIndex((i) => (i + 1) % total);
      }
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [engaged, total]);

  // Left/right arrows, but only while the rail has focus inside it — a global
  // key handler would hijack arrow keys for the whole page.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(index + 1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(index - 1);
    }
  };

  if (total === 0) {
    return (
      <section className="border-y border-border bg-cotton-100 section-y dark:bg-card">
        <div className="container max-w-2xl">
          <p className="eyebrow">{bestWorks.eyebrow}</p>
          <h2 className="mt-3 text-display-md">{bestWorks.heading}</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">{bestWorks.empty}</p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Everything in the store
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    );
  }

  const work = works[index];
  const ground = groundFor(index);
  const light = ground.ink === 'light';

  /** The solved ladder. See the note above and `scripts/ink-check.mjs`. */
  const tone = {
    strong: light ? 'text-white' : 'text-black',
    body: light ? 'text-white/[0.92]' : 'text-black/90',
    quiet: light ? 'text-white/[0.84]' : 'text-black/[0.82]',
    faint: light ? 'text-white/[0.76]' : 'text-black/[0.74]',
    rule: light ? 'border-white/25' : 'border-black/20',
    edge: light ? 'border-white/30' : 'border-black/25',
    hover: light ? 'hover:bg-white/10' : 'hover:bg-black/5',
    ring: light ? 'focus-visible:ring-white/80' : 'focus-visible:ring-black/70',
  };

  return (
    <section
      aria-labelledby="best-works-heading"
      className="relative isolate overflow-hidden border-y border-border section-y"
      style={{ backgroundColor: ground.hex }}
    >
      {/* The colour change, as a cross-fade rather than a cut. A separate layer
          so the section's own background never transitions between a token and
          a hex. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 transition-colors duration-700 ease-out motion-reduce:transition-none"
        style={{ backgroundColor: ground.hex }}
      />

      <div className="container">
        <RevealOnScroll>
          <div className="max-w-2xl">
            <p className={cn('eyebrow', tone.faint)}>{bestWorks.eyebrow}</p>
            <h2
              id="best-works-heading"
              className={cn('mt-3 text-display-md', tone.strong)}
            >
              {bestWorks.heading}
            </h2>
            <span aria-hidden="true" className={cn('mt-4 block h-px w-14 border-t', tone.edge)} />
            <p className={cn('mt-4 text-[0.9375rem] leading-relaxed', tone.quiet)}>
              {bestWorks.standfirst}
            </p>
          </div>
        </RevealOnScroll>

        {/*
          The plate and its description, side by side from `lg`.

          Heights are capped in `rem` and never in viewport units. This is the
          section that had to get shorter; letting the plate track the viewport
          is how a "compact" rail becomes 700px tall on a desktop.
        */}
        <RevealOnScroll delay={0.08}>
          <div
            ref={regionRef}
            onKeyDown={onKeyDown}
            role="group"
            aria-roledescription="carousel"
            aria-label="Best works"
            className="mt-5 grid gap-5 md:mt-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:items-center lg:gap-10"
          >
            {/* ---- The plate ------------------------------------------- */}
            <div className="relative">
              <div
                className={cn(
                  'relative flex h-[18rem] items-center justify-center overflow-hidden rounded-sm border shadow-[0_30px_60px_-30px_rgb(0_0_0/0.45)] sm:h-[21rem] lg:h-[24rem]',
                  tone.edge,
                  light ? 'bg-white/[0.06]' : 'bg-black/[0.04]',
                )}
              >
                {/* The inner mount line, a second frame inside the first. */}
                <span
                  aria-hidden="true"
                  className={cn('pointer-events-none absolute inset-2.5 rounded-[2px] border', tone.rule)}
                />
                {/*
                  `key` remounts the figure, which replays the CSS entrance —
                  the same mechanism `TwoCrafts` uses to re-run an animation
                  that has already finished. Without it the image would swap
                  with no transition at all.

                  `object-contain` at 95%: the whole piece, with the ground
                  showing as a mount. See the note at the top of the file.
                */}
                <Image
                  key={work.id}
                  src={work.images.split('\n')[0] ?? '/images/placeholder-cloth.jpg'}
                  alt={work.name}
                  fill
                  sizes="(min-width: 1024px) 40vw, 92vw"
                  className="object-contain p-[2.5%] motion-safe:animate-story-in"
                />
              </div>

              {/* ---- Controls, under the plate rather than over it -------
                  Arrows laid over a photograph either obscure the drawing or
                  need a scrim that does. There is room underneath, and the
                  counter belongs beside them. */}
              <div className="mt-3 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-full border transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                    tone.edge,
                    tone.strong,
                    tone.hover,
                    tone.ring,
                  )}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Previous piece</span>
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-full border transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                    tone.edge,
                    tone.strong,
                    tone.hover,
                    tone.ring,
                  )}
                >
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Next piece</span>
                </button>

                {/* Progress: one segment per piece, each a way straight to it. */}
                <div className="ml-2 flex flex-1 items-center gap-1.5" role="group" aria-label="Choose a piece">
                  {works.map((w, i) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => go(i)}
                      aria-label={`Piece ${i + 1}: ${w.name}`}
                      aria-current={i === index}
                      className="group/seg flex h-11 flex-1 items-center focus-visible:outline-none"
                    >
                      <span
                        className={cn(
                          'block h-[3px] w-full rounded-full transition-all duration-500',
                          i === index
                            ? light
                              ? 'bg-white'
                              : 'bg-black'
                            : light
                              ? 'bg-white/30 group-hover/seg:bg-white/60'
                              : 'bg-black/25 group-hover/seg:bg-black/50',
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Position and the pot the ground came from. */}
              <p
                className={cn(
                  'tabular mt-1 font-inscription text-[0.625rem] uppercase tracking-[0.16em]',
                  tone.faint,
                )}
              >
                {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                <span className="mx-2 opacity-50">·</span>
                Ground: {ground.note}
              </p>
            </div>

            {/* ---- What it is -------------------------------------------- */}
            {/* `key` here too: the whole column is the thing that changes. */}
            <div key={work.id} className="min-w-0 motion-safe:animate-story-in">
              <p
                className={cn(
                  'font-inscription text-[0.625rem] uppercase tracking-[0.18em]',
                  tone.faint,
                )}
              >
                {work.category.name}
                {work.fabric && (
                  <>
                    <span className="mx-2 opacity-50">·</span>
                    {work.fabric.name}
                  </>
                )}
              </p>

              <h3 className={cn('mt-2.5 font-display text-display-sm leading-tight', tone.strong)}>
                {work.name}
              </h3>

              <p className={cn('mt-3.5 max-w-prose leading-relaxed', tone.body)}>
                {work.summary}
              </p>

              {/* The record: what it took, who drew it, what it costs. Only the
                  parts the store has actually filled in — `artisan` is set on
                  15 of 43 pieces, so it is optional here rather than printing
                  "Painted by —". */}
              <dl className={cn('mt-6 grid grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] border-y', tone.rule)}>
                {/* Nullable in the schema, and left null where the store has
                    not recorded it — the same rule `artisan` follows. */}
                {(work.craftDays ?? 0) > 0 && (
                  <div className={cn('py-4 pr-4 [&:not(:first-child)]:border-l [&:not(:first-child)]:pl-5', tone.rule)}>
                    <dt
                      className={cn(
                        'font-inscription text-[0.5625rem] uppercase tracking-[0.16em]',
                        tone.faint,
                      )}
                    >
                      Days by hand
                    </dt>
                    <dd className={cn('tabular mt-1.5 text-xl', tone.strong)}>{work.craftDays}</dd>
                  </div>
                )}
                {work.artisan && (
                  <div className={cn('py-4 pr-4 [&:not(:first-child)]:border-l [&:not(:first-child)]:pl-5', tone.rule)}>
                    <dt
                      className={cn(
                        'font-inscription text-[0.5625rem] uppercase tracking-[0.16em]',
                        tone.faint,
                      )}
                    >
                      Drawn by
                    </dt>
                    <dd className={cn('mt-1.5 text-xl', tone.strong)}>{work.artisan}</dd>
                  </div>
                )}
                <div className={cn('py-4 pr-4 [&:not(:first-child)]:border-l [&:not(:first-child)]:pl-5', tone.rule)}>
                  <dt
                    className={cn(
                      'font-inscription text-[0.5625rem] uppercase tracking-[0.16em]',
                      tone.faint,
                    )}
                  >
                    {work.stock > 0 ? 'Price' : 'Sold for'}
                  </dt>
                  <dd className={cn('tabular mt-1.5 text-xl', tone.strong)}>
                    {formatPrice(work.price)}
                  </dd>
                </div>
              </dl>

              <Link
                href={`/product/${work.slug}`}
                className={cn(
                  'group/cta mt-7 inline-flex min-h-[3rem] items-center gap-2 rounded-full px-6 text-sm font-medium tracking-wide transition-opacity hover:opacity-90',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                  light ? 'bg-white text-black' : 'bg-black text-white',
                  tone.ring,
                )}
              >
                {work.stock > 0 ? 'See this piece' : 'See what was made'}
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </div>

      {/*
        Announced once, complete, from a region that is never streamed into —
        the site's rule for `aria-live`. The name and the category are enough
        to know what changed; the description is in reading order immediately
        above and does not need saying twice.
      */}
      <p className="sr-only" aria-live="polite">
        {`Piece ${index + 1} of ${total}: ${work.name}, ${work.category.name}.`}
      </p>
    </section>
  );
}
