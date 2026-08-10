import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * `size={1}` is a layout fix, not a sizing choice, and it belongs here rather
 * than at each call site.
 *
 * An `<input>` with no `size` attribute carries a default of 20 characters —
 * about 223px of *intrinsic* width. That figure still counts toward the
 * min-content of any flex or grid container the input sits in, even though
 * `w-full` makes the input itself perfectly happy to be 40px wide. The
 * container refuses to shrink below it, and the overflow surfaces somewhere
 * else entirely, which is what made the newsletter row size the whole footer
 * column. `size={1}` removes the floor; `w-full` still does the growing.
 *
 * Overridable, because a caller that genuinely wants character-sizing can pass
 * its own — this only changes the default from "223px" to "nothing".
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, size = 1, ...props }, ref) => (
    <input
      type={type}
      size={size}
      ref={ref}
      className={cn(
        // 16px base size prevents iOS Safari from zooming the viewport on focus.
        'flex h-11 w-full rounded-sm border border-input bg-card px-3 py-2 text-base',
        'ring-offset-background placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[7rem] w-full rounded-sm border border-input bg-card px-3 py-2.5 text-base leading-relaxed',
      'ring-offset-background placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'aria-[invalid=true]:border-destructive',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export { Input, Textarea };
