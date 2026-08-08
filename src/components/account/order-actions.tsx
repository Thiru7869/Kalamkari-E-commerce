'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { cancelOrder, requestReturn } from '@/app/actions/account';
import { initialFormState } from '@/lib/form-state';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/forms/field-error';

function ConfirmButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

/**
 * What a customer can still do to an order themselves.
 *
 * Cancellation is offered only while nothing has been drawn. Once the piece is
 * in production, weeks of one person's hand are already committed, so the
 * button becomes a conversation instead — which is also what a delivered order
 * gets, because hand-painted work has no returnable-condition checklist a form
 * could apply.
 */
export function OrderActions({
  number,
  status,
}: {
  number: string;
  status: string;
}) {
  const cancellable = status === 'PENDING' || status === 'CONFIRMED';
  const returnable = status === 'DELIVERED';

  if (!cancellable && !returnable) return null;

  return cancellable ? (
    <CancelForm number={number} />
  ) : (
    <ReturnForm number={number} />
  );
}

function CancelForm({ number }: { number: string }) {
  const [state, formAction] = useActionState(cancelOrder, initialFormState);
  const [open, setOpen] = useState(false);

  if (state.status === 'success') {
    return (
      <p role="status" className="mt-4 text-sm text-muted-foreground">
        {state.message}
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex min-h-[2.75rem] items-center text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Cancel this order
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-4 rounded-sm border border-border bg-muted/40 p-4">
      <input type="hidden" name="number" value={number} />

      <p className="text-sm leading-relaxed text-muted-foreground">
        Nothing has been drawn for this order yet, so it can still be cancelled. The
        pieces go straight back into the catalogue.
      </p>

      <div className="mt-4">
        <Label htmlFor={`cancel-reason-${number}`}>Why, if you would like to say</Label>
        <Textarea
          id={`cancel-reason-${number}`}
          name="reason"
          rows={2}
          maxLength={600}
          className="mt-1.5"
          placeholder="Optional — but it is the only way the store finds out."
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <ConfirmButton label="Cancel the order" pendingLabel="Cancelling…" />
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Keep it
        </Button>
        {state.status === 'error' && (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

function ReturnForm({ number }: { number: string }) {
  const [state, formAction] = useActionState(requestReturn, initialFormState);
  const [open, setOpen] = useState(false);

  if (state.status === 'success') {
    return (
      <p role="status" className="mt-4 text-sm text-muted-foreground">
        {state.message}
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex min-h-[2.75rem] items-center text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Something is wrong with this order
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-4 rounded-sm border border-border bg-muted/40 p-4">
      <input type="hidden" name="number" value={number} />

      <p className="text-sm leading-relaxed text-muted-foreground">
        Small variations in line, colour depth and the border repeat are how hand
        painting is identified rather than faults in it. But if a piece arrived damaged,
        or is not what was described, tell us and we will make it right.
      </p>

      <div className="mt-4">
        <Label htmlFor={`return-reason-${number}`} required>
          What is wrong
        </Label>
        <Textarea
          id={`return-reason-${number}`}
          name="reason"
          rows={3}
          required
          maxLength={2000}
          className="mt-1.5"
          aria-invalid={Boolean(state.errors?.reason)}
          aria-describedby={state.errors?.reason ? `return-reason-${number}-error` : undefined}
          placeholder="What arrived, and how it differs from what you expected."
        />
        <FieldError id={`return-reason-${number}-error`} message={state.errors?.reason} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <ConfirmButton label="Send to the store" pendingLabel="Sending…" />
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Never mind
        </Button>
        {state.status === 'error' && (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
