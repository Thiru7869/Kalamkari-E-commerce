import { Skeleton } from '@/components/ui/primitives';

/**
 * Route-level loading state. Mirrors the most common page shape (a heading and
 * a product grid) so the layout does not jump when content arrives.
 */
export default function Loading() {
  return (
    <div className="container py-12">
      <span className="sr-only" role="status">
        Loading
      </span>
      <Skeleton className="h-10 w-2/3 max-w-md" />
      <Skeleton className="mt-4 h-5 w-full max-w-xl" />

      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[3/4] w-full" />
            <Skeleton className="mt-3 h-5 w-4/5" />
            <Skeleton className="mt-2 h-4 w-3/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
