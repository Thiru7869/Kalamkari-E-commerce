'use client';

import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * A disclosure that keeps a long page short.
 *
 * This site has a lot to say and says it well, which is its own problem: a
 * visitor who wanted to know what a dupatta costs should not have to scroll
 * past four paragraphs on tannin chemistry to find out. The lead stays
 * visible; the depth is one click away for the reader who wants it.
 *
 * Deliberately not `<details>`. The native element cannot be animated open in
 * a way that works consistently across browsers, and it steals the summary's
 * styling in ways that fight the type scale here. This is a button plus a
 * region, wired with `aria-expanded`/`aria-controls`, which is the same
 * contract a screen reader gets from `<details>` without the constraints.
 *
 * The panel is unmounted when closed rather than hidden, so its content is out
 * of the tab order and out of the accessibility tree — a collapsed section
 * that a keyboard user can still tab into is worse than no collapse at all.
 */
export function KnowMore({
  children,
  label = 'Know more',
  closeLabel = 'Show less',
  className,
  panelClassName,
  /** Rendered above the control, always visible. */
  lead,
}: {
  children: React.ReactNode;
  label?: string;
  closeLabel?: string;
  className?: string;
  panelClassName?: string;
  lead?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className={className}>
      {lead}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className={cn(
          'mt-4 inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-sm border border-border px-4',
          'text-sm font-medium transition-colors',
          'hover:border-primary/50 hover:text-primary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        {open ? closeLabel : label}
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-300 motion-reduce:transition-none',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={id}
          className={cn(
            'mt-5 motion-safe:animate-rise-in',
            panelClassName,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
