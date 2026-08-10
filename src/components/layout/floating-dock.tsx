'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { BackToTop } from './back-to-top';
import { WhatsAppFloat } from './whatsapp-float';
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
const StoreAssistant = dynamic(
  () => import('@/components/assistant/store-assistant').then((m) => m.StoreAssistant),
  { ssr: false },
);

/**
 * The only place the assistant does not appear.
 *
 * Admin is a different application wearing the same layout — a staff order
 * list, not a page of the shop — and the assistant knows nothing about it. It
 * would answer questions about sarees to somebody trying to refund one.
 *
 * Checkout used to be on this list, on the reasoning that a chat launcher
 * interrupts a purchase. It is off it now: the questions that stop a checkout
 * are "is this actually in stock", "how long will it take" and "can it ship
 * there", and the assistant answers all three from the same notes the family
 * wrote. Somewhere to ask at the moment of doubt is worth more than a clear
 * corner, and the dock already yields on a phone the moment the visitor
 * scrolls down.
 *
 * Back-to-top is not suppressed anywhere at all: every one of these pages is
 * long enough to need it, and unlike the assistant it never covers anything.
 */
const ASSISTANT_SUPPRESSED = ['/admin'];

/**
 * Where the next step is a conversation rather than a purchase.
 *
 * WhatsApp *joins* the assistant on these rather than replacing it. They are
 * two different offers — one reaches the family, the other answers now — and
 * the column below stacks them with a gap, so the old worry about two floating
 * buttons landing on top of each other does not apply to a flex column.
 */
const WHATSAPP_ROUTES = ['/journal', '/contact', '/custom'];

export function FloatingDock() {
  const pathname = usePathname();
  const direction = useScrollDirection();
  // Matches the `md` breakpoint the tab bar uses, and stays in sync on rotate.
  const isCompact = useMediaQuery('(max-width: 767px)');

  const wantsWhatsApp = WHATSAPP_ROUTES.some((prefix) => pathname.startsWith(prefix));
  const assistantSuppressed = ASSISTANT_SUPPRESSED.some((prefix) => pathname.startsWith(prefix));

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
      )}
    >
      {/*
        Back-to-top does not retract.

        It used to sit inside the sliding group with the other two, which meant
        it was hidden by exactly the gesture that earns it: scrolling down. A
        reader eleven screens into /process — the case the control exists for —
        could only summon it by first scrolling up, which is the thing they
        wanted the button to do. It appears after a viewport and a half of
        travel and is 48px, so there is no cost to leaving it there.

        It also carries no transform of its own, so nothing here becomes a
        containing block for a `position: fixed` descendant.
      */}
      <BackToTop />

      {/*
        These two do retract on a phone, and should.

        Both are offers rather than navigation, and both are wide enough to
        cover the page. The tab bar already owns the bottom of a phone screen
        permanently; a reader moving down the page gets the column out of the
        way, and it returns the moment they stop or scroll back.

        The transform lives on this inner wrapper, not on the column above,
        because the assistant's panel is `position: fixed` and a transformed
        ancestor would become its containing block — which is precisely how the
        chat sheet came to open 48px wide. The panel is portalled to <body> as
        well, so this is belt and braces rather than the only guard.
      */}
      <div
        className={cn(
          'pointer-events-none flex flex-col items-end gap-3',
          'transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none',
          retracted ? 'translate-y-[calc(100%+5rem)] opacity-0' : 'translate-y-0 opacity-100',
        )}
        // Keyboard users must not be able to tab into a control that has slid
        // off the screen.
        inert={retracted ? true : undefined}
      >
        {wantsWhatsApp && <WhatsAppFloat />}
        {!assistantSuppressed && <StoreAssistant />}
      </div>
    </div>
  );
}
