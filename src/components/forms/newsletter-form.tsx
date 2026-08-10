'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { ArrowRight } from 'lucide-react';
import { subscribeNewsletter } from '@/app/actions/forms';
import { initialFormState } from '@/lib/form-state';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-sm bg-cotton-200 px-4 text-sm font-medium text-kasim-900 transition-colors hover:bg-cotton-50 disabled:opacity-60"
    >
      {pending ? 'Sending…' : 'Join'}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

export function NewsletterForm() {
  const [state, formAction] = useActionState(subscribeNewsletter, initialFormState);

  return (
    <form action={formAction} className="max-w-sm">
      <label htmlFor="newsletter-email" className="block text-sm font-medium text-cotton-100">
        Notes from the store
      </label>
      <p className="mt-1 text-xs leading-relaxed text-cotton-200/65">
        A few times a year — when a large piece is finished, when the dye season turns.
        Nothing else.
      </p>

      <div className="mt-3 flex gap-2">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          /*
            An <input> defaults to `size="20"`, which is an *intrinsic* width of
            roughly 223px here. `min-w-0 flex-1` lets it shrink once the row is
            being laid out, but it does not remove that 223px from the row's
            min-content — so this row reported a 309px minimum, which sized the
            whole footer column and pushed the footer 32px past the right edge
            of a 320px screen. `size={1}` drops the intrinsic floor; `flex-1`
            still grows it to fill whatever is actually available.
          */
          size={1}
          aria-describedby={state.status !== 'idle' ? 'newsletter-status' : undefined}
          aria-invalid={state.status === 'error'}
          className="h-11 min-w-0 flex-1 rounded-sm border border-cotton-200/25 bg-transparent px-3 text-base text-cotton-50 placeholder:text-cotton-200/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cotton-200 focus-visible:ring-offset-2 focus-visible:ring-offset-kasim-900"
        />
        <SubmitButton />
      </div>

      {/* Honeypot — hidden from users and assistive tech, attractive to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="newsletter-website">Website</label>
        <input id="newsletter-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <p
        id="newsletter-status"
        role="status"
        aria-live="polite"
        className={`mt-2 text-xs ${state.status === 'error' ? 'text-chay-300' : 'text-cotton-200/80'}`}
      >
        {state.message}
      </p>
    </form>
  );
}
