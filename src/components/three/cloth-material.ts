'use client';

import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

/**
 * The cloth material used by every scene on the site.
 *
 * It has one job: make a plane read as *dyed cotton* rather than as a coloured
 * polygon. Three things do that, and nothing else is in here:
 *
 *  1. A woven grid — the visible warp/weft of handloom cotton. Without it a
 *     cloth in WebGL always looks like plastic.
 *  2. Dye that bleeds along the weave rather than stopping at a hard edge,
 *     because that is how liquid behaves in fibre. `uDyeProgress` drives a
 *     noisy front sweeping across the cloth, which is what makes the madder
 *     bath and the indigo vat legible as processes.
 *  3. Ink that sits *in* the cloth: the outline texture is multiplied, and
 *     modulated by the same weave noise, so it varies in density like a real
 *     pen stroke running dry.
 */

export const ClothMaterial = shaderMaterial(
  {
    uTime: 0,
    /** 0 = undyed myrobalan cream, 1 = fully struck colour. */
    uDyeProgress: 0,
    /** 0 = no drawing, 1 = outline fully drawn. */
    uInkProgress: 0,
    uGroundColor: new THREE.Color('#F4EDE0'),
    uDyeColor: new THREE.Color('#8E2F22'),
    uInkColor: new THREE.Color('#22201D'),
    /** Outline artwork, alpha-keyed. Optional. */
    uInkMap: null,
    uHasInkMap: 0,
    /** Threads per unit — higher looks finer. */
    uWeaveScale: 210,
    uWeaveStrength: 0.055,
    /** Direction the dye front travels across the cloth. */
    uDyeDirection: new THREE.Vector2(1, 0.35),
    uOpacity: 1,
  },
  /* ---------------------------------- vertex --------------------------------- */
  /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying float vWave;

    uniform float uTime;

    void main() {
      vUv = uv;

      // Two crossed low-frequency waves: cloth hanging in still air, not flag
      // in a gale. Amplitude falls to zero at the top edge, where it is pinned.
      float hang = smoothstep(0.0, 0.85, 1.0 - uv.y);
      float w =
        sin(uv.x * 4.2 + uTime * 0.55) * 0.055 +
        sin(uv.y * 3.1 - uTime * 0.42) * 0.035 +
        sin((uv.x + uv.y) * 6.4 + uTime * 0.3) * 0.018;
      w *= hang;
      vWave = w;

      vec3 displaced = position + normal * w;

      // Analytic normal perturbation from the same wave — cheaper and steadier
      // than deriving it per-fragment.
      vec3 n = normalize(normal + vec3(
        cos(uv.x * 4.2 + uTime * 0.55) * 0.22 * hang,
        cos(uv.y * 3.1 - uTime * 0.42) * 0.16 * hang,
        0.0
      ));
      vNormal = normalize(normalMatrix * n);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
    }
  `,
  /* --------------------------------- fragment -------------------------------- */
  /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying float vWave;

    uniform float uTime;
    uniform float uDyeProgress;
    uniform float uInkProgress;
    uniform vec3  uGroundColor;
    uniform vec3  uDyeColor;
    uniform vec3  uInkColor;
    uniform sampler2D uInkMap;
    uniform float uHasInkMap;
    uniform float uWeaveScale;
    uniform float uWeaveStrength;
    uniform vec2  uDyeDirection;
    uniform float uOpacity;

    // Cheap value noise. Two octaves is enough for fibre irregularity; more is
    // invisible at these scales and costs real time on a phone GPU.
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    float fbm(vec2 p) {
      return noise(p) * 0.62 + noise(p * 2.7) * 0.38;
    }

    void main() {
      // --- weave -------------------------------------------------------------
      // Warp and weft as two out-of-phase sine grids. The slight frequency
      // difference stops them forming a regular moire.
      float warp = sin(vUv.x * uWeaveScale) * 0.5 + 0.5;
      float weft = sin(vUv.y * uWeaveScale * 1.04) * 0.5 + 0.5;
      float weave = (warp * weft * 0.6 + (warp + weft) * 0.2);

      // Slubs and thread irregularity — handloom cotton is never even.
      float fibre = fbm(vUv * 90.0);

      vec3 ground = uGroundColor * (1.0 - uWeaveStrength + weave * uWeaveStrength * 2.0);
      ground *= 0.97 + fibre * 0.06;

      // --- dye ---------------------------------------------------------------
      // A front travelling along uDyeDirection, with its edge broken up by
      // noise so the dye creeps into the cloth instead of arriving as a line.
      float axis = dot(vUv - 0.5, normalize(uDyeDirection)) + 0.5;
      float bleed = fbm(vUv * 5.5 + uTime * 0.03) * 0.34;
      // Front runs past 1.0 so the cloth finishes fully saturated.
      float front = uDyeProgress * 1.45 - 0.22;
      float dye = smoothstep(front - 0.20, front + 0.14, 1.0 - axis + bleed);
      dye *= uDyeProgress > 0.001 ? 1.0 : 0.0;

      // Uptake varies with the weave: thread crossings take more dye, which is
      // what gives naturally dyed cloth its grain.
      float uptake = 0.82 + weave * 0.30 + fibre * 0.14;
      vec3 colour = mix(ground, uDyeColor * uptake, clamp(dye, 0.0, 1.0));

      // --- ink ---------------------------------------------------------------
      if (uHasInkMap > 0.5) {
        vec4 inkTex = texture2D(uInkMap, vUv);
        // Reveal left-to-right, as the pen actually travels.
        float reveal = smoothstep(uInkProgress - 0.10, uInkProgress + 0.02, 1.0 - vUv.x);
        float ink = inkTex.a * (1.0 - reveal);
        // Density varies with fibre: the pen runs dry and is recharged.
        ink *= 0.72 + fibre * 0.42;
        colour = mix(colour, uInkColor, clamp(ink, 0.0, 1.0));
      }

      // --- light -------------------------------------------------------------
      // A single soft key from the front-left, standing in for a courtyard.
      vec3 n = normalize(vNormal);
      float lambert = clamp(dot(n, normalize(vec3(-0.45, 0.6, 0.85))), 0.0, 1.0);
      // Cotton is thin: a little light comes through from behind.
      float transmit = pow(1.0 - abs(n.z), 2.5) * 0.16;
      colour *= 0.74 + lambert * 0.34 + transmit;

      // Folds catch and lose light.
      colour *= 1.0 + vWave * 0.85;

      gl_FragColor = vec4(colour, uOpacity);

      #include <colorspace_fragment>
    }
  `,
);

extend({ ClothMaterial });

export type ClothMaterialImpl = THREE.ShaderMaterial & {
  uTime: number;
  uDyeProgress: number;
  uInkProgress: number;
  uGroundColor: THREE.Color;
  uDyeColor: THREE.Color;
  uInkColor: THREE.Color;
  uWeaveScale: number;
  uDyeDirection: THREE.Vector2;
  uOpacity: number;
};

declare module '@react-three/fiber' {
  interface ThreeElements {
    clothMaterial: import('@react-three/fiber').ThreeElement<typeof ClothMaterial>;
  }
}
