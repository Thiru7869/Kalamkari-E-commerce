'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * The settle between pages.
 *
 * Deliberately an entrance only — no exit. An exit animation has to delay the
 * navigation to play, which makes every click on the site measurably slower to
 * satisfy something nobody asked for. This runs after the new page has already
 * committed, so it costs nothing and cannot hold anything up.
 *
 * It is also very small: eight pixels and 400ms. On a site whose pages are
 * mostly long-form reading, a large page transition reads as a slideshow. This
 * is punctuation — enough to tell the eye that the ground has changed.
 *
 * Skipped entirely on first load (that is the browser's job, and the hero
 * would flicker), under reduced motion, and for in-page anchor changes.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // The Web Animations API rather than a class: it cannot leave an inline
    // style behind if the component unmounts mid-flight, which is exactly what
    // happens when somebody clicks twice quickly.
    const animation = el.animate(
      [
        { opacity: 0, transform: 'translateY(8px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 400, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'none' },
    );

    return () => animation.cancel();
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
