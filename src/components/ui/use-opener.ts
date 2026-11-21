import { useEffect, useRef } from 'react';

/**
 * Hands focus back to whatever opened a lazily mounted dialog.
 *
 * Radix returns focus to its own `Dialog.Trigger`. The panels here have none —
 * the button that opens them is a separate, always-loaded shell — so without
 * this, closing a panel drops focus on `<body>` and a keyboard or switch user
 * starts again from the top of the page.
 */
export function useOpener() {
  const opener = useRef<HTMLElement | null>(null);
  return {
    remember: (event: React.SyntheticEvent) => {
      opener.current = event.currentTarget as HTMLElement;
    },
    restore: (event: Event) => {
      event.preventDefault();
      opener.current?.focus();
    },
  };
}

/**
 * Fetches a lazily loaded panel once the page has settled.
 *
 * Preloading on pointer or touch is too late for a tap: the finger is already
 * down, and on a slow phone the first press spent over a second waiting for the
 * chunk to arrive and run. Waiting for `load` plus a pause, then an idle
 * moment, keeps the download and parse out of the first paint and out of the
 * interactive window, and still has it ready before anybody reaches for the
 * button. Data Saver is respected.
 */
export function useIdlePreload(load: () => Promise<unknown>) {
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    let timer = 0;
    let idle = 0;
    const start = () => {
      timer = window.setTimeout(() => {
        const run = () => void load().catch(() => undefined);
        if ('requestIdleCallback' in window) idle = window.requestIdleCallback(run, { timeout: 4000 });
        else run();
      }, 2500);
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      window.removeEventListener('load', start);
      window.clearTimeout(timer);
      if (idle && 'cancelIdleCallback' in window) window.cancelIdleCallback(idle);
    };
    // `load` is a module-level function in every caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
