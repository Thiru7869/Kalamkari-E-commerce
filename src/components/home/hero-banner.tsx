'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * The hero banner: four photographs, arranged as a collage rather than a
 * carousel.
 *
 * A conventional slider replaces one rectangle with another and the eye has
 * nothing to hold on to. Here the two smaller panels stay put and show what is
 * coming, while the large panel changes — so the arrangement reads as a stack
 * of cloth on a table, which is how these pieces are actually shown to you.
 *
 * The transition is a dye wipe, not a cross-fade: the incoming image is
 * revealed along a diagonal, the same direction the madder front travels
 * across cloth in the hero scene behind it.
 */

export type BannerSlide = {
  src: string;
  alt: string;
  label: string;
  caption: string;
  href: string;
};

const INTERVAL_MS = 5600;

export function HeroBanner({
  slides,
  className,
}: {
  slides: BannerSlide[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    // Auto-advance is a convenience, not the mechanism — the ticks below are
    // always operable, and under reduced motion it never rotates on its own.
    if (paused || reduced || slides.length < 2) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, reduced, slides.length]);

  const active = slides[index];
  const upcoming = [
    slides[(index + 1) % slides.length],
    slides[(index + 2) % slides.length],
  ];

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* ---- The large panel ------------------------------------------- */}
      <Link
        href={active.href}
        className="group relative block aspect-[4/5] overflow-hidden rounded-sm bg-kasim-800 shadow-[0_28px_70px_-40px_rgb(0_0_0/0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cotton-100 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      >
        {slides.map((slide, i) => {
          const isActive = i === index;
          return (
            <Image
              key={slide.src}
              src={slide.src}
              alt={isActive ? slide.alt : ''}
              aria-hidden={!isActive}
              fill
              // The first slide is inside the LCP region on desktop.
              priority={i === 0}
              sizes="(min-width: 1024px) 34vw, (min-width: 640px) 60vw, 84vw"
              className={cn(
                'object-cover transition-[clip-path,opacity,transform]',
                // Arbitrary CSS properties rather than the arbitrary-value
                // duration and easing utilities: those map to both the
                // transition and animation namespaces, so Tailwind cannot tell
                // which was meant and warns at build time.
                '[transition-duration:1200ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]',
                'motion-safe:group-hover:scale-[1.04]',
                isActive ? 'opacity-100' : 'opacity-0',
              )}
              style={{
                // The dye front: fully open when active, closed on a diagonal
                // when not. Two polygons with matched vertex counts so the
                // browser can interpolate between them.
                clipPath: isActive
                  ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
                  : 'polygon(0% 0%, 0% 0%, 22% 100%, 0% 100%)',
              }}
            />
          );
        })}

        <div
          className="absolute inset-0 bg-gradient-to-t from-kasim-950/90 via-kasim-950/25 to-transparent"
          aria-hidden="true"
        />

        <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
          <p className="font-inscription text-[0.625rem] uppercase tracking-[0.2em] text-myrobalan-300">
            {active.label}
          </p>
          <p className="mt-1.5 max-w-[22rem] font-display text-lg leading-snug text-cotton-50 md:text-xl">
            {active.caption}
          </p>
        </div>
      </Link>

      {/* ---- The two panels behind, offset like stacked cloth ---------- */}
      <div className="pointer-events-none absolute -right-3 -top-6 hidden gap-2 lg:flex">
        {upcoming.map((slide, i) => (
          <div
            key={slide.src}
            className="relative h-20 w-16 overflow-hidden rounded-sm border border-cotton-100/25 bg-kasim-800 shadow-lg transition-transform duration-700"
            style={{ transform: `rotate(${i === 0 ? 3 : -2}deg) translateY(${i * 6}px)` }}
          >
            <Image src={slide.src} alt="" fill sizes="64px" className="object-cover opacity-80" />
          </div>
        ))}
      </div>

      {/* ---- Ticks: position, and the way to move ---------------------- */}
      <div className="mt-4 flex items-center gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show ${slide.label}`}
            aria-current={i === index}
            className="group relative h-6 flex-1"
          >
            <span
              className={cn(
                'block h-[2px] w-full origin-left transition-all duration-500',
                i === index ? 'bg-myrobalan-300' : 'bg-cotton-100/30 group-hover:bg-cotton-100/60',
              )}
            />
            <span
              className={cn(
                'mt-1.5 block truncate text-left text-[0.625rem] uppercase tracking-[0.12em] transition-colors',
                i === index ? 'text-cotton-100' : 'text-cotton-100/45',
              )}
            >
              {slide.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
