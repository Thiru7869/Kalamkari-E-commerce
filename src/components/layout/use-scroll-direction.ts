'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Which way the page is currently moving.
 *
 * Used to let the floating dock get out of the way on a phone. The threshold
 * matters: without one, the few pixels of overscroll bounce at the top of an
 * iOS scroll, or the reflow when an image resolves, flips the direction and the
 * dock flickers. Twelve pixels is more than either produces and less than a
 * deliberate flick.
 *
 * Reads are batched into a frame because on this site the scroll listener runs
 * on every tick of a Lenis-smoothed scroll, which is a great many of them.
 */
export function useScrollDirection(threshold = 12) {
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const lastY = useRef(0);
  const frame = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const measure = () => {
      frame.current = 0;
      const y = window.scrollY;

      // Near the top there is nothing to get out of the way of.
      if (y < 80) {
        setDirection('up');
        lastY.current = y;
        return;
      }

      if (Math.abs(y - lastY.current) < threshold) return;
      setDirection(y > lastY.current ? 'down' : 'up');
      lastY.current = y;
    };

    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [threshold]);

  return direction;
}
