'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SareeCanvas, journeyStages, JOURNEY_COUNT } from '@/components/craft/saree-stages';
import type { ProcessPhase, DyeTone } from '@/content/process';
import { scrollTo } from '@/lib/smooth-scroll';
import { cn } from '@/lib/utils';

/**
 * The scroll-driven walk through the 23 steps.
 *
 * Two things move together as the reader descends:
 *
 *  1. **The wash behind the page** shifts through the seven pot colours in the
 *     order the craft reaches them. It is a real transition rather than a set
 *     of section backgrounds — the tone is interpolated continuously, so the
 *     black bleeds into the madder the way it would in water.
 *  2. **The cloth in the frame** advances through twelve states, from a length
 *     of loom cotton to a finished painted saree. It is the same drawing
 *     throughout, which is the whole claim: one cloth, twenty-three
 *     operations, not twelve different sarees photographed side by side.
 *
 * Readability is not left to chance. The dye tone is painted on a fixed layer
 * *behind* the text, and every block of prose sits on a solid card built from
 * the theme's own surface tokens — so the copy is exactly as legible over
 * kasim black as it is over myrobalan cream, in either theme. Only the phase
 * numerals and the frame furniture sit on the dye directly, and those switch
 * between a light and a dark ink chosen per tone.
 *
 * Everything is ordinary HTML in document order. Turn off JavaScript and you
 * get the full twenty-three steps as a readable article on a plain background;
 * the wash and the frame add atmosphere and carry no information of their own.
 */
export function ProcessJourney({
  phases,
  tones,
}: {
  phases: ProcessPhase[];
  tones: DyeTone[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const [activePhase, setActivePhase] = useState(0);
  const [stage, setStage] = useState(0);
  const [ink, setInk] = useState<'light' | 'dark'>('dark');
  /** True while the page is moving. Drives the frame's presence. */
  const [scrolling, setScrolling] = useState(false);
  /**
   * Set when the reader steps the frame by hand. Scroll then stops driving it
   * until they move the page again — otherwise the next scroll tick would
   * immediately overwrite the stage they just chose.
   */
  const [manual, setManual] = useState(false);
  const manualRef = useRef(false);
  /**
   * The current stage, readable from callbacks that must not re-subscribe.
   *
   * `stepTo` is handed to the frame and to the rail; if it closed over `stage`
   * it would be a new function on every one of the twelve stage changes, and
   * every consumer would re-render with it for no benefit.
   */
  const stageRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    const wash = washRef.current;
    if (!root || !wash) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      /* ---- The dye wash -------------------------------------------------- */

      // One trigger spanning the whole journey, scrubbed. The tone is written
      // to a CSS variable rather than to state: this fires on every scroll
      // tick, and re-rendering a page of twenty-three steps that often would
      // be indefensible.
      const swatch = { t: 0 };

      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        scrub: reduced ? false : 0.6,
        onUpdate: (self) => {
          swatch.t = self.progress;
          const scaled = self.progress * (tones.length - 1);
          const index = Math.min(tones.length - 2, Math.floor(scaled));
          const within = scaled - index;

          const from = tones[index];
          const to = tones[index + 1];
          wash.style.setProperty(
            '--dye',
            gsap.utils.interpolate(from.hex, to.hex, within) as string,
          );

          // The ink flips at the halfway point of each pair, so it changes
          // while the background is still clearly one tone or the other and
          // never mid-way through an ambiguous blend.
          const nextInk = within < 0.5 ? from.ink : to.ink;
          setInk((prev) => (prev === nextInk ? prev : nextInk));
        },
      });

      /* ---- The cloth in the frame ---------------------------------------- */

      // Twelve stages spread across the same scroll distance. Quantised to an
      // index so each state holds long enough to be read, rather than
      // dissolving continuously into the next.
      ScrollTrigger.create({
        trigger: root,
        start: 'top 80%',
        end: 'bottom bottom',
        scrub: false,
        onUpdate: (self) => {
          if (manualRef.current) return;
          const next = Math.min(
            JOURNEY_COUNT - 1,
            Math.floor(self.progress * JOURNEY_COUNT),
          );
          stageRef.current = next;
          setStage((prev) => (prev === next ? prev : next));
        },
      });

      /* ---- Is the page moving? ------------------------------------------- */

      // The frame is fully present while the reader is travelling and settles
      // back to three-quarters when they stop, so it holds the page together
      // during the journey and yields to the text once they are reading.
      let idle: number;
      ScrollTrigger.create({
        trigger: root,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: () => {
          setScrolling(true);
          window.clearTimeout(idle);
          idle = window.setTimeout(() => setScrolling(false), 260);
        },
      });

      /* ---- Phase tracking, for the rail and the live region -------------- */

      const sections = gsap.utils.toArray<HTMLElement>('[data-phase]');

      sections.forEach((section, index) => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top 65%',
          end: 'bottom 35%',
          onEnter: () => setActivePhase(index),
          onEnterBack: () => setActivePhase(index),
        });

        if (reduced) return;

        // Individual steps fade up as they arrive. Cheap, and it gives the
        // reader a sense of moving through a sequence rather than a list.
        gsap.from(section.querySelectorAll('[data-step]'), {
          opacity: 0,
          y: 18,
          duration: 0.55,
          stagger: 0.07,
          ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 72%', once: true },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [tones]);

  /**
   * Step the frame by hand, and bring the article with it.
   *
   * The frame and the prose are two views of one sequence, so moving one and
   * leaving the other behind is a bug rather than a missing nicety: the reader
   * clicks to stage nine, the caption says the madder bath, and the twelve
   * paragraphs beside it are still describing charcoal.
   *
   * Scroll is taken out of the loop first (`manualRef`) and only then is the
   * page moved. The order matters — the scroll this triggers would otherwise
   * be read as the reader travelling and would immediately overwrite the very
   * stage they just asked for.
   */
  const stepTo = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(JOURNEY_COUNT - 1, next));
    if (clamped === stageRef.current) return;

    manualRef.current = true;
    setManual(true);
    setStage(clamped);
    stageRef.current = clamped;

    scrollTo(`#step-${journeyStages[clamped].startsAtStep}`);
  }, []);

  /** Hand the frame back to the page, from wherever the reader now is. */
  const release = useCallback(() => {
    manualRef.current = false;
    setManual(false);
    // Re-measure so the cloth snaps to the reader's actual position rather
    // than resuming from whichever stage they had stepped to by hand.
    ScrollTrigger.refresh();
  }, []);

  const current = journeyStages[stage];

  return (
    <div ref={rootRef} className="relative">
      {/*
        The wash. Fixed rather than sticky so it cannot seam between sections,
        and behind everything. The two overlays are what keep the dye readable:
        a vertical scrim that deepens towards the edges, and a flat veil that
        pulls the whole tone back far enough for card surfaces to sit on it in
        both themes.
      */}
      <div
        ref={washRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ ['--dye' as string]: tones[0].hex }}
      >
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{ backgroundColor: 'var(--dye)' }}
        />
        {/* Pulls the saturation back so body text on cards stays comfortable. */}
        <div className="absolute inset-0 bg-background/[0.72] dark:bg-background/[0.78]" />
        {/* Depth: the tone reads strongest at the edges, like dye in a tray. */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/55" />
      </div>

      <div className="container">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,35rem)] xl:gap-14">
          {/* ---------------------------------------------------------------- */}
          {/* Left: the reading                                                */}
          {/* ---------------------------------------------------------------- */}
          <div>
            {/* Announces phase changes to screen-reader users, who get no
                benefit from the wash or the frame. */}
            <p className="sr-only" aria-live="polite">
              {`Phase ${activePhase + 1} of ${phases.length}: ${phases[activePhase]?.title}. Cloth stage ${stage + 1} of ${JOURNEY_COUNT}: ${current?.title}.`}
            </p>

            {phases.map((phase) => (
              <section
                key={phase.id}
                id={`phase-${phase.id}`}
                data-phase={phase.id}
                className="relative scroll-mt-24 py-16 md:py-24"
              >
                <div className="rounded-sm border border-border/70 bg-background/95 p-6 shadow-[0_20px_60px_-40px_rgb(0_0_0/0.55)] backdrop-blur-md md:p-10">
                  <div className="flex items-baseline gap-4">
                    <span
                      className="font-display text-4xl leading-none text-primary/70"
                      aria-hidden="true"
                    >
                      {phase.numeral}
                    </span>
                    <div>
                      <h2 className="text-display-md leading-tight">{phase.title}</h2>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        Steps {phase.steps[0].n}–{phase.steps[phase.steps.length - 1].n}
                      </p>
                    </div>
                  </div>

                  <p className="mt-7 font-display text-xl italic leading-snug text-primary md:text-2xl">
                    {phase.question}
                  </p>
                  <p className="mt-4 text-body-lg leading-relaxed text-muted-foreground">
                    {phase.intro}
                  </p>

                  <ol className="mt-10 flex flex-col gap-9">
                    {phase.steps.map((step) => (
                      <li
                        key={step.n}
                        data-step
                        id={`step-${step.n}`}
                        className="scroll-mt-24 border-l-2 border-border pl-5 md:pl-7"
                      >
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="tabular font-display text-sm font-semibold text-primary">
                            {String(step.n).padStart(2, '0')}
                          </span>
                          <h3 className="font-display text-xl leading-snug">{step.title}</h3>
                          {step.localName && (
                            <span className="text-sm italic text-muted-foreground">
                              {step.localName}
                            </span>
                          )}
                        </div>

                        <p className="mt-3 leading-relaxed text-muted-foreground">{step.body}</p>

                        {(step.materials?.length || step.duration) && (
                          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-xs">
                            {step.materials?.length ? (
                              <div>
                                <dt className="uppercase tracking-[0.12em] text-muted-foreground/70">
                                  Materials
                                </dt>
                                <dd className="mt-1">{step.materials.join(' · ')}</dd>
                              </div>
                            ) : null}
                            {step.duration && (
                              <div>
                                <dt className="uppercase tracking-[0.12em] text-muted-foreground/70">
                                  Takes
                                </dt>
                                <dd className="mt-1">{step.duration}</dd>
                              </div>
                            )}
                          </dl>
                        )}

                        {step.note && (
                          <p className="mt-4 border-l-2 border-primary/50 bg-primary/[0.05] py-2.5 pl-4 pr-3 text-sm leading-relaxed">
                            {step.note}
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
            ))}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Right: the cloth, framed and sticky                              */}
          {/* ---------------------------------------------------------------- */}
          {/*
            No longer `aria-hidden`. The frame's controls now move the article
            itself, which makes them navigation rather than decoration — and a
            control that relocates the reader must be reachable by keyboard and
            announced. The canvas inside it stays hidden; the drawing carries
            no information the prose does not.
          */}
          <aside className="sticky top-20 hidden h-fit py-10 lg:block">
            <ClothFrame
              stage={stage}
              ink={ink}
              phases={phases}
              activePhase={activePhase}
              scrolling={scrolling}
              manual={manual}
              onStep={stepTo}
              onRelease={release}
            />
          </aside>
        </div>
      </div>

      {/*
        Below `lg` the frame moves under the header as a slim strip rather than
        a full panel. A 460×600 frame pinned on a phone would leave a column of
        text the width of a receipt.
      */}
      <div
        className="pointer-events-none sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-10 px-5 lg:hidden"
        aria-hidden="true"
      >
        <div className="mx-auto flex max-w-md items-center gap-3 rounded-sm border border-border/70 bg-background/92 p-2.5 shadow-[0_14px_40px_-28px_rgb(0_0_0/0.7)] backdrop-blur-md">
          <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-[2px] border border-border/60 bg-cotton-100 dark:bg-kasim-800">
            <SareeCanvas stage={0} layers={current.layers} label="" />
          </div>
          <div className="min-w-0">
            <p className="tabular font-inscription text-[0.625rem] uppercase tracking-[0.16em] text-primary">
              {current.short} · {current.steps}
            </p>
            <p className="truncate font-display text-sm leading-tight">{current.title}</p>
          </div>
          <span className="tabular ml-auto shrink-0 pr-1 font-display text-sm text-muted-foreground">
            {current.n}/{JOURNEY_COUNT}
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* The frame                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The cloth, in a frame.
 *
 * Double-ruled rather than a single border - a hairline inside a heavier outer
 * line, the way a narrative panel is actually mounted in this workshop, and
 * the same rhythm as the temple borders in the drawing itself.
 *
 * Two behaviours worth naming:
 *
 *  - **Presence follows travel.** While the page is moving the frame is fully
 *    opaque and the reader is watching the cloth change; when they stop it
 *    settles to three-quarters and yields to the paragraph they have stopped
 *    to read. It never disappears, because the whole point is that the cloth
 *    and the words are the same story.
 *  - **The controls sit on the image.** Low-contrast until hovered, so they
 *    are available without competing with the drawing. Stepping by hand takes
 *    scroll out of the loop until the reader hands it back, because otherwise
 *    the next scroll tick would immediately overwrite their choice.
 *
 * `ink` follows the ground so the caption stays legible as the tone shifts.
 */
function ClothFrame({
  stage,
  ink,
  phases,
  activePhase,
  scrolling,
  manual,
  onStep,
  onRelease,
}: {
  stage: number;
  ink: 'light' | 'dark';
  phases: ProcessPhase[];
  activePhase: number;
  scrolling: boolean;
  manual: boolean;
  onStep: (next: number) => void;
  onRelease: () => void;
}) {
  const current = journeyStages[stage];
  const light = ink === 'light';

  const control = cn(
    'absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full',
    'border backdrop-blur-sm transition-all duration-300',
    'opacity-20 hover:opacity-100 focus-visible:opacity-100 group-hover/frame:opacity-65',
    'disabled:pointer-events-none disabled:opacity-0',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    light
      ? 'border-cotton-100/40 bg-kasim-950/40 text-cotton-50'
      : 'border-kasim-900/25 bg-cotton-50/70 text-kasim-900',
  );

  return (
    <div
      className={cn(
        'transition-opacity duration-500 ease-out motion-reduce:transition-none',
        scrolling || manual ? 'opacity-100' : 'opacity-[0.75]',
      )}
    >
      <div
        className={cn(
          'group/frame relative rounded-sm p-3 shadow-[0_30px_80px_-50px_rgb(0_0_0/0.85)] transition-colors duration-700',
          light
            ? 'bg-cotton-50/10 ring-1 ring-cotton-100/25'
            : 'bg-kasim-950/[0.05] ring-1 ring-kasim-900/15',
        )}
      >
        <div
          className={cn(
            'rounded-[2px] border p-2 transition-colors duration-700',
            light ? 'border-cotton-100/35' : 'border-kasim-900/20',
          )}
        >
          <div
            className={cn(
              'overflow-hidden rounded-[1px] border transition-colors duration-700',
              light ? 'border-cotton-100/25' : 'border-kasim-900/15',
            )}
            // The drawing itself carries nothing the prose does not. The panel
            // around it is no longer hidden wholesale — the controls in it are
            // real navigation now — so the canvas opts out on its own.
            aria-hidden="true"
          >
            {/*
              Sized from the *viewport height*, not from the column width.

              The cloth is a tall portrait in a sticky panel, so width-driven
              sizing is the wrong control: widening the column to enlarge the
              drawing makes it taller faster than it makes it bigger, and past
              a certain point the caption underneath is pushed below the fold
              at the very moment the frame pins. Deriving the width from a
              capped height instead means the frame grows on a large screen
              and is guaranteed to fit on a short one, with the aspect ratio
              intact in both cases.
            */}
            <div className="relative mx-auto aspect-[46/60] h-[min(58vh,32rem)] max-w-full bg-cotton-100 dark:bg-kasim-800 xl:h-[min(62vh,40rem)]">
              <SareeCanvas
                stage={0}
                layers={current.layers}
                label=""
                className="absolute inset-0"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onStep(stage - 1)}
          disabled={stage === 0}
          className={cn(control, 'left-5')}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">
            {stage === 0
              ? 'Previous stage of the cloth'
              : `Go to stage ${journeyStages[stage - 1].n}, ${journeyStages[stage - 1].title}`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onStep(stage + 1)}
          disabled={stage === JOURNEY_COUNT - 1}
          className={cn(control, 'right-5')}
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">
            {stage === JOURNEY_COUNT - 1
              ? 'Next stage of the cloth'
              : `Go to stage ${journeyStages[stage + 1].n}, ${journeyStages[stage + 1].title}`}
          </span>
        </button>

        {manual && (
          <button
            type="button"
            onClick={onRelease}
            className={cn(
              'absolute bottom-5 left-1/2 -translate-x-1/2 rounded-sm border px-3 py-1.5',
              'text-[0.6875rem] uppercase tracking-[0.12em] backdrop-blur-sm transition-opacity duration-300',
              'opacity-60 hover:opacity-100 focus-visible:opacity-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              light
                ? 'border-cotton-100/40 bg-kasim-950/45 text-cotton-50'
                : 'border-kasim-900/25 bg-cotton-50/75 text-kasim-900',
            )}
          >
            Follow the page again
          </button>
        )}
      </div>

      {/* The caption repeats, word for word, what the live region above the
          article already announces on every stage change. Exposing both would
          read the same sentence twice. */}
      <div className="mt-4 px-1" aria-hidden="true">
        <p
          className={cn(
            'tabular font-inscription text-[0.6875rem] uppercase tracking-[0.18em] transition-colors duration-700',
            light ? 'text-cotton-100/80' : 'text-kasim-900/70',
          )}
        >
          Stage {current.n} of {JOURNEY_COUNT} - {current.steps}
        </p>
        <p
          className={cn(
            'mt-1.5 font-display text-xl leading-snug transition-colors duration-700',
            light ? 'text-cotton-50' : 'text-kasim-950',
          )}
        >
          {current.title}
        </p>
        <p
          className={cn(
            'mt-2 text-[0.8125rem] leading-relaxed transition-colors duration-700',
            light ? 'text-cotton-100/75' : 'text-kasim-900/75',
          )}
        >
          {current.caption}
        </p>

        <ol className="mt-5 flex items-center gap-1" aria-hidden="true">
          {journeyStages.map((s, i) => (
            <li
              key={s.n}
              className={cn(
                'h-0.5 flex-1 rounded-full transition-colors duration-500',
                i <= stage
                  ? light
                    ? 'bg-cotton-100/85'
                    : 'bg-kasim-900/70'
                  : light
                    ? 'bg-cotton-100/20'
                    : 'bg-kasim-900/15',
              )}
            />
          ))}
        </ol>

        <p
          className={cn(
            'mt-4 text-[0.6875rem] uppercase tracking-[0.14em] transition-colors duration-700',
            light ? 'text-cotton-100/55' : 'text-kasim-900/55',
          )}
        >
          {phases[activePhase]?.numeral} - {phases[activePhase]?.title}
        </p>
      </div>
    </div>
  );
}
