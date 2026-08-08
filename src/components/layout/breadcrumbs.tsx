import Link from 'next/link';
import { cn } from '@/lib/utils';

export type Crumb = { label: string; href?: string };

/**
 * The trail back up.
 *
 * Extracted from the two hand-written copies on /shop and /product so the rest
 * of the site can have one. It matters more here than on a typical shop: the
 * journal, the care guide and the process page are all deep-linkable from
 * search and from the assistant, so a large share of visitors arrive halfway
 * down the tree with no idea what is above them.
 *
 * The final crumb is the current page and is never a link — it carries
 * `aria-current="page"` instead. Separators are decorative and hidden, so a
 * screen reader hears the list rather than a row of slashes.
 */
export function Breadcrumbs({
  trail,
  className,
}: {
  /** Ancestors first; the last entry is the current page. */
  trail: Crumb[];
  className?: string;
}) {
  if (trail.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm text-muted-foreground', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
        </li>

        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
              <span aria-hidden="true">/</span>
              {crumb.href && !isLast ? (
                <Link href={crumb.href} className="hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className="text-foreground">
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
