'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { Search, X } from 'lucide-react';

export function SearchForm({
  defaultValue = '',
  className,
}: {
  defaultValue?: string;
  className?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

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
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id="site-search"
          name="q"
          type="search"
          defaultValue={defaultValue}
          autoComplete="off"
          placeholder="Ramayana, tussar, indigo, peacock…"
          className="h-12 w-full rounded-sm border border-input bg-card pl-10 pr-24 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        {defaultValue && (
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = '';
              router.push('/search');
            }}
            className="absolute right-[4.75rem] top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Clear search</span>
          </button>
        )}
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 inline-flex h-9 -translate-y-1/2 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-chay-700"
        >
          Search
        </button>
      </div>
    </form>
  );
}
