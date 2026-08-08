'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { setCommissionStatus } from '@/app/actions/admin';

const STATUSES = [
  { value: 'NEW', label: 'New' },
  { value: 'IN_DISCUSSION', label: 'In discussion' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'IN_PROGRESS', label: 'Being painted' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DECLINED', label: 'Declined' },
];

export function CommissionStatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <>
      <label htmlFor={`commission-${id}`} className="sr-only">
        Commission status
      </label>
      <select
        id={`commission-${id}`}
        defaultValue={status}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          startTransition(async () => {
            const result = await setCommissionStatus(id, next);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success(result.message);
            router.refresh();
          });
        }}
        className="h-9 rounded-sm border border-input bg-card px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </>
  );
}
