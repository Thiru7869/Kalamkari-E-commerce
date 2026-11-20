import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // 44px minimum touch target on every variant except `link` — this site is
  // used mostly on phones.
  /*
    The press.

    A 1px lift on hover and a return to zero on `:active` — the whole gesture
    is two pixels of travel, which is enough for the control to feel like it
    has a surface and far too little to move the layout. `transition-[…]`
    rather than `transition-all`: only colour and transform are animated, so a
    hover can never accidentally animate a width or a border and drop the
    frame rate on a page of forty of these.

    `motion-safe:` on the transform alone. Somebody who has asked for less
    motion still gets the colour change, which is the part that carries the
    information.
  */
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-[color,background-color,border-color,box-shadow,transform] duration-swift ease-swift motion-safe:hover:-translate-y-px motion-safe:active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 motion-safe:disabled:hover:translate-y-0 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-chay-700 active:bg-chay-800',
        indigo:
          'bg-accent text-accent-foreground hover:bg-indigo-700 active:bg-indigo-800',
        outline:
          'border border-foreground/25 bg-transparent hover:bg-foreground/[0.04] active:bg-foreground/[0.07]',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/70',
        ghost: 'hover:bg-foreground/[0.05] active:bg-foreground/[0.08]',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      /*
        `lg` was 52px tall with 32px of side padding, which on a phone made a
        pair of stacked calls-to-action 116px of solid chrome directly under the
        headline. It is now 48px with 24px sides: still comfortably past the
        44px target, still the largest control on the page, and no longer the
        loudest thing in the hero. `default` stays at exactly 44px, because
        that is the floor rather than a preference.
      */
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-9 px-3.5 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-11 w-11',
        link: 'h-auto p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
