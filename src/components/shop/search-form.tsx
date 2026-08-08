'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useTypewriter } from './use-typewriter';
import { searchPlaceholders } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * The search field.
 *
 * The placeholder types itself through the dimensions this catalogue is
 * genuinely searchable by — the kinds of piece first, then the cloths, then
 * the motifs — which teaches the shape of the search without a line of
 * instructional copy. It stops on focus, because text moving underneath a
 * cursor somebody is typing into is a distraction, and it does not run at all
 * under reduced motion, where the first phrase simply stands.
 *
 * The field itself lifts slightly and draws its ring on focus. Small, and it
 * is the difference between a form control and something that feels answered.
 */
export function SearchForm({
  defaultValue = '',
  className,
  autoFocus = false,
}: {
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(defaultValue));

  // Paused while the visitor is typing, and while there is already a query.
  const placeholder = useTypewriter(searchPlaceholders, {
    active: !focused && !hasValue,
  });

  return (
    <form
      role="search"
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const value = inputRef.current?.value.trim() ?? '';
        router.push(value ? `/search?q=${encodeURIComponent(value)}` : '/search');
      }}
    >
      <label htmlFor="site-search" className="sr-only">
        Search for a piece, motif or cloth
      </label>

      <div
        className={cn(
          'relative rounded-sm transition-all duration-300 ease-out',
          focused
            ? 'shadow-[0_10px_30px_-16px_hsl(var(--primary)/0.55)] motion-safe:-translate-y-0.5'
            : 'shadow-none',
        )}
      >
        <Search
          className={cn(
            'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300',
            focused ? 'text-primary' : 'text-muted-foreground',
          )}
          aria-hidden="true"
        />

        <input
          ref={inputRef}
          id="site-search"
          name="q"
          type="search"
          defaultValue={defaultValue}
          autoComplete="off"
          // eslint-disable-next-line jsx-a11y/no-autofocus -- only on /search,
          // where searching is the sole purpose of the page.
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => setHasValue(e.target.value.length > 0)}
          placeholder={placeholder}
          className={cn(
            'h-12 w-full rounded-sm border bg-card pl-10 pr-24 text-base transition-colors duration-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            focused ? 'border-primary/50' : 'border-input',
          )}
        />

        {/* The caret. Purely decorative — the placeholder text carries the
            meaning and is present whether or not this is drawn. */}
        {!focused && !hasValue && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-10 top-1/2 hidden -translate-y-1/2 text-base text-transparent motion-safe:block"
          >
            <span className="invisible">{placeholder}</span>
            <span className="ml-px inline-block h-[1.1em] w-px translate-y-[0.15em] bg-primary/70 motion-safe:animate-pulse" />
          </span>
        )}

        {hasValue && (
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.value = '';
                inputRef.current.focus();
              }
              setHasValue(false);
              router.push('/search');
            }}
            className="absolute right-[4.75rem] top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Clear search</span>
          </button>
        )}

        <button
          type="submit"
          className="absolute right-1.5 top-1/2 inline-flex h-9 -translate-y-1/2 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-chay-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Search
        </button>
      </div>
    </form>
  );
}
