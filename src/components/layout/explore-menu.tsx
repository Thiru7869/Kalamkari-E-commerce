'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useState, startTransition } from 'react';
import { Compass } from 'lucide-react';
import { useIdlePreload, useOpener } from '@/components/ui/use-opener';

const loadPanel = () => import('./explore-menu-panel');
const ExploreMenuPanel = dynamic(() => loadPanel().then((m) => m.ExploreMenuPanel), { ssr: false });

/**
 * Everything worth reading, in one panel.
 *
 * The header nav can hold six items before it stops being a nav, and this site
 * has considerably more than six things worth finding — the twenty-three
 * steps, the dye index, the care guide, the journal, the type pages. Rather
 * than growing the nav until it is a wall, one control opens the whole map.
 *
 * Ten sections, each with a line saying what it actually is. Grouped, because
 * an undifferentiated list of ten links is a list nobody reads to the bottom.
 */
export function ExploreMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { remember, restore } = useOpener();
  useIdlePreload(loadPanel);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

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
          startTransition(() => {
            setMounted(true);
            setOpen(true);
          });
        }}
        className="inline-flex h-11 items-center gap-1.5 rounded-sm px-2.5 text-sm transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
      >
        <Compass className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
        <span className="hidden sm:inline">Explore</span>
        <span className="sr-only sm:hidden">Explore the site</span>
      </button>
      {mounted && <ExploreMenuPanel open={open} onOpenChange={setOpen} onCloseAutoFocus={restore} />}
    </>
  );
}
