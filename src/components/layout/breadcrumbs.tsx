import Link from 'next/link';
import { cn, absoluteUrl } from '@/lib/utils';

export type Crumb = { label: string; href?: string };

/**
 * The trail back up: Home, the ancestors, then the current page.
 *
 * The last crumb is not a link and carries `aria-current="page"`. Separators
 * are hidden from assistive tech. The same trail is emitted as BreadcrumbList
 * JSON-LD, so what a reader sees and what a crawler is told cannot drift apart.
 * A long final crumb (a product or article title) is truncated on narrow
 * screens so the trail stays on one line.
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

  const itemListElement = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
    ...trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 2,
      name: crumb.label,
      ...(crumb.href && i < trail.length - 1 ? { item: absoluteUrl(crumb.href) } : {}),
    })),
  ];

  return (
    <nav aria-label="Breadcrumb" className={cn('mb-5 text-sm text-muted-foreground', className)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement,
          }),
        }}
      />
      <ol className="flex flex-wrap items-center gap-x-1.5">
        <li>
          <Link href="/" className="inline-flex items-center py-3 -my-3 hover:text-foreground">
            Home
          </Link>
        </li>

        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="flex min-w-0 items-center gap-1.5">
              <span aria-hidden="true">/</span>
              {crumb.href && !isLast ? (
                <Link href={crumb.href} className="inline-flex items-center py-3 -my-3 hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="max-w-[12rem] truncate text-foreground sm:max-w-md"
                  title={crumb.label}
                >
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
