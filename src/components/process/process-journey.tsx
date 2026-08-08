'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ProcessScene } from '@/components/three/process-scene';
import type { ProcessPhase } from '@/content/process';
import { cn } from '@/lib/utils';

/**
 * The scroll-driven walk through the 23 steps.
 *
 * Structure, and why it is this way:
 *
 *  - The 3D canvas is pinned to the viewport and stays mounted for the whole
 *    journey. Six separate canvases would exhaust the browser's WebGL context
 *    limit on mobile.
 *  - Phase and within-phase progress are written into refs, not React state.
 *    The scene reads them in its own render loop, so scrolling never triggers a
 *    React re-render — this is what keeps it at 60fps on a mid-range phone.
 *  - The *only* React state is the current phase index, updated once per phase
 *    boundary, because the visible rail and the aria-live region need it.
 *  - All content is ordinary HTML in normal document order. Turn off
 *    JavaScript, or WebGL, or scroll with a screen reader, and you get the
 *    entire twenty-three steps as a readable article. The 3D adds atmosphere;
 *    it carries no information of its own.
 */
export function ProcessJourney({ phases }: { phases: ProcessPhase[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(0);
  const progressRef = useRef(0);
  const [activePhase, setActivePhase] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>('[data-phase]');

      sections.forEach((section, index) => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top 65%',
          end: 'bottom 35%',
          onEnter: () => {
            phaseRef.current = index;
            setActivePhase(index);
          },
          onEnterBack: () => {
            phaseRef.current = index;
            setActivePhase(index);
          },
          // Continuous 0→1 within this phase, consumed by the 3D scene.
          onUpdate: (self) => {
            if (phaseRef.current === index) progressRef.current = self.progress;
          },
        });

        if (reduced) return;

        // Individual steps fade up as they arrive. Cheap, and it gives the
        // reader a sense of moving through a sequence rather than a list.
        gsap.from(section.querySelectorAll('[data-step]'), {
          opacity: 0,
          y: 18,
          duration: 0.55,
          stagger: 0.07,
          ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 72%', once: true },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative">
      {/* Pinned scene. Sticky rather than GSAP-pinned so it needs no spacer
          element and cannot desynchronise from the document flow. */}
      <div className="pointer-events-none sticky top-0 -z-10 h-svh w-full">
        <ProcessScene phaseRef={phaseRef} progressRef={progressRef} className="h-full w-full" />
      </div>

      {/* Phase rail — a persistent sense of place in a long page. */}
      <nav
        aria-label="Process phases"
        className="pointer-events-none sticky top-24 z-10 hidden h-0 lg:block"
      >
        <div className="container">
          <ol className="pointer-events-auto ml-auto flex w-fit flex-col gap-2.5 rounded-sm border border-border/60 bg-background/85 p-3 backdrop-blur-sm">
            {phases.map((phase, i) => (
              <li key={phase.id}>
                <a
                  href={`#phase-${phase.id}`}
                  aria-current={activePhase === i ? 'step' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-sm px-2 py-1.5 text-xs transition-colors',
                    activePhase === i
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'tabular w-5 shrink-0 text-right font-display text-sm',
                      activePhase === i ? 'text-primary' : 'text-muted-foreground/60',
                    )}
                  >
                    {phase.numeral}
                  </span>
                  <span className="whitespace-nowrap">{phase.title}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-px w-6 transition-colors',
                      activePhase === i ? 'bg-primary' : 'bg-border',
                    )}
                  />
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      {/* Announces phase changes to screen-reader users, who get no benefit
          from the visual scene. */}
      <p className="sr-only" aria-live="polite">
        {`Phase ${activePhase + 1} of ${phases.length}: ${phases[activePhase]?.title}`}
      </p>

      {phases.map((phase) => (
        <section
          key={phase.id}
          id={`phase-${phase.id}`}
          data-phase={phase.id}
          className="relative scroll-mt-20 py-20 md:py-32"
        >
          <div className="container">
            <div className="max-w-2xl rounded-sm bg-background/92 p-6 backdrop-blur-sm md:p-10 lg:max-w-3xl">
              <div className="flex items-baseline gap-4">
                <span
                  className="font-display text-4xl leading-none text-primary/70"
                  aria-hidden="true"
                >
                  {phase.numeral}
                </span>
                <div>
                  <h2 className="text-display-md leading-tight">{phase.title}</h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Steps {phase.steps[0].n}–{phase.steps[phase.steps.length - 1].n}
                  </p>
                </div>
              </div>

              <p className="mt-7 font-display text-xl italic leading-snug text-primary md:text-2xl">
                {phase.question}
              </p>
              <p className="mt-4 text-body-lg leading-relaxed text-muted-foreground">
                {phase.intro}
              </p>

              <ol className="mt-10 flex flex-col gap-9">
                {phase.steps.map((step) => (
                  <li
                    key={step.n}
                    data-step
                    id={`step-${step.n}`}
                    className="scroll-mt-24 border-l-2 border-border pl-5 md:pl-7"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="tabular font-display text-sm font-semibold text-primary">
                        {String(step.n).padStart(2, '0')}
                      </span>
                      <h3 className="font-display text-xl leading-snug">{step.title}</h3>
                      {step.localName && (
                        <span className="text-sm italic text-muted-foreground">
                          {step.localName}
                        </span>
                      )}
                    </div>

                    <p className="mt-3 leading-relaxed text-muted-foreground">{step.body}</p>

                    {(step.materials?.length || step.duration) && (
                      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-xs">
                        {step.materials?.length ? (
                          <div>
                            <dt className="uppercase tracking-[0.12em] text-muted-foreground/70">
                              Materials
                            </dt>
                            <dd className="mt-1">{step.materials.join(' · ')}</dd>
                          </div>
                        ) : null}
                        {step.duration && (
                          <div>
                            <dt className="uppercase tracking-[0.12em] text-muted-foreground/70">
                              Takes
                            </dt>
                            <dd className="mt-1">{step.duration}</dd>
                          </div>
                        )}
                      </dl>
                    )}

                    {step.note && (
                      <p className="mt-4 border-l-2 border-primary/50 bg-primary/[0.05] py-2.5 pl-4 pr-3 text-sm leading-relaxed">
                        {step.note}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
