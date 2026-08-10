'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Subtle parallax, on one shared loop.
 *
 * Three rules this follows, each of which is a bug it does not have:
 *
 *   1. **One rAF for the whole page, not one per instance.** Every mounted
 *      `Parallax` registers with the module-level set below; a single scroll
 *      listener schedules a single frame and moves all of them. A dozen
 *      independent listeners is a dozen layout reads per scroll event.
 *   2. **Offsets are written straight to `style.transform`, never to state.**
 *      Scrolling must not re-render React. This is the same rule the /process
 *      scroll work already follows.
 *   3. **Reads are batched ahead of writes.** All `getBoundingClientRect`
 *      calls happen first and all the transform writes after, so the frame
 *      contains one layout pass rather than one per element.
 *
 * It only moves while the element is on screen (IntersectionObserver gates
 * membership), and it is never mounted at all under reduced motion — the
 * element keeps its natural position, which is its final state, so nothing is
 * lost by turning the movement off.
 *
 * `speed` is a fraction of the distance scrolled: 0.08 means the element
 * drifts 8px for every 100px of page travel. Keep it small. Anything past
 * about 0.15 stops reading as depth and starts reading as a bug.
 */

type Registration = { el: HTMLElement; speed: number };

const active = new Set<Registration>();
let frame = 0;
/**
 * How many `Parallax` instances are mounted — not how many are on screen.
 *
 * The listeners are attached once for the first instance and removed once for
 * the last. Attaching per-instance looks like it works, because
 * `addEventListener` with the same function reference and options is a no-op
 * after the first call — but `removeEventListener` is not refcounted, so the
 * first component to unmount would silently take the scroll handler away from
 * every other one still on the page.
 */
let mounted = 0;

function run() {
  frame = 0;
  const viewportH = window.innerHeight;

  // Read pass.
  const work: { el: HTMLElement; y: number }[] = [];
  for (const item of active) {
    const rect = item.el.getBoundingClientRect();
    // Distance of the element's centre from the viewport's centre, so the
    // offset is zero when it is centred and symmetric either side. Without
    // this the element arrives already displaced.
    const fromCentre = rect.top + rect.height / 2 - viewportH / 2;
    work.push({ el: item.el, y: -fromCentre * item.speed });
  }

  // Write pass.
  for (const { el, y } of work) {
    el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
  }
}

function schedule() {
  if (frame) return;
  frame = requestAnimationFrame(run);
}

export function Parallax({
  children,
  speed = 0.08,
  className,
}: {
  children: React.ReactNode;
  /** Fraction of scroll distance to drift. Small. */
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const registration: Registration = { el, speed };

    // Only elements on screen are worth moving.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          active.add(registration);
          schedule();
        } else {
          active.delete(registration);
        }
      },
      { rootMargin: '20% 0px' },
    );
    observer.observe(el);

    // First instance on the page brings the listeners with it; the last one
    // out takes them away.
    if (mounted === 0) {
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule, { passive: true });
    }
    mounted += 1;

    return () => {
      observer.disconnect();
      active.delete(registration);
      mounted -= 1;
      if (mounted === 0) {
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
        if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      }
      // Leave nothing behind: an unmount mid-drift would otherwise freeze the
      // element at an arbitrary offset if it is ever re-parented.
      el.style.transform = '';
    };
  }, [speed]);

  return (
    <div ref={ref} className={cn('will-change-transform', className)}>
      {children}
    </div>
  );
}
