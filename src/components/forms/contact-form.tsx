'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitEnquiry } from '@/app/actions/forms';
import { initialFormState } from '@/lib/form-state';
import { Honeypot } from './honeypot';
import { FieldError } from './field-error';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? 'Sending…' : 'Send message'}
    </Button>
  );
}

export function ContactForm({ className }: { className?: string }) {
  const [state, formAction] = useActionState(submitEnquiry, initialFormState);

  if (state.status === 'success') {
    return (
      <div className={className} role="status">
        <div className="rounded-sm border border-border bg-background p-6 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
          <h3 className="mt-4 font-display text-display-sm">Message sent</h3>
          <p className="mt-3 leading-relaxed text-muted-foreground">{state.message}</p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className={className} noValidate>
      <div className="grid gap-5">
        <div>
          <Label htmlFor="e-name" required>Your name</Label>
          <Input
            id="e-name"
            name="name"
            required
            autoComplete="name"
            className="mt-1.5"
            aria-invalid={Boolean(state.errors?.name)}
            aria-describedby={state.errors?.name ? 'e-name-error' : undefined}
          />
          <FieldError id="e-name-error" message={state.errors?.name} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="e-email" required>Email</Label>
            <Input
              id="e-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              className="mt-1.5"
              aria-invalid={Boolean(state.errors?.email)}
              aria-describedby={state.errors?.email ? 'e-email-error' : undefined}
            />
            <FieldError id="e-email-error" message={state.errors?.email} />
          </div>

          <div>
            <Label htmlFor="e-phone">Phone</Label>
            <Input
              id="e-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              className="mt-1.5"
              placeholder="Optional"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="e-subject" required>Subject</Label>
          <Input
            id="e-subject"
            name="subject"
            required
            className="mt-1.5"
            placeholder="A visit, a piece, wholesale, a question…"
            aria-invalid={Boolean(state.errors?.subject)}
            aria-describedby={state.errors?.subject ? 'e-subject-error' : undefined}
          />
          <FieldError id="e-subject-error" message={state.errors?.subject} />
        </div>

        <div>
          <Label htmlFor="e-message" required>Message</Label>
          <Textarea
            id="e-message"
            name="message"
            required
            rows={6}
            className="mt-1.5"
            aria-invalid={Boolean(state.errors?.message)}
            aria-describedby={state.errors?.message ? 'e-message-error' : undefined}
          />
          <FieldError id="e-message-error" message={state.errors?.message} />
        </div>
      </div>

      <Honeypot idPrefix="e" />

      <div className="mt-6">
        <SubmitButton />
        {state.status === 'error' && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
