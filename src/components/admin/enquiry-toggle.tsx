'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { markEnquiryHandled } from '@/app/actions/admin';

export function EnquiryToggle({ id, handled }: { id: string; handled: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant={handled ? 'ghost' : 'outline'}
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await markEnquiryHandled(id, !handled);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success(result.message);
          router.refresh();
        });
      }}
    >
      {handled ? 'Reopen' : 'Mark handled'}
    </Button>
  );
}
