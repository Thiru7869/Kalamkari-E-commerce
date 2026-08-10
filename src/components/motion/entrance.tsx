import { cn } from '@/lib/utils';

/**
 * The page-load entrance, for content that is already on screen when the page
 * arrives.
 *
 * `RevealOnScroll` deliberately returns early for anything above the fold —
 * it hides the element in an effect, and an effect runs after a paint, so
 * using it on the hero would show the headline and then blink it away. That
 * left the top of every page as the one part with no entrance at all, which is
 * the part a visitor actually watches arrive.
 *
 * So this is a stylesheet animation and not a component with behaviour: no
 * `use client`, no effect, no observer, nothing to hydrate. The first keyframe
 * is in place before the first paint, which is the only way to fade something
 * in from zero without a flash of it at one.
 *
 * Two things it will not do:
 *
 *   - `step={0}` has no delay. The first item is usually the headline, which
 *     is usually the LCP element, and an element at `opacity: 0` is not
 *     eligible for LCP at all — a 300ms stagger on the wrong element buys a
 *     nice arrival and pays for it in the metric that decides whether anyone
 *     sees the page. Later steps cost nothing because they are not the LCP.
 *   - Under `prefers-reduced-motion` the class is not applied (`motion-safe:`),
 *     so the content is simply present. It is never hidden by a preference.
 */
export function Entrance({
  children,
  step = 0,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  /** Position in the stagger. 0 is immediate; each step adds 70ms. */
  step?: number;
  className?: string;
  as?: 'div' | 'p' | 'h1' | 'h2' | 'span' | 'li' | 'section';
}) {
  return (
    <Tag
      className={cn('motion-safe:animate-enter-rise', className)}
      style={step > 0 ? { animationDelay: `${step * 0.07}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
