'use client';

import { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ClothMaterialImpl } from './cloth-material';
import './cloth-material';

/**
 * The WebGL half of the home hero, in its own module so `next/dynamic` can
 * split three.js into a chunk that loads after first paint.
 *
 * Nothing here is imported by a server component, and the parent never renders
 * it until capability detection has resolved on the client — so three.js never
 * appears in the initial bundle for a page whose LCP is a piece of text.
 */

function Cloth({
  scroll,
  lowPower,
}: {
  scroll: React.MutableRefObject<number>;
  lowPower: boolean;
}) {
  const material = useRef<ClothMaterialImpl>(null);
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  // Fill the viewport with bleed, so an edge is never visible at any aspect.
  const width = viewport.width * 1.2;
  const height = viewport.height * 1.2;

  // Segment count is the only real geometry cost. 48² is smooth at the wave
  // frequencies used; phones get less and cannot tell.
  const seg = lowPower ? 28 : 48;

  useFrame((state, delta) => {
    const mat = material.current;
    if (!mat) return;

    // Clamped so a backgrounded tab does not resume with one enormous step.
    const dt = Math.min(delta, 0.05);
    mat.uTime += dt;

    // Ease toward the scroll target rather than tracking it exactly: dye should
    // read as liquid moving through cloth, not as a slider being dragged.
    mat.uDyeProgress = THREE.MathUtils.damp(mat.uDyeProgress, scroll.current, 3.2, dt);

    if (group.current) {
      // Small damped parallax — the cloth breathing, not a gimmick.
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        state.pointer.x * 0.07,
        2.4,
        dt,
      );
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        -state.pointer.y * 0.045,
        2.4,
        dt,
      );
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <planeGeometry args={[width, height, seg, seg]} />
        <clothMaterial
          ref={material}
          uGroundColor={new THREE.Color('#F2E9D9')}
          uDyeColor={new THREE.Color('#8E2F22')}
          uWeaveScale={lowPower ? 150 : 230}
          uWeaveStrength={0.06}
          uDyeDirection={new THREE.Vector2(1, 0.42)}
        />
      </mesh>
    </group>
  );
}

export default function HeroCanvas({
  scroll,
  lowPower,
  reducedMotion,
  dpr,
}: {
  scroll: React.MutableRefObject<number>;
  lowPower: boolean;
  reducedMotion: boolean;
  dpr: [number, number];
}) {
  return (
    <Canvas
      dpr={dpr}
      // Opaque and never picked: no alpha, no stencil, no raycasting cost.
      gl={{
        alpha: false,
        antialias: !lowPower,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      camera={{ position: [0, 0, 2.4], fov: 42 }}
      // Reduced motion still gets the scene — rendered once, as a still.
      frameloop={reducedMotion ? 'demand' : 'always'}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Cloth scroll={scroll} lowPower={lowPower} />
    </Canvas>
  );
}
