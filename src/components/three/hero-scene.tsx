'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSceneCapability } from './use-scene-capability';

/**
 * Home hero scene.
 *
 * What it shows, and why: a length of cloth hanging in the store, with the
 * madder red striking across it as you scroll. That is not decoration — it is
 * the single most counter-intuitive fact about this craft (colour arrives in a
 * boiling dye bath, days after it was painted on as a clear liquid), stated
 * visually before the visitor has read a word.
 *
 * three.js is code-split behind `next/dynamic` and only requested once
 * capability detection has resolved on the client, so it never delays the
 * hero text — which is the actual LCP element on this page.
 */

// ssr:false is correct here: the canvas cannot render on the server, and the
// gradient below is a complete visual substitute until it loads.
const HeroCanvas = dynamic(() => import('./hero-canvas'), { ssr: false });

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Maps the hero's position in the viewport to 0→1, written into a ref so it
 * never re-renders React. Lives outside the Canvas so it is unaffected by
 * whether WebGL is available.
 */
function useScrollProgress(
  ref: React.RefObject<HTMLDivElement | null>,
  reducedMotion: boolean,
) {
  const progress = useRef(0);
  const raf = useRef(0);

  useIsomorphicLayoutEffect(() => {
    if (reducedMotion) {
      // Show the finished, fully dyed cloth rather than a blank one.
      progress.current = 1;
      return;
    }

    const measure = () => {
      raf.current = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height || 1;
      progress.current = Math.min(1, Math.max(0, -rect.top / total));
    };

    const onScroll = () => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [ref, reducedMotion]);

  return progress;
}

/**
 * The non-WebGL rendering: the same two colours as a gradient, in the same
 * direction the dye travels. Shown on the server, while three.js loads, and
 * permanently on devices without WebGL. Only the motion is lost.
 */
function ClothGradient() {
  return (
    <div className="h-full w-full bg-[linear-gradient(115deg,#F2E9D9_0%,#F2E9D9_38%,#B0503F_72%,#8E2F22_100%)]" />
  );
}

export function HeroScene({ className }: { className?: string }) {
  const { ready, enabled, reducedMotion, dpr, lowPower } = useSceneCapability();
  const containerRef = useRef<HTMLDivElement>(null);
  const scroll = useScrollProgress(containerRef, reducedMotion);

  return (
    <div ref={containerRef} className={className} aria-hidden="true">
      {ready && enabled ? (
        <HeroCanvas
          scroll={scroll}
          lowPower={lowPower}
          reducedMotion={reducedMotion}
          dpr={dpr}
        />
      ) : (
        <ClothGradient />
      )}
    </div>
  );
}
