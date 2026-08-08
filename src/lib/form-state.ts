/**
 * Shared form-state shapes for `useActionState`.
 *
 * These live here, and NOT alongside the actions themselves, because a
 * `'use server'` module may only export async functions. Exporting a plain
 * object or constant from one throws at runtime:
 *
 *   A "use server" file can only export async functions, found object.
 *
 * and — importantly — it takes down *every* action in that module graph, not
 * just the offending export. TypeScript and `next build` both accept it, so
 * the only way to catch it is to run the thing.
 */

export type FormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  /** Field-level errors keyed by input name. */
  errors?: Record<string, string>;
};

export const initialFormState: FormState = { status: 'idle' };

export type CheckoutState = {
  status: 'idle' | 'error';
  message?: string;
  errors?: Record<string, string>;
};

export const initialCheckoutState: CheckoutState = { status: 'idle' };
