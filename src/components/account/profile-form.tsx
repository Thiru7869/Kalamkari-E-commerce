'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateProfile } from '@/app/actions/account';
import { initialFormState } from '@/lib/form-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/forms/field-error';

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save'}
    </Button>
  );
}

/**
 * Name and phone.
 *
 * The email address is shown but not editable — it signs the account in and it
 * is the second factor on order tracking, so it is not a field a form should
 * quietly change. The note says so rather than leaving a disabled input with
 * no explanation.
 */
export function ProfileForm({
  name,
  phone,
  email,
}: {
  name: string;
  phone: string;
  email: string;
}) {
  const [state, formAction] = useActionState(updateProfile, initialFormState);

  return (
    <form action={formAction} className="mt-6 max-w-lg">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="profile-name" required>
            Name
          </Label>
          <Input
            id="profile-name"
            name="name"
            defaultValue={name}
            required
            maxLength={120}
            autoComplete="name"
            className="mt-1.5"
            aria-invalid={Boolean(state.errors?.name)}
            aria-describedby={state.errors?.name ? 'profile-name-error' : undefined}
          />
          <FieldError id="profile-name-error" message={state.errors?.name} />
        </div>

        <div>
          <Label htmlFor="profile-phone">Phone</Label>
          <Input
            id="profile-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            defaultValue={phone}
            maxLength={20}
            autoComplete="tel"
            placeholder="Optional"
            className="mt-1.5"
            aria-invalid={Boolean(state.errors?.phone)}
            aria-describedby={state.errors?.phone ? 'profile-phone-error' : undefined}
          />
          <FieldError id="profile-phone-error" message={state.errors?.phone} />
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Signed in as {email}. This address is how you sign in and how an order is
        matched to you when you track it, so it is not changed from here — write to
        the store if it needs to move.
      </p>

      <div className="mt-5 flex items-center gap-4">
        <SaveButton />
        {state.status !== 'idle' && state.message && (
          <p
            role="status"
            className={
              state.status === 'error' ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'
            }
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
