'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';

/**
 * Light and dark.
 *
 * The two palettes are not a light one and an inverted copy: the dark theme is
 * defined independently in globals.css as "the store at night, or an indigo
 * vat", with madder lifted in value so it still reads against a dark ground.
 * Both are sampled from the same dyes.
 *
 * `light` is the default, regardless of the operating system's preference: the
 * store is first met in daylight cotton. The toggle lets a visitor opt into
 * dark, and that choice is remembered.
 *
 * Transitions are suppressed while the theme flips by `ThemeToggle`, not by
 * the provider: the provider's own option also ran on every page load.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      {children}
    </NextThemeProvider>
  );
}
