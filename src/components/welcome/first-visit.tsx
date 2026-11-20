'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Sequences the loading frame and the doorway.
 *
 *   preloader  →  welcome  →  the site
 *
 * Both are code-split and none is requested twice in a session, so the
 * overwhelming majority of page views inside a visit pay nothing for any of
 * them.
 *
 * Persistence is **sessionStorage**, not localStorage. Two reasons: the store
 * asked for the welcome to return on a new visit, and — more practically — a
 * localStorage flag written during development is invisible and permanent, and
 * is exactly why the welcome appeared to have stopped working.
 *
 * Rules:
 *  - Nothing appears until after mount. Reading storage during render is a
 *    hydration mismatch, and a doorway that flashes for a returning visitor is
 *    worse than none.
 *  - Nothing appears on checkout, the account pages or admin. Interrupting
 *    somebody mid-purchase to introduce the shop is indefensible.
 *  - A visitor who is already scrolled is reading, not arriving; they get
 *    straight through.
 */

const Preloader = dynamic(() => import('./preloader').then((m) => m.Preloader), {
  ssr: false,
});

const WelcomeOverlay = dynamic(
  () => import('./welcome-overlay').then((m) => m.WelcomeOverlay),
  { ssr: false },
);

const SEEN_KEY = 'svl_intro';

/** Routes where an interruption is never acceptable. */
const SUPPRESSED = ['/checkout', '/admin', '/account', '/signin', '/orders'];

type Phase = 'idle' | 'preloader' | 'welcome' | 'done';

function seen(step: string) {
  try {
    return window.sessionStorage.getItem(`${SEEN_KEY}_${step}`) === '1';
  } catch {
    // Private browsing with storage disabled. Treat as seen rather than
    // replaying the whole sequence on every navigation.
    return true;
  }
}

function remember(step: string) {
  try {
    window.sessionStorage.setItem(`${SEEN_KEY}_${step}`, '1');
  } catch {
    /* Storage unavailable — nothing to do, and nothing worth failing over. */
  }
}

export function FirstVisit() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    if (phase !== 'idle') return;

    if (SUPPRESSED.some((prefix) => pathname.startsWith(prefix))) {
      setPhase('done');
      return;
    }

    // Deep-linked and already reading: do not interrupt.
    if (window.scrollY > 200) {
      setPhase('done');
      return;
    }

    if (!seen('preloader')) {
      setPhase('preloader');
      return;
    }
    if (!seen('welcome')) {
      setPhase('welcome');
      return;
    }
    setPhase('done');
  }, [pathname, phase]);

  const finishPreloader = useCallback(() => {
    remember('preloader');
    setPhase(seen('welcome') ? 'done' : 'welcome');
  }, []);

  const finishWelcome = useCallback(() => {
    remember('welcome');
    setPhase('done');
  }, []);

  if (phase === 'preloader') return <Preloader onDone={finishPreloader} />;
  if (phase === 'welcome') return <WelcomeOverlay onClose={finishWelcome} />;

  return null;
}
