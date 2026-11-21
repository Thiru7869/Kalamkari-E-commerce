'use client';

import { useActionState, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitCommission } from '@/app/actions/forms';
import { initialFormState } from '@/lib/form-state';
import { Honeypot } from './honeypot';
import { FieldError } from './field-error';
import { CommissionGuide } from './commission-guide';
import { ReferenceUpload } from './reference-upload';

const PIECE_TYPES = [
  { value: 'saree', label: 'Saree' },
  { value: 'dupatta', label: 'Dupatta or stole' },
  { value: 'blouse', label: 'Blouse piece' },
  { value: 'painting', label: 'Painting or narrative panel' },
  { value: 'home-decor', label: 'Home — cushions, runner, bedspread, wall panel' },
  { value: 'other', label: 'Something else' },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? 'Sending…' : 'Send to the store'}
    </Button>
  );
}

export function CommissionForm({ className }: { className?: string }) {
  const [state, formAction] = useActionState(submitCommission, initialFormState);

  // The guide writes into these rather than replacing the fields, so somebody
  // who ignores it entirely gets exactly the form that was here before.
  const briefRef = useRef<HTMLTextAreaElement>(null);
  const [pieceType, setPieceType] = useState('saree');
  const [fabric, setFabric] = useState('');
  const [timeline, setTimeline] = useState('');

  if (state.status === 'success') {
    return (
      <div className={className} role="status">
        <div className="rounded-sm border border-border bg-background p-6 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
          <h3 className="mt-4 font-display text-display-sm">Sent</h3>
          <p className="mt-3 leading-relaxed text-muted-foreground">{state.message}</p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className={className} noValidate>
      <CommissionGuide
        className="mb-6"
        onApply={({ brief, pieceType: pt, fabric: fb, timeline: tl }) => {
          if (pt) setPieceType(pt);
          if (fb !== undefined) setFabric(fb);
          if (tl) setTimeline(tl);

          // Prepend rather than overwrite: anything already typed is the
          // visitor's own words and outranks the generated draft.
          const el = briefRef.current;
          if (el) {
            el.value = `${brief}${el.value}`.trimStart();
            el.focus();
            el.setSelectionRange(el.value.length, el.value.length);
          }
        }}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="c-name" required>Your name</Label>
          <Input
            id="c-name"
            name="name"
            required
            autoComplete="name"
            className="mt-1.5"
            aria-invalid={Boolean(state.errors?.name)}
            aria-describedby={state.errors?.name ? 'c-name-error' : undefined}
          />
          <FieldError id="c-name-error" message={state.errors?.name} />
        </div>

        <div>
          <Label htmlFor="c-email" required>Email</Label>
          <Input
            id="c-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            className="mt-1.5"
            aria-invalid={Boolean(state.errors?.email)}
            aria-describedby={state.errors?.email ? 'c-email-error' : undefined}
          />
          <FieldError id="c-email-error" message={state.errors?.email} />
        </div>

        <div>
          <Label htmlFor="c-phone">Phone or WhatsApp</Label>
          <Input
            id="c-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className="mt-1.5"
            placeholder="Optional, but faster"
          />
        </div>

        <div>
          <Label htmlFor="c-type" required>What kind of piece</Label>
          <select
            id="c-type"
            name="pieceType"
            required
            value={pieceType}
            onChange={(e) => setPieceType(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-sm border border-input bg-card px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {PIECE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="c-fabric">Cloth, if you have a preference</Label>
          <Input
            id="c-fabric"
            name="fabric"
            value={fabric}
            onChange={(e) => setFabric(e.target.value)}
            className="mt-1.5"
            placeholder="Cotton, tussar, Chanderi…"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="c-brief" required>What would you like painted?</Label>
          <Textarea
            ref={briefRef}
            id="c-brief"
            name="brief"
            required
            rows={6}
            className="mt-1.5"
            placeholder="The subject or story, where it should sit on the cloth, colours you want or want avoided, the occasion it is for. Rough is fine — this is where the conversation starts."
            aria-invalid={Boolean(state.errors?.brief)}
            aria-describedby={state.errors?.brief ? 'c-brief-error' : 'c-brief-hint'}
          />
          <p id="c-brief-hint" className="mt-1.5 text-xs text-muted-foreground">
            Rough is fine. This is where the conversation starts, not where it ends.
          </p>
          <FieldError id="c-brief-error" message={state.errors?.brief} />
        </div>

        <div className="sm:col-span-2">
          <ReferenceUpload />
        </div>

        <div>
          <Label htmlFor="c-budget-min">Budget from (₹)</Label>
          <Input
            id="c-budget-min"
            name="budgetMin"
            type="number"
            min={0}
            step={500}
            inputMode="numeric"
            className="mt-1.5"
            placeholder="Optional"
          />
        </div>

        <div>
          <Label htmlFor="c-budget-max">Budget to (₹)</Label>
          <Input
            id="c-budget-max"
            name="budgetMax"
            type="number"
            min={0}
            step={500}
            inputMode="numeric"
            className="mt-1.5"
            placeholder="Optional"
            aria-invalid={Boolean(state.errors?.budgetMax)}
            aria-describedby={state.errors?.budgetMax ? 'c-budget-error' : undefined}
          />
          <FieldError id="c-budget-error" message={state.errors?.budgetMax} />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="c-timeline">When do you need it?</Label>
          <Input
            id="c-timeline"
            name="timeline"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="mt-1.5"
            placeholder="“Before Sankranti”, “no deadline”, a date…"
          />
        </div>
      </div>

      <Honeypot idPrefix="c" />

      <div className="mt-7">
        <SubmitButton />
        {state.status === 'error' && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {state.message}
          </p>
        )}
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          We use these details only to reply about your commission. Nothing is shared, and
          there is no mailing list attached to this form.
        </p>
      </div>
    </form>
  );
}
