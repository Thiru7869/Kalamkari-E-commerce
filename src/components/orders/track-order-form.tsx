'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Submits via the URL rather than an action, so a tracking result is a real
 * page the customer can bookmark, refresh and share with whoever is waiting
 * for the parcel.
 */
export function TrackOrderForm({
  defaultNumber,
  defaultEmail,
  error,
  className,
}: {
  defaultNumber: string;
  defaultEmail: string;
  error?: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const number = String(data.get('number') ?? '').trim().toUpperCase();
        const email = String(data.get('email') ?? '').trim();
        setPending(true);
        router.push(
          `/orders/track?number=${encodeURIComponent(number)}&email=${encodeURIComponent(email)}`,
        );
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="track-number" required>Order reference</Label>
          <Input
            id="track-number"
            name="number"
            required
            defaultValue={defaultNumber}
            placeholder="SVL-2A7F4C"
            autoComplete="off"
            spellCheck={false}
            className="mt-1.5 uppercase"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'track-error' : undefined}
          />
        </div>
        <div>
          <Label htmlFor="track-email" required>Email used to order</Label>
          <Input
            id="track-email"
            name="email"
            type="email"
            required
            defaultValue={defaultEmail}
            autoComplete="email"
            inputMode="email"
            className="mt-1.5"
            aria-invalid={Boolean(error)}
          />
        </div>
      </div>

      {error && (
        <p id="track-error" role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-6" disabled={pending}>
        {pending ? 'Looking…' : 'Find my order'}
      </Button>
    </form>
  );
}
