'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Pagination({ page, pageCount }: { page: number; pageCount: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pageCount <= 1) return null;

  const hrefFor = (target: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (target <= 1) params.delete('page');
    else params.set('page', String(target));
    return `${pathname}${params.toString() ? `?${params}` : ''}`;
  };

  // Show first, last, current and its neighbours; ellipsis for the rest.
  const pages: (number | 'gap')[] = [];
  for (let i = 1; i <= pageCount; i += 1) {
    if (i === 1 || i === pageCount || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== 'gap') pages.push('gap');
  }

  return (
    /*
      The word labels are hidden below `sm`.

      "Previous" and "Next" are ~99px and ~74px of unbreakable text. Add the
      numbered buttons at 44px each and the row's min-content passes the 280px
      a 320px phone actually offers inside the container, so the row pushed the
      document 12px wider than the viewport. The chevrons alone are unambiguous
      in a pagination row, the 44px targets are untouched, and `sr-only` keeps
      the accessible name for anybody not reading the glyph.
    */
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          rel="prev"
          scroll
          className="inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-sm px-2 text-sm transition-colors hover:bg-foreground/5 sm:px-3"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Previous</span>
        </Link>
      ) : (
        <span className="inline-flex h-11 min-w-11 items-center justify-center gap-1 px-2 text-sm text-muted-foreground/50 sm:px-3">
          <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Previous</span>
        </span>
      )}

      <ul className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === 'gap' ? (
            <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-muted-foreground">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={hrefFor(p)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Page ${p}`}
                className={cn(
                  'tabular inline-flex h-11 w-11 items-center justify-center rounded-sm text-sm transition-colors',
                  p === page
                    ? 'bg-primary font-medium text-primary-foreground'
                    : 'hover:bg-foreground/5',
                )}
              >
                {p}
              </Link>
            </li>
          ),
        )}
      </ul>

      {page < pageCount ? (
        <Link
          href={hrefFor(page + 1)}
          rel="next"
          scroll
          className="inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-sm px-2 text-sm transition-colors hover:bg-foreground/5 sm:px-3"
        >
          <span className="sr-only sm:not-sr-only">Next</span>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
      ) : (
        <span className="inline-flex h-11 min-w-11 items-center justify-center gap-1 px-2 text-sm text-muted-foreground/50 sm:px-3">
          <span className="sr-only sm:not-sr-only">Next</span>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
