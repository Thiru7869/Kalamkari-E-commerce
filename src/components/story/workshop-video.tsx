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
  tone = 'dark',
  eyebrow = 'From the workshop',
  caption,
  aspect = 'tall',
}: {
  /** Path to the film. Null until the store supplies one. */
  src?: string | null;
  poster: string;
  className?: string;
  /**
   * Which ground the frame is standing on.
   *
   * The frame was written for the kasim band on /our-story and hardcoded
   * cotton-on-dark throughout, so dropping it onto the cream visit section
   * produced pale text on a pale ground. Stated rather than sniffed: the
   * caller knows what its own background is and the component cannot.
   */
  tone?: 'dark' | 'light';
  eyebrow?: string;
  /**
   * What the film actually is, in the caller's words.
   *
   * A default that says "a morning in the front room" would be this component
   * asserting the contents of whatever file it was handed. The caller has the
   * file; the caller describes it.
   */
  caption?: string;
  /**
   * `tall` fills a narrow side column beside a heading. `wide` is for a video
   * standing in a body column, where 4:3 would be a wall of player.
   */
  aspect?: 'tall' | 'wide';
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const light = tone === 'light';

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
        'overflow-hidden rounded-sm border',
        light
          ? // Light ground: a real hairline and a soft lift rather than a
            // translucent panel, which on cream reads as a smudge.
            'border-border bg-background shadow-[0_24px_60px_-40px_rgb(60_40_30/0.45)]'
          : 'border-cotton-100/20 bg-kasim-950/40 shadow-[0_30px_70px_-45px_rgb(0_0_0/0.9)] backdrop-blur-sm',
        className,
      )}
    >
      {/*
        Not 16:9. The frame stands in a side column beside a headline and two
        paragraphs, and a widescreen crop there is a 200px-tall letterbox with
        a stack of empty banner above it. Squarer from `lg` up fills the column
        it was given; 16:10 on a phone, where it is full width and a taller
        crop would push the first chapter off the screen.
      */}
      <div
        className={cn(
          'relative w-full',
          aspect === 'tall' ? 'aspect-[16/10] lg:aspect-[4/3]' : 'aspect-[16/10]',
        )}
      >
        {src ? (
          <>
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              playsInline
              controls={playing}
              preload="none"
              /*
                `absolute inset-0`, not `h-full w-full`.

                A <video> carries the intrinsic width of its file — 1200px for
                this one — and that width counts toward its *container's*
                min-content even when the element itself is `w-full`. It is the
                same trap as the `<input size="20">` that once sized the whole
                footer column: `w-full` constrains the box that is drawn, not
                the width the box demands during layout.

                In flow it pushed the story fold 858px past the right edge of a
                390px phone. Out of flow it contributes nothing to intrinsic
                sizing, and the wrapper's aspect-ratio already reserves the
                space, so nothing shifts.
              */
              className="absolute inset-0 h-full w-full object-cover"
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
              sizes="(min-width: 1280px) 30rem, (min-width: 1024px) 24rem, 92vw"
              className="object-cover opacity-80"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-kasim-950/80 to-kasim-950/20"
              aria-hidden="true"
            />
          </>
        )}
      </div>

      <figcaption
        className={cn('border-t px-3.5 py-2.5', light ? 'border-border' : 'border-cotton-100/15')}
      >
        <p
          className={cn(
            'font-inscription text-label uppercase tracking-[0.18em]',
            light ? 'text-muted-foreground' : 'text-cotton-200/60',
          )}
        >
          {eyebrow}
        </p>
        <p
          className={cn(
            'mt-1 text-sm leading-snug',
            light ? 'text-muted-foreground' : 'text-cotton-100/85',
          )}
        >
          {caption ??
            (src
              ? 'Filmed in the store.'
              : 'A film of a morning in the front room is being cut. It will appear here.')}
        </p>
      </figcaption>
    </figure>
  );
}
