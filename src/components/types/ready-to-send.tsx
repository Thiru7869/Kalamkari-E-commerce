'use client';

import { useEffect, useRef, useState } from 'react';
import { ProductCard } from '@/components/shop/product-card';
import { Button } from '@/components/ui/button';
import type { ProductCardData } from '@/lib/queries';

const FIRST = 8;
const STEP = 16;

/**
 * The first things a buyer sees: pieces that can be sent today, mixed across
 * every cloth the page covers rather than ordered by cloth.
 *
 * Eight to begin with and sixteen more on request, in place — no navigation, no
 * reload. The list is chosen on the server (one piece from each cloth in turn)
 * and arrives here already ordered, so this component only decides how much of
 * it to show.
 *
 * Accessibility: the button announces how many more it will reveal, a polite
 * status line says how many are showing, and focus moves to the first newly
 * revealed card so a keyboard or screen-reader user continues from where the
 * new content starts instead of being left on a button that has moved.
 */
export function ReadyToSend({
  products,
  wishlistIds,
  label,
}: {
  products: ProductCardData[];
  wishlistIds: string[];
  label: string;
}) {
  const [shown, setShown] = useState(Math.min(FIRST, products.length));
  const listRef = useRef<HTMLUListElement>(null);
  const focusIndex = useRef<number | null>(null);
  const wished = new Set(wishlistIds);

  useEffect(() => {
    if (focusIndex.current == null) return;
    const links = listRef.current?.querySelectorAll<HTMLElement>('li a');
    const target = links
      ? [...links].find((a) => a.closest('li')?.getAttribute('data-index') === String(focusIndex.current))
      : undefined;
    target?.focus({ preventScroll: false });
    focusIndex.current = null;
  }, [shown]);

  const remaining = products.length - shown;
  const nextBatch = Math.min(STEP, remaining);

  return (
    <div>
      <ul
        ref={listRef}
        className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5"
      >
        {products.slice(0, shown).map((product, i) => (
          <li key={product.id} data-index={i} className="flex">
            <ProductCard
              product={product}
              wishlisted={wished.has(product.id)}
              priority={i < 4}
              className="w-full"
              sizes="(min-width: 1024px) 23vw, (min-width: 768px) 31vw, 48vw"
            />
          </li>
        ))}
      </ul>

      <div className="mt-9 flex flex-col items-center gap-3 border-t border-border pt-7">
        <p role="status" className="tabular text-sm text-muted-foreground">
          Showing {shown} of {products.length} {label.toLowerCase()} ready to send
        </p>
        {remaining > 0 && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              focusIndex.current = shown;
              setShown(shown + nextBatch);
            }}
          >
            View {nextBatch} more
          </Button>
        )}
      </div>
    </div>
  );
}
