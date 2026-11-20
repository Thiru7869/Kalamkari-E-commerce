import { CardGridSkeleton, HeaderSkeleton } from '@/components/ui/page-skeletons';

export default function Loading() {
  return (
    <div className="container section-y-sm">
      <span className="sr-only" role="status">
        Loading your wishlist
      </span>
      <HeaderSkeleton />
      <CardGridSkeleton count={4} className="mt-8 md:mt-10" />
    </div>
  );
}
