'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import { setProductStatus, setProductStock } from '@/app/actions/admin';

/**
 * Inline stock / visibility editing. Split by `field` so each table cell owns
 * exactly one control and there is no shared form spanning the row.
 */
export function ProductAdminRow({
  productId,
  stock,
  status,
  field,
}: {
  productId: string;
  stock: number;
  status: string;
  field: 'stock' | 'status';
}) {
  const [stockValue, setStockValue] = useState(String(stock));
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (field === 'stock') {
    const commit = () => {
      const parsed = Number(stockValue);
      if (!Number.isInteger(parsed) || parsed < 0) {
        setStockValue(String(stock));
        toast.error('Stock must be a whole number, 0 or more.');
        return;
      }
      if (parsed === stock) return;

      startTransition(async () => {
        const result = await setProductStock(productId, parsed);
        if (!result.ok) {
          setStockValue(String(stock));
          toast.error(result.error);
          return;
        }
        toast.success(result.message);
        router.refresh();
      });
    };

    return (
      <>
        <label htmlFor={`stock-${productId}`} className="sr-only">
          Stock
        </label>
        <input
          id={`stock-${productId}`}
          type="number"
          min={0}
          max={999}
          value={stockValue}
          disabled={pending}
          onChange={(e) => setStockValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          className="tabular h-9 w-16 rounded-sm border border-input bg-card px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </>
    );
  }

  return (
    <>
      <label htmlFor={`status-${productId}`} className="sr-only">
        Visibility
      </label>
      <select
        id={`status-${productId}`}
        value={status}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          startTransition(async () => {
            const result = await setProductStatus(productId, next);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success(result.message);
            router.refresh();
          });
        }}
        className="h-9 rounded-sm border border-input bg-card px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="ACTIVE">Live</option>
        <option value="DRAFT">Draft</option>
        <option value="ARCHIVED">Archived</option>
      </select>
    </>
  );
}
