'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { scrollToTop } from '@/lib/smooth-scroll';
import { cn } from '@/lib/utils';

/**
 * Back to top, with the page's read-progress drawn around it.
 *
 * The ring is not decoration. This site's pages are long-form — /process is
 * twenty-three chapters and /our-story is five biographies — and a reader deep
 * in one has no other way to tell how much is left. The same circle therefore
 * answers two questions with one mark: how far through am I, and how do I get
 * back.
 *
 * It appears only once returning to the top is a real journey (one and a half
 * viewports), so it never covers content on a short page.
 *
 * **Present, but not insistent.** At rest it sits at 70% — legible, findable,
 * and not competing with the cloth it is floating over. While the page is
 * actually moving it comes to full strength, because that is the moment it is
 * both useful and being looked at: the ring around it is redrawing, and the
 * reader is the one making it move. It settles back a beat after they stop.
 *
 * That is deliberately the *scroll* state and not a hover state. This control
 * spends most of its life on a phone, where there is no hover, and a floating
 * button that only resolves under a cursor is a desktop affordance wearing a
 * mobile body.
 */

const APPEAR_AFTER_VIEWPORTS = 1.5;

/** How long after the last scroll tick the button settles back to its rest. */
const SETTLE_MS = 420;

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  /** True while the page is moving. Drives the step from 70% to full. */
  const [scrolling, setScrolling] = useState(false);
  const frame = useRef(0);

  useEffect(() => {
    let settle: number;

    const measure = () => {
      frame.current = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      setVisible(y > window.innerHeight * APPEAR_AFTER_VIEWPORTS);
      setProgress(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0);
    };

    const onScroll = () => {
      // `setScrolling(true)` on an already-true value is a bail-out in React,
      // not a render — so this is safe to call on every tick, and the timer
      // below is the only thing that actually changes anything.
      setScrolling(true);
      window.clearTimeout(settle);
      settle = window.setTimeout(() => setScrolling(false), SETTLE_MS);

      // One measurement per frame at most: this listener runs on every wheel
      // tick of a Lenis-smoothed scroll, which is a lot of them.
      if (frame.current) return;
      frame.current = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.clearTimeout(settle);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  // r = 21 in a 48-box leaves 3px for the stroke without clipping.
  const radius = 21;
  const circumference = 2 * Math.PI * radius;

  return (
    <button
      type="button"
      onClick={() => scrollToTop()}
      aria-label="Back to top"
      // Hidden from the tab order while off-screen, so keyboard users do not
      // land on an invisible control.
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        'group pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-full',
        'border border-border/70 bg-background/85 text-foreground shadow-[0_6px_20px_-10px_rgb(0_0_0/0.5)] backdrop-blur-md',
        'transition-[opacity,transform] duration-300 ease-out',
        'hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        // Three states, not two. Hover and focus also take it to full, so a
        // pointer or a keyboard reaches the same place the scroll does.
        'hover:opacity-100 focus-visible:opacity-100',
        visible
          ? scrolling
            ? 'translate-y-0 opacity-100'
            : 'translate-y-0 opacity-70'
          : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      <svg
        viewBox="0 0 48 48"
        className="absolute inset-0 h-full w-full -rotate-90"
        aria-hidden="true"
        fill="none"
      >
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-foreground/10"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="text-primary"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 120ms linear' }}
        />
      </svg>

      <ArrowUp
        className="relative h-[1.15rem] w-[1.15rem] transition-transform duration-300 ease-out motion-safe:group-hover:-translate-y-0.5"
        aria-hidden="true"
      />
    </button>
  );
}
