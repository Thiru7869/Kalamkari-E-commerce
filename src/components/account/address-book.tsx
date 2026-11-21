'use client';

import { useActionState, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from '@/lib/toast';
import { Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { saveAddress, deleteAddress, setDefaultAddress } from '@/app/actions/account';
import { initialFormState } from '@/lib/form-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FieldError } from '@/components/forms/field-error';

export type AddressRow = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

function SaveButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : editing ? 'Save changes' : 'Add address'}
    </Button>
  );
}

/**
 * The address book.
 *
 * One form, reused for adding and for editing — `editing` decides whether a
 * hidden id goes up with it, and the server scopes every write by userId so an
 * id belonging to another account changes nothing.
 *
 * Nothing here can alter a past order. Orders keep their own snapshot of where
 * they were sent, which is exactly why moving house is safe.
 */
export function AddressBook({ addresses }: { addresses: AddressRow[] }) {
  const [state, formAction] = useActionState(saveAddress, initialFormState);
  const [editing, setEditing] = useState<AddressRow | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  // A successful save closes the form; the list re-renders from the server.
  const formKey = `${editing?.id ?? 'new'}-${state.status}`;

  function beginEdit(address: AddressRow) {
    setEditing(address);
    setOpen(true);
  }

  function beginAdd() {
    setEditing(null);
    setOpen(true);
  }

  function remove(address: AddressRow) {
    startTransition(async () => {
      const result = await deleteAddress(address.id);
      if (result.ok) toast.success('Address removed');
      else toast.error(result.error);
    });
  }

  function makeDefault(address: AddressRow) {
    startTransition(async () => {
      const result = await setDefaultAddress(address.id);
      if (result.ok) toast.success('Default address updated');
      else toast.error(result.error);
    });
  }

  return (
    <div className="mt-6">
      {addresses.length === 0 ? (
        <div className="rounded-sm border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            No addresses saved yet. One is kept automatically the first time you ask us
            to at checkout.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <li
              key={address.id}
              className="flex flex-col rounded-sm border border-border bg-card p-5"
            >
              {address.isDefault && (
                <Badge variant="muted" className="mb-3 self-start">
                  Default
                </Badge>
              )}

              <address className="text-sm not-italic leading-relaxed">
                <span className="font-medium">{address.fullName}</span>
                <br />
                <span className="text-muted-foreground">
                  {address.line1}
                  <br />
                  {address.line2 && (
                    <>
                      {address.line2}
                      <br />
                    </>
                  )}
                  {address.city}, {address.state} {address.postalCode}
                  <br />
                  {address.phone}
                </span>
              </address>

              <div className="mt-4 flex flex-wrap gap-1 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => beginEdit(address)}
                  className="inline-flex h-11 items-center gap-1.5 rounded-sm px-2.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit
                  <span className="sr-only"> address for {address.fullName}</span>
                </button>

                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={() => makeDefault(address)}
                    disabled={pending}
                    className="inline-flex h-11 items-center gap-1.5 rounded-sm px-2.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    <Star className="h-3.5 w-3.5" aria-hidden="true" />
                    Make default
                    <span className="sr-only"> — address for {address.fullName}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => remove(address)}
                  disabled={pending}
                  className="inline-flex h-11 items-center gap-1.5 rounded-sm px-2.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/5 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Remove
                  <span className="sr-only"> address for {address.fullName}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!open && (
        <Button variant="outline" className="mt-6" onClick={beginAdd}>
          <Plus aria-hidden="true" />
          Add an address
        </Button>
      )}

      {open && (
        <form
          key={formKey}
          action={formAction}
          className="mt-6 max-w-2xl rounded-sm border border-border bg-card p-5 md:p-6"
        >
          <h3 className="font-display text-lg">
            {editing ? 'Edit address' : 'Add an address'}
          </h3>

          {editing && <input type="hidden" name="id" value={editing.id} />}

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="addr-fullName" required>
                Full name
              </Label>
              <Input
                id="addr-fullName"
                name="fullName"
                required
                maxLength={120}
                autoComplete="name"
                defaultValue={editing?.fullName}
                className="mt-1.5"
                aria-invalid={Boolean(state.errors?.fullName)}
                aria-describedby={state.errors?.fullName ? 'addr-fullName-error' : undefined}
              />
              <FieldError id="addr-fullName-error" message={state.errors?.fullName} />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="addr-phone" required>
                Phone
              </Label>
              <Input
                id="addr-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                required
                autoComplete="tel"
                defaultValue={editing?.phone}
                className="mt-1.5"
                aria-invalid={Boolean(state.errors?.phone)}
                aria-describedby={state.errors?.phone ? 'addr-phone-error' : undefined}
              />
              <FieldError id="addr-phone-error" message={state.errors?.phone} />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="addr-line1" required>
                Address
              </Label>
              <Input
                id="addr-line1"
                name="line1"
                required
                maxLength={200}
                autoComplete="address-line1"
                defaultValue={editing?.line1}
                className="mt-1.5"
                aria-invalid={Boolean(state.errors?.line1)}
                aria-describedby={state.errors?.line1 ? 'addr-line1-error' : undefined}
              />
              <FieldError id="addr-line1-error" message={state.errors?.line1} />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="addr-line2">Area, landmark</Label>
              <Input
                id="addr-line2"
                name="line2"
                maxLength={200}
                autoComplete="address-line2"
                defaultValue={editing?.line2 ?? ''}
                placeholder="Optional"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="addr-city" required>
                City
              </Label>
              <Input
                id="addr-city"
                name="city"
                required
                maxLength={100}
                autoComplete="address-level2"
                defaultValue={editing?.city}
                className="mt-1.5"
                aria-invalid={Boolean(state.errors?.city)}
                aria-describedby={state.errors?.city ? 'addr-city-error' : undefined}
              />
              <FieldError id="addr-city-error" message={state.errors?.city} />
            </div>

            <div>
              <Label htmlFor="addr-state" required>
                State
              </Label>
              <Input
                id="addr-state"
                name="state"
                required
                maxLength={100}
                autoComplete="address-level1"
                defaultValue={editing?.state}
                className="mt-1.5"
                aria-invalid={Boolean(state.errors?.state)}
                aria-describedby={state.errors?.state ? 'addr-state-error' : undefined}
              />
              <FieldError id="addr-state-error" message={state.errors?.state} />
            </div>

            <div>
              <Label htmlFor="addr-postalCode" required>
                PIN code
              </Label>
              <Input
                id="addr-postalCode"
                name="postalCode"
                required
                inputMode="numeric"
                maxLength={6}
                autoComplete="postal-code"
                defaultValue={editing?.postalCode}
                className="mt-1.5"
                aria-invalid={Boolean(state.errors?.postalCode)}
                aria-describedby={
                  state.errors?.postalCode ? 'addr-postalCode-error' : undefined
                }
              />
              <FieldError id="addr-postalCode-error" message={state.errors?.postalCode} />
            </div>

            <div>
              <Label htmlFor="addr-country">Country</Label>
              <Input
                id="addr-country"
                name="country"
                maxLength={80}
                autoComplete="country-name"
                defaultValue={editing?.country ?? 'India'}
                className="mt-1.5"
              />
            </div>
          </div>

          <label className="mt-5 flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="isDefault"
              defaultChecked={editing?.isDefault}
              className="h-4 w-4 rounded-sm border-input accent-primary"
            />
            Use this as my default address
          </label>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <SaveButton editing={Boolean(editing)} />
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {state.status === 'error' && state.message && (
              <p role="alert" className="text-sm text-destructive">
                {state.message}
              </p>
            )}
          </div>
        </form>
      )}

      {state.status === 'success' && state.message && (
        <p role="status" className="mt-4 text-sm text-muted-foreground">
          {state.message}
        </p>
      )}
    </div>
  );
}
