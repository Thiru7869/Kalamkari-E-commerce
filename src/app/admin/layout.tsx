import Link from 'next/link';
import { requireAdmin } from '@/lib/require-admin';
import { site } from '@/content/site';

const adminNav = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/products', label: 'Catalogue' },
  { href: '/admin/commissions', label: 'Commissions' },
  { href: '/admin/enquiries', label: 'Enquiries' },
];

/**
 * Admin routes are gated in a server layout rather than middleware, because
 * middleware runs on the edge where the Prisma adapter cannot read a user's
 * role from the database.
 *
 * This layout guard handles navigation. It is NOT sufficient on its own —
 * every admin page calls `requireAdmin()` itself before querying, because
 * layout and page render concurrently. See the note in lib/require-admin.ts.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-svh bg-cotton-100 dark:bg-background">
      <div className="border-b border-border bg-background">
        <div className="container">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-lg">Store</span>
              <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {site.location.town}
              </span>
            </div>
            <Link
              href="/"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              View site
            </Link>
          </div>

          <nav aria-label="Admin" className="-mb-px">
            <ul className="flex gap-1 overflow-x-auto no-scrollbar">
              {adminNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex h-11 items-center whitespace-nowrap border-b-2 border-transparent px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="container py-8 md:py-10">{children}</div>
    </div>
  );
}
