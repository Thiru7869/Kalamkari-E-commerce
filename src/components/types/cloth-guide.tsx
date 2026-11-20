'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export type GuideCloth = {
  slug: string;
  name: string;
  description: string;
  careNote: string | null;
  count: number;
  /** Lowest price among pieces available now, already formatted. */
  from: string | null;
};

export type GuideFamily = {
  family: string;
  label: string;
  note: string | null;
  cloths: GuideCloth[];
};

/**
 * What each cloth is and how it behaves, explained in place.
 *
 * Choosing a family switches the panel; nothing navigates. The point of this
 * section is to explain cotton as cotton and silk as silk — what it does to
 * the dye, how it wears, how it is washed — so the reader can choose a cloth
 * with the facts in front of them. Browsing the pieces is the catalogue's job
 * and is not repeated here.
 *
 * A group of toggle buttons rather than ARIA tabs: it is the same interaction
 * with fewer ways to get the keyboard behaviour wrong, every button is a tab
 * stop, and `aria-pressed` states which family is showing.
 */
export function ClothGuide({ families }: { families: GuideFamily[] }) {
  const [active, setActive] = useState(families[0]?.family);
  const current = families.find((f) => f.family === active) ?? families[0];
  if (!current) return null;

  return (
    <div>
      <div role="group" aria-label="Kind of cloth" className="flex flex-wrap gap-2">
        {families.map((f) => {
          const on = f.family === current.family;
          return (
            <button
              key={f.family}
              type="button"
              aria-pressed={on}
              onClick={() => setActive(f.family)}
              className={cn(
                'inline-flex min-h-[2.75rem] items-center rounded-sm border px-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                on
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:border-primary/50',
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8" aria-live="off">
        <h3 className="font-display text-display-sm">{current.label}</h3>
        {current.note && (
          <p className="mt-2 max-w-3xl leading-relaxed text-muted-foreground">{current.note}</p>
        )}

        <ul className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {current.cloths.map((cloth) => (
            <li key={cloth.slug} className="flex flex-col rounded-sm border border-border bg-background p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="font-display text-lg leading-snug">{cloth.name}</h4>
                <span className="tabular shrink-0 text-sm text-muted-foreground">
                  <span className="sr-only">Pieces: </span>
                  {cloth.count}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {cloth.description}
              </p>
              {cloth.careNote && (
                <p className="mt-3 border-t border-border pt-3 text-sm leading-relaxed">
                  <span className="font-medium">Care: </span>
                  <span className="text-muted-foreground">{cloth.careNote}</span>
                </p>
              )}
              {cloth.from && (
                <p className="tabular mt-auto pt-4 text-sm">
                  <span className="text-muted-foreground">From </span>
                  <span className="font-medium">{cloth.from}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
