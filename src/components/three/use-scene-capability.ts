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
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const cores = navigator.hardwareConcurrency ?? 4;
    const smallViewport = window.innerWidth < 768;

    const lowPower =
      (deviceMemory != null && deviceMemory <= 4) || cores <= 4 || smallViewport;

    // Retina beyond 2x buys nothing perceptible here and costs 2.25x the pixels.
    const maxDpr = lowPower ? 1.5 : 2;

    setState({
      ready: true,
      enabled: hasWebGL,
      reducedMotion,
      dpr: [1, Math.min(window.devicePixelRatio || 1, maxDpr)],
      lowPower,
    });
  }, []);

  return state;
}
