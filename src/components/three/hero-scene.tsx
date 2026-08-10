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
 * The non-WebGL rendering: the dye sequence as a gradient, in the direction the
 * colour actually travels across cloth. Shown on the server, while three.js
 * loads, and permanently on devices without WebGL.
 *
 * Five stops rather than two, and every one of them a real pot colour in the
 * order the craft reaches it — myrobalan cream, the alum shadow that is almost
 * no colour at all, madder as it first strikes, deep madder off the boil, and
 * the kasim black of the outline. A two-stop ramp read as a generic warm
 * gradient; this reads as a piece of cloth part-way through step sixteen.
 *
 * The whole band is oversized and slid on scroll, so the front travels rather
 * than the surface simply darkening. Driven by a CSS variable the parent
 * writes to, which costs no React render.
 */
function ClothGradient() {
  return (
    <div
      className="h-full w-full"
      style={{
        backgroundImage:
          'linear-gradient(115deg,' +
          '#F4EDE0 0%,' +
          '#EFE2C6 22%,' +
          '#D9BFA0 38%,' +
          '#C06B54 56%,' +
          '#A94434 70%,' +
          '#8E2F22 84%,' +
          '#3D3A35 100%)',
        backgroundSize: '260% 100%',
        // 0 → the cream end of the band; 1 → the kasim end.
        backgroundPosition: 'calc(var(--hero-progress, 0) * 100%) 0%',
        transition: 'background-position 240ms linear',
      }}
    />
  );
}

export function HeroScene({ className }: { className?: string }) {
  const { ready, enabled, reducedMotion, dpr, lowPower } = useSceneCapability();
  const containerRef = useRef<HTMLDivElement>(null);
  const scroll = useScrollProgress(containerRef, reducedMotion);

  // Mirror the scroll ref onto a CSS variable for the gradient path. Written
  // straight to the element in a rAF rather than through state, for the same
  // reason the WebGL path uses a ref: this fires on every scroll tick.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (reducedMotion) {
      el.style.setProperty('--hero-progress', '1');
      return;
    }

    let frame = 0;
    let last = -1;

    const paint = () => {
      const value = scroll.current;
      // Two decimal places is finer than the eye can follow and keeps the
      // style write off the critical path when nothing meaningful changed.
      if (Math.abs(value - last) > 0.005) {
        el.style.setProperty('--hero-progress', value.toFixed(3));
        last = value;
      }
      frame = requestAnimationFrame(paint);
    };

    /*
      The loop runs only while the hero is actually on screen.

      It used to start on mount and never stop, so reading the rest of a very
      long home page — or leaving the tab open on it — kept a rAF callback
      firing every frame for the lifetime of the page, to move a gradient
      nobody could see. That is the kind of thing that shows up as battery
      drain on a phone rather than as a bug on a desktop.

      An IntersectionObserver rather than a scroll handler: the browser already
      knows the answer and can give it to us without running anything per
      frame.
    */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !frame) {
          frame = requestAnimationFrame(paint);
        } else if (!entry.isIntersecting && frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [scroll, reducedMotion]);

  return (
    <div ref={containerRef} className={className} aria-hidden="true">
      {/*
        The gradient is always painted, and the canvas layers over it.

        It used to be an either/or, and the "or" was decided by a WebGL *probe*
        — a throwaway context created and immediately released by
        useSceneCapability. That probe answers "could this device do WebGL",
        which is not the same question as "did this Canvas start". The real
        context can still fail afterwards: a driver blocklist, one context too
        many on the page, a lost context on a phone that backgrounded the tab.
        When it did, `enabled` was still true, so the fallback was not rendered
        and the hero was left as bare page colour under a scrim built to sit on
        mid-dark cloth — which took the heading down to about 2.4:1.

        Painting both costs one CSS gradient and removes the whole failure
        class: whatever happens to WebGL, the hero has its cloth behind the
        text, and the canvas is a pure enhancement on top of it.
      */}
      <div className="relative h-full w-full">
        <div className="absolute inset-0">
          <ClothGradient />
        </div>

        {ready && enabled && (
          <div className="absolute inset-0">
            <HeroCanvas
              scroll={scroll}
              lowPower={lowPower}
              reducedMotion={reducedMotion}
              dpr={dpr}
            />
          </div>
        )}
      </div>
    </div>
  );
}
