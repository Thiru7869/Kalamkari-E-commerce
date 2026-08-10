'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import type { ColourStory } from '@/content/process';
import { cn } from '@/lib/utils';

/**
 * The vegetable palette, one colour at a time.
 *
 * Deliberately the same interaction as "How a Kalamkari saree is made" on the
 * home page — a numbered rail and two arrows — because a visitor who has
 * already learned that pattern should not have to learn a second one. What
 * differs is what fills the panel: there, a cloth changing state; here, the
 * pot the colour comes out of.
 *
 * The swatch is the hero, so it is large and the text sits on it. Each colour
 * carries its own `ink` pairing rather than a computed one, because a
 * luminance formula gets myrobalan gold wrong — it is bright enough to score
 * as "light" and still needs dark text over it to be comfortable.
 */
export function ColourWalk({ colours }: { colours: ColourStory[] }) {
  const [{ index, direction }, setPosition] = useState<{ index: number; direction: 1 | -1 }>({
    index: 0,
    direction: 1,
  });

  const copyRef = useRef<HTMLDivElement>(null);
  const swatchRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);

  const count = colours.length;
  const current = colours[index];

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(count - 1, next));
      setPosition((prev) =>
        clamped === prev.index
          ? prev
          : { index: clamped, direction: clamped > prev.index ? 1 : -1 },
      );
    },
    [count],
  );

  // The copy is swapped rather than cross-faded: two paragraphs dissolving
  // through each other are unreadable for the whole transition.
  useEffect(() => {
    const el = copyRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('[data-animate]'),
        { opacity: 0, y: direction * 14 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.05, overwrite: true },
      );
    }, el);
    return () => ctx.revert();
  }, [index, direction]);

  // The colour floods in from the side it arrived from — dye entering water.
  useEffect(() => {
    const el = swatchRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { clipPath: direction > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', opacity: 0.4 },
        {
          clipPath: 'inset(0 0 0 0%)',
          opacity: 1,
          duration: 0.85,
          ease: 'power2.inOut',
          overwrite: true,
        },
      );
    }, el);
    return () => ctx.revert();
  }, [index, direction]);

  const light = current.ink === 'light';

  return (
    <section
      id="colours"
      className="scroll-mt-24 border-y border-border bg-cotton-100 section-y dark:bg-card"
      aria-labelledby="colour-walk-heading"
    >
      <div className="container">
        <div className="max-w-2xl">
          <p className="eyebrow">The vegetable palette</p>
          <h2 id="colour-walk-heading" className="mt-3 text-display-md">
            Eight colours, and where each one comes from
          </h2>
          <p className="mt-4 text-body-lg text-muted-foreground">
            Three are painted on with the pen. One is dipped. One is struck in a boiling
            bath. One is not a dye at all. Move through them and see which is which.
          </p>
        </div>

        {/* ---- The rail ---------------------------------------------------- */}
        <div className="mt-10 md:mt-14">
          <div
            className="relative"
            role="tablist"
            aria-label="Natural colours"
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') go(index + 1);
              if (e.key === 'ArrowLeft') go(index - 1);
            }}
          >
            <span
              className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-foreground/15"
              aria-hidden="true"
            />
            <span
              className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-primary transition-[width] duration-700 ease-out"
              style={{ width: `${(index / (count - 1)) * 100}%` }}
              aria-hidden="true"
            />

            <ol className="relative flex items-center justify-between">
              {colours.map((colour, i) => {
                const active = i === index;
                return (
                  <li key={colour.id}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-label={colour.name}
                      tabIndex={active ? 0 : -1}
                      onClick={() => go(i)}
                      className={cn(
                        'block h-8 w-8 rounded-full border-2 transition-all duration-300 ease-out md:h-11 md:w-11',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-cotton-100 dark:focus-visible:ring-offset-card',
                        active
                          ? 'scale-110 border-primary shadow-[0_0_0_5px_hsl(var(--primary)/0.12)]'
                          : 'border-foreground/15 hover:border-primary/40',
                      )}
                      style={{ backgroundColor: colour.hex }}
                    />
                  </li>
                );
              })}
            </ol>
          </div>

          <ol className="mt-2.5 hidden justify-between sm:flex" aria-hidden="true">
            {colours.map((colour, i) => (
              <li
                key={colour.id}
                className={cn(
                  'w-11 text-center text-[0.625rem] uppercase tracking-[0.1em] transition-colors duration-300',
                  i === index ? 'text-primary' : 'text-muted-foreground/70',
                )}
              >
                {colour.name.split(' ')[0]}
              </li>
            ))}
          </ol>
        </div>

        {/* ---- The colour, and what it is --------------------------------- */}
        <div
          className="mt-8 grid gap-5 md:mt-12 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:gap-14"
          onTouchStart={(e) => {
            touchStart.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            const start = touchStart.current;
            if (start == null) return;
            const delta = e.changedTouches[0].clientX - start;
            if (Math.abs(delta) > 48) go(index + (delta < 0 ? 1 : -1));
            touchStart.current = null;
          }}
        >
          {/* The pot */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-border shadow-[0_18px_50px_-32px_rgb(0_0_0/0.6)] md:aspect-[46/44]">
            <div
              ref={swatchRef}
              className="absolute inset-0 will-change-[clip-path]"
              style={{ backgroundColor: current.hex }}
            />
            {/* A little depth, so it reads as liquid rather than a paint chip. */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20"
              aria-hidden="true"
            />

            <div className="relative flex h-full flex-col justify-end p-5 md:p-7">
              <p
                className={cn(
                  'font-inscription text-[0.625rem] uppercase tracking-[0.2em]',
                  light ? 'text-white/70' : 'text-black/60',
                )}
              >
                {current.method}
              </p>
              <p
                className={cn(
                  'mt-1.5 font-display text-2xl leading-tight md:text-3xl',
                  light ? 'text-white' : 'text-black',
                )}
              >
                {current.name}
              </p>
              {current.localName && (
                <p
                  className={cn(
                    'mt-1 font-display text-base italic',
                    light ? 'text-white/70' : 'text-black/60',
                  )}
                >
                  {current.localName}
                </p>
              )}
            </div>
          </div>

          {/* What it is */}
          <div ref={copyRef} className="flex flex-col justify-center">
            <p
              data-animate
              className="tabular font-inscription text-[0.6875rem] uppercase tracking-[0.2em] text-primary"
            >
              Colour {index + 1} of {count}
            </p>

            <dl data-animate className="mt-4 flex flex-col gap-3 border-y border-border py-4">
              <div className="flex flex-wrap gap-x-3 text-sm">
                <dt className="w-20 shrink-0 uppercase tracking-[0.12em] text-muted-foreground/70">
                  From
                </dt>
                <dd className="flex-1">{current.source}</dd>
              </div>
              <div className="flex flex-wrap gap-x-3 text-sm">
                <dt className="w-20 shrink-0 uppercase tracking-[0.12em] text-muted-foreground/70">
                  Applied
                </dt>
                <dd className="flex-1">{current.method}</dd>
              </div>
            </dl>

            <p
              data-animate
              className="mt-5 text-[0.9375rem] leading-relaxed text-muted-foreground md:text-base"
            >
              {current.body}
            </p>

            <p
              data-animate
              className="mt-5 border-l-2 border-primary/50 bg-primary/[0.05] py-3 pl-4 pr-3 text-sm leading-relaxed"
            >
              {current.note}
            </p>

            <div className="mt-7 flex items-center gap-2 md:gap-3">
              <button
                type="button"
                onClick={() => go(index - 1)}
                disabled={index === 0}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background transition-all duration-200 hover:border-primary/50 hover:text-primary disabled:pointer-events-none disabled:opacity-35"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Previous colour</span>
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                disabled={index === count - 1}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background transition-all duration-200 hover:border-primary/50 hover:text-primary disabled:pointer-events-none disabled:opacity-35"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Next colour</span>
              </button>

              <p className="ml-2 text-sm text-muted-foreground" role="status" aria-live="polite">
                {current.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
