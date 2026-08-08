'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useTypewriter } from './use-typewriter';
import { searchPlaceholders } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * The search field in the header.
 *
 * It exists because the typewriter placeholder was invisible: search lived
 * only on `/search`, reached through an icon, so the one control that teaches
 * the shape of the catalogue was on the one page you had already decided to
 * search from.
 *
 * It expands on focus rather than sitting wide the whole time — at rest it is
 * a quiet field beside the other header controls; when it has attention it
 * takes the room it needs and lifts off the surface. That keeps the header
 * calm on a page nobody came here to search from.
 *
 * The placeholder types itself through the dimensions the catalogue is really
 * searchable by, stops the moment the field is focused, and does not run at
 * all under reduced motion — where the first phrase simply stands.
 */
export function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const placeholder = useTypewriter(searchPlaceholders, {
    active: !focused && !hasValue,
  });

  return (
    <form
      role="search"
      className={cn('relative', className)}
      onSubmit={(e) => {
        e.preventDefault();
        const value = inputRef.current?.value.trim() ?? '';
        router.push(value ? `/search?q=${encodeURIComponent(value)}` : '/search');
      }}
    >
      <label htmlFor="header-search" className="sr-only">
        Search for a piece, motif or cloth
      </label>

      <Search
        className={cn(
          'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300',
          focused ? 'text-primary' : 'text-muted-foreground',
        )}
        aria-hidden="true"
      />

      <input
        ref={inputRef}
        id="header-search"
        name="q"
        type="search"
        autoComplete="off"
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => setHasValue(e.target.value.length > 0)}
        className={cn(
          'h-10 rounded-sm border bg-card pl-9 pr-3 text-sm',
          'transition-[width,border-color,box-shadow] duration-300 ease-out',
          'placeholder:text-muted-foreground/80',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          focused
            ? 'w-64 border-primary/50 shadow-[0_10px_28px_-18px_hsl(var(--primary)/0.6)] xl:w-72'
            : 'w-44 border-input xl:w-52',
        )}
      />
    </form>
  );
}
