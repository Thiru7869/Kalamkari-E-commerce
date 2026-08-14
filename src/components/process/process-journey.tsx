'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SareeCanvas } from '@/components/craft/saree-stages';
import { stepsForStage, type MainStage } from '@/content/stages';
import type { DyeTone } from '@/content/process';
import { scrollTo } from '@/lib/smooth-scroll';
import { cn } from '@/lib/utils';

/**
 * The scroll-driven walk through the fourteen main stages.
 *
 * ─── What changed, and what deliberately did not ──────────────────────────
 *
 * This used to render six phases and drive a separate twelve-state cloth. It
 * now renders the fourteen stages in `src/content/stages.ts`, and the cloth is
 * driven by the stage the reader is actually in rather than by a parallel list
 * that had to be kept in step by hand. That removes the failure this component
 * was one edit away from: two independent sequences over the same cloth, with
 * nothing checking that stage nine of one lined up with stage nine of the
 * other.
 *
 * The twenty-three operations have not gone anywhere. Each stage renders the
 * ones it contains, resolved out of `process.ts` through `stepsForStage`, so
 * the page still carries every step, with its materials, duration and note —
 * and `stages.ts` fails at import if the fourteen ever stop accounting for all
 * twenty-three exactly once.
 *
 * ─── What moves as you read ───────────────────────────────────────────────
 *
 *  1. **The wash behind the page** shifts through the pot colours in the order
 *     the craft reaches them, interpolated continuously rather than switched
 *     per section, so the black bleeds into the madder the way it would in
 *     water. Written to a CSS variable, never to state: this fires on every
 *     scroll tick and re-rendering fourteen chapters that often would be
 *     indefensible.
 *  2. **The cloth in the frame** advances through the fourteen states, from a
 *     length of loom cotton to a finished painted saree. It is the same
 *     drawing throughout, which is the whole claim: one cloth, twenty-three
 *     operations, not fourteen different sarees photographed side by side.
 *
 * Readability is not left to chance. The dye tone is painted on a fixed layer
 * *behind* the text, and every block of prose sits on a solid card built from
 * the theme's own surface tokens — so the copy is exactly as legible over kasim
 * black as over myrobalan cream, in either theme.
 *
 * Everything is ordinary HTML in document order. Turn off JavaScript and you
 * get the full fourteen stages and all twenty-three steps as a readable article
 * on a plain background; the wash and the frame add atmosphere and carry no
 * information of their own.
 */
export function ProcessJourney({
  stages,
  tones,
}: {
  stages: MainStage[];
  tones: DyeTone[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  /** Which of the fourteen the reader is in. Drives the frame and the rail. */
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
   * it would be a new function on every one of the fourteen stage changes, and
   * every consumer would re-render with it for no benefit.
   */
  const stageRef = useRef(0);

  const total = stages.length;

  useEffect(() => {
    const root = rootRef.current;
    const wash = washRef.current;
    if (!root || !wash) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      /* ---- The dye wash -------------------------------------------------- */

      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        scrub: reduced ? false : 0.6,
        onUpdate: (self) => {
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

      /* ---- Which stage the reader is in ---------------------------------- */

      /*
        One trigger per stage section, rather than one quantised trigger over
        the whole run.

        The old version divided total scroll progress by twelve, which assumes
        every chapter is the same height. These fourteen are emphatically not:
        stage 10 is four operations and three long paragraphs, stage 6 is one
        operation and a short one. Dividing by count made the frame reach the
        madder bath while the reader was still on the kalam, and then sit on
        the last state for two full screens.

        Anchored to the sections themselves, the cloth is always showing the
        stage whose words are actually on the screen — which is the only thing
        this component is for.
      */
      const sections = gsap.utils.toArray<HTMLElement>('[data-stage]');

      sections.forEach((section, index) => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top 62%',
          end: 'bottom 38%',
          onEnter: () => {
            if (manualRef.current) return;
            stageRef.current = index;
            setStage((prev) => (prev === index ? prev : index));
          },
          onEnterBack: () => {
            if (manualRef.current) return;
            stageRef.current = index;
            setStage((prev) => (prev === index ? prev : index));
          },
        });

        if (reduced) return;

        // The steps inside a stage fade up as they arrive. Cheap, and it gives
        // the reader a sense of moving through a sequence rather than a list.
        gsap.from(section.querySelectorAll('[data-step]'), {
          opacity: 0,
          y: 16,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 72%', once: true },
        });
      });

      /* ---- Is the page moving? ------------------------------------------- */

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
    }, root);

    return () => ctx.revert();
  }, [tones, total]);

  /**
   * Step the frame by hand, and bring the article with it.
   *
   * The frame and the prose are two views of one sequence, so moving one and
   * leaving the other behind is a bug rather than a missing nicety.
   *
   * Scroll is taken out of the loop first (`manualRef`) and only then is the
   * page moved. The order matters — the scroll this triggers would otherwise
   * be read as the reader travelling and would immediately overwrite the very
   * stage they just asked for.
   */
  const stepTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      if (clamped === stageRef.current) return;

      manualRef.current = true;
      setManual(true);
      setStage(clamped);
      stageRef.current = clamped;

      scrollTo(`#stage-${clamped + 1}`);
    },
    [total],
  );

  /** Hand the frame back to the page, from wherever the reader now is. */
  const release = useCallback(() => {
    manualRef.current = false;
    setManual(false);
    // Re-measure so the cloth snaps to the reader's actual position rather
    // than resuming from whichever stage they had stepped to by hand.
    ScrollTrigger.refresh();
  }, []);

  const current = stages[stage];

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
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] xl:gap-14">
          {/* ---------------------------------------------------------------- */}
          {/* Left: the reading                                                */}
          {/* ---------------------------------------------------------------- */}
          <div>
            {/* Announces stage changes to screen-reader users, who get no
                benefit from the wash or the frame. */}
            <p className="sr-only" aria-live="polite">
              {`Stage ${stage + 1} of ${total}: ${current?.title}.`}
            </p>

            {stages.map((s, i) => (
              <StageSection key={s.n} stage={s} index={i} total={total} />
            ))}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Right: the cloth, framed and sticky                              */}
          {/* ---------------------------------------------------------------- */}
          {/*
            Not `aria-hidden`. The frame's controls move the article itself,
            which makes them navigation rather than decoration — and a control
            that relocates the reader must be reachable by keyboard and
            announced. The canvas inside it stays hidden; the drawing carries
            no information the prose does not.
          */}
          <aside className="sticky top-20 hidden h-fit py-10 lg:block">
            <ClothFrame
              stages={stages}
              stage={stage}
              ink={ink}
              scrolling={scrolling}
              manual={manual}
              onStep={stepTo}
              onRelease={release}
            />
          </aside>
        </div>
      </div>

      {/*
        The cloth below `lg`.

        Pinned to the bottom rather than under the header: the header is
        already sticky, and a second pinned band beneath it costs the article
        two bites out of the top of a short viewport. The cloth is sized from
        the viewport, so it holds real presence on a tall phone and still fits
        a landscape one, and the frame around it is the same double-rule the
        desktop panel uses so the two read as one object at two sizes.

        Decorative, and stated as such: every word in it is repeated in the
        prose beside it, so a screen reader gains nothing from a second copy.
      */}
      <div
        className="pointer-events-none sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-10 px-4 lg:hidden"
        aria-hidden="true"
      >
        <div className="mx-auto flex max-w-md items-stretch gap-3.5 rounded-sm border border-border/70 bg-background/95 p-2.5 shadow-[0_18px_50px_-30px_rgb(0_0_0/0.75)] backdrop-blur-md">
          {/* The frame. Outer rule, hairline inner, exactly as on desktop. */}
          <div className="shrink-0 rounded-[3px] bg-foreground/[0.04] p-[3px] ring-1 ring-border/70">
            <div className="relative aspect-[46/60] h-[clamp(6rem,17vh,9.5rem)] overflow-hidden rounded-[2px] border border-border/60 bg-cotton-100 dark:bg-muted">
              <SareeCanvas stage={0} layers={current.layers} label="" />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
            <p className="tabular font-inscription text-[0.625rem] uppercase tracking-[0.16em] text-primary">
              Stage {current.n} of {total}
            </p>
            <p className="mt-1 font-display text-[0.9375rem] leading-tight">{current.title}</p>

            {/* Where the cloth has got to, drawn rather than counted. The
                numeral alone made the reader do the division. */}
            <div className="mt-auto pt-3">
              <div className="h-px w-full bg-foreground/15">
                <div
                  className="h-px bg-primary transition-[width] duration-500 ease-out"
                  style={{ width: `${((stage + 1) / total) * 100}%` }}
                />
              </div>
              <p className="tabular mt-1.5 font-inscription text-[0.625rem] uppercase tracking-[0.16em] text-muted-foreground">
                {current.coversSteps.length > 0
                  ? `Steps ${current.coversSteps[0]}–${current.coversSteps[current.coversSteps.length - 1]} of 23`
                  : 'Between the numbered steps'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* One stage                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * A stage, and the operations inside it.
 *
 * The prose is the stage; the numbered steps underneath are the twenty-three,
 * resolved from `process.ts` rather than restated here. They sit inside the
 * stage that contains them so the page reads as fourteen chapters with their
 * working detail attached, instead of as two separate lists of the same craft
 * that a reader has to reconcile.
 *
 * Stage 13 claims no numbered operations — final detailing is work the
 * twenty-three do not enumerate — so the block is conditional rather than
 * assumed. An empty `<ol>` with a heading over it is worse than none.
 */
function StageSection({
  stage,
  index,
  total,
}: {
  stage: MainStage;
  index: number;
  total: number;
}) {
  const steps = stepsForStage(stage);

  return (
    <section
      id={`stage-${stage.n}`}
      data-stage={stage.n}
      data-index={index}
      className="relative scroll-mt-24 section-y-lg"
      aria-labelledby={`stage-${stage.n}-heading`}
    >
      <div className="rounded-sm border border-border/70 bg-background/95 p-6 shadow-[0_20px_60px_-40px_rgb(0_0_0/0.55)] backdrop-blur-md md:p-10">
        {/* ---- The stage head ------------------------------------------- */}
        <div className="flex items-baseline gap-4">
          <span
            className="tabular font-display text-4xl leading-none text-primary/70"
            aria-hidden="true"
          >
            {String(stage.n).padStart(2, '0')}
          </span>
          <div className="min-w-0">
            <p className="font-inscription text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">
              Stage {stage.n} of {total}
              {steps.length > 0 && (
                <>
                  {' · '}
                  {steps.length === 1
                    ? `Step ${steps[0].n}`
                    : `Steps ${steps[0].n}–${steps[steps.length - 1].n}`}{' '}
                  of 23
                </>
              )}
            </p>
            <h2
              id={`stage-${stage.n}-heading`}
              className="mt-2 text-display-md leading-tight"
            >
              {stage.title}
            </h2>
            {stage.localName && (
              <p className="mt-1.5 font-display text-lg italic text-muted-foreground">
                {stage.localName}
              </p>
            )}
          </div>
        </div>

        {/* ---- The question, and the answer ------------------------------ */}
        <p className="mt-7 font-display text-xl italic leading-snug text-primary md:text-2xl">
          {stage.question}
        </p>

        {stage.body.map((para, i) => (
          <p
            key={i}
            className={cn(
              'leading-relaxed text-muted-foreground',
              i === 0 ? 'mt-4 text-body-lg' : 'mt-4',
            )}
          >
            {para}
          </p>
        ))}

        {(stage.materials?.length || stage.duration) && (
          <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3 border-t border-border pt-5 text-xs">
            {stage.materials?.length ? (
              <div className="min-w-0 max-w-full">
                <dt className="uppercase tracking-[0.12em] text-muted-foreground/70">
                  Materials
                </dt>
                <dd className="mt-1.5">{stage.materials.join(' · ')}</dd>
              </div>
            ) : null}
            {stage.duration && (
              <div>
                <dt className="uppercase tracking-[0.12em] text-muted-foreground/70">Takes</dt>
                <dd className="mt-1.5">{stage.duration}</dd>
              </div>
            )}
          </dl>
        )}

        {stage.note && (
          <p className="mt-5 border-l-2 border-primary/50 bg-primary/[0.05] py-3 pl-4 pr-3 text-sm leading-relaxed">
            {stage.note}
          </p>
        )}

        {/* ---- The numbered operations inside this stage ------------------ */}
        {steps.length > 0 && (
          <div className="mt-9 border-t border-border pt-7">
            <h3 className="font-inscription text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">
              {steps.length === 1
                ? 'The operation, as it is counted'
                : `The ${steps.length} operations inside this stage`}
            </h3>

            <ol className="mt-5 flex flex-col gap-7">
              {steps.map((step) => (
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
                    <h4 className="font-display text-lg leading-snug">{step.title}</h4>
                    {step.localName && (
                      <span className="text-sm italic text-muted-foreground">
                        {step.localName}
                      </span>
                    )}
                  </div>

                  <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>

                  {step.duration && (
                    <p className="mt-2 text-xs uppercase tracking-[0.12em] text-muted-foreground/70">
                      {step.duration}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* The frame                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The cloth, in a frame.
 *
 * Double-ruled rather than a single border — a hairline inside a heavier outer
 * line, the way a narrative panel is actually mounted in this workshop, and the
 * same rhythm as the temple borders in the drawing itself.
 *
 * Three behaviours worth naming:
 *
 *  - **Presence follows travel.** While the page is moving the frame is fully
 *    opaque and the reader is watching the cloth change; when they stop it
 *    settles to three-quarters and yields to the paragraph they have stopped to
 *    read. It never disappears, because the whole point is that the cloth and
 *    the words are the same story.
 *  - **The controls sit on the image.** Low-contrast until hovered, so they are
 *    available without competing with the drawing. Stepping by hand takes
 *    scroll out of the loop until the reader hands it back.
 *  - **The rail is the table of contents.** Fourteen marks, each one a jump. On
 *    a page this long the reader needs to know both where they are and that
 *    there is a way to the stage they came for.
 *
 * `ink` follows the ground so the caption stays legible as the tone shifts.
 */
function ClothFrame({
  stages,
  stage,
  ink,
  scrolling,
  manual,
  onStep,
  onRelease,
}: {
  stages: MainStage[];
  stage: number;
  ink: 'light' | 'dark';
  scrolling: boolean;
  manual: boolean;
  onStep: (next: number) => void;
  onRelease: () => void;
}) {
  const current = stages[stage];
  const total = stages.length;
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
            // around it is not hidden wholesale — the controls in it are real
            // navigation — so the canvas opts out on its own.
            aria-hidden="true"
          >
            {/*
              Sized from the *viewport height*, not from the column width.

              The cloth is a tall portrait in a sticky panel, so width-driven
              sizing is the wrong control: widening the column to enlarge the
              drawing makes it taller faster than it makes it bigger, and past
              a certain point the caption underneath is pushed below the fold
              at the very moment the frame pins. Deriving the width from a
              capped height instead means the frame grows on a large screen and
              is guaranteed to fit on a short one, aspect ratio intact.

              Down from 58vh to 52vh, because the rail underneath is new and
              has to fit in the same sticky column without pushing the stage
              title off a 900px laptop screen.
            */}
            <div className="relative mx-auto aspect-[46/60] h-[min(52vh,28rem)] max-w-full bg-cotton-100 dark:bg-muted xl:h-[min(56vh,34rem)]">
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
              : `Go to stage ${stages[stage - 1].n}, ${stages[stage - 1].title}`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onStep(stage + 1)}
          disabled={stage === total - 1}
          className={cn(control, 'right-5')}
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">
            {stage === total - 1
              ? 'Next stage of the cloth'
              : `Go to stage ${stages[stage + 1].n}, ${stages[stage + 1].title}`}
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
      <div className="mt-4 px-1">
        <p
          className={cn(
            'tabular font-inscription text-[0.6875rem] uppercase tracking-[0.18em] transition-colors duration-700',
            light ? 'text-cotton-100/80' : 'text-kasim-900/70',
          )}
          aria-hidden="true"
        >
          Stage {current.n} of {total}
          {current.coversSteps.length > 0 && (
            <>
              {' · '}
              {current.coversSteps.length === 1
                ? `Step ${current.coversSteps[0]}`
                : `Steps ${current.coversSteps[0]}–${current.coversSteps[current.coversSteps.length - 1]}`}
            </>
          )}
        </p>
        <p
          className={cn(
            'mt-1.5 font-display text-xl leading-snug transition-colors duration-700',
            light ? 'text-cotton-50' : 'text-kasim-950',
          )}
          aria-hidden="true"
        >
          {current.title}
        </p>
        <p
          className={cn(
            'mt-2 text-[0.8125rem] leading-relaxed transition-colors duration-700',
            light ? 'text-cotton-100/75' : 'text-kasim-900/75',
          )}
          aria-hidden="true"
        >
          {current.question}
        </p>

        {/*
          The rail: fourteen marks, and every one of them a jump.

          It replaces a row of inert progress ticks. On a page this long the
          reader arrives with a stage in mind as often as not — somebody who
          came to read about the indigo vat should not have to scroll past the
          myrobalan to find it — and the marks were already drawn. Making them
          buttons costs nothing and turns the frame into the page's table of
          contents.

          Real buttons with real labels, so this is operable by keyboard and
          announced. The bars themselves are `aria-hidden`; the accessible name
          is the stage it goes to.
        */}
        <ol className="mt-6 flex items-end gap-1">
          {stages.map((s, i) => (
            <li key={s.n} className="flex-1">
              <button
                type="button"
                onClick={() => onStep(i)}
                aria-current={i === stage ? 'step' : undefined}
                // 44px of vertical target over a 2px mark: the hit area is
                // padding, not paint, so the rail stays a hairline and is
                // still reachable with a thumb.
                className="group/mark flex w-full items-end justify-center py-3 focus-visible:outline-none"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'block w-full rounded-full transition-all duration-500',
                    'group-hover/mark:h-1.5 group-focus-visible/mark:h-1.5',
                    i === stage ? 'h-1.5' : 'h-0.5',
                    i <= stage
                      ? light
                        ? 'bg-cotton-100/85'
                        : 'bg-kasim-900/70'
                      : light
                        ? 'bg-cotton-100/20'
                        : 'bg-kasim-900/15',
                  )}
                />
                <span className="sr-only">
                  Stage {s.n}: {s.title}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
