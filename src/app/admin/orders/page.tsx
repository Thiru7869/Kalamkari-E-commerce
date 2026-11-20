import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils';
import { ORDER_STATUSES, statusLabel } from '@/lib/orders';

export const metadata: Metadata = {
  title: 'Orders',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Search = Promise<{ status?: string }>;

export default async function AdminOrdersPage({ searchParams }: { searchParams: Search }) {
  // Must precede every query — see lib/require-admin.ts.
  await requireAdmin();

  const { status } = await searchParams;
  const filter = status && ORDER_STATUSES.includes(status as never) ? status : undefined;

  const orders = await prisma.order.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { placedAt: 'desc' },
    take: 100,
    include: { items: { select: { id: true, name: true } } },
  });

  return (
    <>
      <h1 className="text-display-md">Orders</h1>

      <nav aria-label="Filter by status" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href="/admin/orders"
              aria-current={!filter ? 'page' : undefined}
              className={`inline-flex h-9 items-center rounded-sm border px-3 text-sm transition-colors ${
                !filter ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
              }`}
            >
              All
            </Link>
          </li>
          {ORDER_STATUSES.map((s) => (
            <li key={s}>
              <Link
                href={`/admin/orders?status=${s}`}
                aria-current={filter === s ? 'page' : undefined}
                className={`inline-flex h-9 items-center rounded-sm border px-3 text-sm transition-colors ${
                  filter === s
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border'
                }`}
              >
                {statusLabel(s)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {orders.length === 0 ? (
        <p className="mt-8 rounded-sm border border-border bg-background p-10 text-center text-muted-foreground">
          No orders {filter ? `with status “${statusLabel(filter)}”` : 'yet'}.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-sm border border-border bg-background">
          <table className="w-full min-w-[52rem] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th scope="col" className="px-4 py-3 font-medium">Reference</th>
                <th scope="col" className="px-4 py-3 font-medium">Customer</th>
                <th scope="col" className="px-4 py-3 font-medium">Pieces</th>
                <th scope="col" className="px-4 py-3 font-medium">Placed</th>
                <th scope="col" className="px-4 py-3 font-medium">Payment</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.number}`}
                      className="tabular font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {order.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block">{order.shipName}</span>
                    <span className="block text-xs text-muted-foreground">{order.email}</span>
                  </td>
                  <td className="tabular px-4 py-3 text-muted-foreground">
                    {order.items.length}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(order.placedAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.paymentMethod === 'COD' ? 'COD' : 'Online'}
                    {order.paymentStatus === 'PAID' && ' · paid'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={order.status === 'CANCELLED' ? 'muted' : 'default'}>
                      {statusLabel(order.status)}
                    </Badge>
                  </td>
                  <td className="tabular px-4 py-3 text-right">{formatPrice(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
