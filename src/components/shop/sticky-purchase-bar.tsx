'use client';

import { useEffect, useState } from 'react';
import { AddToCart } from './add-to-cart';
import { cn } from '@/lib/utils';

/**
 * The phone purchase bar: price and the one action, while the real buttons are
 * out of sight.
 *
 * It adds to the bag through `AddToCart` (compact), so there is one cart call,
 * one toast and one refresh. Pieces here have no size or colour options — the
 * only choice is a quantity on the rare piece with more than one in stock — so
 * the bar adds one, and the stepper stays on the page.
 *
 * It appears only when the page's own purchase block (`#purchase`) has scrolled
 * out of view, and steps aside again at the footer so it never covers it.
 * It sits directly above the bottom tab bar (4.25rem tall) and below every
 * dialog, the lightbox and the header's menu. Hidden from `md` up, where the
 * purchase block is sticky beside the gallery.
 */
export function StickyPurchaseBar({
  productId,
  stock,
  priceLabel,
  compareLabel,
}: {
  productId: string;
  stock: number;
  priceLabel: string;
  compareLabel?: string;
}) {
  const [purchaseVisible, setPurchaseVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const purchase = document.getElementById('purchase');
    const footer = document.querySelector('footer');
    if (!purchase || typeof IntersectionObserver === 'undefined') return;

    const a = new IntersectionObserver(([e]) => setPurchaseVisible(e.isIntersecting));
    a.observe(purchase);

    let b: IntersectionObserver | undefined;
    if (footer) {
      b = new IntersectionObserver(([e]) => setFooterVisible(e.isIntersecting));
      b.observe(footer);
    }
    return () => {
      a.disconnect();
      b?.disconnect();
    };
  }, []);

  const shown = !purchaseVisible && !footerVisible;

  return (
    <div
      // `inert` while hidden: nobody tabs into a bar that is off screen.
      inert={shown ? undefined : true}
      className={cn(
        'fixed inset-x-0 z-30 border-t border-border bg-background md:hidden',
        'bottom-[calc(4.25rem+1px+env(safe-area-inset-bottom))]',
        'transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none',
        shown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0',
      )}
    >
      <div className="container flex items-center gap-3 py-2.5">
        <div className="min-w-0">
          <p className="tabular font-display text-xl leading-none">{priceLabel}</p>
          {compareLabel && (
            <p className="tabular mt-1 text-xs leading-none text-muted-foreground line-through">
              {compareLabel}
            </p>
          )}
        </div>
        <AddToCart compact productId={productId} stock={stock} className="ml-auto min-w-[10rem] flex-1 sm:flex-none" />
      </div>
    </div>
  );
}
