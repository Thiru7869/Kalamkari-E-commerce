'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { SearchOverlay } from './search-overlay';
import { useTypewriter } from './use-typewriter';
import { searchPlaceholders } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * The search control in the header.
 *
 * It looks like a field and is a button, which is the honest shape for what it
 * does: there is exactly one search on this site now, it lives in the panel,
 * and this opens it. The alternative — a real input here that submits, plus a
 * second real input in the panel — is two search implementations that will
 * drift, and a visitor who types four characters into the header only to have
 * them thrown away when the panel takes focus.
 *
 * The typewriter placeholder is the reason this is not simply an icon. It
 * types through the dimensions the catalogue is genuinely searchable by — the
 * kinds of piece, then the cloths, then the motifs — which teaches the shape
 * of the search without a line of instructional copy. It does not run at all
 * under reduced motion, where the first phrase simply stands.
 *
 * At rest it is quiet beside the other header controls; on hover or focus it
 * takes a little more room and lifts off the surface, so the header stays calm
 * on a page nobody came here to search from.
 */
export function HeaderSearch({ className }: { className?: string }) {
  const [active, setActive] = useState(false);
  const placeholder = useTypewriter(searchPlaceholders, { active: true });

  return (
    <SearchOverlay className={cn('relative', className)}>
      <button
        type="button"
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        className={cn(
          'flex h-10 items-center gap-2.5 rounded-sm border bg-card pl-3 pr-3 text-left text-sm',
          'transition-[width,border-color,box-shadow] duration-300 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          active
            ? 'w-64 border-primary/50 shadow-[0_10px_28px_-18px_hsl(var(--primary)/0.6)] xl:w-72'
            : 'w-44 border-input xl:w-52',
        )}
      >
        <Search
          className={cn(
            'h-4 w-4 shrink-0 transition-colors duration-300',
            active ? 'text-primary' : 'text-muted-foreground',
          )}
          aria-hidden="true"
        />

        {/* The typed phrase is decorative — it changes on a timer and would
            make a nonsense accessible name. The button is named below. */}
        <span className="truncate text-muted-foreground/80" aria-hidden="true">
          {placeholder}
        </span>

        <span className="sr-only">Search for a piece, motif or cloth</span>
      </button>
    </SearchOverlay>
  );
}
