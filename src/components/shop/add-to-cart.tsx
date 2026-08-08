'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { QuantityStepper } from '@/components/ui/primitives';
import { addToCart } from '@/app/actions/cart';

export function AddToCart({
  productId,
  stock,
  className,
}: {
  productId: string;
  stock: number;
  className?: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const soldOut = stock < 1;
  // Nearly everything here is unique, so a stepper would be noise on most pages.
  const showStepper = stock > 1;

  const onAdd = () => {
    startTransition(async () => {
      const result = await addToCart(productId, quantity);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? 'Added to your bag', {
        action: { label: 'View bag', onClick: () => router.push('/cart') },
      });
      router.refresh();
    });
  };

  if (soldOut) {
    return (
      <div className={className}>
        <Button disabled size="lg" className="w-full">
          Sold
        </Button>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          This piece has found its owner. Nothing here is reprinted — but the same
          motif can be painted again for you, on cloth you choose.{' '}
          <a href="/custom" className="text-primary underline underline-offset-4">
            Ask about a commission
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-3">
        {showStepper && (
          <QuantityStepper value={quantity} onChange={setQuantity} max={stock} disabled={pending} />
        )}
        <Button size="lg" onClick={onAdd} disabled={pending} className="min-w-[12rem] flex-1">
          {pending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Adding…
            </>
          ) : (
            <>
              <ShoppingBag aria-hidden="true" />
              Add to bag
            </>
          )}
        </Button>
      </div>

      {stock === 1 && (
        <p className="mt-2.5 text-xs text-muted-foreground">
          Only one of this exists. It was drawn once, by hand.
        </p>
      )}
    </div>
  );
}
