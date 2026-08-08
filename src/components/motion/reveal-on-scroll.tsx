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
  distance = 16,
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

    el.style.opacity = '0';
    el.style.transform = `translateY(${distance}px)`;
    el.style.transition = `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}s`;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
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
