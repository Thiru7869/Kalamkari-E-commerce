'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, Banknote, CreditCard, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox, RadioGroup, RadioGroupItem } from '@/components/ui/primitives';
import { FieldError } from '@/components/forms/field-error';
import { placeOrder } from '@/app/actions/checkout';
import { initialCheckoutState } from '@/lib/form-state';
import { cn } from '@/lib/utils';

type SavedAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
};

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

/** A small numeral in a ring, so the page reads as three short steps. */
function StepNumber({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      className="tabular inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/50 text-sm text-primary"
    >
      {n}
    </span>
  );
}

function SubmitButton({ method }: { method: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} aria-busy={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="animate-spin" aria-hidden="true" />
          Placing order…
        </>
      ) : (
        <>
          <Lock aria-hidden="true" />
          {method === 'COD' ? 'Place order' : 'Continue to payment'}
        </>
      )}
    </Button>
  );
}

export function CheckoutForm({
  defaultEmail,
  savedAddress,
  isSignedIn,
  razorpayAvailable,
  totalLabel,
}: {
  defaultEmail: string;
  savedAddress: SavedAddress | null;
  isSignedIn: boolean;
  razorpayAvailable: boolean;
  /** The order total as text, repeated beside the button so it is in view when paying. */
  totalLabel?: string;
}) {
  const [state, formAction] = useActionState(placeOrder, initialCheckoutState);
  const [method, setMethod] = useState<'COD' | 'RAZORPAY'>('COD');
  const errorRef = useRef<HTMLDivElement>(null);

  // A rejected submission leaves the reader at the button, with the reason
  // above the fold of the form. Bring it into view and let a screen reader
  // land on it.
  useEffect(() => {
    if (state.status === 'error') {
      errorRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      errorRef.current?.focus({ preventScroll: true });
    }
  }, [state]);

  const fieldErrorCount = state.errors ? Object.values(state.errors).filter(Boolean).length : 0;

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="paymentMethod" value={method} />
      <input type="hidden" name="country" value="India" />

      {state.status === 'error' && (
        <div
          ref={errorRef}
          role="alert"
          tabIndex={-1}
          className="mb-6 flex gap-3 rounded-sm border border-destructive/40 bg-destructive/5 p-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <p className="font-medium">{state.message}</p>
            {fieldErrorCount > 0 && (
              <p className="mt-1 text-muted-foreground">
                {fieldErrorCount === 1
                  ? 'One field needs attention — it is marked below.'
                  : `${fieldErrorCount} fields need attention — they are marked below.`}
              </p>
            )}
          </div>
        </div>
      )}

      <section className="rounded-sm border border-border bg-background p-5 md:p-6">
        <h2 className="flex items-center gap-3 font-display text-display-sm">
          <StepNumber n={1} />
          Contact
        </h2>

        <div className="mt-5">
          <Label htmlFor="co-email" required>Email</Label>
          <Input
            id="co-email"
            name="email"
            type="email"
            required
            defaultValue={defaultEmail}
            autoComplete="email"
            inputMode="email"
            className="mt-1.5"
            aria-invalid={Boolean(state.errors?.email)}
            aria-describedby={state.errors?.email ? 'co-email-error' : 'co-email-hint'}
          />
          <p id="co-email-hint" className="mt-1.5 text-xs text-muted-foreground">
            Your order confirmation and tracking updates go here.
          </p>
          <FieldError id="co-email-error" message={state.errors?.email} />
        </div>
      </section>

      <section className="mt-6 rounded-sm border border-border bg-background p-5 md:p-6">
        <h2 className="flex items-center gap-3 font-display text-display-sm">
          <StepNumber n={2} />
          Where it should go
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="co-name" required>Full name</Label>
            <Input
              id="co-name"
              name="fullName"
              required
              defaultValue={savedAddress?.fullName}
              autoComplete="name"
              className="mt-1.5"
              aria-invalid={Boolean(state.errors?.fullName)}
              aria-describedby={state.errors?.fullName ? 'co-name-error' : undefined}
            />
            <FieldError id="co-name-error" message={state.errors?.fullName} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="co-phone" required>Phone</Label>
            <Input
              id="co-phone"
              name="phone"
              type="tel"
              required
              defaultValue={savedAddress?.phone}
              autoComplete="tel"
              inputMode="tel"
              className="mt-1.5"
              aria-invalid={Boolean(state.errors?.phone)}
              aria-describedby={state.errors?.phone ? 'co-phone-error' : 'co-phone-hint'}
            />
            <p id="co-phone-hint" className="mt-1.5 text-xs text-muted-foreground">
              The courier will call this number, and so might we before dispatch.
            </p>
            <FieldError id="co-phone-error" message={state.errors?.phone} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="co-line1" required>Address</Label>
            <Input
              id="co-line1"
              name="line1"
              required
              defaultValue={savedAddress?.line1}
              autoComplete="address-line1"
              className="mt-1.5"
              placeholder="House or flat number, street"
              aria-invalid={Boolean(state.errors?.line1)}
              aria-describedby={state.errors?.line1 ? 'co-line1-error' : undefined}
            />
            <FieldError id="co-line1-error" message={state.errors?.line1} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="co-line2">Area, landmark</Label>
            <Input
              id="co-line2"
              name="line2"
              defaultValue={savedAddress?.line2}
              autoComplete="address-line2"
              className="mt-1.5"
              placeholder="Optional"
            />
          </div>

          <div>
            <Label htmlFor="co-city" required>City or town</Label>
            <Input
              id="co-city"
              name="city"
              required
              defaultValue={savedAddress?.city}
              autoComplete="address-level2"
              className="mt-1.5"
              aria-invalid={Boolean(state.errors?.city)}
              aria-describedby={state.errors?.city ? 'co-city-error' : undefined}
            />
            <FieldError id="co-city-error" message={state.errors?.city} />
          </div>

          <div>
            <Label htmlFor="co-postal" required>PIN code</Label>
            <Input
              id="co-postal"
              name="postalCode"
              required
              defaultValue={savedAddress?.postalCode}
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={6}
              className="mt-1.5"
              aria-invalid={Boolean(state.errors?.postalCode)}
              aria-describedby={state.errors?.postalCode ? 'co-postal-error' : undefined}
            />
            <FieldError id="co-postal-error" message={state.errors?.postalCode} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="co-state" required>State</Label>
            <select
              id="co-state"
              name="state"
              required
              defaultValue={savedAddress?.state ?? ''}
              className={cn(
                'mt-1.5 h-11 w-full rounded-sm border bg-card px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                state.errors?.state ? 'border-destructive' : 'border-input',
              )}
              aria-invalid={Boolean(state.errors?.state)}
              aria-describedby={state.errors?.state ? 'co-state-error' : undefined}
            >
              <option value="" disabled>Select a state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <FieldError id="co-state-error" message={state.errors?.state} />
          </div>
        </div>

        {isSignedIn && (
          <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm">
            <Checkbox name="saveAddress" defaultChecked />
            Save this address for next time
          </label>
        )}
      </section>

      <section className="mt-6 rounded-sm border border-border bg-background p-5 md:p-6">
        <h2 className="flex items-center gap-3 font-display text-display-sm">
          <StepNumber n={3} />
          Payment
        </h2>

        <RadioGroup
          value={method}
          onValueChange={(v) => setMethod(v as 'COD' | 'RAZORPAY')}
          className="mt-5"
          aria-label="Payment method"
        >
          <label
            className={cn(
              'flex min-h-[3.5rem] cursor-pointer items-start gap-3 rounded-sm border p-4 transition-colors',
              method === 'COD' ? 'border-primary bg-primary/[0.04]' : 'border-border',
            )}
          >
            <RadioGroupItem value="COD" className="mt-0.5" />
            <span className="flex-1">
              <span className="flex items-center gap-2 font-medium">
                <Banknote className="h-4 w-4" aria-hidden="true" />
                Cash on delivery
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                Pay when it arrives. We will call to confirm before anything is dispatched.
              </span>
            </span>
          </label>

          <label
            className={cn(
              'flex items-start gap-3 rounded-sm border p-4 transition-colors',
              !razorpayAvailable && 'cursor-not-allowed opacity-55',
              razorpayAvailable && 'cursor-pointer',
              method === 'RAZORPAY' ? 'border-primary bg-primary/[0.04]' : 'border-border',
            )}
          >
            <RadioGroupItem value="RAZORPAY" className="mt-0.5" disabled={!razorpayAvailable} />
            <span className="flex-1">
              <span className="flex items-center gap-2 font-medium">
                <CreditCard className="h-4 w-4" aria-hidden="true" />
                Card, UPI or netbanking
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                {razorpayAvailable
                  ? 'Secure payment through Razorpay.'
                  : 'Not available yet — online payment is being set up.'}
              </span>
            </span>
          </label>
        </RadioGroup>
      </section>

      <section className="mt-6 rounded-sm border border-border bg-background p-5 md:p-6">
        <Label htmlFor="co-note">Anything we should know?</Label>
        <Textarea
          id="co-note"
          name="customerNote"
          rows={3}
          className="mt-1.5"
          maxLength={600}
          placeholder="A gift, an occasion, a delivery window, a date you need it by."
        />
      </section>

      <div className="mt-7">
        {totalLabel && (
          <p className="mb-3 flex items-baseline justify-between border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">Total to pay</span>
            <span className="tabular font-display text-xl">{totalLabel}</span>
          </p>
        )}
        <SubmitButton method={method} />
        <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
          By placing this order you agree to our{' '}
          <a href="/terms" className="underline underline-offset-4">terms</a> and{' '}
          <a href="/privacy" className="underline underline-offset-4">privacy policy</a>.
        </p>
      </div>
    </form>
  );
}
