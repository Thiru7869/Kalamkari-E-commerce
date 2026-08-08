'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { BackToTop } from './back-to-top';

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
const SUPPRESSED_PREFIXES = ['/admin', '/checkout', '/custom/editor'];

export function FloatingDock() {
  const pathname = usePathname();

  const suppressed = SUPPRESSED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (suppressed) return null;

  return (
    <div
      className={
        // Sits above the phone tab bar; clears the safe area on both axes.
        'pointer-events-none fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-40 ' +
        'flex flex-col items-end gap-3 md:bottom-6 md:right-6'
      }
    >
      <BackToTop />
      <KalamAssistant />
    </div>
  );
}
