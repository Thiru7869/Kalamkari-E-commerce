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
 */

const APPEAR_AFTER_VIEWPORTS = 1.5;

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    const measure = () => {
      frame.current = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      setVisible(y > window.innerHeight * APPEAR_AFTER_VIEWPORTS);
      setProgress(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0);
    };

    const onScroll = () => {
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
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
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
