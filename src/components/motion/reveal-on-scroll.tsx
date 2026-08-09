'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Entrance reveal, built on IntersectionObserver rather than GSAP.
 *
 * Reasoning: this component appears dozens of times per page. A ScrollTrigger
 * per instance would mean dozens of scroll-linked calculations for what is a
 * one-shot fade — IntersectionObserver costs nothing until it fires, and
 * disconnects itself afterwards. GSAP is reserved for the genuinely
 * scroll-*linked* work on /process, where its scrubbing is actually needed.
 *
 * Content is visible by default and the animation removes-then-restores it, so
 * it is never hidden if JavaScript fails, and never hidden at all under
 * reduced motion.
 */
export function RevealOnScroll({
  children,
  className,
  delay = 0,
  /** Distance travelled, in px. Kept small — this is punctuation, not a stunt. */
  distance = 20,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  as?: 'div' | 'section' | 'li' | 'article';
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Already in view on first paint (above the fold): show it immediately with
    // no transition, so the hero region never flickers.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return;

    /*
      A rise and a very slight settle.

      The scale is 0.988 — small enough that nobody can name it and large
      enough that the block reads as arriving rather than as appearing. It
      matters most on a phone, where the page is a single stacked column and a
      pure fade at twenty pixels is easy to scroll straight past without the
      eye registering that a new section has started. Anything more than a
      percent and a half turns a page of a dozen of these into a slideshow.
    */
    el.style.opacity = '0';
    el.style.transform = `translateY(${distance}px) scale(0.988)`;
    el.style.transition =
      `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s, ` +
      `transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s`;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0) scale(1)';
          observer.disconnect();
        }
      },
      // Fire slightly before the element is fully in view, so it has finished
      // arriving by the time the reader's eye reaches it.
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, distance]);

  return (
    <Tag ref={ref as never} className={cn(className)}>
      {children}
    </Tag>
  );
}
