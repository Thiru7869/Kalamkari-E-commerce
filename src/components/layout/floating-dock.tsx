'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { BackToTop } from './back-to-top';
import { useScrollDirection } from './use-scroll-direction';
import { useMediaQuery } from './use-media-query';
import { cn } from '@/lib/utils';

/**
 * The one fixed cluster in the bottom-right corner.
 *
 * Both floating controls live here rather than positioning themselves
 * independently, because two independently-fixed elements is exactly how a
 * site ends up with a chat button sitting on top of a back-to-top button on
 * one particular viewport width. One column, one z-index, one set of safe-area
 * offsets.
 *
 * The column itself is pointer-transparent so it never blocks the page behind
 * it; each control re-enables pointer events for its own box.
 */

// The assistant pulls in a transcript, a streaming parser and its own icons.
// None of that is needed for first paint, and it is never open on load.
const KalamAssistant = dynamic(
  () => import('@/components/assistant/kalam-assistant').then((m) => m.KalamAssistant),
  { ssr: false },
);

/** Routes where a floating chat launcher would be in the way, not helpful. */
const SUPPRESSED_PREFIXES = ['/admin', '/checkout'];

export function FloatingDock() {
  const pathname = usePathname();
  const direction = useScrollDirection();
  // Matches the `md` breakpoint the tab bar uses, and stays in sync on rotate.
  const isCompact = useMediaQuery('(max-width: 767px)');

  const suppressed = SUPPRESSED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (suppressed) return null;

  /*
    On a phone the tab bar already occupies the bottom of the screen
    permanently — correctly, because a navigation bar you cannot rely on is
    not a navigation bar. Stacking the dock above it costs another ~48px of a
    viewport that is mostly cloth, so the dock is the thing that yields: it
    drops away while the reader is moving down the page and returns the moment
    they scroll back up or stop. Nothing is lost, because both controls are
    for going somewhere other than forward.

    On desktop there is no tab bar and no shortage of room, so it stays put.
  */
  const retracted = isCompact && direction === 'down';

  return (
    <div
      className={cn(
        // Sits above the phone tab bar; clears the safe area on both axes.
        'pointer-events-none fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-40',
        'flex flex-col items-end gap-3 md:bottom-6 md:right-6',
        'transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none',
        retracted ? 'translate-y-[calc(100%+5rem)] opacity-0' : 'translate-y-0 opacity-100',
      )}
      // Keyboard users must not be able to tab into a control that has slid
      // off the screen.
      inert={retracted ? true : undefined}
    >
      <BackToTop />
      <KalamAssistant />
    </div>
  );
}
