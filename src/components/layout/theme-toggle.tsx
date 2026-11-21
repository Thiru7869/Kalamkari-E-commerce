'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Stops every transition for the moment the theme flips, so the whole page does
 * not animate between palettes at once (with the hover transitions this site
 * uses, that reads as a glitch).
 *
 * This lives here, not on the provider, on purpose. next-themes' own
 * `disableTransitionOnChange` also fires on *mount*, where the pre-paint script
 * has already set the class: it injected a `*` rule, forced a style recalc and
 * removed the rule again, which cost two near-full-document recalcs on every
 * page load for nothing. Here it runs only when somebody presses the button.
 */
function withoutTransitions(change: () => void) {
  const style = document.createElement('style');
  style.appendChild(
    document.createTextNode(
      '*,*::before,*::after{-webkit-transition:none!important;transition:none!important}',
    ),
  );
  document.head.appendChild(style);
  change();
  // React commits the new theme and next-themes applies the class in an effect;
  // the rule has to outlive both, or the flip animates after all.
  window.setTimeout(() => {
    window.getComputedStyle(document.body);
    style.remove();
  }, 120);
}

/**
 * The light/dark switch.
 *
 * Two details that matter more than they look:
 *
 *  - Nothing theme-dependent renders until after mount. The server has no way
 *    to know what the visitor's system preference is, so rendering a sun or a
 *    moon during SSR guarantees a flash of the wrong one. A fixed-size
 *    placeholder holds the space so the header does not shift when it resolves.
 *  - The control reports its state, not its action. `aria-pressed` plus a
 *    stable label ("Dark theme") tells a screen reader what is currently on;
 *    a label that changes between "switch to dark" and "switch to light" is
 *    read as a different control each time it is used.
 */
export function ThemeToggle({
  className,
  ...rest
}: { className?: string } & React.HTMLAttributes<HTMLButtonElement>) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  if (!mounted) {
    return (
      <span
        className={cn('inline-flex h-11 w-11 shrink-0', className)}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => withoutTransitions(() => setTheme(isDark ? 'light' : 'dark'))}
      aria-pressed={isDark}
      {...rest}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-sm transition-colors hover:bg-foreground/5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
    >
      {isDark ? (
        <Sun className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
      ) : (
        <Moon className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
      )}
      <span className="sr-only">Dark theme</span>
    </button>
  );
}
