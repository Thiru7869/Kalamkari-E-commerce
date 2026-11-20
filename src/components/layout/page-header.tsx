import { cn } from '@/lib/utils';

/**
 * The opening of a utility page: an eyebrow, the one `h1`, and a line under it.
 *
 * Search, the wishlist and the bag each wrote this out by hand with slightly
 * different spacing. This is that same arrangement — the site's `eyebrow`,
 * `text-display-lg` in Fraunces and a muted description — in one place, so the
 * customer-facing pages open the same way. Pages that have their own editorial
 * opening are not expected to use it.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  /** A link or button aligned to the end of the title row. */
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('flex flex-wrap items-end justify-between gap-x-6 gap-y-4', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className={cn('text-display-lg', eyebrow && 'mt-3')}>{title}</h1>
        {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </header>
  );
}
