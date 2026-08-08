'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Pause, Play } from 'lucide-react';
import { site } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * The workshop film, sitting in the story banner.
 *
 * Deliberately modest and set to the right of the heading rather than across
 * it: this is background to the section, not the subject of it. Nothing
 * autoplays and nothing carries sound by default — a film that starts talking
 * at somebody who came to read is the fastest way to lose them.
 *
 * It degrades honestly. Until the store supplies a file, `src` is null and the
 * frame shows a still with a plain line saying the film is coming, rather than
 * a play button that does nothing. That is the same rule the contact channels
 * follow: absent beats broken.
 */
export function WorkshopVideo({
  src = null,
  poster,
  className,
}: {
  /** Path to the film. Null until the store supplies one. */
  src?: string | null;
  poster: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <figure
      className={cn(
        'overflow-hidden rounded-sm border border-cotton-100/20 bg-kasim-950/40 shadow-[0_30px_70px_-45px_rgb(0_0_0/0.9)] backdrop-blur-sm',
        className,
      )}
    >
      <div className="relative aspect-video w-full">
        {src ? (
          <>
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              playsInline
              controls={playing}
              preload="none"
              className="h-full w-full object-cover"
              onEnded={() => setPlaying(false)}
            />
            {!playing && (
              <button
                type="button"
                onClick={toggle}
                className="absolute inset-0 flex items-center justify-center bg-kasim-950/25 transition-colors hover:bg-kasim-950/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cotton-100/70"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-cotton-100/40 bg-kasim-950/50 text-cotton-50 backdrop-blur-sm transition-transform duration-300 hover:scale-105">
                  {playing ? (
                    <Pause className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />
                  )}
                </span>
                <span className="sr-only">
                  Play the film from the workshop in {site.location.town}
                </span>
              </button>
            )}
          </>
        ) : (
          <>
            <Image
              src={poster}
              alt={`The workshop in ${site.location.town}`}
              fill
              sizes="(min-width: 1024px) 28vw, 80vw"
              className="object-cover opacity-80"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-kasim-950/80 to-kasim-950/20"
              aria-hidden="true"
            />
          </>
        )}
      </div>

      <figcaption className="border-t border-cotton-100/15 px-3.5 py-2.5">
        <p className="font-inscription text-[0.5625rem] uppercase tracking-[0.18em] text-cotton-200/60">
          From the workshop
        </p>
        <p className="mt-1 text-[0.8125rem] leading-snug text-cotton-100/85">
          {src
            ? 'A morning in the front room, at ordinary speed.'
            : 'A film of a morning in the front room is being cut. It will appear here.'}
        </p>
      </figcaption>
    </figure>
  );
}
