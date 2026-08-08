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
 * `system` is the default because a visitor who has told their operating system
 * how they want to read has already answered this question. The toggle exists
 * for the ones who want to override it on this site specifically.
 *
 * `disableTransitionOnChange` stops every colour-carrying element on the page
 * animating at once when the theme flips — with the transitions this site uses
 * on hover states, that reads as a glitch rather than a flourish.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}
