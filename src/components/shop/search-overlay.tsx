'use client';

import dynamic from 'next/dynamic';
import { useState, startTransition } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { useIdlePreload, useOpener } from '@/components/ui/use-opener';

const loadPanel = () => import('./search-overlay-panel');
const SearchOverlayPanel = dynamic(() => loadPanel().then((m) => m.SearchOverlayPanel), {
  ssr: false,
});

/**
 * Search, opened over the page rather than instead of the page. The panel (a
 * Radix Dialog, the live lookup and the suggestions) lives in
 * `search-overlay-panel` and is requested when the trigger is first approached
 * or pressed — see there for why it opens in place.
 */
export function SearchOverlay({
  children,
  className,
}: {
  /** The trigger. Rendered as-is via `asChild` semantics. */
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { remember, restore } = useOpener();
  useIdlePreload(loadPanel);

  return (
    <>
      <Slot
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
        onPointerEnter={loadPanel}
        onTouchStart={loadPanel}
        onFocus={loadPanel}
        onClick={(event) => {
          remember(event);
          startTransition(() => {
            setMounted(true);
            setOpen(true);
          });
        }}
      >
        {children}
      </Slot>
      {mounted && <SearchOverlayPanel open={open} setOpen={setOpen} onCloseAutoFocus={restore} />}
    </>
  );
}
