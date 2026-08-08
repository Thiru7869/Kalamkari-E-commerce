'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { QuantityStepper } from '@/components/ui/primitives';
import { updateCartItem, removeCartItem } from '@/app/actions/cart';

export function CartLineControls({
  itemId,
  quantity,
  maxQuantity,
  disabled,
}: {
  itemId: string;
  quantity: number;
  maxQuantity: number;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const setQuantity = (next: number) => {
    startTransition(async () => {
      const result = await updateCartItem(itemId, next);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  };

  const remove = () => {
    startTransition(async () => {
      const result = await removeCartItem(itemId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('Removed from your bag');
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Hidden for one-of-one pieces, where a stepper is meaningless. */}
      {maxQuantity > 1 && !disabled && (
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          max={maxQuantity}
          disabled={pending}
        />
      )}

      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="inline-flex h-9 items-center gap-1.5 rounded-sm px-2 text-sm text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Remove
      </button>
    </div>
  );
}
