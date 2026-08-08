'use client';

import { useEffect, useState } from 'react';

export type SceneCapability = {
  /** Resolved after mount; null while unknown, so nothing renders on the server. */
  ready: boolean;
  /** WebGL is available and the device is not obviously incapable. */
  enabled: boolean;
  /** User asked for reduced motion — render a still frame, no animation. */
  reducedMotion: boolean;
  /** Device pixel ratio to render at. Capped hard; 3D at DPR 3 is wasted work. */
  dpr: [number, number];
  /** Coarse pointer, small viewport, or limited memory: simplify the scene. */
  lowPower: boolean;
};

/**
 * Decides whether — and how heavily — to render a 3D scene.
 *
 * The scenes on this site are storytelling, not product configuration, so they
 * are always optional. Every caller must render a meaningful static fallback
 * when `enabled` is false; the information in a scene is never available only
 * in the scene.
 */
export function useSceneCapability(): SceneCapability {
  const [state, setState] = useState<SceneCapability>({
    ready: false,
    enabled: false,
    reducedMotion: false,
    dpr: [1, 1.5],
    lowPower: false,
  });

  useEffect(() => {
    // WebGL support cannot change during a session, so it is probed once.
    let hasWebGL = false;
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2') ??
        canvas.getContext('webgl') ??
        canvas.getContext('experimental-webgl');
      hasWebGL = Boolean(gl);
      // Release the context immediately — browsers cap how many can be live.
      if (gl && 'getExtension' in gl) {
        (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
      }
    } catch {
      hasWebGL = false;
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Matches the `md` breakpoint the rest of the site uses.
    const compactQuery = window.matchMedia('(max-width: 767px)');

    const measure = () => {
      const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
      const cores = navigator.hardwareConcurrency ?? 4;

      const lowPower =
        (deviceMemory != null && deviceMemory <= 4) || cores <= 4 || compactQuery.matches;

      // Retina beyond 2x buys nothing perceptible here and costs 2.25x the pixels.
      const maxDpr = lowPower ? 1.5 : 2;

      setState({
        ready: true,
        enabled: hasWebGL,
        reducedMotion: motionQuery.matches,
        dpr: [1, Math.min(window.devicePixelRatio || 1, maxDpr)],
        lowPower,
      });
    };

    measure();

    /*
      Both preferences are subscribed rather than sampled.

      `prefers-reduced-motion` is the one that matters: a visitor who turns it
      on partway through reading /process is asking for the animation to stop
      *now*, and a value read once at mount would keep the rAF loop running
      until they reloaded — which is exactly the thing somebody with vestibular
      sensitivity cannot comfortably do.

      The viewport query is subscribed for a duller reason: rotating a phone
      changes which side of the low-power threshold it sits on, and the DPR cap
      should follow.
    */
    motionQuery.addEventListener('change', measure);
    compactQuery.addEventListener('change', measure);
    return () => {
      motionQuery.removeEventListener('change', measure);
      compactQuery.removeEventListener('change', measure);
    };
  }, []);

  return state;
}
