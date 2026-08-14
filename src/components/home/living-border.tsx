'use client';

import { useEffect, useState } from 'react';

/**
 * The vine that grows around the edge of the screen while the doorway plays.
 *
 * A Kalamkari cloth is bordered on all four sides, and this is that border at
 * the scale of the window: a thin creeper along each edge, drawn on after the
 * store's name has been inked in, then left to breathe very slowly.
 *
 * ---------------------------------------------------------------------------
 * Why it is `fixed`, and why that is the dangerous choice
 * ---------------------------------------------------------------------------
 *
 * CLAUDE.md records that `position: fixed` overflow **does not move
 * `scrollWidth`** — a fixed box hanging off the right edge is simply
 * unreadable, with no scrollbar to reveal it, and the quick-tour card shipped
 * exactly that bug at 163px past a 390px phone. So this element is pinned to
 * `inset-0` and nothing inside it is ever wider than its own edge strip: each
 * vine is `inset-x-0` or `inset-y-0` with a fixed thickness, and the SVGs
 * stretch rather than tile. There is no width in this component that can
 * exceed the viewport, at any breakpoint, by construction.
 *
 * `pointer-events-none` throughout, `aria-hidden` on the wrapper: it is
 * ornament laid over the whole page, and it must never take a click or a
 * screen reader's attention.
 *
 * ---------------------------------------------------------------------------
 * Why it mounts late and unmounts on scroll
 * ---------------------------------------------------------------------------
 *
 * It belongs to the arrival, not to the page. Somebody reading the third
 * section does not need a decorative frame following them down, and an
 * `infinite` animation left running in the corner of the eye is the kind of
 * motion this site otherwise refuses (see the `kalam-trail` and `scroll-hint`
 * notes — both are mostly rest for the same reason).
 *
 * So it fades out for good once the reader has left the fold. `once: true`
 * behaviour is deliberate: it must not flicker back when they scroll up again.
 */
export function LivingBorder({ delay = 2.2 }: { delay?: number }) {
  const [shown, setShown] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // Never for a reader who asked for less motion. Read as a subscription
    // rather than a sample, per the site's `useMediaQuery` rule — a preference
    // changed while the page is open takes effect.
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setShown(!query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (gone) return;
    const onScroll = () => {
      if (window.scrollY > 180) setGone(true);
    };
    // `passive` — this must never be able to delay a scroll frame.
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [gone]);

  if (!shown) return null;

  /** One creeper, stretched along an edge. Repeated four times, rotated. */
  const vine = (
    <svg
      className="h-full w-full"
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      {/* The stem. */}
      <path
        d="M0 20C60 6 120 34 180 20s120-28 180-14 120 28 180 14 120-28 180-14 120 28 180 14 120-28 180-14"
        stroke="hsl(var(--primary))"
        strokeWidth="1.4"
        vectorEffect="non-scaling-stroke"
      />
      {/* Buds along it, on alternating sides — the way the border on a real
          piece alternates rather than repeating. */}
      {Array.from({ length: 13 }, (_, i) => {
        const x = 45 + i * 92;
        const up = i % 2 === 0;
        return (
          <g key={i} transform={`translate(${x} ${up ? 13 : 27})`}>
            <ellipse
              rx="4.5"
              ry="8"
              fill="hsl(var(--primary))"
              opacity="0.55"
              transform={`rotate(${up ? -28 : 28})`}
            />
            <circle r="2" fill="hsl(var(--gold))" opacity="0.8" />
          </g>
        );
      })}
    </svg>
  );

  return (
    <div
      className={[
        'pointer-events-none fixed inset-0 z-[5] transition-opacity duration-1000',
        gone ? 'opacity-0' : 'opacity-100',
      ].join(' ')}
      aria-hidden="true"
    >
      {/*
        Four strips, each pinned to one edge and given a fixed thickness.

        The two vertical strips are the ones worth reading carefully: they are
        `w-[26px]` boxes running the full height, and the vine inside each is
        rotated by being drawn into a box that is *already* the right shape —
        no `rotate` on a full-width element, which would sweep a 1200px box
        across the viewport and hang off both sides.
      */}
      <div
        className="absolute inset-x-0 top-0 h-[26px] opacity-[0.14] motion-safe:animate-vine-breathe"
        style={{ animationDelay: `${delay}s` }}
      >
        {vine}
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-[26px] rotate-180 opacity-[0.14] motion-safe:animate-vine-breathe"
        style={{ animationDelay: `${delay + 0.3}s` }}
      >
        {vine}
      </div>

      {/* Vertical edges. The inner box is sized to the strip and the SVG
          stretches into it, so `preserveAspectRatio="none"` does the turning
          rather than a transform. */}
      <div
        className="absolute inset-y-0 left-0 w-[26px] opacity-[0.14] motion-safe:animate-vine-breathe"
        style={{ animationDelay: `${delay + 0.15}s` }}
      >
        <svg
          className="h-full w-full"
          viewBox="0 0 40 1200"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M20 0C6 60 34 120 20 180s-28 120-14 180 28 120 14 180-28 120-14 180 28 120 14 180-28 120-14 180"
            stroke="hsl(var(--primary))"
            strokeWidth="1.4"
            vectorEffect="non-scaling-stroke"
          />
          {Array.from({ length: 13 }, (_, i) => {
            const y = 45 + i * 92;
            const left = i % 2 === 0;
            return (
              <g key={i} transform={`translate(${left ? 13 : 27} ${y})`}>
                <ellipse
                  rx="8"
                  ry="4.5"
                  fill="hsl(var(--primary))"
                  opacity="0.55"
                  transform={`rotate(${left ? 28 : -28})`}
                />
                <circle r="2" fill="hsl(var(--gold))" opacity="0.8" />
              </g>
            );
          })}
        </svg>
      </div>
      <div
        className="absolute inset-y-0 right-0 w-[26px] rotate-180 opacity-[0.14] motion-safe:animate-vine-breathe"
        style={{ animationDelay: `${delay + 0.45}s` }}
      >
        <svg
          className="h-full w-full"
          viewBox="0 0 40 1200"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M20 0C6 60 34 120 20 180s-28 120-14 180 28 120 14 180-28 120-14 180 28 120 14 180-28 120-14 180"
            stroke="hsl(var(--primary))"
            strokeWidth="1.4"
            vectorEffect="non-scaling-stroke"
          />
          {Array.from({ length: 13 }, (_, i) => {
            const y = 45 + i * 92;
            const left = i % 2 === 0;
            return (
              <g key={i} transform={`translate(${left ? 13 : 27} ${y})`}>
                <ellipse
                  rx="8"
                  ry="4.5"
                  fill="hsl(var(--primary))"
                  opacity="0.55"
                  transform={`rotate(${left ? 28 : -28})`}
                />
                <circle r="2" fill="hsl(var(--gold))" opacity="0.8" />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
