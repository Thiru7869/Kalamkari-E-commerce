'use client';

import dynamic from 'next/dynamic';
import { useSceneCapability } from './use-scene-capability';

/**
 * The scene behind /process.
 *
 * three.js is code-split and requested only after capability detection
 * resolves on the client, so the twenty-three steps — which are the actual
 * content of the page — render and become readable first.
 *
 * The canvas is aria-hidden and carries no information of its own. Turn off
 * JavaScript or WebGL and the page is still the complete article.
 */

const ProcessCanvas = dynamic(() => import('./process-canvas'), { ssr: false });

/** The palette of the finished cloth, for devices without WebGL. */
const STILL_BACKGROUND =
  'radial-gradient(120% 90% at 30% 20%, #F2E9D9 0%, #E3D5BC 45%, #8E2F22 100%)';

export function ProcessScene({
  phaseRef,
  progressRef,
  className,
}: {
  phaseRef: React.MutableRefObject<number>;
  progressRef: React.MutableRefObject<number>;
  className?: string;
}) {
  const { ready, enabled, reducedMotion, dpr, lowPower } = useSceneCapability();

  if (!ready || !enabled) {
    return <div className={className} aria-hidden="true" style={{ background: STILL_BACKGROUND }} />;
  }

  return (
    <div className={className} aria-hidden="true">
      <ProcessCanvas
        phaseRef={phaseRef}
        progressRef={progressRef}
        lowPower={lowPower}
        reducedMotion={reducedMotion}
        dpr={dpr}
      />
    </div>
  );
}
