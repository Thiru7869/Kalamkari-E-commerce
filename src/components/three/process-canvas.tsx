'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ClothMaterialImpl } from './cloth-material';
import './cloth-material';
import type { ProcessPhase } from '@/content/process';

/**
 * The WebGL half of /process, split into its own module so three.js is a
 * separate chunk fetched after the article itself has rendered.
 *
 * One canvas serves all six phases and stays mounted for the whole journey.
 * Six separate canvases would exhaust the browser's WebGL context limit on
 * mobile and start silently killing the earliest ones.
 *
 * Each phase shows the cloth as it actually is at that point in the sequence:
 *
 *   I   cloth      — bare cream cotton, undyed, undrawn
 *   II  charcoal   — the sketch appearing, faint and grey
 *   III kasim      — the black outline striking as iron meets tannin
 *   IV  chay       — madder red sweeping across in the boiling bath
 *   V   indigo     — blue arriving from above, as the cloth is lowered in
 *   VI  sun        — the ground washing back to clean cream, colours holding
 */

type PhaseVisual = {
  ground: THREE.Color;
  dye: THREE.Color;
  ink: THREE.Color;
  dyeTarget: number;
  inkTarget: number;
  direction: THREE.Vector2;
  backdrop: THREE.Color;
};

const CREAM = '#F2E9D9';

function buildVisuals(): Record<ProcessPhase['tone'], PhaseVisual> {
  return {
    cloth: {
      ground: new THREE.Color(CREAM),
      dye: new THREE.Color(CREAM),
      ink: new THREE.Color('#22201D'),
      dyeTarget: 0,
      inkTarget: 0,
      direction: new THREE.Vector2(1, 0.2),
      backdrop: new THREE.Color('#E8DDC8'),
    },
    charcoal: {
      ground: new THREE.Color(CREAM),
      dye: new THREE.Color('#9E9990'),
      ink: new THREE.Color('#6B655C'),
      dyeTarget: 0.3,
      inkTarget: 0.55,
      direction: new THREE.Vector2(1, 0.5),
      backdrop: new THREE.Color('#DCD3C2'),
    },
    kasim: {
      ground: new THREE.Color(CREAM),
      dye: new THREE.Color('#2F2C29'),
      ink: new THREE.Color('#22201D'),
      dyeTarget: 0.62,
      inkTarget: 1,
      direction: new THREE.Vector2(1, 0.15),
      backdrop: new THREE.Color('#4C4842'),
    },
    chay: {
      ground: new THREE.Color(CREAM),
      dye: new THREE.Color('#8E2F22'),
      ink: new THREE.Color('#22201D'),
      dyeTarget: 1,
      inkTarget: 1,
      direction: new THREE.Vector2(0.9, 0.55),
      backdrop: new THREE.Color('#74251B'),
    },
    indigo: {
      ground: new THREE.Color('#EFE4CE'),
      dye: new THREE.Color('#2C4268'),
      ink: new THREE.Color('#1B2942'),
      dyeTarget: 0.88,
      inkTarget: 1,
      // Downward: the cloth is lowered into the vat.
      direction: new THREE.Vector2(0.08, -1),
      backdrop: new THREE.Color('#233553'),
    },
    sun: {
      ground: new THREE.Color('#FBF6EA'),
      dye: new THREE.Color('#A94434'),
      ink: new THREE.Color('#22201D'),
      dyeTarget: 0.46,
      inkTarget: 1,
      direction: new THREE.Vector2(1, 0.3),
      backdrop: new THREE.Color('#E3BE59'),
    },
  };
}

const TONES = ['cloth', 'charcoal', 'kasim', 'chay', 'indigo', 'sun'] as const;

function Cloth({
  phaseRef,
  progressRef,
  lowPower,
}: {
  phaseRef: React.MutableRefObject<number>;
  progressRef: React.MutableRefObject<number>;
  lowPower: boolean;
}) {
  const material = useRef<ClothMaterialImpl>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport, scene } = useThree();

  const visuals = useMemo(buildVisuals, []);

  // Scratch objects reused every frame — allocating inside useFrame is the
  // classic R3F garbage-collection stall.
  const scratch = useMemo(
    () => ({
      ground: new THREE.Color(),
      dye: new THREE.Color(),
      ink: new THREE.Color(),
      backdrop: new THREE.Color(),
      dir: new THREE.Vector2(),
    }),
    [],
  );

  const width = viewport.width * 0.86;
  const height = viewport.height * 0.78;
  const seg = lowPower ? 26 : 44;

  useFrame((state, delta) => {
    const mat = material.current;
    if (!mat) return;

    const dt = Math.min(delta, 0.05);
    mat.uTime += dt;

    const i = Math.max(0, Math.min(TONES.length - 1, phaseRef.current));
    const current = visuals[TONES[i]];
    const next = visuals[TONES[Math.min(TONES.length - 1, i + 1)]];

    // Blend into the following phase across the back half of this one, so the
    // transition happens while the reader is between sections.
    const blend = THREE.MathUtils.smoothstep(progressRef.current, 0.55, 1);

    scratch.ground.copy(current.ground).lerp(next.ground, blend);
    scratch.dye.copy(current.dye).lerp(next.dye, blend);
    scratch.ink.copy(current.ink).lerp(next.ink, blend);
    scratch.backdrop.copy(current.backdrop).lerp(next.backdrop, blend);
    scratch.dir.copy(current.direction).lerp(next.direction, blend);

    const dyeTarget = THREE.MathUtils.lerp(current.dyeTarget, next.dyeTarget, blend);
    const inkTarget = THREE.MathUtils.lerp(current.inkTarget, next.inkTarget, blend);

    // Damping rates differ by channel on purpose: ink is a pen and arrives
    // briskly; dye is liquid soaking through cloth and takes its time.
    mat.uDyeProgress = THREE.MathUtils.damp(mat.uDyeProgress, dyeTarget, 2.0, dt);
    mat.uInkProgress = THREE.MathUtils.damp(mat.uInkProgress, inkTarget, 3.6, dt);

    const k = 1 - Math.exp(-2.6 * dt);
    mat.uGroundColor.lerp(scratch.ground, k);
    mat.uDyeColor.lerp(scratch.dye, k);
    mat.uInkColor.lerp(scratch.ink, k);
    mat.uDyeDirection.lerp(scratch.dir, k);

    if (scene.background instanceof THREE.Color) {
      scene.background.lerp(scratch.backdrop, 1 - Math.exp(-2.2 * dt));
    }

    if (mesh.current) {
      // The cloth turns very slightly through the sequence, so a reader who
      // scrolls back can see that time has passed.
      const turn = (i + progressRef.current) / TONES.length;
      mesh.current.rotation.y = THREE.MathUtils.damp(
        mesh.current.rotation.y,
        (turn - 0.5) * 0.5 + state.pointer.x * 0.06,
        2.0,
        dt,
      );
      mesh.current.rotation.x = THREE.MathUtils.damp(
        mesh.current.rotation.x,
        -state.pointer.y * 0.04,
        2.0,
        dt,
      );
      mesh.current.rotation.z = THREE.MathUtils.damp(
        mesh.current.rotation.z,
        Math.sin(turn * Math.PI) * 0.03,
        2.0,
        dt,
      );
    }
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[width, height, seg, seg]} />
      <clothMaterial
        ref={material}
        uGroundColor={new THREE.Color(CREAM)}
        uDyeColor={new THREE.Color(CREAM)}
        uInkColor={new THREE.Color('#22201D')}
        uWeaveScale={lowPower ? 160 : 245}
        uWeaveStrength={0.07}
      />
    </mesh>
  );
}

export default function ProcessCanvas({
  phaseRef,
  progressRef,
  lowPower,
  reducedMotion,
  dpr,
}: {
  phaseRef: React.MutableRefObject<number>;
  progressRef: React.MutableRefObject<number>;
  lowPower: boolean;
  reducedMotion: boolean;
  dpr: [number, number];
}) {
  return (
    <Canvas
      dpr={dpr}
      gl={{
        alpha: false,
        antialias: !lowPower,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      camera={{ position: [0, 0, 2.1], fov: 45 }}
      frameloop={reducedMotion ? 'demand' : 'always'}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.06;
        scene.background = new THREE.Color('#E8DDC8');
      }}
    >
      <Cloth phaseRef={phaseRef} progressRef={progressRef} lowPower={lowPower} />
    </Canvas>
  );
}
