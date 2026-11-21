'use client';

/**
 * Compatibility barrel. Every export lives in its own module so a page that
 * wants one component does not ship the rest: importing from here pulls in
 * Select, Tabs, Accordion, Checkbox and RadioGroup together. New code imports
 * the module it needs (`ui/accordion`, `ui/quantity-stepper`, ...);
 * `bundle-boundaries.test.ts` fails if anything under `src` imports this file.
 */

export * from './dialog';
export { Badge } from './badge';
export * from './card';
export * from './separator';
export * from './accordion';
export * from './tabs';
export * from './select';
export * from './checkbox';
export * from './radio-group';
export * from './quantity-stepper';
export * from './skeleton';
