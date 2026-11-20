'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Entry = { id: string; label: string };

/**
 * A dot rail that lets a reader jump between the home page's long sections.
 *
 * Only from `2xl`. Below that the container fills too much of the width for a
 * fixed rail to sit in the margin without overlapping copy, and on a phone the
 * page is already a single short scroll per section. Hidden from `2xl` down, so
 * nothing here can cause the edge-crossing the layout audit looks for.
 *
 * Positioned with `inset-y-0 my-auto h-fit` rather than a centring transform,
 * and it animates nothing — the label simply appears on hover or focus.
 *
 * The current section is tracked with an IntersectionObserver and written to
 * state only when it changes, not on every scroll event.
 */
export function SectionIndex({ entries }: { entries: Entry[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((r) => r.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [entries]);

  return (
    <nav
      aria-label="Sections of this page"
      className="fixed inset-y-0 right-4 z-30 my-auto hidden h-fit 2xl:block"
    >
      <ul className="flex flex-col items-end gap-1">
        {entries.map((entry) => {
          const current = active === entry.id;
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                aria-current={current ? 'true' : undefined}
                className="group flex min-h-[2.75rem] items-center justify-end gap-3 focus-visible:outline-none"
              >
                <span
                  className={cn(
                    'rounded-sm bg-background/95 px-2 py-1 text-xs text-foreground opacity-0 shadow-sm ring-1 ring-border transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100',
                    current && 'opacity-100',
                  )}
                >
                  {entry.label}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'block h-2.5 w-2.5 rounded-full border border-foreground/50 transition-colors group-focus-visible:ring-2 group-focus-visible:ring-ring',
                    current ? 'bg-primary border-primary' : 'bg-transparent group-hover:bg-foreground/30',
                  )}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
