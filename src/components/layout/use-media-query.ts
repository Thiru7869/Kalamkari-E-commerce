'use client';

import { useEffect, useState } from 'react';

/**
 * A media query, kept in sync.
 *
 * Subscribed rather than sampled: a query read once on mount is wrong as soon
 * as the device is rotated, the window is resized, or — for preference queries
 * like `prefers-reduced-motion` — the visitor changes their mind in system
 * settings without reloading the page.
 *
 * Returns `false` until mounted, because the server cannot know the answer and
 * guessing produces a hydration mismatch. Callers that need to render
 * something either way should treat `false` as "not yet known" and default to
 * the safer branch.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    setMatches(list.matches);

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
