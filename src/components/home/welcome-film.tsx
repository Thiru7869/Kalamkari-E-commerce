'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

/** The film that already ships with the site, reused rather than re-cut. */
const FILM_SRC = '/video/opening.mp4';

/**
 * The welcome film.
 *
 * Autoplay here is defensible in a way it usually is not: the clip is muted,
 * short, loops, carries no speech and no information, and replaces a still
 * photograph in the same box. Nothing is announced, nothing is interrupted, and
 * a visitor who never notices it has lost nothing.
 *
 * That said, it is treated as a decoration that may fail:
 *
 *   - Under `prefers-reduced-motion` the file is never requested at all. The
 *     poster frame stands in its place and the block is otherwise identical.
 *     This is a subscription rather than a one-shot read, so a visitor who
 *     changes the setting while the page is open gets the change.
 *   - `preload="metadata"` — the poster carries the first impression, and a
 *     3MB download must never compete with the hero image for the LCP.
 *   - If `play()` rejects (a data-saver policy, a battery-saver mode, an
 *     autoplay block that muting did not satisfy), the control resolves to a
 *     visible play button rather than a frozen frame with no way in.
 *
 * The ratio is fixed at both sizes so the block's height never depends on the
 * file: 16/9 on a phone, where the film sits above the greeting and any taller
 * crop would push the words off the first screen; 4/5 from `sm`, where it is a
 * column beside them and wants the height back.
 */
export function WelcomeFilm({ poster, label }: { poster: string; label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  /** Set when the browser refuses to start it for us. */
  const [needsGesture, setNeedsGesture] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || reduced !== false) return;
    // Muted is set on the element, but Safari checks the property.
    el.muted = true;
    void el
      .play()
      .then(() => {
        setPlaying(true);
        setNeedsGesture(false);
      })
      .catch(() => {
        setPlaying(false);
        setNeedsGesture(true);
      });
  }, [reduced]);

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.muted = true;
      void el.play().then(
        () => {
          setPlaying(true);
          setNeedsGesture(false);
        },
        () => setNeedsGesture(true),
      );
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  // `null` is the first render, before the preference is known. Showing the
  // poster until then means a reduced-motion visitor never sees a frame of
  // movement, not even briefly.
  const showFilm = reduced === false;

  return (
    <figure
      className={cn(
        'group relative isolate overflow-hidden bg-cotton-300 dark:bg-muted',
        /*
          One ratio, every width.

          This was `aspect-[21/9]` below `sm` and `4/5` above it, from when the
          film sat full-width above the greeting on a phone. The source is a
          720x1280 portrait clip, and cropping that to 21:9 keeps roughly a
          sixth of the frame. 4/5 is a mild, deliberate crop of a 9:16 source —
          it trims the top and bottom of the frame rather than everything
          except a band through the middle — and it is now the same shape on
          a phone as on a desktop, which is what the layout asks for.
        */
        'aspect-[4/5] w-full',
        'shadow-[0_18px_44px_-28px_rgb(0_0_0/0.55)]',
      )}
      // A temple niche: semicircular head, straight shoulders. The radius is
      // softened from the portrait's full 999px because the frame is much
      // wider now, and a half-round head on a 16:9 box reads as an arch over
      // nothing.
      style={{ borderRadius: '10px 10px 3px 3px' }}
    >
      {/* The poster is always painted. It is the reduced-motion frame, the
          slow-connection frame, and the thing behind a film that never
          decodes. */}
      <Image
        src={poster}
        alt={label}
        fill
        // Tracks the column caps in welcome-note.tsx. A stale `sizes` here does
        // not break the layout, it just makes the browser fetch a candidate
        // several times wider than the box it will be painted into.
        sizes="(min-width: 1024px) 7.5rem, (min-width: 640px) 6.5rem, 92vw"
        priority
        className="object-cover"
      />

      {showFilm && (
        <video
          ref={videoRef}
          src={FILM_SRC}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          // Decoration: the poster's alt text above already names what is in
          // the frame, and a second description of the same thing is noise.
          aria-hidden="true"
          tabIndex={-1}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
            playing ? 'opacity-100' : 'opacity-0',
          )}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      )}

      {/* Legibility for the caption, and it lifts the whole frame out of the
          cream ground it sits on. */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-kasim-950/70 via-kasim-950/10 to-transparent"
        aria-hidden="true"
      />

      {showFilm && (
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'absolute bottom-2 right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full',
            'border border-cotton-100/35 bg-kasim-950/55 text-cotton-50 backdrop-blur-sm',
            'transition-opacity duration-300 hover:bg-kasim-950/75',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cotton-100/80',
            // Quiet once it is running, obvious when the browser has refused
            // to start it and the visitor is looking at a still.
            needsGesture || !playing
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-90 focus-visible:opacity-100',
          )}
        >
          {playing ? (
            <Pause className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />
          )}
          <span className="sr-only">
            {playing ? 'Pause the film from the front room' : 'Play the film from the front room'}
          </span>
        </button>
      )}

      {/*
        No caption.

        There was one — "The front room, today", set in tracked capitals across
        the foot of the frame. It has been taken out rather than reworded, and
        the reason is what now surrounds this box: the film sits inside a drawn
        Kalamkari border whose whole job is to be looked at, and a line of type
        laid over the bottom edge of that border fights it and loses. Two
        ornaments in one 120px box is one too many.

        Nothing is lost by the removal. The poster's `alt` still names what is
        in the frame for anyone who cannot see it, and the sentence beside the
        film says the same thing in words a visitor will actually read.
      */}
    </figure>
  );
}
