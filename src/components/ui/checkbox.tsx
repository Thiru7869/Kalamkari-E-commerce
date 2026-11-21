import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
  /** Called with the new state, as Radix's Checkbox did. */
  onCheckedChange?: (checked: boolean) => void;
};

/**
 * A native checkbox, drawn.
 *
 * This was Radix's Checkbox, which per instance mounts a button, a presence
 * wrapper, a size observer and a hidden mirror `<input>` for form posts. The
 * filter sheet shows about thirty of them at once, so opening it was thirty of
 * those mounting inside a tap. An `<input type="checkbox">` is the control
 * Radix was imitating: it already is a checkbox to every assistive technology,
 * it posts with its form, and it toggles on Space with no code here.
 *
 * Needs no client boundary of its own — the handler comes from whichever client
 * component renders it.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, onCheckedChange, ...props },
  ref,
) {
  return (
    <span className="relative inline-flex h-5 w-5 shrink-0">
      <input
        ref={ref}
        type="checkbox"
        onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
        className={cn(
          'peer h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-[3px] border border-foreground/35 bg-background ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'checked:border-primary checked:bg-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
      <Check
        className="pointer-events-none absolute inset-0 m-auto h-3.5 w-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100"
        strokeWidth={3}
        aria-hidden="true"
      />
    </span>
  );
});
