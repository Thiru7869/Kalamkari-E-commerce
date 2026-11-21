import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { OrderDetail } from '@/components/orders/order-detail';
import { TrackOrderForm } from '@/components/orders/track-order-form';
import { trackOrderSchema } from '@/lib/validation';
import { statusLabel } from '@/lib/orders';

export const metadata: Metadata = {
  title: 'Track an order',
  description: 'Follow an order from the store in Srikalahasti through to delivery.',
  alternates: { canonical: '/orders/track' },
};

type Search = Promise<{ number?: string; email?: string }>;

export default async function TrackOrderPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const session = await auth();

  // Two ways in, and only two.
  //
  // A guest supplies the order number *and* the matching email: a guessable
  // reference alone must never reveal a customer's address and phone number.
  //
  // A signed-in customer is already authenticated, so the account page links
  // here with the number alone rather than putting the email in a URL where it
  // would land in browser history and in the Referer of every outbound link.
  const parsed =
    sp.number && sp.email
      ? trackOrderSchema.safeParse({ number: sp.number, email: sp.email })
      : null;

  const bySession =
    session?.user?.id && sp.number && !sp.email
      ? await prisma.order.findFirst({
          where: { number: sp.number.toUpperCase(), userId: session.user.id },
          include: { items: true, events: { orderBy: { createdAt: 'desc' } } },
        })
      : null;

  const byCredentials = parsed?.success
    ? await prisma.order.findFirst({
        where: {
          number: parsed.data.number,
          email: parsed.data.email,
        },
        include: { items: true, events: { orderBy: { createdAt: 'desc' } } },
      })
    : null;

  const order = bySession ?? byCredentials;

  const notFound = Boolean(parsed?.success) && !order;

  return (
    <div className="container section-y">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-display-lg">Track an order</h1>

        {/* A signed-in owner arrived with the order already resolved; asking
            them for the email they are signed in with would be theatre. */}
        {bySession ? (
          <p className="mt-4 text-body-lg text-muted-foreground">
            Where this order has got to, and what is happening to the cloth.
          </p>
        ) : (
          <>
            <p className="mt-4 text-body-lg text-muted-foreground">
              Enter the reference from your confirmation, along with the email you ordered
              with.
            </p>

            <TrackOrderForm
              defaultNumber={sp.number ?? ''}
              defaultEmail={sp.email ?? ''}
              error={
                notFound
                  ? 'We could not find an order with that reference and email. Check both — the reference looks like SVL-2A7F4C.'
                  : parsed && !parsed.success
                    ? parsed.error.issues[0]?.message
                    : undefined
              }
              className="mt-8"
            />
          </>
        )}
      </div>

      {order && (
        <div className="mt-14">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-5">
            <h2 className="tabular font-display text-display-sm">{order.number}</h2>
            <p className="text-sm text-muted-foreground">{statusLabel(order.status)}</p>
          </div>
          <OrderDetail order={order} />
        </div>
      )}
    </div>
  );
}
