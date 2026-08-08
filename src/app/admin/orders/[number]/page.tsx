import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import { OrderDetail } from '@/components/orders/order-detail';
import { OrderAdminControls } from '@/components/admin/order-admin-controls';
import { statusLabel } from '@/lib/orders';

export const metadata: Metadata = {
  title: 'Order',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Params = Promise<{ number: string }>;

export default async function AdminOrderPage({ params }: { params: Params }) {
  // Must precede every query — see lib/require-admin.ts. Order rows carry a
  // customer's address and phone number, so this one matters most.
  await requireAdmin();

  const { number } = await params;

  const order = await prisma.order.findUnique({
    where: { number: number.toUpperCase() },
    include: { items: true, events: { orderBy: { createdAt: 'desc' } } },
  });

  if (!order) notFound();

  return (
    <>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All orders
      </Link>

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="tabular text-display-md">{order.number}</h1>
          <p className="mt-1 text-muted-foreground">
            {order.shipName} · {order.email}
            {order.phone && ` · ${order.phone}`}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{statusLabel(order.status)}</p>
      </div>

      <div className="mt-8 rounded-sm border border-border bg-background p-5 md:p-6">
        <OrderAdminControls
          orderNumber={order.number}
          currentStatus={order.status}
          courier={order.courier ?? ''}
          trackingNumber={order.trackingNumber ?? ''}
        />
      </div>

      <div className="mt-10 rounded-sm border border-border bg-background p-5 md:p-6">
        <OrderDetail order={order} />
      </div>
    </>
  );
}
