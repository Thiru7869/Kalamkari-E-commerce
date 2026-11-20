import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils';
import { statusLabel } from '@/lib/orders';

export const metadata: Metadata = {
  title: 'Store dashboard',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  // Must precede every query — see lib/require-admin.ts.
  await requireAdmin();

  const [
    orderCount,
    openOrders,
    revenue,
    productCount,
    lowStock,
    newCommissions,
    unhandledEnquiries,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: { status: { in: ['CONFIRMED', 'IN_PRODUCTION', 'PACKED', 'SHIPPED'] } },
    }),
    // Cancelled orders are excluded — counting them as revenue would flatter
    // the number and make it useless for actual decisions.
    prisma.order.aggregate({
      where: { status: { not: 'CANCELLED' } },
      _sum: { total: true },
    }),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.product.count({ where: { status: 'ACTIVE', stock: 0 } }),
    prisma.commissionRequest.count({ where: { status: 'NEW' } }),
    prisma.enquiry.count({ where: { handled: false } }),
    prisma.order.findMany({
      orderBy: { placedAt: 'desc' },
      take: 8,
      include: { items: { select: { id: true } } },
    }),
  ]);

  const stats = [
    { label: 'Orders in progress', value: String(openOrders), href: '/admin/orders' },
    { label: 'Orders, all time', value: String(orderCount), href: '/admin/orders' },
    { label: 'Revenue, all time', value: formatPrice(revenue._sum.total ?? 0), href: '/admin/orders' },
    { label: 'Pieces listed', value: String(productCount), href: '/admin/products' },
    { label: 'Sold out', value: String(lowStock), href: '/admin/products' },
    { label: 'New commissions', value: String(newCommissions), href: '/admin/commissions' },
    { label: 'Unread enquiries', value: String(unhandledEnquiries), href: '/admin/enquiries' },
  ];

  return (
    <>
      <h1 className="text-display-md">Overview</h1>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <li key={stat.label}>
            <Link
              href={stat.href}
              className="block rounded-sm border border-border bg-background p-5 transition-colors hover:border-foreground/25"
            >
              <span className="tabular block font-display text-2xl leading-none">
                {stat.value}
              </span>
              <span className="mt-2 block text-sm text-muted-foreground">{stat.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-12" aria-labelledby="recent-heading">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="recent-heading" className="text-display-sm">
            Recent orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            All orders
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="mt-6 rounded-sm border border-border bg-background p-8 text-center text-muted-foreground">
            No orders yet.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-sm border border-border bg-background">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="px-4 py-3 font-medium">Reference</th>
                  <th scope="col" className="px-4 py-3 font-medium">Customer</th>
                  <th scope="col" className="px-4 py-3 font-medium">Placed</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.number}`}
                        className="tabular font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {order.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{order.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(order.placedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={order.status === 'DELIVERED' ? 'muted' : 'default'}>
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
      </section>
    </>
  );
}
