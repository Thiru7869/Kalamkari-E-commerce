'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Sticky header that hides on scroll-down and returns on scroll-up.
 *
 * Justification, since hiding chrome is easy to get wrong: on a phone the
 * header plus announcement bar is ~100px of a ~700px viewport, and this site
 * is mostly long reading and tall product photography. Returning it on any
 * upward scroll means it is never more than a flick away.
 *
 * It never hides while a menu is open, near the top of the page, or when the
 * user prefers reduced motion.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const delta = y - lastY.current;

        setScrolled(y > 8);

        // 6px deadzone absorbs trackpad jitter and iOS rubber-banding.
        if (Math.abs(delta) > 6) {
          const menuOpen = document.body.hasAttribute('data-menu-open');
          const next = delta > 0 && y > 160 && !menuOpen;
          setHidden(next);
          /*
            Publish the state to the document, for the sub-navbars.

            The shop and cloth rails are `sticky` under this header and have to
            know where its bottom edge currently is: pinned at a fixed `4rem`
            they leave a band of scrolling page above them the moment the header
            slides away, and the rail stops reading as attached to anything.

            A data attribute rather than context or a store, because the
            consumers are two leaf components several layers down in a different
            part of the tree, they need this on *every* scroll frame, and none
            of them should re-render for it. CSS reads it and moves them; React
            never hears about it. `globals.css` owns the offset itself, as
            `--subnav-top`.
          */
          document.documentElement.dataset.header = next ? 'hidden' : 'shown';
          lastY.current = y;
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full bg-background/95 backdrop-blur-md',
        'transition-[transform,box-shadow] duration-300 ease-out',
        scrolled && 'shadow-[0_1px_0_hsl(var(--border)),0_8px_24px_-16px_rgb(0_0_0/0.3)]',
        hidden && '-translate-y-full',
      )}
    >
      {children}
    </header>
  );
}
