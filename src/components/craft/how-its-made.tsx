'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { SareeCanvas, sareeStages, STAGE_COUNT } from './saree-stages';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * "How a Kalamkari saree is made" — eight states of one cloth.
 *
 * The interaction is deliberately plain: a numbered line, and two buttons.
 * The drama is entirely in the cloth, which is the point — a visitor should
 * come away remembering that the red arrives in a boiling pot at stage six,
 * not remembering the widget that told them so.
 *
 * The layout is identical on phone and desktop. Collapsing this into a single
 * column would destroy the one thing it exists to show: the rail and the cloth
 * changing together.
 */

export function HowItsMade() {
  // Direction travels with the stage rather than in its own state: deriving it
  // in a second setState from inside the first one's updater is a side effect
  // in a reducer, which React is free to run twice.
  const [{ stage, direction }, setPosition] = useState<{ stage: number; direction: 1 | -1 }>({
    stage: 0,
    direction: 1,
  });

  const copyRef = useRef<HTMLDivElement>(null);
  const clothRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);

  const current = sareeStages[stage];

  const go = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(STAGE_COUNT - 1, next));
    setPosition((prev) =>
      clamped === prev.stage
        ? prev
        : { stage: clamped, direction: clamped > prev.stage ? 1 : -1 },
    );
  }, []);

  // The copy is swapped, not cross-faded: cross-fading two paragraphs of body
  // text over each other is unreadable for the whole transition.
  useEffect(() => {
    const el = copyRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('[data-animate]'),
        { opacity: 0, y: direction * 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.06,
          overwrite: true,
        },
      );
    }, el);

    return () => ctx.revert();
  }, [stage, direction]);

  // The cloth takes a small breath on each change — the physical jolt of a
  // length of fabric being lifted out of a pot and hung again.
  useEffect(() => {
    const el = clothRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scale: 0.985, rotateZ: direction * 0.4 },
        { scale: 1, rotateZ: 0, duration: 1.1, ease: 'elastic.out(1, 0.75)', overwrite: true },
      );
    }, el);
    return () => ctx.revert();
  }, [stage, direction]);

  return (
    <section
      className="relative overflow-hidden border-y border-border bg-cotton-100 section-y dark:bg-card"
      aria-labelledby="how-its-made-heading"
    >
      <div className="container">
        <div className="max-w-2xl">
          <p className="eyebrow">Eight stages, one cloth</p>
          <h2 id="how-its-made-heading" className="mt-3 text-display-md">
            How a Kalamkari saree is made
          </h2>
          <p className="mt-4 text-body-lg text-muted-foreground">
            The same length of cotton, at every stage of the twenty-three. Move through it
            and watch the colour arrive — days after it was painted on, in a liquid nobody
            could see.
          </p>
        </div>

        {/* ---- The rail: one line, eight numbers, identical on every screen ---- */}
        <div className="mt-10 md:mt-14">
          <div
            className="relative"
            role="tablist"
            aria-label="Stages of making"
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') go(stage + 1);
              if (e.key === 'ArrowLeft') go(stage - 1);
            }}
          >
            {/* The line the numbers sit on, and the progress drawn along it. */}
            <span
              className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-foreground/15"
              aria-hidden="true"
            />
            <span
              className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-primary transition-[width] duration-700 ease-out"
              style={{ width: `${(stage / (STAGE_COUNT - 1)) * 100}%` }}
              aria-hidden="true"
            />

            <ol className="relative flex items-center justify-between">
              {sareeStages.map((s, i) => {
                const active = i === stage;
                const done = i < stage;
                return (
                  <li key={s.n}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-label={`Stage ${s.n}: ${s.short}`}
                      tabIndex={active ? 0 : -1}
                      onClick={() => go(i)}
                      className={cn(
                        'tabular flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium',
                        'transition-all duration-300 ease-out md:h-11 md:w-11 md:text-sm',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-cotton-100',
                        active
                          ? 'scale-110 border-primary bg-primary text-primary-foreground shadow-[0_0_0_5px_hsl(var(--primary)/0.12)]'
                          : done
                            ? 'border-primary/40 bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
                      )}
                    >
                      {s.n}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Labels under the rail — hidden below sm, where eight words do not fit
              legibly and the numbers plus the caption carry it instead. */}
          <ol className="mt-2.5 hidden justify-between sm:flex" aria-hidden="true">
            {sareeStages.map((s, i) => (
              <li
                key={s.n}
                className={cn(
                  'w-11 text-center text-label uppercase tracking-[0.1em] transition-colors duration-300',
                  i === stage ? 'text-primary' : 'text-muted-foreground/70',
                )}
              >
                {s.short}
              </li>
            ))}
          </ol>
        </div>

        {/* ---- Cloth and copy. Two columns on every screen, by design. ---- */}
        <div
          className="mt-8 grid grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] items-center gap-5 md:mt-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] md:gap-14"
          onTouchStart={(e) => {
            touchStart.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            const start = touchStart.current;
            if (start == null) return;
            const delta = e.changedTouches[0].clientX - start;
            if (Math.abs(delta) > 48) go(stage + (delta < 0 ? 1 : -1));
            touchStart.current = null;
          }}
        >
          <div
            ref={clothRef}
            className="relative aspect-[46/60] overflow-hidden rounded-sm bg-cotton-200 shadow-[0_18px_50px_-30px_rgb(0_0_0/0.6)] will-change-transform dark:bg-muted"
          >
            {/* Layers stated, not derived. The eight public stages no longer
                advance the cloth by exactly one layer each — stage 5 covers
                the alum and the bath that follows it — so index gating showed
                the wrong cloth under two of the eight headings. */}
            <SareeCanvas stage={stage} layers={current.layers} />

            <span
              className="tabular absolute left-2 top-2 rounded-sm bg-kasim-950/60 px-2 py-1 font-inscription text-label uppercase tracking-[0.14em] text-cotton-100 backdrop-blur-sm md:left-3 md:top-3"
              aria-hidden="true"
            >
              {current.steps}
            </span>
          </div>

          <div ref={copyRef}>
            <p
              data-animate
              className="tabular font-inscription text-label uppercase tracking-[0.2em] text-primary"
            >
              Stage {current.n} of {STAGE_COUNT}
            </p>
            <h3 data-animate className="mt-2 font-display text-xl leading-tight md:mt-3 md:text-3xl">
              {current.title}
            </h3>

            {/*
              The workshop's own word for the operation.

              Bracketed and set small, under the English rather than beside it:
              this is the name the thing is called in the room where it happens,
              and a reader should be able to take it or leave it without it
              competing with the heading. The transliteration follows in roman
              because most readers here cannot sound out the script, and a label
              nobody can pronounce is decoration.

              `lang` is on the script alone. Marking the whole line as Telugu
              would have a screen reader attempt the roman gloss and the
              brackets in a Telugu voice.
            */}
            <p
              data-animate
              className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-muted-foreground"
            >
              <span lang="te" className="font-telugu text-sm text-primary/90 md:text-base">
                [{current.telugu.script}]
              </span>
              <span className="font-inscription text-label uppercase tracking-[0.14em] text-muted-foreground/75">
                {current.telugu.roman}
              </span>
            </p>

            <p
              data-animate
              className="mt-2.5 text-sm leading-relaxed text-muted-foreground md:mt-5 md:text-base"
            >
              {current.body}
            </p>

            {/*
              The materials, in the workshop's words, under the paragraph that
              describes them in English.

              Placed *after* the body rather than before it, and that is the
              whole editorial decision. Before, it is a glossary the reader has
              to get past to reach the point; after, it is the set of words they
              have just been given the meaning of — "the black is kasim" lands
              in the sentence that explains what the black is, and this line
              only names it.

              One `<p>` per term, each opening with the script in brackets, so
              a reader scanning down the column sees a column of Telugu rather
              than a paragraph with Telugu in it. `lang="te"` is on the script
              alone: marking the whole line would have a screen reader read the
              roman gloss and the English in a Telugu voice.
            */}
            <div data-animate className="mt-3.5 space-y-1 md:mt-5">
              {current.terms.map((term) => (
                <p
                  key={term.roman}
                  className="flex flex-wrap items-baseline gap-x-2 text-xs leading-snug md:text-sm"
                >
                  <span lang="te" className="font-telugu text-primary/90">
                    [{term.script}]
                  </span>
                  <span className="font-inscription text-label uppercase tracking-[0.12em] text-muted-foreground/80">
                    {term.roman}
                  </span>
                  <span className="text-muted-foreground/90">— {term.gloss}</span>
                </p>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2 md:mt-8 md:gap-3">
              <button
                type="button"
                onClick={() => go(stage - 1)}
                disabled={stage === 0}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-all duration-200 hover:border-primary/50 hover:text-primary disabled:pointer-events-none disabled:opacity-35 md:h-11 md:w-11"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Previous stage</span>
              </button>
              <button
                type="button"
                onClick={() => go(stage + 1)}
                disabled={stage === STAGE_COUNT - 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-all duration-200 hover:border-primary/50 hover:text-primary disabled:pointer-events-none disabled:opacity-35 md:h-11 md:w-11"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Next stage</span>
              </button>
            </div>
          </div>
        </div>

        {/*
          The way through to the full sequence.

          These eight stages are a summary of twenty-three, and the visitor who
          has just watched the colour arrive is the one most likely to want the
          rest. Previously that route appeared only once the rail reached stage
          eight, which meant it was invisible to everyone who did not finish —
          and the landing page carried a second, near-duplicate section further
          down to compensate. One permanent, stated route replaces both.

          The line on the left is the single most surprising fact in the whole
          process, kept from that removed section: it is what makes the link
          worth following rather than a label saying "learn more".
        */}
        <div className="mt-10 flex flex-col gap-5 border-t border-border pt-7 md:mt-14 md:flex-row md:items-center md:justify-between md:gap-10">
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            The reds are never painted on as red. They go down as a clear solution of
            alum, and the colour arrives days later in a boiling bath of madder root —
            binding only where the alum went.
          </p>

          <Button asChild size="lg" className="shrink-0">
            <Link href="/process">
              See the making — all 23 steps
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
