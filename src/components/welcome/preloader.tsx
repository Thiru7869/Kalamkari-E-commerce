'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GaneshaMark } from './ganesha-mark';
import { site } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * The doorway before the doorway.
 *
 * Three acts, strictly in order, because the sequence is a sentence and the
 * clauses do not commute:
 *
 *   1. the film   — the workshop itself, moving, before a single word
 *   2. the name   — held alone on a dark ground, arriving out of a slow push in
 *   3. the site   — handed over to the welcome, which is the first thing that
 *                   actually speaks to the visitor
 *
 * Act 2 does not begin until the film has genuinely ended, and the hand-over to
 * act 3 does not happen until the name has finished settling. That ordering is
 * the whole point: a name that appears over a still-playing film is a title
 * card, and a welcome that appears over a still-moving name is a pop-up.
 *
 * Nothing here is load-bearing. Autoplay may be refused, the file may stall on
 * a bad connection, `ended` may never fire on a codec the browser half-supports
 * — every one of those paths falls through to the name, which is the part that
 * matters. See `settleVideo`.
 *
 * Under reduced motion the film is never requested at all. The visitor gets the
 * finished Ganesha frame — the drawing complete, every pot arrived — beside the
 * name, held long enough to read. Nothing is lost but the movement.
 */

/** Where the film lives. Muted, short, and decorative by construction. */
const VIDEO_SRC = '/video/opening.mp4';

/**
 * The longest the film is allowed to hold the visitor.
 *
 * `ended` is not a guarantee. A partially-supported codec can play to the last
 * frame and simply stop; a stalled download can sit at 90% forever. Without a
 * ceiling either case is an infinite loading screen, which is the one failure
 * mode a loading screen may never have.
 */
const VIDEO_CEILING_MS = 14000;

/** How long the name is held on screen before the welcome takes over. */
const NAME_MS = 2600;

/** The reduced-motion hold: long enough to read the name, short enough to pass. */
const STATIC_MS = 1600;

/** The cross-fade out. Short — the site is already mounted behind this. */
const LEAVE_MS = 480;

type Act = 'film' | 'name';

export function Preloader({ onDone }: { onDone: () => void }) {
  const [reduced, setReduced] = useState<boolean | null>(null);
  const [act, setAct] = useState<Act>('film');
  const [leaving, setLeaving] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  /** Guards the hand-over. Several paths race to end the film; one may win. */
  const settled = useRef(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // The browser restores scroll position on reload; while this is up, the page
  // behind it must not move underneath.
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  /** End act 1 and begin act 2. Idempotent — every failure path calls it. */
  const settleVideo = useCallback(() => {
    if (settled.current) return;
    settled.current = true;
    setAct('name');
  }, []);

  /** Begin the fade, then hand over to the welcome. */
  const finish = useCallback(() => {
    setLeaving(true);
    window.setTimeout(onDone, LEAVE_MS);
  }, [onDone]);

  // ---- Act 1 → Act 2 ------------------------------------------------------
  // Autoplay is requested explicitly rather than left to the `autoPlay`
  // attribute, because the returned promise is the only way to find out that it
  // was refused. A refusal is not an error here; it just means act 1 is over
  // before it started.
  useEffect(() => {
    if (reduced !== false || act !== 'film') return;

    const video = videoRef.current;
    if (!video) return;

    const ceiling = window.setTimeout(settleVideo, VIDEO_CEILING_MS);

    void video.play().catch(settleVideo);

    return () => window.clearTimeout(ceiling);
  }, [reduced, act, settleVideo]);

  // ---- Act 2 → the welcome ------------------------------------------------
  useEffect(() => {
    if (reduced === null) return;

    // Reduced motion: one still frame, one name, then through.
    if (reduced) {
      const id = window.setTimeout(finish, STATIC_MS);
      return () => window.clearTimeout(id);
    }

    if (act !== 'name') return;

    const id = window.setTimeout(finish, NAME_MS);
    return () => window.clearTimeout(id);
  }, [reduced, act, finish]);

  // Nothing is committed until the motion preference is known. Rendering the
  // film first and pulling it a frame later is worse than one blank frame.
  if (reduced === null) return null;

  const showFilm = !reduced && act === 'film';

  return (
    <div
      className={cn(
        'fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden',
        'bg-kasim-950',
        'transition-opacity ease-out',
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
      style={{ transitionDuration: `${LEAVE_MS}ms` }}
      role="status"
      aria-live="polite"
      aria-label={`${site.name} — opening`}
    >
      {/* ---- Act 1: the film ------------------------------------------- */}
      {showFilm && (
        <>
          {/*
            The film is 720x1280 — portrait, shot on a phone over a table.

            `object-cover` across a full-screen box is right on a phone and
            wrong on everything else. On a 1280x900 laptop, covering the
            viewport with a 9:16 clip scales it to 1280 wide and therefore 2276
            tall, and throws away sixty per cent of the frame — including, on
            this footage, the hand and the pen, which are the entire reason
            there is a film here at all.

            So the fit follows the shape of the screen rather than being fixed:
            cover while the viewport is itself portrait-ish, and contain once it
            is wider than it is tall, where the clip becomes a centred column of
            film on the same kasim ground the name arrives on afterwards. That
            ground is the brand's own black, not a letterbox bar — the frame
            reads as mounted rather than as a video that did not fit.
          */}
          <video
            ref={videoRef}
            className={cn(
              'absolute inset-0 h-full w-full',
              'object-cover [@media(min-aspect-ratio:1/1)]:object-contain',
            )}
            // Muted is not a preference — it is the condition under which a
            // browser will autoplay at all.
            muted
            playsInline
            disablePictureInPicture
            preload="auto"
            aria-hidden="true"
            onEnded={settleVideo}
            // A file that cannot be decoded or fetched must not strand anyone.
            onError={settleVideo}
            onStalled={settleVideo}
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>

          {/* A vignette, so the skip control keeps its contrast over whatever
              frame happens to be under it. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-kasim-950/70 via-transparent to-kasim-950/40"
          />

          {/*
            WCAG 2.2.2. The film starts on its own and runs well past five
            seconds, so there has to be a way out of it that is not the back
            button. It is quiet, but it is real, and it is focusable first.
          */}
          <button
            type="button"
            onClick={settleVideo}
            className="absolute bottom-7 right-6 z-10 flex h-11 items-center rounded-sm border border-cotton-100/25 bg-kasim-950/40 px-4 font-inscription text-[0.6875rem] uppercase tracking-[0.22em] text-cotton-100/85 backdrop-blur-sm transition-colors hover:border-cotton-100/50 hover:text-cotton-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cotton-100 focus-visible:ring-offset-2 focus-visible:ring-offset-kasim-950"
          >
            Skip
          </button>
        </>
      )}

      {/* ---- Reduced motion: the finished frame, standing in for the film -- */}
      {reduced && (
        <div className="relative w-[min(52vw,13rem)] max-w-full">
          <div className="rounded-sm border border-cotton-100/15 p-2">
            <div className="overflow-hidden rounded-[2px] border border-cotton-100/10 bg-cotton-100">
              <GaneshaMark draw={1} colour={1} />
            </div>
          </div>
        </div>
      )}

      {/* ---- Act 2: the name ------------------------------------------- */}
      {!showFilm && (
        <div
          className={cn(
            'relative w-[min(90vw,42rem)] px-4 text-center',
            reduced ? 'mt-8' : 'motion-safe:animate-name-arrive',
          )}
        >
          <p className="font-display text-[2rem] font-semibold leading-[1.04] tracking-[-0.014em] text-cotton-50 sm:text-[2.9rem] md:text-[3.6rem]">
            <span className="block">Sri Vijaya Lakshmi</span>
            <span className="mt-1 block text-chay-300">Fine Kalamkari Arts</span>
          </p>

          {/* The rule the pen leaves under the name, drawn rather than placed:
              it grows outward from the centre as the name settles. */}
          <span
            aria-hidden="true"
            className={cn(
              'mx-auto mt-5 block h-[2px] w-full max-w-[26rem] origin-center',
              !reduced && 'motion-safe:animate-rule-draw',
            )}
            style={{
              backgroundImage:
                'linear-gradient(to right, transparent, hsl(var(--gold) / 0.9) 18%, hsl(var(--gold) / 0.9) 82%, transparent)',
            }}
          />

          <p className="mt-4 font-inscription text-[0.6875rem] uppercase tracking-[0.32em] text-cotton-200/70 sm:text-[0.75rem]">
            {site.location.town} · {site.location.state}
          </p>
        </div>
      )}

      <p className="sr-only">Loading {site.name}</p>
    </div>
  );
}
