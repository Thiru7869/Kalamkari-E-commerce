import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The eyebrow → heading → optional action cluster this site is built out of.
 *
 * It appeared by hand six times on the home page alone and again across the
 * shop, journal and story pages, each copy free to drift in its spacing or its
 * heading level. Gathering it here fixes the vertical rhythm in one place.
 *
 * `as` exists because heading level is a document-structure decision, not a
 * size one: a section inside another section needs an h3 while looking exactly
 * like an h2. The type scale is chosen with `size`, independently.
 */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  action,
  as: Heading = 'h2',
  size = 'md',
  align = 'start',
  className,
  id,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  /** One or two sentences under the heading. */
  lead?: React.ReactNode;
  action?: { label: string; href: string };
  as?: 'h1' | 'h2' | 'h3';
  size?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center';
  className?: string;
  id?: string;
}) {
  const sizeClass =
    size === 'lg' ? 'text-display-lg' : size === 'sm' ? 'text-display-sm' : 'text-display-md';

  return (
    <div
      className={cn(
        'flex flex-wrap gap-4',
        align === 'center'
          ? 'flex-col items-center text-center'
          : 'items-end justify-between',
        className,
      )}
    >
      <div className={align === 'center' ? undefined : 'max-w-2xl'}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Heading id={id} className={cn(eyebrow ? 'mt-3' : undefined, sizeClass)}>
          {title}
        </Heading>
        {lead && (
          <p
            className={cn(
              'mt-4 text-body-lg text-muted-foreground',
              align === 'center' ? 'mx-auto max-w-xl' : 'max-w-xl',
            )}
          >
            {lead}
          </p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className="inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {action.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
