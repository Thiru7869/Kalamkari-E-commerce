'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
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
