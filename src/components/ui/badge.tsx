import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/*
  Deliberately not a client module. `primitives.tsx` is `'use client'`, so a
  server component that imported Badge from it turned the whole file — every
  Radix primitive — into client JavaScript just to print a label. Badge has no
  state, so it lives here and server pages and components import it directly.
*/

/* Badge                                                                       */
/* -------------------------------------------------------------------------- */

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-label font-medium uppercase tracking-[0.08em]',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/10 text-chay-700 dark:text-chay-300',
        indigo: 'border-transparent bg-accent/10 text-indigo-700 dark:text-indigo-300',
        outline: 'border-foreground/25 text-foreground',
        muted: 'border-transparent bg-muted text-muted-foreground',
        gold: 'border-myrobalan-600/40 bg-myrobalan-100 text-myrobalan-800 dark:bg-myrobalan-950 dark:text-myrobalan-200',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
