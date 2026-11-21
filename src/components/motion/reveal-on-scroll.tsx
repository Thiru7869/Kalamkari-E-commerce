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
 *
 * One observer serves every instance, and nothing here reads layout. The
 * earlier version called `getBoundingClientRect()` in each instance's effect to
 * decide whether it was above the fold; every call came straight after the
 * previous instance had written its inline styles, so each one forced a
 * synchronous layout of the whole page — dozens per page, on the main thread,
 * before the page could respond. The observer's first callback carries the
 * same answer without the reflow: an element that is already in view is left
 * alone, and one that is not is hidden (it is off-screen, so nobody sees it
 * happen) and revealed when it arrives.
 */

type Armed = { delay: number; distance: number; hidden: boolean };
const pending = new WeakMap<Element, Armed>();
let shared: IntersectionObserver | null = null;

function observer(): IntersectionObserver {
  shared ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        const state = pending.get(el);
        if (!state) {
          shared?.unobserve(el);
          continue;
        }
        if (entry.isIntersecting) {
          // Above the fold on first paint: leave it exactly as rendered.
          if (state.hidden) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0) scale(1)';
          }
          pending.delete(el);
          shared?.unobserve(el);
        } else if (!state.hidden) {
          /*
            A rise and a very slight settle.

            The scale is 0.988 — small enough that nobody can name it and large
            enough that the block reads as arriving rather than as appearing. It
            matters most on a phone, where the page is a single stacked column
            and a pure fade at twenty pixels is easy to scroll straight past
            without the eye registering that a new section has started. Anything
            more than a percent and a half turns a page of a dozen of these into
            a slideshow.
          */
          state.hidden = true;
          el.style.opacity = '0';
          el.style.transform = `translateY(${state.distance}px) scale(0.988)`;
          el.style.transition =
            `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${state.delay}s, ` +
            `transform 0.7s cubic-bezier(0.22,1,0.36,1) ${state.delay}s`;
        }
      }
    },
    // Fire slightly before the element is fully in view, so it has finished
    // arriving by the time the reader's eye reaches it.
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  return shared;
}


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

    pending.set(el, { delay, distance, hidden: false });
    const io = observer();
    io.observe(el);
    return () => {
      io.unobserve(el);
      pending.delete(el);
    };
  }, [delay, distance]);

  return (
    <Tag ref={ref as never} className={cn(className)}>
      {children}
    </Tag>
  );
}
