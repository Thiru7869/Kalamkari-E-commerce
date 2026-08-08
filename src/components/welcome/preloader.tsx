'use client';

import { useEffect, useRef, useState } from 'react';
import { GaneshaMark } from './ganesha-mark';
import { site } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * The five seconds before the site.
 *
 * A loading screen is normally an apology for a slow page. This one is the
 * shortest possible statement of what the store does: a figure set out in line
 * by a bamboo pen, and the colours arriving afterwards out of separate pots —
 * which is the actual order of the twenty-three steps, and the single fact the
 * rest of the site spends a thousand words on.
 *
 * Ganesha because he is the figure a Srikalahasti artist begins a new cloth
 * with.
 *
 * It is driven by one rAF loop writing to component state at a coarse
 * granularity rather than by CSS keyframes, because the drawing and the dye
 * have to stay in step with each other and with the wordmark — three
 * independent animations would drift.
 *
 * Under reduced motion none of it runs: the finished frame is shown complete,
 * held briefly, and the site follows.
 */

const DURATION_MS = 5000;

/** When each part of the sequence happens, as a fraction of the whole. */
const TIMELINE = {
  drawFrom: 0.02,
  drawTo: 0.62,
  colourFrom: 0.34,
  colourTo: 0.86,
  wordmarkAt: 0.66,
};

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function span(t: number, from: number, to: number) {
  return Math.min(1, Math.max(0, (t - from) / (to - from)));
}

export function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
  }, []);

  // The scroll position is restored by the browser on reload; while this is up
  // the page behind must not move under it.
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    // Reduced motion: the finished frame, held long enough to be seen, then on.
    if (reduced) {
      setProgress(1);
      const id = window.setTimeout(() => {
        setLeaving(true);
        window.setTimeout(onDone, 260);
      }, 1200);
      return () => window.clearTimeout(id);
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      setProgress(t);

      if (t < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (doneRef.current) return;
      doneRef.current = true;

      // Lift, then hand over. The fade is short: the visitor has already
      // waited five seconds and the site is behind it, ready.
      setLeaving(true);
      window.setTimeout(onDone, 420);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced, onDone]);

  const draw = easeOutCubic(span(progress, TIMELINE.drawFrom, TIMELINE.drawTo));
  const colour = span(progress, TIMELINE.colourFrom, TIMELINE.colourTo);
  const wordmark = span(progress, TIMELINE.wordmarkAt, 1);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[90] flex flex-col items-center justify-center',
        'bg-cotton-100 dark:bg-kasim-950',
        'transition-opacity duration-[420ms] ease-out',
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
      role="status"
      aria-live="polite"
      aria-label={`${site.name} — loading`}
    >
      {/* The frame the drawing sits in: the same double rule as the panels
          elsewhere on the site, so this is recognisably the same house. */}
      <div className="relative w-[min(62vw,17rem)] max-w-full">
        <div className="rounded-sm border border-foreground/12 p-2">
          <div className="overflow-hidden rounded-[2px] border border-foreground/10 bg-cotton-50 dark:bg-cotton-100">
            <GaneshaMark draw={draw} colour={colour} />
          </div>
        </div>

        {/*
          The nib. It rides the drawing progress along the frame's edge, so
          there is visibly a pen doing the work rather than lines appearing.
          Hidden once the drawing is finished and the pots take over.
        */}
        {!reduced && draw > 0.02 && draw < 0.99 && (
          <span
            aria-hidden="true"
            className="absolute -left-1 h-6 w-[2px] rounded-full bg-kasim-900 dark:bg-cotton-200"
            style={{
              top: `${6 + draw * 84}%`,
              boxShadow: '0 0 10px 2px hsl(var(--primary) / 0.35)',
            }}
          />
        )}
      </div>

      {/* ---- The wordmark, written rather than placed --------------------- */}
      <div
        className="mt-8 w-[min(88vw,34rem)] text-center"
        style={{
          opacity: wordmark,
          transform: `translateY(${(1 - wordmark) * 10}px)`,
          transition: reduced ? 'none' : 'opacity 300ms linear, transform 300ms ease-out',
        }}
      >
        <BambooWordmark progress={wordmark} />

        <p className="mt-3 font-inscription text-[0.625rem] uppercase tracking-[0.3em] text-muted-foreground sm:text-[0.6875rem]">
          {site.location.town} · {site.location.state}
        </p>
      </div>

      {/* Progress, as a drawn rule rather than a bar. */}
      <div className="mt-7 h-px w-[min(70vw,16rem)] overflow-hidden bg-foreground/10">
        <span
          className="block h-full bg-primary"
          style={{ width: `${progress * 100}%`, transition: 'width 120ms linear' }}
        />
      </div>

      <p className="sr-only">Loading {site.name}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* The wordmark                                                               */
/* -------------------------------------------------------------------------- */

/**
 * The store's name, set as if drawn with the kalam.
 *
 * A bamboo pen makes a stroke that swells where the hand slows and thins where
 * it lifts, so the two lines are set in the display face with a heavy optical
 * weight, a drawn rule under them that grows as the name arrives, and the
 * madder-red serif accent the rest of the site uses for the second clause of a
 * heading. It is type, not an image: it stays sharp, it is selectable, and a
 * screen reader gets the name rather than nothing.
 */
function BambooWordmark({ progress }: { progress: number }) {
  return (
    <div>
      <p className="font-display text-[1.6rem] font-semibold leading-[1.06] tracking-[-0.012em] sm:text-[2.1rem] md:text-[2.5rem]">
        <span className="block">Sri Vijaya Lakshmi</span>
        <span className="mt-0.5 block text-primary">Fine Kalamkari Arts</span>
      </p>

      {/* The rule the pen leaves under the name. Grows with the wordmark, and
          tapers at both ends the way a real stroke lifts off the cloth. */}
      <span
        aria-hidden="true"
        className="mx-auto mt-3 block h-[2px]"
        style={{
          width: `${Math.round(progress * 100)}%`,
          maxWidth: '100%',
          backgroundImage:
            'linear-gradient(to right, transparent, hsl(var(--primary) / 0.85) 18%, hsl(var(--primary) / 0.85) 82%, transparent)',
        }}
      />
    </div>
  );
}
