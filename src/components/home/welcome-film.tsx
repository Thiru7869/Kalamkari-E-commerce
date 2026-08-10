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
        'group relative isolate overflow-hidden bg-cotton-300 dark:bg-kasim-800',
        // A cinematic band on a phone, where the film sits above the greeting
        // and every pixel of height it takes is a pixel the welcome loses;
        // portrait from `sm`, where it is a column beside the words and a
        // letterbox would leave a stripe floating in white space.
        'aspect-[21/9] w-full sm:aspect-[4/5]',
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
        sizes="(min-width: 1024px) 15rem, (min-width: 640px) 13rem, 92vw"
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

      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 p-2.5">
        <span className="font-inscription text-[0.5625rem] uppercase tracking-[0.18em] text-myrobalan-200">
          The front room, today
        </span>
      </figcaption>
    </figure>
  );
}
