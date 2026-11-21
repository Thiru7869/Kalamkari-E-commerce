'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

/*
  A disclosure list with the shape of Radix's Accordion, and none of its
  measuring.

  Radix animates height by reading each panel's rendered size in a layout
  effect and writing it back as a CSS variable. Mounting seven of them on the
  type page, or six on the product page, meant seven synchronous layouts and
  style recalculations in the middle of hydration — the page was doing the work
  to animate panels nobody had opened. Here the height transition is a CSS grid
  track going from `0fr` to `1fr`, which the browser interpolates without any
  script reading a size.

  What is kept: `type="single"` (with `collapsible`) and `type="multiple"`,
  controlled and uncontrolled, the heading > button > region structure with
  `aria-expanded` / `aria-controls` / `aria-labelledby`, and Arrow Up / Down,
  Home and End moving between triggers. Closed panels stay in the document
  (hidden from sight, the accessibility tree and the tab order by
  `visibility`), so their text is also in the page a crawler is given.
*/

type Mode =
  | {
      type: 'single';
      collapsible?: boolean;
      value?: string;
      defaultValue?: string;
      onValueChange?: (value: string) => void;
    }
  | {
      type: 'multiple';
      value?: string[];
      defaultValue?: string[];
      onValueChange?: (value: string[]) => void;
    };

type AccordionProps = Mode &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>;

type Context = { isOpen: (value: string) => boolean; toggle: (value: string) => void };

const AccordionContext = React.createContext<Context | null>(null);
const ItemContext = React.createContext<{ value: string; open: boolean; triggerId: string; panelId: string } | null>(
  null,
);

function useAccordion() {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error('Accordion parts must be rendered inside <Accordion>.');
  return context;
}

function useItem() {
  const context = React.useContext(ItemContext);
  if (!context) throw new Error('AccordionTrigger and AccordionContent must be inside <AccordionItem>.');
  return context;
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(function Accordion(props, ref) {
  const {
    type,
    value,
    defaultValue,
    onValueChange,
    collapsible: collapsibleProp,
    ...divProps
  } = props as AccordionProps & { collapsible?: boolean };
  const collapsible = type === 'multiple' ? true : (collapsibleProp ?? false);

  const toList = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);
  const [inner, setInner] = React.useState<string[]>(() => toList(defaultValue));
  const controlled = value !== undefined;
  const open = controlled ? toList(value) : inner;

  const toggle = React.useCallback(
    (item: string) => {
      const isOpen = open.includes(item);
      let next: string[];
      if (type === 'multiple') {
        next = isOpen ? open.filter((v) => v !== item) : [...open, item];
      } else if (isOpen) {
        if (!collapsible) return;
        next = [];
      } else {
        next = [item];
      }
      if (!controlled) setInner(next);
      if (type === 'multiple') (onValueChange as ((v: string[]) => void) | undefined)?.(next);
      else (onValueChange as ((v: string) => void) | undefined)?.(next[0] ?? '');
    },
    [open, type, collapsible, controlled, onValueChange],
  );

  const context = React.useMemo<Context>(() => ({ isOpen: (v) => open.includes(v), toggle }), [open, toggle]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    divProps.onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    const triggers = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('button[data-accordion-trigger]:not(:disabled)'),
    );
    const at = triggers.indexOf(document.activeElement as HTMLButtonElement);
    if (at === -1) return;
    event.preventDefault();
    const last = triggers.length - 1;
    const to =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? last
          : event.key === 'ArrowDown'
            ? (at + 1) % triggers.length
            : (at - 1 + triggers.length) % triggers.length;
    triggers[to]?.focus();
  };

  return (
    <AccordionContext.Provider value={context}>
      <div ref={ref} {...divProps} onKeyDown={onKeyDown} />
    </AccordionContext.Provider>
  );
});

export const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(function AccordionItem({ className, value, ...props }, ref) {
  const { isOpen } = useAccordion();
  const id = React.useId();
  const open = isOpen(value);
  return (
    <ItemContext.Provider value={{ value, open, triggerId: `${id}-trigger`, panelId: `${id}-panel` }}>
      <div
        ref={ref}
        data-state={open ? 'open' : 'closed'}
        className={cn('border-b border-border', className)}
        {...props}
      />
    </ItemContext.Provider>
  );
});

export const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function AccordionTrigger({ className, children, onClick, ...props }, ref) {
  const { toggle } = useAccordion();
  const { value, open, triggerId, panelId } = useItem();
  return (
    <h3 className="flex">
      <button
        ref={ref}
        type="button"
        id={triggerId}
        data-accordion-trigger=""
        data-state={open ? 'open' : 'closed'}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) toggle(value);
        }}
        className={cn(
          'flex flex-1 items-center justify-between gap-4 py-4 text-left text-sm font-medium transition-colors hover:text-primary [&[data-state=open]>svg]:rotate-45',
          className,
        )}
        {...props}
      >
        {children}
        <Plus
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </button>
    </h3>
  );
});

export const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function AccordionContent({ className, children, ...props }, ref) {
  const { open, triggerId, panelId } = useItem();
  return (
    <div
      ref={ref}
      id={panelId}
      role="region"
      aria-labelledby={triggerId}
      data-state={open ? 'open' : 'closed'}
      className={cn(
        'grid text-sm transition-[grid-template-rows,visibility] duration-200 ease-out motion-reduce:transition-none',
        open ? 'grid-rows-[1fr]' : 'invisible grid-rows-[0fr]',
      )}
      {...props}
    >
      <div className="min-h-0 overflow-hidden">
        <div className={cn('pb-4 pt-0 leading-relaxed text-muted-foreground', className)}>{children}</div>
      </div>
    </div>
  );
});
