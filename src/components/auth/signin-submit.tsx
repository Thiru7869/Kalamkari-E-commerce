'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * The submit button for the sign-in forms, which are server-action forms on a
 * server page. Only the button needs to know the form is in flight, so only the
 * button is a client component: it disables itself and says what is happening,
 * which stops a second tap sending a second email.
 */
export function SigninSubmit({
  children,
  pendingLabel,
  variant,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: 'outline';
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      variant={variant}
      disabled={pending}
      aria-busy={pending}
      className="w-full"
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
