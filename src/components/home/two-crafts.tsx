'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { colourStories, openPalette, whatWeDoNotUse } from '@/content/process';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { cn } from '@/lib/utils';

/**
 * "Two crafts, one name" — the claim, and the pots behind it.
 *
 * Choosing a colour floods the whole section with it **and replaces the claim
 * on the left with that colour's story**. That is not decoration: this is the
 * section arguing that the palette comes out of pots rather than out of a
 * printer, and the fastest way to make the argument is to let somebody stand
 * inside a colour while reading where it came from.
 *
 * The eight pots are read from `colourStories` in `src/content/process.ts`
 * rather than restated here. They used to be a local array, which meant the
 * home page and /process could describe the same pot differently — and did,
 * once the store corrected the account of pink. Content lives in the content
 * layer; this file decides only how it moves.
 *
 * Readability is guaranteed structurally rather than hoped for. Every dye
 * carries a stated `ink` — `light` or `dark` — chosen against the real swatch,
 * and every piece of text in the section reads from that one value. A computed
 * luminance gets myrobalan gold wrong: it scores as bright and still needs dark
 * text over it. So it is written down, once, beside the colour.
 *
 * The type shifts with it. On a flooded ground the display face goes up in
 * size and weight and the body copy narrows its measure — the vintage
 * broadside setting these workshops' own printed labels used, and the setting
 * that survives being laid over a strong colour.
 */

/**
 * The ninth tile has no hex, and the section does not flood for it.
 *
 * `openPalette` is the statement that the eight pots are a working week rather
 * than the limit of the craft. Flooding the section with one arbitrary colour
 * chosen to represent "countless shades" would contradict the sentence it is
 * there to make, so selecting it keeps the site's own ground and lets the copy
 * do the work.
 */
const OPEN_ID = openPalette.id;

/**
 * Draws the exclusion marks once, when the list arrives.
 *
 * Not a plain `motion-safe:animate-*` on the marks themselves: this section is
 * a screen and a half down the landing page, and a CSS animation starts when
 * the element is painted, so the whole sequence would have played out and
 * finished before anybody scrolled to it. An observer is the difference between
 * a mark that draws as you read it and a mark that was already drawn.
 *
 * It fires once and disconnects. A list that re-strikes itself every time it
 * passes the fold is a toy, and this list is the site's flat denial that
 * anything synthetic is used.
 */
function useDrawOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion gets the finished state immediately. The mark carries
    // meaning — it is what makes the row a negation rather than a bullet — so
    // it must never be left half-drawn or absent.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setArmed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setArmed(true);
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, armed };
}

/**
 * One line of the story, arriving behind a stagger.
 *
 * The delay is an index rather than a duration so the caller reads as an
 * ordered list. 70ms is the same step the exclusion marks use below, which is
 * what keeps the two halves of the section feeling like one hand.
 */
function Line({
  step,
  className,
  children,
}: {
  step: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn('motion-safe:animate-story-in motion-reduce:animate-none', className)}
      style={{ animationDelay: `${step * 70}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * The flood, which is not quite the dye.
 *
 * The swatch shows the pot's true hex, because there it is being shown *as a
 * dye*. The section behind the words is a surface that has to carry text, and
 * on one of the eight — pink, `#C66857` — it could not: measured, black at
 * *full* strength reaches only 5.52:1 on it, so three of the four tones in the
 * ladder below were under AA and most of that colour's story was illegible.
 *
 * Raising the ladder fixed seven of the eight outright. Pink needed the ground
 * to move as well, and 7% is the whole move: a veil toward white under dark
 * ink, toward black under light ink. It is the same reasoning as the hero's
 * scrim, which is "a legibility device first and a colour second" — and at 7%
 * the flood is still unmistakably the dye beside it in the swatch.
 *
 * Applied uniformly rather than only to pink. A veil always pushes the ground
 * *away* from its own ink, so it can only ever raise contrast; solving it once
 * for the worst case costs the other seven nothing and removes a per-colour
 * exception that somebody would eventually have to maintain.
 *
 * `scripts/tmp/solve-flood.mjs` is the solver that produced both numbers.
 */
const FLOOD_VEIL = 0.07;

function floodOf(hex: string, ink: 'light' | 'dark') {
  const towards = ink === 'dark' ? 255 : 0;
  const channel = (i: number) => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
    return Math.round(c * (1 - FLOOD_VEIL) + towards * FLOOD_VEIL);
  };
  return `rgb(${channel(0)} ${channel(1)} ${channel(2)})`;
}

export function TwoCrafts() {
  const [active, setActive] = useState<string | null>(null);

  const story = colourStories.find((s) => s.id === active) ?? null;
  const isOpenPalette = active === OPEN_ID;
  /** Only a real pot floods the section. See the note on `OPEN_ID`. */
  const dye = story;
  const light = dye?.ink === 'light';
  const denials = useDrawOnce<HTMLUListElement>();

  const flood = dye ? floodOf(dye.hex, dye.ink) : null;

  /*
    The ink ladder, re-struck.

    It was 100 / 85 / 70 / 60 for light ink and 100 / 75 / 65 / 55 for dark, and
    eight of those thirty-two tone-on-ground pairs missed AA — the small tracked
    labels ("Where it comes from") worst of all, on five of the eight grounds.

    The values below are the weakest ladder that clears 4.5:1 for every body
    tone on every ground, and 3:1 for the display tone, solved rather than
    guessed. They are set as arbitrary opacities because Tailwind's default
    scale has no 92, 84, 82, 76 or 74 — rounding them to the nearest stock step
    is what would put them back under the line.

    The hierarchy survives the raise: `strong` is display type at three or four
    times the size of `faint`, so the separation the ladder creates was never
    carried by opacity alone.
  */
  const tone = {
    strong: dye ? (light ? 'text-white' : 'text-black') : 'text-foreground',
    body: dye
      ? light
        ? 'text-white/[0.92]'
        : 'text-black/90'
      : 'text-muted-foreground',
    quiet: dye
      ? light
        ? 'text-white/[0.84]'
        : 'text-black/[0.82]'
      : 'text-muted-foreground',
    faint: dye
      ? light
        ? 'text-white/[0.76]'
        : 'text-black/[0.74]'
      : 'text-muted-foreground',
    rule: dye ? (light ? 'border-white/25' : 'border-black/20') : 'border-border',
  };

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden border-b border-border section-y',
        // With no colour chosen the section keeps the site's own surface.
        !dye && 'bg-cotton-100 dark:bg-card',
      )}
      style={flood ? { backgroundColor: flood } : undefined}
      aria-labelledby="two-crafts-heading"
    >
      {/* The flood. A separate layer so the colour can cross-fade rather than
          snapping, without transitioning the section's own background between
          a token and a hex. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 transition-colors duration-700 ease-out motion-reduce:transition-none"
        style={{ backgroundColor: flood ?? 'transparent' }}
      />

      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
          {/* ---- The claim, or the colour standing in its place ----------- */}
          <RevealOnScroll>
            {/*
              One column, two contents.

              `key` is the whole mechanism: changing it remounts the block, and
              a remounted element replays its CSS animation. Without it the
              copy would swap in place with no reveal at all, because the
              animation has already run. The claim gets a key too, so returning
              from a colour is as considered as arriving at one.
            */}
            {story || isOpenPalette ? (
              <div key={active}>
                <Line step={0} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={cn('h-px w-8 shrink-0', dye ? (light ? 'bg-white/40' : 'bg-black/30') : 'bg-primary/40')}
                  />
                  <p
                    className={cn(
                      'font-inscription text-eyebrow uppercase tracking-[0.2em]',
                      tone.faint,
                    )}
                  >
                    {story ? 'From the pot' : 'And beyond them'}
                  </p>
                </Line>

                <Line step={1}>
                  <h2
                    id="two-crafts-heading"
                    className={cn(
                      'mt-4 text-display-lg font-semibold tracking-[-0.015em]',
                      tone.strong,
                    )}
                  >
                    {story ? story.name : openPalette.name}
                  </h2>
                  {story?.localName && (
                    <p className={cn('mt-1.5 font-telugu text-lg', tone.faint)}>
                      {story.localName}
                    </p>
                  )}
                </Line>

                {/* Origin and method, as a two-column record rather than a
                    sentence. This is the part somebody actually scans. */}
                <Line step={2}>
                  <dl className={cn('mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2', tone.rule)}>
                    <div>
                      <dt
                        className={cn(
                          'font-inscription text-label uppercase tracking-[0.16em]',
                          tone.faint,
                        )}
                      >
                        Where it comes from
                      </dt>
                      <dd className={cn('mt-1.5 text-sm leading-snug', tone.body)}>
                        {story ? story.source : openPalette.source}
                      </dd>
                    </div>
                    <div>
                      <dt
                        className={cn(
                          'font-inscription text-label uppercase tracking-[0.16em]',
                          tone.faint,
                        )}
                      >
                        How it is worked
                      </dt>
                      <dd className={cn('mt-1.5 text-sm leading-snug', tone.body)}>
                        {story ? story.method : openPalette.method}
                      </dd>
                    </div>
                  </dl>
                </Line>

                <Line step={3}>
                  <p className={cn('mt-6 max-w-xl text-body-lg leading-relaxed', tone.body)}>
                    {story ? story.body : openPalette.body}
                  </p>
                </Line>

                {(story?.meaning ?? openPalette.meaning) && (
                  <Line step={4}>
                    <p className={cn('mt-4 max-w-xl leading-relaxed', tone.quiet)}>
                      {story ? story.meaning : openPalette.meaning}
                    </p>
                  </Line>
                )}

                {story?.usedFor && (
                  <Line step={5}>
                    <p
                      className={cn(
                        'mt-5 max-w-xl border-l-2 pl-4 text-base leading-relaxed',
                        dye ? (light ? 'border-white/30' : 'border-black/25') : 'border-primary/40',
                        tone.quiet,
                      )}
                    >
                      <span
                        className={cn(
                          'mr-2 font-inscription text-label uppercase tracking-[0.16em]',
                          tone.faint,
                        )}
                      >
                        Where it lands
                      </span>
                      {story.usedFor}
                    </p>
                  </Line>
                )}

                {/*
                  Green, and only green. Four routes to one colour is the most
                  interesting fact in this palette and it cannot be told in a
                  sentence — each route is a different shade, so the list is the
                  content rather than a decoration on it.
                */}
                {story?.routes && (
                  <Line step={6}>
                    <ul className={cn('mt-6 grid gap-px overflow-hidden rounded-sm border sm:grid-cols-2', tone.rule)}>
                      {story.routes.map((route) => (
                        <li
                          key={route.label}
                          className={cn(
                            'p-4',
                            dye ? (light ? 'bg-black/15' : 'bg-white/25') : 'bg-background',
                          )}
                        >
                          <p className={cn('font-display text-base leading-snug', tone.strong)}>
                            {route.label}
                          </p>
                          <p className={cn('mt-1.5 text-sm leading-relaxed', tone.quiet)}>
                            {route.body}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </Line>
                )}

                <Line step={7}>
                  <p
                    className={cn(
                      'mt-6 font-display text-lg italic leading-snug',
                      tone.strong,
                    )}
                  >
                    {story ? story.note : openPalette.note}
                  </p>
                </Line>

                {/*
                  The way back. A real 44px control rather than "press it
                  again": on a phone the swatch that is currently selected has
                  scrolled out of the viewport by the time somebody has read to
                  here, so the only affordance to close was off-screen.
                */}
                <Line step={8}>
                  <button
                    type="button"
                    onClick={() => setActive(null)}
                    className={cn(
                      'mt-7 inline-flex min-h-[2.75rem] items-center gap-2 rounded-sm border px-4 text-sm font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                      dye
                        ? light
                          ? 'border-white/25 text-white hover:bg-white/10 focus-visible:ring-white/70 focus-visible:ring-offset-transparent'
                          : 'border-black/20 text-black hover:bg-black/5 focus-visible:ring-black/60 focus-visible:ring-offset-transparent'
                        : 'border-border text-foreground hover:bg-foreground/5 focus-visible:ring-ring focus-visible:ring-offset-background',
                    )}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Back to the claim
                  </button>
                </Line>
              </div>
            ) : (
              <div key="claim">
                <p
                  className={cn(
                    'font-inscription text-eyebrow uppercase tracking-[0.2em]',
                    tone.faint,
                  )}
                >
                  Two crafts, one name
                </p>

                <h2 id="two-crafts-heading" className="mt-4 text-display-md text-foreground">
                  Almost everything sold as &ldquo;Kalamkari&rdquo; is printed. This is not.
                </h2>

                <p className="mt-5 max-w-xl text-body-lg leading-relaxed text-muted-foreground">
                  Printed Kalamkari is carved into a block or burned into a screen and then
                  repeated. This craft is drawn freehand with a bamboo pen, once, with no
                  tracing and no repetition device of any kind.
                </p>

                <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                  It grew up serving the temple rather than the export trade, which is why the
                  subjects are narrative: epics, deities, stories painted to be read across a
                  room. You cannot carve a block for a scene that happens once.
                </p>

                <Link
                  href="/our-story"
                  className="mt-6 inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Read the full story
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </RevealOnScroll>

          {/* ---- The pots ------------------------------------------------ */}
          <RevealOnScroll delay={0.1}>
            <div
              className={cn(
                'rounded-sm border p-5 transition-colors duration-700 md:p-7',
                dye
                  ? light
                    ? 'border-white/20 bg-black/15'
                    : 'border-black/15 bg-white/25'
                  : 'border-border bg-background',
              )}
            >
              <h3
                className={cn(
                  'font-display text-display-sm transition-colors duration-700',
                  tone.strong,
                )}
              >
                What we use instead
              </h3>
              {/*
                The claim, stated in the words people search for.
                "Kalamkari sarees · vegetable colours only" is the sentence
                this whole section exists to support, and it was implied by the
                eight swatches rather than said. A visitor who scrolls past the
                swatches without pressing one should still leave having read
                it, so it is set as a line of its own rather than folded into
                the paragraph underneath.
              */}
              <p
                className={cn(
                  'mt-2.5 font-inscription text-label uppercase tracking-[0.16em] transition-colors duration-700',
                  // Was white/80 and black/70, set by eye. Both are body copy
                  // on a flooded ground, so they take the solved ladder.
                  dye ? tone.body : 'text-primary',
                )}
              >
                Kalamkari sarees · vegetable colours only
              </p>

              <p
                className={cn(
                  'mt-2.5 text-sm transition-colors duration-700',
                  tone.quiet,
                )}
              >
                Press one and the page takes its colour, and the story of that pot opens
                beside it — where it comes from, how it is worked, and where it lands on
                the cloth.
              </p>

              {/*
                Three across, at every width, and now exactly three rows.

                `sm:grid-cols-4` broke eight swatches into two flush rows of
                four, which reads as a colour picker — a grid of equal options
                to pick from. These are not options; they are the pots this
                workshop actually keeps. Three-up also buys each swatch half as
                much width again for its two lines of label, which at four-up
                were breaking to three lines on a phone.

                The ninth tile is `openPalette`, and it is deliberately last
                and deliberately different: eight real pots, then the statement
                that eight is a working week rather than a limit.
              */}
              <ul className="mt-6 grid grid-cols-3 gap-2.5">
                {colourStories.map((swatch) => {
                  const on = active === swatch.id;
                  return (
                    <li key={swatch.id}>
                      <button
                        type="button"
                        onClick={() => setActive(on ? null : swatch.id)}
                        aria-pressed={on}
                        className={cn(
                          'group flex w-full flex-col items-start gap-2 rounded-sm border p-2 text-left transition-all duration-300',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                          // The press itself. `active:` is the one state a
                          // touch screen actually has — there is no hover on a
                          // phone, and this section's whole invitation is
                          // "press one". Without it, tapping a swatch on a
                          // phone produced a 700ms colour change with no
                          // acknowledgement at all in the first 300ms of it,
                          // which reads as a tap that missed.
                          'active:scale-[0.97] motion-reduce:active:scale-100',
                          dye
                            ? light
                              ? 'border-white/20 hover:border-white/50 focus-visible:ring-white/70 focus-visible:ring-offset-transparent'
                              : 'border-black/15 hover:border-black/40 focus-visible:ring-black/60 focus-visible:ring-offset-transparent'
                            : 'border-border hover:border-primary/40 focus-visible:ring-ring focus-visible:ring-offset-background',
                          on && 'scale-[1.03]',
                        )}
                      >
                        {/*
                          The swatch deepens rather than only scaling when it
                          is chosen: it grows from 36px to 52px, which is the
                          difference between a chip and a pot of dye you are
                          looking into. Height and transform only, so it stays
                          on the compositor.
                        */}
                        <span
                          aria-hidden="true"
                          className={cn(
                            'w-full rounded-[2px]',
                            'transition-[height,transform,box-shadow] duration-500 ease-out',
                            'motion-safe:group-hover:scale-[1.04] motion-reduce:transition-none',
                            // Height is set inline when chosen — 3.25rem has no
                            // key on the stock scale, and inventing one in the
                            // theme for a single swatch would be worse.
                            on ? 'ring-2 ring-offset-2 ring-offset-transparent' : 'h-9',
                          )}
                          style={{
                            backgroundColor: swatch.hex,
                            height: on ? '3.25rem' : undefined,
                            boxShadow: on ? `0 10px 30px -12px ${swatch.hex}` : undefined,
                          }}
                        />
                        <span className="min-w-0">
                          <span
                            className={cn(
                              'block text-xs font-medium leading-tight transition-colors duration-700',
                              tone.strong,
                            )}
                          >
                            {swatch.name}
                          </span>
                          <span
                            className={cn(
                              'mt-0.5 block text-label leading-tight transition-colors duration-700',
                              tone.faint,
                            )}
                          >
                            {swatch.method}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}

                {/* The ninth: not a pot, and drawn as a sweep so nobody reads
                    it as one more colour to pick. */}
                <li>
                  <button
                    type="button"
                    onClick={() => setActive(isOpenPalette ? null : OPEN_ID)}
                    aria-pressed={isOpenPalette}
                    className={cn(
                      'group flex w-full flex-col items-start gap-2 rounded-sm border border-dashed p-2 text-left transition-all duration-300',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                      'active:scale-[0.97] motion-reduce:active:scale-100',
                      dye
                        ? light
                          ? 'border-white/30 hover:border-white/60 focus-visible:ring-white/70 focus-visible:ring-offset-transparent'
                          : 'border-black/25 hover:border-black/50 focus-visible:ring-black/60 focus-visible:ring-offset-transparent'
                        : 'border-primary/35 hover:border-primary/60 focus-visible:ring-ring focus-visible:ring-offset-background',
                      isOpenPalette && 'scale-[1.03]',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'w-full rounded-[2px] transition-[height,transform] duration-500 ease-out',
                        'motion-safe:group-hover:scale-[1.04] motion-reduce:transition-none',
                        !isOpenPalette && 'h-9',
                      )}
                      style={{
                        height: isOpenPalette ? '3.25rem' : undefined,
                        backgroundImage: `linear-gradient(115deg, ${openPalette.sweep.join(', ')})`,
                      }}
                    />
                    <span className="min-w-0">
                      <span
                        className={cn(
                          'block text-xs font-medium leading-tight transition-colors duration-700',
                          tone.strong,
                        )}
                      >
                        {openPalette.name}
                      </span>
                      <span
                        className={cn(
                          'mt-0.5 block text-label leading-tight transition-colors duration-700',
                          tone.faint,
                        )}
                      >
                        Countless more
                      </span>
                    </span>
                  </button>
                </li>
              </ul>

              {/* What never goes in the pot. */}
              <div
                className={cn(
                  'mt-7 border-t pt-5 transition-colors duration-700',
                  tone.rule,
                )}
              >
                <h3
                  className={cn(
                    'font-display text-display-sm transition-colors duration-700',
                    tone.strong,
                  )}
                >
                  What we never use
                </h3>
                {/*
                  The marks, drawn one after another as the list arrives.

                  A note on which mark. The brief asked for animated ticks, and
                  a tick is the wrong glyph here by exactly one word: a ✓ beside
                  "Chemical or azo dyes" says the shop uses them. So it is the
                  *no* mark — a ring with a bar through it — animated the way a
                  tick would have been, drawn rather than faded so it reads as
                  somebody striking each item off by hand. That is also the
                  gesture the section is about.

                  Two strokes per item, `pathLength="1"` so one dash length
                  covers both regardless of their real geometry, and a 70ms
                  stagger down the list. Nothing moves after the pass; nothing
                  animates at all under reduced motion, where the marks are
                  simply present.
                */}
                <ul ref={denials.ref} className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {whatWeDoNotUse.map((item, i) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <svg
                        viewBox="0 0 16 16"
                        className={cn(
                          'mt-[0.15rem] h-4 w-4 shrink-0 transition-colors duration-700',
                          // `black/55` measured 2.97:1 on the pink ground —
                          // under the 3:1 that non-text UI needs, on the one
                          // mark whose whole job is to be read as a negation.
                          // It takes the solved ladder like everything else.
                          dye ? tone.faint : 'text-chay-600',
                        )}
                        aria-hidden="true"
                        fill="none"
                      >
                        <circle
                          cx="8"
                          cy="8"
                          r="6.4"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          pathLength="1"
                          strokeDasharray="1"
                          style={{
                            strokeDashoffset: denials.armed ? 0 : 1,
                            transition: `stroke-dashoffset 620ms cubic-bezier(0.32,0.72,0.28,1) ${i * 70}ms`,
                          }}
                        />
                        <path
                          d="M4.2 11.8 11.8 4.2"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          pathLength="1"
                          strokeDasharray="1"
                          style={{
                            strokeDashoffset: denials.armed ? 0 : 1,
                            transition: `stroke-dashoffset 420ms cubic-bezier(0.32,0.72,0.28,1) ${i * 70 + 260}ms`,
                          }}
                        />
                      </svg>
                      <span
                        className={cn('transition-colors duration-700', tone.quiet)}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/*
                Announced once, complete, from a region that is never streamed
                into. A screen reader gets the name and the origin — enough to
                know what just happened — rather than the whole story, which is
                on the page in reading order immediately above.
              */}
              <p className="sr-only" aria-live="polite">
                {story
                  ? `Showing ${story.name}: ${story.source}.`
                  : isOpenPalette
                    ? `Showing ${openPalette.name}: ${openPalette.source}.`
                    : 'No colour selected.'}
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
