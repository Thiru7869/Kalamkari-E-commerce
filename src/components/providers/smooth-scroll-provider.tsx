'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import type Lenis from 'lenis';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';
import { registerLenis } from '@/lib/smooth-scroll';

/**
 * Lenis + GSAP ScrollTrigger, wired together correctly — and loaded only where
 * they do anything.
 *
 * The three things that go wrong when they are not wired:
 *  1. Two rAF loops. GSAP's ticker drives Lenis here, so there is exactly one.
 *  2. ScrollTrigger reading native scroll while Lenis owns it — fixed by the
 *     `scrollerProxy`-equivalent `lenis.on('scroll', ScrollTrigger.update)`.
 *  3. Smooth scroll ignoring a user's reduced-motion preference. Lenis is not
 *     mounted at all in that case; the browser scrolls natively.
 *
 * And the fourth, which is cost: touch scrolling is left native (`syncTouch`
 * is off), so on a phone Lenis smoothed nothing while its ~110 kB of GSAP,
 * ScrollTrigger and Lenis still downloaded and ran on every page, during the
 * same main-thread window the page needs to become interactive. They are now
 * imported only for a fine pointer without reduced motion, after the page is
 * idle. The /process components import GSAP themselves and need none of this.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const triggerRef = useRef<typeof ScrollTriggerType | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (prefersReduced || !finePointer) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    const mount = async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      // Without this, ScrollTrigger's own rAF competes with the ticker below.
      gsap.ticker.lagSmoothing(0);
      triggerRef.current = ScrollTrigger;

      const lenis = new Lenis({
        duration: 1.05,
        // Gentle exponential ease-out: settles quickly without feeling slippery.
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        syncTouch: false,
        touchMultiplier: 1.6,
        wheelMultiplier: 1,
      });
      lenisRef.current = lenis;
      registerLenis(lenis);

      lenis.on('scroll', ScrollTrigger.update);

      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);

      ScrollTrigger.refresh();

      teardown = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        lenisRef.current = null;
        triggerRef.current = null;
        registerLenis(null);
      };
    };

    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => void mount());

    return () => {
      cancelled = true;
      cancelIdle(handle);
      teardown?.();
    };
  }, []);

  // App Router keeps the DOM alive across navigations, so scroll position and
  // every ScrollTrigger from the previous page must be reset explicitly.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    const trigger = triggerRef.current;
    if (!trigger) return;
    trigger.getAll().forEach((t) => t.kill());
    // Let the new route paint before measuring it.
    const id = requestAnimationFrame(() => trigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return <>{children}</>;
}
