'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The banner at the head of a type page.
 *
 * Every slide after the first is a **real piece currently in the store**,
 * captioned and linked. That is the whole design constraint: a carousel of
 * stock photography at the top of a category page is decoration, and this site
 * does not get to put decoration above the fold on a page whose argument is
 * that the work is real. If somebody is looking at the third slide, they are
 * looking at a saree they can buy, and clicking it takes them to it.
 *
 * The first slide is the category's own photograph, which is the one image
 * here that is about the *kind* of thing rather than about one piece.
 *
 * Behaviour worth naming:
 *
 *  - **It stops when watched.** Advancing pauses on hover, on focus within, and
 *    whenever the tab is hidden — a carousel that keeps cycling behind a
 *    background tab is spending battery to move pictures nobody is looking at.
 *  - **It never advances under reduced motion**, and the control reads as
 *    stopped rather than pretending otherwise.
 *  - **There is a real pause button.** WCAG 2.2.2: this moves on its own, for
 *    longer than five seconds, beside content somebody is trying to read.
 *  - **Only the current slide is in the tab order.** Otherwise a keyboard user
 *    tabs through eight invisible links stacked on top of each other.
 */

/** How long each slide holds. Long: these are photographs, not headlines. */
const INTERVAL_MS = 5200;

export type BannerSlide = {
  src: string;
  alt: string;
  /** Shown over the image. Absent on the opening category shot. */
  caption?: string;
  /** Where the piece lives, when the slide is a piece. */
  href?: string;
};

export function TypeBanner({
  slides,
  className,
}: {
  slides: BannerSlide[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(query.matches);
    sync();
    // Subscribed, not sampled: a preference read once on mount is wrong the
    // moment the visitor changes it.
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  // A tab nobody is looking at should not be running a timer.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const count = slides.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (reduced || paused || count < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduced, paused, count]);

  if (count === 0) return null;

  const single = count < 2;

  return (
    <div
      ref={rootRef}
      className={cn(
        'group/banner relative overflow-hidden rounded-sm border border-border bg-kasim-800',
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      // Not a list of headlines being rotated at a screen reader: each slide is
      // announced only when it is reached by the controls below.
      aria-roledescription={single ? undefined : 'carousel'}
      aria-label={single ? undefined : 'Pieces of this kind in the store'}
    >
      <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
        {slides.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.src}
              className={cn(
                'absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none',
                active ? 'opacity-100' : 'opacity-0',
              )}
              aria-hidden={!active}
              inert={!active ? true : undefined}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                // The first slide is above the fold on every one of these pages.
                priority={i === 0}
                sizes="(min-width: 1280px) 1200px, 100vw"
                className={cn(
                  'object-cover',
                  // A slow drift, so a still photograph on a five-second hold
                  // does not read as a broken image.
                  active && !reduced && 'motion-safe:scale-105',
                  'transition-transform duration-[6000ms] ease-out',
                )}
              />

              {/* The caption sits on a scrim rather than on the photograph, so
                  it is legible over a dark pallu and a pale cotton alike. */}
              {slide.caption && (
                <>
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-kasim-950/85 via-kasim-950/15 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 pb-12 sm:p-6 sm:pb-14">
                    {slide.href ? (
                      <Link
                        href={slide.href}
                        className="inline-block max-w-[min(100%,32rem)] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cotton-100"
                        tabIndex={active ? undefined : -1}
                      >
                        <span className="font-inscription text-[0.625rem] uppercase tracking-[0.2em] text-cotton-200/75">
                          In the store
                        </span>
                        <span className="mt-1 block font-display text-lg leading-snug text-cotton-50 sm:text-2xl">
                          {slide.caption}
                        </span>
                      </Link>
                    ) : (
                      <p className="max-w-[min(100%,32rem)] font-display text-lg leading-snug text-cotton-50 sm:text-2xl">
                        {slide.caption}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {!single && (
        <>
          {/* ---- Stepping ------------------------------------------------ */}
          <button
            type="button"
            onClick={() => go(index - 1)}
            className={controlClass('left-3')}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Previous piece</span>
          </button>

          <button
            type="button"
            onClick={() => go(index + 1)}
            className={controlClass('right-3')}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Next piece</span>
          </button>

          {/* ---- Position, and the stop control -------------------------- */}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 px-4 pb-3 sm:px-6 sm:pb-4">
            <ol className="flex flex-1 items-center gap-1.5">
              {slides.map((slide, i) => (
                <li key={slide.src} className="contents">
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={i === index ? 'true' : undefined}
                    className="group/dot flex h-6 flex-1 items-center focus-visible:outline-none"
                  >
                    <span
                      className={cn(
                        'h-0.5 w-full rounded-full transition-colors duration-500',
                        i === index
                          ? 'bg-cotton-50'
                          : 'bg-cotton-100/35 group-hover/dot:bg-cotton-100/70 group-focus-visible/dot:bg-cotton-100/70',
                      )}
                    />
                    <span className="sr-only">
                      Go to slide {i + 1} of {count}
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            {/*
              Only offered when something is actually moving. Under reduced
              motion the banner never advances, so a pause button would be a
              control for a thing that is not happening.
            */}
            {!reduced && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cotton-100/30 bg-kasim-950/45 text-cotton-50 backdrop-blur-sm transition-colors hover:border-cotton-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cotton-100"
              >
                {paused ? (
                  <Play className="ml-0.5 h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span className="sr-only">
                  {paused ? 'Resume the banner' : 'Pause the banner'}
                </span>
              </button>
            )}
          </div>

          {/* One announcement per settled slide. */}
          <p className="sr-only" aria-live="polite">
            {`Slide ${index + 1} of ${count}${slides[index].caption ? `: ${slides[index].caption}` : ''}`}
          </p>
        </>
      )}
    </div>
  );
}

/**
 * The stepping controls.
 *
 * Quiet until the banner is hovered or the control is focused — they sit on a
 * photograph, and a pair of solid buttons parked on somebody's saree is worse
 * than a pair that appears when wanted. Always full-size for touch.
 */
function controlClass(side: string) {
  return cn(
    'absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full',
    'border border-cotton-100/30 bg-kasim-950/45 text-cotton-50 backdrop-blur-sm',
    'transition-all duration-300',
    'opacity-0 group-hover/banner:opacity-90 focus-visible:opacity-100',
    // No hover on a touch screen, so they are simply present there.
    '[@media(hover:none)]:opacity-80',
    'hover:border-cotton-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cotton-100',
    side,
  );
}
