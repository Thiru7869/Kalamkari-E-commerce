'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { WELCOME_VERSION, TOUR_VERSION } from '@/content/welcome';

/**
 * Sequences the doorway and the walk-through.
 *
 * Both are code-split and never requested for a returning visitor, so the
 * overwhelming majority of page loads pay nothing for either.
 *
 * Rules:
 *  - Neither appears until after mount. Reading localStorage during render is
 *    a hydration mismatch, and a welcome that flashes for returning visitors
 *    is worse than none.
 *  - Neither appears on checkout, the account pages or admin. Interrupting
 *    somebody mid-purchase to introduce the shop is indefensible.
 *  - Dismissal is versioned, so the copy can be changed later without either
 *    being stuck shut forever.
 *  - A visitor who has already scrolled is past the doorway. Showing it then
 *    would be an interruption rather than a greeting.
 */

const WelcomeOverlay = dynamic(
  () => import('./welcome-overlay').then((m) => m.WelcomeOverlay),
  { ssr: false },
);

const QuickTour = dynamic(() => import('./quick-tour').then((m) => m.QuickTour), {
  ssr: false,
});

const WELCOME_KEY = 'svl_welcome';
const TOUR_KEY = 'svl_tour';

/** Routes where an interruption is never acceptable. */
const SUPPRESSED = ['/checkout', '/admin', '/account', '/signin', '/orders'];

type Phase = 'idle' | 'welcome' | 'tour' | 'done';

function seen(key: string, version: string) {
  try {
    return window.localStorage.getItem(key) === version;
  } catch {
    // Private browsing with storage disabled. Treat as seen rather than
    // showing the overlay on every single page load.
    return true;
  }
}

function remember(key: string, version: string) {
  try {
    window.localStorage.setItem(key, version);
  } catch {
    /* Storage unavailable — nothing to do, and nothing worth failing over. */
  }
}

export function FirstVisit() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    if (SUPPRESSED.some((prefix) => pathname.startsWith(prefix))) return;
    if (phase !== 'idle') return;

    // Deep-linked and already reading: do not interrupt.
    if (window.scrollY > 200) {
      setPhase('done');
      return;
    }

    if (!seen(WELCOME_KEY, WELCOME_VERSION)) {
      setPhase('welcome');
      return;
    }

    if (!seen(TOUR_KEY, TOUR_VERSION)) {
      setPhase('tour');
      return;
    }

    setPhase('done');
  }, [pathname, phase]);

  if (phase === 'welcome') {
    return (
      <WelcomeOverlay
        onClose={() => {
          remember(WELCOME_KEY, WELCOME_VERSION);
          // Straight into the tour, as asked — but only if it has not already
          // been taken and dismissed.
          setPhase(seen(TOUR_KEY, TOUR_VERSION) ? 'done' : 'tour');
        }}
      />
    );
  }

  if (phase === 'tour') {
    return (
      <QuickTour
        onClose={() => {
          remember(TOUR_KEY, TOUR_VERSION);
          setPhase('done');
        }}
      />
    );
  }

  return null;
}
