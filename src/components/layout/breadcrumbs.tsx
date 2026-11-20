import Link from 'next/link';
import { cn, absoluteUrl } from '@/lib/utils';

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

  /*
    The same trail, again, for a search engine.

    Google builds the breadcrumb line under a result from this rather than from
    the visible markup, and without it a deep page — a product, a journal entry,
    a cloth type — is listed under a bare domain with no indication of where it
    sits. It is emitted from this component rather than from each page so the
    two can never drift: the trail a reader sees and the trail a crawler is told
    about are the same array.

    Positions are 1-based and include Home, matching what is rendered. Only
    entries with a real href get an `item`; the last crumb is the current page
    and schema.org expects it to be nameless of a URL.
  */
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
    <nav aria-label="Breadcrumb" className={cn('text-sm text-muted-foreground', className)}>
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
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="inline-flex items-center py-3 -my-3 hover:text-foreground">
            Home
          </Link>
        </li>

        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
              <span aria-hidden="true">/</span>
              {crumb.href && !isLast ? (
                <Link href={crumb.href} className="inline-flex items-center py-3 -my-3 hover:text-foreground">
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
