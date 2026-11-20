'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export type PotStory = {
  slug: string;
  name: string;
  localName?: string;
  hex: string;
  /** 'light' = pale text on this ground. 'dark' = ink text on this ground. */
  ink: 'light' | 'dark';
  source: string;
  method: string;
  body: string;
  note: string;
  usedFor?: string;
  routes?: { label: string; body: string }[];
  count: number;
};

/** The two inks, from the palette: cotton-50 and kasim-950. */
const INK = { light: '#FDFBF6', dark: '#141312' } as const;

/**
 * The pots, one at a time.
 *
 * Choosing a colour does two things and both stay inside this section: it
 * floods the section's own background with that dye, and it opens an account of
 * how that colour is made in the same panel. Nothing outside the section
 * changes, and nothing navigates.
 *
 * Every ground is paired with the ink that clears AA against it — the pairing
 * is the one `colourStories` already carries and `audit:ink` checks — and all
 * text in the flooded state is set in that ink at full strength, never as a
 * tint of it, so contrast is the pair's contrast and not something the
 * background happens to leave over.
 *
 * Nothing is selected on arrival, so the section reads as an ordinary one until
 * somebody asks. Choosing the same colour again puts it back. The background
 * change is a colour transition only and is dropped under reduced motion.
 */
export function DyePots({
  pots,
  category,
  eyebrow,
  title,
  lead,
}: {
  pots: PotStory[];
  category: string;
  eyebrow: string;
  title: string;
  lead: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const pot = pots.find((p) => p.slug === selected) ?? null;
  const ink = pot ? INK[pot.ink] : undefined;

  return (
    <section
      id="colours"
      aria-labelledby="colours-heading"
      className="scroll-mt-20 border-y border-border section-y transition-colors duration-500 motion-reduce:transition-none"
      style={pot ? { backgroundColor: pot.hex, color: ink } : undefined}
    >
      <div className="container">
        <div className="max-w-2xl">
          <p className="eyebrow" style={pot ? { color: ink } : undefined}>
            {eyebrow}
          </p>
          <h2 id="colours-heading" className="mt-3 text-display-md">
            {title}
          </h2>
          <p className={pot ? 'mt-4 text-body-lg' : 'mt-4 text-body-lg text-muted-foreground'}>
            {lead}
          </p>
        </div>

        <div
          role="group"
          aria-label="Colours"
          className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4"
        >
          {pots.map((p) => {
            const on = p.slug === selected;
            return (
              <button
                key={p.slug}
                type="button"
                aria-pressed={on}
                onClick={() => setSelected(on ? null : p.slug)}
                className="flex min-h-[3.5rem] items-center gap-3 rounded-sm border p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                style={
                  pot
                    ? {
                        borderColor: on ? ink : `${ink}55`,
                        borderWidth: on ? 2 : 1,
                      }
                    : {
                        borderColor: on ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                      }
                }
              >
                <span
                  aria-hidden="true"
                  className="h-8 w-8 shrink-0 rounded-[2px] ring-1 ring-inset ring-foreground/25"
                  style={{ backgroundColor: p.hex }}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium leading-tight">{p.name}</span>
                  <span className="tabular block text-xs opacity-90">{p.count} in the store</span>
                </span>
              </button>
            );
          })}
        </div>

        <div aria-live="polite" className="mt-7">
          {pot ? (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
              <div>
                <h3 className="font-display text-display-sm leading-tight">
                  {pot.name}
                  {pot.localName && (
                    <span className="ml-3 text-base font-normal">({pot.localName})</span>
                  )}
                </h3>
                <p className="mt-2 text-sm font-medium uppercase tracking-[0.1em]">{pot.method}</p>
                <p className="mt-4 leading-relaxed">{pot.body}</p>
                <p className="mt-4 border-l-2 pl-4 leading-relaxed" style={{ borderColor: ink }}>
                  {pot.note}
                </p>
              </div>

              <dl className="flex flex-col gap-5 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-[0.12em]">Made from</dt>
                  <dd className="mt-1 leading-relaxed">{pot.source}</dd>
                </div>
                {pot.usedFor && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-[0.12em]">
                      Where it lands on a piece
                    </dt>
                    <dd className="mt-1 leading-relaxed">{pot.usedFor}</dd>
                  </div>
                )}
                {pot.routes && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-[0.12em]">
                      The four routes
                    </dt>
                    <dd className="mt-1">
                      <ul className="flex flex-col gap-2">
                        {pot.routes.map((r) => (
                          <li key={r.label} className="leading-relaxed">
                            <span className="font-medium">{r.label}.</span> {r.body}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
                <Link
                  href={`/shop/${category}?dye=${pot.slug}`}
                  className="inline-flex min-h-[2.75rem] items-center gap-1.5 font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  See the {pot.count} in this colour
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </dl>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Choose a colour to see how it is made and where it appears on a piece.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
