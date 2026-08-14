'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, X } from 'lucide-react';
import { tourSteps, type TourStep } from '@/content/welcome';
import { scrollTo } from '@/lib/smooth-scroll';
import { cn } from '@/lib/utils';

/**
 * The walk-through that follows the welcome.
 *
 * Deliberately not a spotlight overlay. Those dim the page, trap the pointer,
 * and have to do positioning arithmetic that breaks the moment a target is
 * off-screen or the viewport is 360px wide. This is a small card that stays
 * out of the way, plus a soft ring drawn on whatever it is currently talking
 * about — so the page underneath stays fully usable and nothing has to be
 * measured.
 *
 * Steps whose target is not in the DOM are skipped rather than shown pointing
 * at nothing: the header controls do not exist on a phone, and the tab bar
 * does not exist on a desktop.
 *
 * Each step is one or two lines with the rest behind "more", because a tour
 * that explains everything is a tour nobody finishes.
 */
export function QuickTour({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Only the steps whose target actually exists on this viewport.
  const steps = useMemo<TourStep[]>(() => {
    if (typeof document === 'undefined') return tourSteps;
    return tourSteps.filter((step) =>
      document.querySelector(`[data-tour="${step.target}"]`),
    );
  }, []);

  const total = steps.length;
  const step = steps[index];

  const finish = useCallback(() => {
    document.querySelectorAll('[data-tour-active]').forEach((el) => {
      el.removeAttribute('data-tour-active');
    });
    onClose();
  }, [onClose]);

  /*
    Move the ring, then take the reader to what it is pointing at.

    ---------------------------------------------------------------------------
    Why this no longer uses `scrollIntoView`
    ---------------------------------------------------------------------------

    It used to, with `behavior: 'smooth'`, and on this site that silently did
    not work. Lenis owns the page's scroll position whenever it is mounted, and
    the stylesheet it ships with sets

        .lenis.lenis-smooth { scroll-behavior: auto !important }

    precisely so that native smooth scrolling cannot fight it. The consequence
    is that every `scrollIntoView({ behavior: 'smooth' })` on this site is a
    *jump*: the tour teleported the reader between steps and there was nothing
    in the code to suggest it would. Going through `scrollTo` from
    `src/lib/smooth-scroll.ts` routes the move through the one Lenis instance —
    the same path the back-to-top button and the process rail already use — and
    falls back to native smooth scrolling when Lenis is absent.

    ---------------------------------------------------------------------------
    Why it now scrolls every time, and the one case where it must not
    ---------------------------------------------------------------------------

    It used to move the page only when the target was already off-screen, which
    made Next feel inert for the first two or three steps and then suddenly
    lurch. Every step now travels, so the button does one predictable thing.

    The exception is a `position: fixed` target. Three of the six stops are
    fixed or sticky chrome — the assistant launcher, the phone tab bar, the
    theme toggle in the header — and a fixed element's `getBoundingClientRect()`
    is its position in the *viewport*, not in the document. Scrolling "to" it
    computes a document offset from a number that has nothing to do with the
    document, which sends the page somewhere arbitrary. Those targets are
    already on screen by definition, so the correct move is not to move.
  */
  useEffect(() => {
    if (!step) return;

    document.querySelectorAll('[data-tour-active]').forEach((el) => {
      el.removeAttribute('data-tour-active');
    });

    const target = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (!target) return;

    target.setAttribute('data-tour-active', '');

    /*
      Where to travel.

      Prefer the step's own section — the part of the page this stop is about.
      Fall back to the ringed control, but only when that control is actually
      in the document flow: a `fixed` or `sticky` element's
      `getBoundingClientRect()` is its position in the *viewport*, so deriving
      a document offset from it sends the page somewhere meaningless. Those
      controls are on screen by definition, so the correct move is not to move.
    */
    const section = step.section
      ? document.querySelector<HTMLElement>(`[data-tour-section="${step.section}"]`)
      : null;

    const destination =
      section ??
      (['fixed', 'sticky'].includes(getComputedStyle(target).position) ? null : target);

    if (destination) {
      // Centre it rather than clearing the header: the ring is drawn *outside*
      // the element, so a target parked directly under the header loses its
      // top edge to it.
      scrollTo(destination, { offset: -Math.round(window.innerHeight * 0.3) });
    }

    return () => target.removeAttribute('data-tour-active');
  }, [step]);

  // A new step is a new topic; nobody wants the previous one's detail left open.
  useEffect(() => setExpanded(false), [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(total - 1, i + 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [finish, total]);

  useEffect(() => {
    cardRef.current?.focus();
  }, []);

  if (!step) return null;

  const last = index === total - 1;

  return (
    <div
      ref={cardRef}
      tabIndex={-1}
      role="dialog"
      aria-label="Quick tour"
      // Not modal: the page behind stays usable, which is the whole point.
      aria-modal="false"
      /*
        Centred by auto margins, never by a transform.

        This card previously centred itself with `left-1/2 -translate-x-1/2`
        while also carrying `animate-rise-in` — and `rise-in` animates
        `transform`, ending on `translateY(0)`. `transform` is one property, not
        a list of independent ones, so the animation's final value *replaced*
        the centring translate rather than adding to it. With
        `animation-fill-mode: forwards` that final value sticks, so the card
        settled at exactly `left: 50%` with nothing pulling it back: on a phone
        it began at the middle of the screen and ran off the right edge, with
        every line of its own copy clipped. Desktop was unaffected, because
        from `md` the card is anchored to `right` and never used the translate.

        The lesson generalises: an element positioned by `transform` cannot
        also be animated by `transform`. Here the positioning gives way, since
        `inset-x-0` + `mx-auto` + a width centres an out-of-flow box by spec
        (CSS 2.1 §10.3.7 splits the leftover space equally between two auto
        margins) and leaves `transform` free for the animation to own.
      */
      className={cn(
        'fixed z-[60] w-[calc(100%-2rem)] max-w-sm outline-none',
        // Above the phone tab bar; bottom-right on a desktop.
        'inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] mx-auto',
        'md:inset-x-auto md:bottom-6 md:right-6 md:mx-0',
        'motion-safe:animate-rise-in',
      )}
    >
      {/*
        The card is struck in the same gold as the ring it is pointing with.

        Without that they are two unrelated pieces of chrome that happen to be
        on screen together, and the reader has to work out which highlighted
        thing this panel is talking about. One colour, used in one place, for
        one purpose: the ring says "this", the card says what "this" is.
      */}
      <div className="overflow-hidden rounded-sm border border-gold/45 bg-background shadow-[0_28px_70px_-30px_rgb(0_0_0/0.7)]">
        {/* Head */}
        <div className="flex items-center gap-2 border-b border-gold/30 bg-gold/[0.10] px-4 py-2.5">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
          />
          <span className="tabular font-inscription text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">
            A quick look · {index + 1} of {total}
          </span>
          <button
            type="button"
            onClick={finish}
            className="ml-auto -mr-2 flex h-9 w-9 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Close the tour</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4">
          <h2 className="font-display text-lg leading-snug">{step.title}</h2>
          <p className="mt-2 text-[0.875rem] leading-relaxed text-muted-foreground">
            {step.summary}
          </p>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls={`tour-more-${step.id}`}
            className="mt-3 inline-flex min-h-[2.25rem] items-center gap-1 text-[0.8125rem] font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {expanded ? 'Less' : 'More'}
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform duration-300',
                expanded && 'rotate-180',
              )}
              aria-hidden="true"
            />
          </button>

          {/* Only this step's detail expands — the card grows, nothing else moves. */}
          <div
            id={`tour-more-${step.id}`}
            hidden={!expanded}
            className="mt-3 flex flex-col gap-2.5 border-l-2 border-primary/40 pl-3.5"
          >
            {step.more.map((line) => (
              <p key={line} className="text-[0.8125rem] leading-relaxed text-muted-foreground">
                {line}
              </p>
            ))}
          </div>
        </div>

        {/*
          The stops, as links rather than as a progress bar.

          What was here was six anonymous segments: they showed how far along
          the reader was and offered nothing else. A tour is a table of
          contents for a page somebody has just met, so the contents should be
          readable and reachable — a reader who only wants the one about
          commissions should not have to press Next three times to find out
          which one that is.

          Each carries `.link-underline`, whose whole design constraint is that
          it cannot move anything: the rule is an absolutely-positioned
          pseudo-element animating `scaleX`, so hovering one label does not
          shift the five beside it by even a pixel. The current stop is marked
          with `aria-current`, which both draws the rule permanently and is the
          correct thing to announce.
        */}
        <nav
          aria-label="Tour stops"
          className="flex flex-wrap gap-x-3.5 gap-y-2 border-t border-border px-4 py-3"
        >
          {steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-current={i === index ? 'true' : undefined}
              className={cn(
                'link-underline rounded-sm text-[0.75rem] leading-none transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                i === index
                  ? 'font-semibold text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {/* Foot */}
        <div className="flex items-center gap-2 border-t border-border px-3 py-2.5">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-primary/50 hover:text-primary disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Previous stop</span>
          </button>

          {/* Position, without a second set of numbers. */}
          <ol className="flex flex-1 items-center gap-1 px-1" aria-hidden="true">
            {steps.map((s, i) => (
              <li
                key={s.id}
                className={cn(
                  'h-0.5 flex-1 rounded-full transition-colors duration-300',
                  i <= index ? 'bg-primary' : 'bg-border',
                )}
              />
            ))}
          </ol>

          {last ? (
            <button
              type="button"
              onClick={finish}
              className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-chay-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Done
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Next stop</span>
            </button>
          )}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {`Tour step ${index + 1} of ${total}: ${step.title}. ${step.summary}`}
      </p>
    </div>
  );
}
