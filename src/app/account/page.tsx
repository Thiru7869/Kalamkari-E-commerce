import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Package, MapPin, LogOut, ShieldCheck } from 'lucide-react';
import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/primitives';
import { ProfileForm } from '@/components/account/profile-form';
import { AddressBook } from '@/components/account/address-book';
import { OrderActions } from '@/components/account/order-actions';
import { formatPrice, formatDate } from '@/lib/utils';
import { statusLabel, statusDescription } from '@/lib/orders';

export const metadata: Metadata = {
  title: 'Your account',
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/signin?callbackUrl=/account');

  const userId = session.user.id;

  const [user, orders, wishlistCount, addresses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true },
    }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { placedAt: 'desc' },
      take: 20,
      include: { items: { take: 4 } },
    }),
    prisma.wishlistItem.count({ where: { userId } }),
    prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
    }),
  ]);

  return (
    <div className="container py-10 md:py-14">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-display-lg">
            {user?.name ? `Hello, ${user.name.split(' ')[0]}` : 'Your account'}
          </h1>
          <p className="mt-2 text-muted-foreground">{user?.email}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {session.user.role === 'ADMIN' && (
            <Button asChild variant="outline">
              <Link href="/admin">
                <ShieldCheck aria-hidden="true" />
                Store dashboard
              </Link>
            </Button>
          )}
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <Button type="submit" variant="ghost">
              <LogOut aria-hidden="true" />
              Sign out
            </Button>
          </form>
        </div>
      </div>

      {/* In-page anchors for the two sections below; the wishlist is its own
          route. A tile that linked back to the page it sits on was worse than
          no link at all. */}
      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { href: '#orders', label: 'Orders', value: orders.length, Icon: Package },
          { href: '/wishlist', label: 'Saved pieces', value: wishlistCount, Icon: Heart },
          { href: '#addresses', label: 'Addresses', value: addresses.length, Icon: MapPin },
        ].map(({ href, label, value, Icon }) => (
          <li key={label}>
            <Link
              href={href}
              className="flex items-center gap-4 rounded-sm border border-border bg-card p-5 transition-colors hover:border-foreground/25"
            >
              <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="tabular block font-display text-2xl leading-none">{value}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* ------------------------------------------------------------------ */}
      {/* Orders                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section id="orders" className="mt-14 scroll-mt-28" aria-labelledby="orders-heading">
        <h2 id="orders-heading" className="text-display-sm">
          Your orders
        </h2>

        {orders.length === 0 ? (
          <div className="mt-6 rounded-sm border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">You have not ordered anything yet.</p>
            <Button asChild className="mt-5">
              <Link href="/shop">See what is in the store</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-6 flex flex-col gap-4">
            {orders.map((order) => (
              <li
                key={order.id}
                className="rounded-sm border border-border bg-card p-5 transition-colors hover:border-foreground/25"
              >
                {/*
                  The tracking link carries the order number only. It used to
                  carry the email address too, which put it in browser history
                  and in the Referer of every outbound link on the page — the
                  address is the second factor protecting the order, so it is
                  the last thing that should be published in a URL. A signed-in
                  owner is recognised by session instead.
                */}
                <Link
                  href={`/orders/track?number=${order.number}`}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <div>
                      <p className="tabular font-display text-lg">{order.number}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {formatDate(order.placedAt)} · {order.items.length}{' '}
                        {order.items.length === 1 ? 'piece' : 'pieces'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={order.status === 'DELIVERED' ? 'muted' : 'default'}>
                        {statusLabel(order.status)}
                      </Badge>
                      <p className="tabular font-medium">{formatPrice(order.total)}</p>
                    </div>
                  </div>

                  {/* What is actually happening to the cloth, not just a state name. */}
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {statusDescription(order.status)}
                  </p>

                  <ul className="mt-4 flex gap-2">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="relative aspect-[3/4] w-12 overflow-hidden rounded-sm bg-cotton-300"
                      >
                        <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                      </li>
                    ))}
                  </ul>
                </Link>

                <OrderActions number={order.number} status={order.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Addresses                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section id="addresses" className="mt-14 scroll-mt-28" aria-labelledby="addresses-heading">
        <h2 id="addresses-heading" className="text-display-sm">
          Saved addresses
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Editing these never changes an order that has already been placed — every order
          keeps its own record of where it was sent.
        </p>
        <AddressBook addresses={addresses} />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Profile                                                             */}
      {/* ------------------------------------------------------------------ */}
      <section id="details" className="mt-14 scroll-mt-28" aria-labelledby="details-heading">
        <h2 id="details-heading" className="text-display-sm">
          Your details
        </h2>
        <ProfileForm
          name={user?.name ?? ''}
          phone={user?.phone ?? ''}
          email={user?.email ?? ''}
        />
      </section>
    </div>
  );
}
