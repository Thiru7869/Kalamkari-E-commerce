'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/primitives';
import { CartLineControls } from './cart-line-controls';
import { CART_OPEN_EVENT, type CartOpenDetail } from './cart-events';
import type { CartSummary } from '@/lib/totals';
import { formatPrice } from '@/lib/utils';

/** Pages where the bag is already on screen, or must not be interrupted. */
const SUPPRESSED = ['/cart', '/checkout', '/admin', '/signin'];

/**
 * The bag, as a side panel that opens after "Add to bag".
 *
 * It holds no cart state. `cart` is the server's reading, re-sent every time a
 * cart action calls `router.refresh()`; quantities and removal go through the
 * same `CartLineControls` the bag page uses. When it opens straight after an
 * add, the refresh may not have landed yet, so it says "Updating" until the
 * `cart` prop changes (or a few seconds pass) rather than showing a bag that is
 * one piece short.
 */
export function CartDrawer({ cart }: { cart: CartSummary }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const suppressed = SUPPRESSED.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (suppressed) return;
    const onOpen = (event: Event) => {
      (event as CustomEvent<CartOpenDetail>).detail.handled = true;
      setWaiting(true);
      setOpen(true);
    };
    window.addEventListener(CART_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CART_OPEN_EVENT, onOpen);
  }, [suppressed]);

  // Fresh data has arrived.
  useEffect(() => setWaiting(false), [cart]);

  // Never wait forever if the refresh produced an identical reading.
  useEffect(() => {
    if (!waiting) return;
    const t = window.setTimeout(() => setWaiting(false), 3000);
    return () => window.clearTimeout(t);
  }, [waiting]);

  // Navigating anywhere closes it.
  useEffect(() => setOpen(false), [pathname]);

  const soldOut = cart.lines.filter((l) => l.stock < 1);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent side="right" className="flex flex-col gap-0 p-0" closeLabel="Close bag">
        <DialogTitle className="border-b border-border px-5 py-4 pr-14 font-display text-lg">
          Your bag
          {cart.itemCount > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {cart.itemCount} {cart.itemCount === 1 ? 'piece' : 'pieces'}
            </span>
          )}
        </DialogTitle>
        <DialogDescription className="sr-only">
          The pieces in your bag, with a way to change them or go on to checkout
        </DialogDescription>

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-display text-lg">Your bag is empty</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {waiting ? 'Updating your bag…' : 'Have a look at what is in the store now.'}
            </p>
            <Button asChild className="mt-6">
              <Link href="/shop">Browse the store</Link>
            </Button>
          </div>
        ) : (
          <>
            <div
              className="flex-1 overflow-y-auto overscroll-contain px-5"
              data-lenis-prevent
              aria-busy={waiting}
            >
              {waiting && (
                <p className="pt-3 text-xs text-muted-foreground" role="status">
                  Updating your bag…
                </p>
              )}
              <ul className="divide-y divide-border">
                {cart.lines.map((line) => (
                  <li key={line.id} className="flex gap-3 py-4">
                    <Link
                      href={`/product/${line.slug}`}
                      className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-sm bg-cotton-300"
                    >
                      <Image src={line.image} alt={line.name} fill sizes="64px" className="object-cover" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-display text-base leading-snug">
                          <Link href={`/product/${line.slug}`} className="hover:text-primary">
                            {line.name}
                          </Link>
                        </p>
                        <p className="tabular shrink-0 text-sm font-medium">
                          {formatPrice(line.price * line.quantity)}
                        </p>
                      </div>
                      {line.quantity > 1 && (
                        <p className="tabular mt-0.5 text-xs text-muted-foreground">
                          {formatPrice(line.price)} each
                        </p>
                      )}
                      {line.stock < 1 && (
                        <p className="mt-1 text-sm font-medium text-destructive">Sold</p>
                      )}
                      <div className="mt-2">
                        <CartLineControls
                          itemId={line.id}
                          quantity={line.quantity}
                          maxQuantity={Math.max(1, line.stock)}
                          disabled={line.stock < 1}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border bg-background px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {soldOut.length > 0 && (
                <p role="alert" className="mb-3 text-sm text-destructive">
                  {soldOut.map((l) => l.name).join(', ')} has sold. Remove it to continue.
                </p>
              )}
              <dl className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular font-medium">{formatPrice(cart.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="tabular">
                    {cart.shipping === 0 ? 'Included' : formatPrice(cart.shipping)}
                  </dd>
                </div>
              </dl>
              {cart.freeShippingGap > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatPrice(cart.freeShippingGap)} more for free shipping.
                </p>
              )}

              <div className="mt-4 grid gap-2">
                {soldOut.length > 0 ? (
                  <Button size="lg" disabled>
                    Remove sold pieces to continue
                  </Button>
                ) : (
                  <Button asChild size="lg">
                    <Link href="/checkout">
                      Checkout
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                )}
                <Button asChild size="lg" variant="outline">
                  <Link href="/cart">View full bag</Link>
                </Button>
                <DialogClose className="inline-flex min-h-[2.75rem] items-center justify-center rounded-sm text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Keep looking
                </DialogClose>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
