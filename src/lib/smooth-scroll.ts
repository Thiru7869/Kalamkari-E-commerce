import type Lenis from 'lenis';

/**
 * A one-instance registry for the Lenis scroller.
 *
 * Lenis is mounted once, in SmoothScrollProvider, and owns the page's scroll
 * position. Anything that wants to move the page — the back-to-top button, an
 * in-page anchor, the process chapter rail — has to go through the same
 * instance, or it fights it: `window.scrollTo({ behavior: 'smooth' })` and
 * Lenis both animate the same scrollTop and produce a visible stutter.
 *
 * It is a module singleton rather than a React context on purpose. The
 * consumers are leaf components scattered across the tree (some of them inside
 * portals), and none of them should force a re-render when the scroller is
 * registered.
 */

let instance: Lenis | null = null;

export function registerLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis() {
  return instance;
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export type ScrollOptions = {
  /** Pixels of breathing room above the target. Defaults to clearing the header. */
  offset?: number;
  /** Jump with no animation. Always used under reduced motion. */
  immediate?: boolean;
};

/** Height of the sticky header, so an anchored target is never hidden under it. */
const HEADER_CLEARANCE = 96;

export function scrollToTop(options: ScrollOptions = {}) {
  scrollTo(0, options);
}

export function scrollTo(target: number | string | HTMLElement, options: ScrollOptions = {}) {
  const immediate = options.immediate ?? prefersReducedMotion();
  const offset = options.offset ?? -HEADER_CLEARANCE;

  const lenis = instance;
  if (lenis) {
    lenis.scrollTo(target, {
      offset,
      immediate,
      duration: 1.1,
      // Slightly longer tail than the wheel easing: a deliberate jump should
      // read as travel, so the reader keeps their place on the page.
      easing: (t: number) => 1 - Math.pow(1 - t, 3.2),
    });
    return;
  }

  // No Lenis (reduced motion, or before mount): native scrolling.
  const behavior: ScrollBehavior = immediate ? 'auto' : 'smooth';
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior });
    return;
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior });
}
