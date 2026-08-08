'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { toggleWishlist } from '@/app/actions/cart';
import { cn } from '@/lib/utils';

export function WishlistButton({
  productId,
  initialWishlisted = false,
  className,
  showLabel = false,
}: {
  productId: string;
  initialWishlisted?: boolean;
  className?: string;
  showLabel?: boolean;
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onClick = () => {
    // Optimistic — the heart must respond instantly, even on a slow connection.
    const next = !wishlisted;
    setWishlisted(next);

    startTransition(async () => {
      const result = await toggleWishlist(productId);
      if (!result.ok) {
        setWishlisted(!next);
        toast.error(result.error, {
          action: result.error.includes('Sign in')
            ? { label: 'Sign in', onClick: () => router.push('/signin') }
            : undefined,
        });
        return;
      }
      setWishlisted(result.wishlisted ?? next);
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={wishlisted}
      // The link overlay on product cards covers the whole card; this must sit
      // above it to remain clickable.
      className={cn(
        'relative z-10 inline-flex h-10 items-center gap-2 rounded-sm px-2.5 transition-colors',
        'bg-background/85 backdrop-blur-sm hover:bg-background',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        showLabel ? 'min-w-[3rem]' : 'w-10 justify-center',
        className,
      )}
    >
      <Heart
        className={cn(
          'h-[1.1rem] w-[1.1rem] transition-all duration-200',
          wishlisted ? 'scale-110 fill-primary text-primary' : 'text-foreground/70',
        )}
        aria-hidden="true"
      />
      {showLabel && (
        <span className="text-sm">{wishlisted ? 'Saved' : 'Save'}</span>
      )}
      <span className="sr-only">
        {wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
      </span>
    </button>
  );
}
