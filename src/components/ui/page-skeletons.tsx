import { Skeleton } from '@/components/ui/skeleton';
import { PRODUCT_GRID_GAP } from '@/components/shop/product-card';
import { cn } from '@/lib/utils';

/**
 * The loading shapes the route-level `loading.tsx` files are built from.
 *
 * Each one is cut to the page it stands in for, at the same ratios and gaps,
 * because a skeleton that is the wrong shape is worse than a spinner: the page
 * lands, everything jumps, and the loading state has caused the layout shift it
 * existed to prevent.
 *
 * All of them announce themselves once, in words, and nothing inside them is
 * read — `Skeleton` is `aria-hidden`.
 */

/** One sentence for assistive technology; the grey boxes say nothing. */
function Status({ label }: { label: string }) {
  return (
    <span className="sr-only" role="status">
      {label}
    </span>
  );
}

/** A card plate and its three lines, in the listing card's own proportions. */
function CardSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="aspect-[5/6] w-full" />
      <Skeleton className="mt-3 h-5 w-4/5" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-3 h-4 w-1/3" />
    </div>
  );
}

export function CardGridSkeleton({
  count = 8,
  withSidebar = false,
  className,
}: {
  count?: number;
  /** The shop listing, which gives the filters a column from `lg`. */
  withSidebar?: boolean;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        'grid grid-cols-2 md:grid-cols-3',
        withSidebar ? '2xl:grid-cols-4' : 'xl:grid-cols-4',
        PRODUCT_GRID_GAP,
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex">
          <CardSkeleton />
        </li>
      ))}
    </ul>
  );
}

/** A page header: eyebrow, title, one line of description. */
export function HeaderSkeleton() {
  return (
    <div>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-9 w-2/3 max-w-md" />
      <Skeleton className="mt-4 h-4 w-full max-w-xl" />
    </div>
  );
}

/** Search: the header, the search field, then results. */
export function SearchSkeleton() {
  return (
    <div className="container section-y-sm">
      <Status label="Searching" />
      <HeaderSkeleton />
      <Skeleton className="mt-6 h-12 w-full max-w-xl" />
      <CardGridSkeleton count={4} className="mt-8" />
    </div>
  );
}

/** A signed-in page of blocks: the account, a list of orders. */
export function AccountSkeleton({ label = 'Loading your account' }: { label?: string }) {
  return (
    <div className="container section-y-sm">
      <Status label={label} />
      <HeaderSkeleton />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <Skeleton className="mt-5 h-56 w-full" />
    </div>
  );
}
