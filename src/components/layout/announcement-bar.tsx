'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { announcements } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * The moving bar above the header.
 *
 * Three things keep this on the right side of the line between "useful" and
 * "the thing everybody blocks":
 *
 *  1. **It stops when you look at it.** Hovering pauses it, and so does
 *     focusing anything inside it — a moving target you cannot read or click
 *     is worse than a static one you can.
 *  2. **Under reduced motion it does not move at all.** It becomes a plain
 *     centred line that rotates every few seconds instead, which carries the
 *     same messages without the scroll.
 *  3. **It closes, and stays closed.** Dismissal is remembered, so it is not
 *     an interruption repeated on every page.
 *
 * The track is rendered twice and translated by exactly half its width, which
 * is what makes the loop seamless; the duplicate is hidden from assistive
 * technology so the messages are announced once.
 */
export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [rotating, setRotating] = useState(0);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // The reduced-motion fallback: rotate rather than scroll.
  useEffect(() => {
    if (!reduced || dismissed) return;
    const id = window.setInterval(
      () => setRotating((i) => (i + 1) % announcements.length),
      6000,
    );
    return () => window.clearInterval(id);
  }, [reduced, dismissed]);

  if (dismissed) return null;

  const close = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem('svl_announce', '1');
      // Keep the pre-paint script and this component in agreement, so a client
      // navigation does not bring the bar back for the rest of the session.
      document.documentElement.dataset.announce = 'closed';
    } catch {
      /* Storage unavailable. It closes for this page load and that is enough. */
    }
  };

  return (
    <div
      // Rendered on the server and hidden before paint by the inline script in
      // the layout when it has been dismissed. Deciding this in an effect
      // instead would either shift the whole page down 36px on every first
      // load, or flash the bar at everyone who has already closed it.
      data-announce-bar
      className="relative flex h-9 items-center overflow-hidden border-b border-border/60 bg-kasim-900 text-cotton-200"
    >
      {reduced ? (
        <p
          className="flex-1 px-12 text-center text-[0.6875rem] uppercase tracking-[0.14em]"
          aria-live="off"
        >
          {announcements[rotating]}
        </p>
      ) : (
        <div
          className={cn(
            'group flex min-w-full shrink-0 select-none',
            // Pausing on hover *or* on focus-within: a keyboard user tabbing
            // into the bar needs it to stop for exactly the same reason.
            'hover:[&>*]:[animation-play-state:paused] focus-within:[&>*]:[animation-play-state:paused]',
          )}
          style={{ ['--marquee-duration' as string]: `${announcements.length * 7}s` }}
        >
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              // The duplicate exists only to make the loop seamless.
              aria-hidden={copy === 1}
              className="flex shrink-0 items-center gap-10 whitespace-nowrap pr-10 motion-safe:animate-marquee"
            >
              {announcements.map((message) => (
                <li
                  key={message}
                  className="flex items-center gap-10 text-[0.6875rem] uppercase tracking-[0.14em]"
                >
                  {message}
                  <span className="text-myrobalan-400/60" aria-hidden="true">
                    ·
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      )}

      {/* Fades at the edges so text enters and leaves rather than being cut. */}
      {!reduced && (
        <>
          <span
            className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-kasim-900 to-transparent"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute inset-y-0 right-9 w-10 bg-gradient-to-l from-kasim-900 to-transparent"
            aria-hidden="true"
          />
        </>
      )}

      <button
        type="button"
        onClick={close}
        className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center bg-kasim-900 text-cotton-200/70 transition-colors hover:text-cotton-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cotton-100/60"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">Close announcements</span>
      </button>
    </div>
  );
}
