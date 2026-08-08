'use client';

import { useEffect, useState } from 'react';

/**
 * A phrase that types itself, holds, deletes, and moves to the next.
 *
 * Used for the search placeholder, where a static hint can only ever suggest
 * one way in. Cycling through the real dimensions the catalogue is searchable
 * by — the kinds of piece, then the cloths, then the motifs — teaches the
 * shape of the search without a line of instructional copy.
 *
 * Two rules keep it calm rather than busy:
 *
 *  - It stops completely under `prefers-reduced-motion`, and under it the hook
 *    returns the first phrase whole. A placeholder that animates is decorative;
 *    the words themselves are the information, and those are never lost.
 *  - It stops while the field is focused. Text moving underneath a cursor
 *    somebody is typing into is the definition of a distraction.
 */
export function useTypewriter(
  phrases: readonly string[],
  { active = true }: { active?: boolean } = {},
) {
  const [text, setText] = useState(phrases[0] ?? '');
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!active || reduced || phrases.length === 0) {
      setText(phrases[0] ?? '');
      return;
    }

    let phrase = 0;
    let chars = 0;
    let deleting = false;
    let timer: number;

    const tick = () => {
      const full = phrases[phrase];

      if (!deleting) {
        chars += 1;
        setText(full.slice(0, chars));

        if (chars === full.length) {
          deleting = true;
          // Two seconds to read it, as asked.
          timer = window.setTimeout(tick, 2000);
          return;
        }
        // Slight jitter so it reads as typing rather than as a metronome.
        timer = window.setTimeout(tick, 55 + Math.random() * 45);
        return;
      }

      chars -= 1;
      setText(full.slice(0, chars));

      if (chars === 0) {
        deleting = false;
        phrase = (phrase + 1) % phrases.length;
        timer = window.setTimeout(tick, 320);
        return;
      }
      // Deleting is always faster than typing; the reverse feels broken.
      timer = window.setTimeout(tick, 26);
    };

    timer = window.setTimeout(tick, 700);
    return () => window.clearTimeout(timer);
  }, [phrases, active, reduced]);

  return text;
}
