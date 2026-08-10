'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { whatWeDoNotUse } from '@/content/process';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { cn } from '@/lib/utils';

/**
 * "Two crafts, one name" — the claim, and the pots behind it.
 *
 * Choosing a colour floods the whole section with it. That is not decoration:
 * this is the section arguing that the palette comes out of pots rather than
 * out of a printer, and letting somebody stand inside each colour makes the
 * point faster than the paragraph does.
 *
 * Readability is guaranteed structurally rather than hoped for. Every dye
 * carries a stated `ink` — `light` or `dark` — chosen against the real swatch,
 * and every piece of text in the section reads from that one value. A computed
 * luminance gets myrobalan gold wrong: it scores as bright and still needs dark
 * text over it. So it is written down, once, beside the colour.
 *
 * The type shifts with it. On a flooded ground the display face goes up in
 * size and weight and the body copy narrows its measure — the vintage
 * broadside setting these workshops' own printed labels used, and the setting
 * that survives being laid over a strong colour.
 */

/** The eight pots, with the ink that clears AA on each. */
const SWATCHES = [
  { id: 'kasim', label: 'Kasim black', source: 'Rusted iron, fermented 21 days', hex: '#22201D', ink: 'light' as const },
  { id: 'chay', label: 'Madder red', source: 'Chay root, struck over alum', hex: '#8E2F22', ink: 'light' as const },
  { id: 'pink', label: 'Pink', source: 'The same bath, thinner alum', hex: '#C66857', ink: 'dark' as const },
  { id: 'myrobalan', label: 'Myrobalan gold', source: 'Flower and pomegranate rind', hex: '#D4A337', ink: 'dark' as const },
  { id: 'indigo', label: 'Indigo blue', source: 'Dipped, never painted', hex: '#2C4268', ink: 'light' as const },
  { id: 'green', label: 'Green', source: 'Indigo laid over yellow', hex: '#4A5D3A', ink: 'light' as const },
  { id: 'katha', label: 'Catechu brown', source: 'Catechu bark', hex: '#6F4B31', ink: 'light' as const },
  { id: 'cotton', label: 'Myrobalan cream', source: 'The ground it all begins on', hex: '#EFE2C6', ink: 'dark' as const },
];

export function TwoCrafts() {
  const [active, setActive] = useState<string | null>(null);
  const dye = SWATCHES.find((s) => s.id === active) ?? null;
  const light = dye?.ink === 'light';

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden border-b border-border section-y',
        // With no colour chosen the section keeps the site's own surface.
        !dye && 'bg-cotton-100 dark:bg-card',
      )}
      style={dye ? { backgroundColor: dye.hex } : undefined}
      aria-labelledby="two-crafts-heading"
    >
      {/* The flood. A separate layer so the colour can cross-fade rather than
          snapping, without transitioning the section's own background between
          a token and a hex. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 transition-colors duration-700 ease-out motion-reduce:transition-none"
        style={{ backgroundColor: dye?.hex ?? 'transparent' }}
      />

      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
          {/* ---- The claim ---------------------------------------------- */}
          <RevealOnScroll>
            <p
              className={cn(
                'font-inscription text-eyebrow uppercase tracking-[0.2em] transition-colors duration-700',
                dye
                  ? light
                    ? 'text-white/65'
                    : 'text-black/55'
                  : 'text-muted-foreground',
              )}
            >
              Two crafts, one name
            </p>

            <h2
              id="two-crafts-heading"
              className={cn(
                'mt-4 transition-all duration-700',
                // Vintage broadside setting once a colour is standing behind
                // it: larger, heavier, tighter.
                dye
                  ? 'text-display-lg font-semibold tracking-[-0.015em]'
                  : 'text-display-md',
                dye ? (light ? 'text-white' : 'text-black') : 'text-foreground',
              )}
            >
              Almost everything sold as &ldquo;Kalamkari&rdquo; is printed. This is not.
            </h2>

            <p
              className={cn(
                'mt-5 max-w-xl text-body-lg leading-relaxed transition-colors duration-700',
                dye
                  ? light
                    ? 'text-white/85'
                    : 'text-black/75'
                  : 'text-muted-foreground',
              )}
            >
              Printed Kalamkari is carved into a block or burned into a screen and then
              repeated. This craft is drawn freehand with a bamboo pen, once, with no
              tracing and no repetition device of any kind.
            </p>

            <p
              className={cn(
                'mt-4 max-w-xl leading-relaxed transition-colors duration-700',
                dye ? (light ? 'text-white/70' : 'text-black/65') : 'text-muted-foreground',
              )}
            >
              It grew up serving the temple rather than the export trade, which is why the
              subjects are narrative: epics, deities, stories painted to be read across a
              room. You cannot carve a block for a scene that happens once.
            </p>

            <Link
              href="/our-story"
              className={cn(
                'mt-6 inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium underline-offset-4 transition-colors duration-700 hover:underline',
                dye ? (light ? 'text-white' : 'text-black') : 'text-primary',
              )}
            >
              Read the full story
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </RevealOnScroll>

          {/* ---- The pots ------------------------------------------------ */}
          <RevealOnScroll delay={0.1}>
            <div
              className={cn(
                'rounded-sm border p-5 transition-colors duration-700 md:p-7',
                dye
                  ? light
                    ? 'border-white/20 bg-black/15'
                    : 'border-black/15 bg-white/25'
                  : 'border-border bg-background',
              )}
            >
              <h3
                className={cn(
                  'font-display text-display-sm transition-colors duration-700',
                  dye ? (light ? 'text-white' : 'text-black') : 'text-foreground',
                )}
              >
                What we use instead
              </h3>
              <p
                className={cn(
                  'mt-2 text-sm transition-colors duration-700',
                  dye ? (light ? 'text-white/70' : 'text-black/65') : 'text-muted-foreground',
                )}
              >
                Choose one and the page takes its colour. Every one of them comes out of a
                pot in the yard.
              </p>

              {/*
                Three across, at every width.

                `sm:grid-cols-4` broke eight swatches into two flush rows of
                four, which reads as a colour picker — a grid of equal options
                to pick from. These are not options; they are the eight pots
                this workshop actually keeps, and three-up gives 3 · 3 · 2, so
                the last row is short and the set reads as a counted list of
                real things rather than as a complete palette. It also buys each
                swatch half as much width again for its two lines of label,
                which at four-up were breaking to three lines on a phone.
              */}
              <ul className="mt-6 grid grid-cols-3 gap-2.5">
                {SWATCHES.map((swatch) => {
                  const on = active === swatch.id;
                  return (
                    <li key={swatch.id}>
                      <button
                        type="button"
                        onClick={() => setActive(on ? null : swatch.id)}
                        aria-pressed={on}
                        className={cn(
                          'group flex w-full flex-col items-start gap-2 rounded-sm border p-2 text-left transition-all duration-300',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                          dye
                            ? light
                              ? 'border-white/20 hover:border-white/50 focus-visible:ring-white/70 focus-visible:ring-offset-transparent'
                              : 'border-black/15 hover:border-black/40 focus-visible:ring-black/60 focus-visible:ring-offset-transparent'
                            : 'border-border hover:border-primary/40 focus-visible:ring-ring focus-visible:ring-offset-background',
                          on && 'scale-[1.03]',
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'h-9 w-full rounded-[2px] transition-transform duration-500',
                            'motion-safe:group-hover:scale-[1.04]',
                            on && 'ring-2 ring-offset-2 ring-offset-transparent',
                          )}
                          style={{
                            backgroundColor: swatch.hex,
                            boxShadow: on ? `0 8px 24px -10px ${swatch.hex}` : undefined,
                          }}
                        />
                        <span className="min-w-0">
                          <span
                            className={cn(
                              'block text-[0.75rem] font-medium leading-tight transition-colors duration-700',
                              dye
                                ? light
                                  ? 'text-white'
                                  : 'text-black'
                                : 'text-foreground',
                            )}
                          >
                            {swatch.label}
                          </span>
                          <span
                            className={cn(
                              'mt-0.5 block text-[0.625rem] leading-tight transition-colors duration-700',
                              dye
                                ? light
                                  ? 'text-white/60'
                                  : 'text-black/55'
                                : 'text-muted-foreground',
                            )}
                          >
                            {swatch.source}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* What never goes in the pot. */}
              <div
                className={cn(
                  'mt-7 border-t pt-5 transition-colors duration-700',
                  dye ? (light ? 'border-white/15' : 'border-black/10') : 'border-border',
                )}
              >
                <h3
                  className={cn(
                    'font-display text-display-sm transition-colors duration-700',
                    dye ? (light ? 'text-white' : 'text-black') : 'text-foreground',
                  )}
                >
                  What we never use
                </h3>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {whatWeDoNotUse.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <span
                        className={cn(
                          'mt-[0.3rem] h-3 w-3 shrink-0 rounded-full border transition-colors duration-700',
                          dye
                            ? light
                              ? 'border-white/60'
                              : 'border-black/50'
                            : 'border-chay-600',
                        )}
                        aria-hidden="true"
                      >
                        <span
                          className={cn(
                            'block h-full w-full origin-center rotate-45 border-t transition-colors duration-700',
                            dye
                              ? light
                                ? 'border-white/60'
                                : 'border-black/50'
                              : 'border-chay-600',
                          )}
                        />
                      </span>
                      <span
                        className={cn(
                          'transition-colors duration-700',
                          dye
                            ? light
                              ? 'text-white/75'
                              : 'text-black/70'
                            : 'text-muted-foreground',
                        )}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="sr-only" aria-live="polite">
                {dye
                  ? `Showing ${dye.label}: ${dye.source}.`
                  : 'No colour selected.'}
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
