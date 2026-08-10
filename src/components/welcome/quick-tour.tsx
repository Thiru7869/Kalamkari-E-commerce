'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, X } from 'lucide-react';
import { tourSteps, type TourStep } from '@/content/welcome';
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

  // Move the ring, and bring the target into view if it has scrolled away.
  useEffect(() => {
    if (!step) return;

    document.querySelectorAll('[data-tour-active]').forEach((el) => {
      el.removeAttribute('data-tour-active');
    });

    const target = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (!target) return;

    target.setAttribute('data-tour-active', '');

    const rect = target.getBoundingClientRect();
    const offScreen = rect.top < 72 || rect.bottom > window.innerHeight - 160;
    if (offScreen) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'center',
      });
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

        {/* Foot */}
        <div className="flex items-center gap-2 border-t border-border px-3 py-2.5">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-primary/50 hover:text-primary disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Previous</span>
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
              <span className="sr-only">Next</span>
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
