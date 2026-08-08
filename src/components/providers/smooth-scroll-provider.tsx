'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { registerLenis } from '@/lib/smooth-scroll';

/**
 * Lenis + GSAP ScrollTrigger, wired together correctly.
 *
 * The three things that go wrong when they are not:
 *  1. Two rAF loops. GSAP's ticker drives Lenis here, so there is exactly one.
 *  2. ScrollTrigger reading native scroll while Lenis owns it — fixed by the
 *     `scrollerProxy`-equivalent `lenis.on('scroll', ScrollTrigger.update)`.
 *  3. Smooth scroll ignoring a user's reduced-motion preference. Lenis is not
 *     mounted at all in that case; the browser scrolls natively.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    gsap.registerPlugin(ScrollTrigger);
    // Without this, ScrollTrigger's own rAF competes with the ticker below.
    gsap.ticker.lagSmoothing(0);

    if (prefersReduced) {
      // Native scrolling only. ScrollTrigger still works — the animations that
      // depend on it resolve to their end state via the CSS media query.
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      // Gentle exponential ease-out: settles quickly without feeling slippery.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      // Touch is left native. Hijacking momentum scroll on a phone is the
      // fastest way to make a site feel broken, and this site is mostly phones.
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

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      registerLenis(null);
    };
  }, []);

  // App Router keeps the DOM alive across navigations, so scroll position and
  // every ScrollTrigger from the previous page must be reset explicitly.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    ScrollTrigger.getAll().forEach((t) => t.kill());
    // Let the new route paint before measuring it.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return <>{children}</>;
}
