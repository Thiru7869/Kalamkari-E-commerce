'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { useIdlePreload, useOpener } from '@/components/ui/use-opener';

const loadPanel = () => import('./mobile-menu-panel');
const MobileMenuPanel = dynamic(() => loadPanel().then((m) => m.MobileMenuPanel), { ssr: false });

/**
 * The menu button. The drawer behind it (a Radix Dialog with its focus and
 * scroll locks) is not part of the page's JavaScript: it is requested when a
 * finger or pointer first approaches the button, or when it is pressed.
 */
export function MobileMenu({ isSignedIn }: { isSignedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { remember, restore } = useOpener();
  useIdlePreload(loadPanel);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  // The sticky header reads this to stay put while the drawer is open.
  useEffect(() => {
    if (open) document.body.setAttribute('data-menu-open', '');
    else document.body.removeAttribute('data-menu-open');
    return () => document.body.removeAttribute('data-menu-open');
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onPointerEnter={loadPanel}
        onTouchStart={loadPanel}
        onFocus={loadPanel}
        onClick={(event) => {
          remember(event);
          setMounted(true);
          setOpen(true);
        }}
        className="inline-flex h-11 w-11 items-center justify-center rounded-sm transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Open menu</span>
      </button>
      {mounted && <MobileMenuPanel isSignedIn={isSignedIn} open={open} onOpenChange={setOpen} onCloseAutoFocus={restore} />}
    </>
  );
}
