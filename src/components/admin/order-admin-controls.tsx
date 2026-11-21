'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateOrderStatus, updateShipping } from '@/app/actions/admin';
import { ORDER_STATUSES, statusLabel } from '@/lib/orders';

export function OrderAdminControls({
  orderNumber,
  currentStatus,
  courier,
  trackingNumber,
}: {
  orderNumber: string;
  currentStatus: string;
  courier: string;
  trackingNumber: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState('');
  const [courierValue, setCourierValue] = useState(courier);
  const [trackingValue, setTrackingValue] = useState(trackingNumber);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const saveStatus = () => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderNumber, status, note);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      setNote('');
      router.refresh();
    });
  };

  const saveShipping = () => {
    startTransition(async () => {
      const result = await updateShipping(orderNumber, courierValue, trackingValue);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h2 className="font-display text-lg">Move this order on</h2>

        <div className="mt-4">
          <Label htmlFor="admin-status">Status</Label>
          <select
            id="admin-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-sm border border-input bg-card px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <Label htmlFor="admin-note">Note for the customer</Label>
          <Textarea
            id="admin-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="mt-1.5"
            placeholder="Left blank, a sensible default message is used. This appears on the customer's tracking page."
          />
        </div>

        {status === 'CANCELLED' && currentStatus !== 'CANCELLED' && (
          <p className="mt-3 rounded-sm border border-myrobalan-500/40 bg-myrobalan-100 p-3 text-xs leading-relaxed text-myrobalan-900 dark:bg-myrobalan-950 dark:text-myrobalan-100">
            Cancelling returns every piece in this order to the catalogue.
          </p>
        )}

        <Button
          onClick={saveStatus}
          disabled={pending || (status === currentStatus && !note.trim())}
          className="mt-4"
        >
          {pending ? 'Saving…' : 'Save status'}
        </Button>
      </div>

      <div>
        <h2 className="font-display text-lg">Courier</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Shown on the customer&rsquo;s tracking page once saved.
        </p>

        <div className="mt-4">
          <Label htmlFor="admin-courier">Courier</Label>
          <Input
            id="admin-courier"
            value={courierValue}
            onChange={(e) => setCourierValue(e.target.value)}
            className="mt-1.5"
            placeholder="India Post, DTDC, Delhivery…"
          />
        </div>

        <div className="mt-4">
          <Label htmlFor="admin-tracking">Tracking number</Label>
          <Input
            id="admin-tracking"
            value={trackingValue}
            onChange={(e) => setTrackingValue(e.target.value)}
            className="mt-1.5"
            spellCheck={false}
          />
        </div>

        <Button variant="outline" onClick={saveShipping} disabled={pending} className="mt-4">
          {pending ? 'Saving…' : 'Save courier details'}
        </Button>
      </div>
    </div>
  );
}
