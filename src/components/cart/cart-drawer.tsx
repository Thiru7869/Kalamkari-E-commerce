'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useIdlePreload } from '@/components/ui/use-opener';
import { CART_OPEN_EVENT, type CartOpenDetail } from './cart-events';
import type { CartSummary } from '@/lib/totals';

const loadPanel = () => import('./cart-drawer-panel');
const CartDrawerPanel = dynamic(() => loadPanel().then((m) => m.CartDrawerPanel), { ssr: false });

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
  useIdlePreload(loadPanel);
  const [open, setOpen] = useState(false);
  // The panel is not even requested until the first time the bag is opened.
  const [mounted, setMounted] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const suppressed = SUPPRESSED.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (suppressed) return;
    const onOpen = (event: Event) => {
      (event as CustomEvent<CartOpenDetail>).detail.handled = true;
      setWaiting(true);
      setMounted(true);
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

  if (!mounted) return null;
  return <CartDrawerPanel cart={cart} open={open} onOpenChange={setOpen} waiting={waiting} />;
}
