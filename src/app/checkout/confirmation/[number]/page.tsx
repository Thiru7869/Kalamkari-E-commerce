import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { OrderDetail } from '@/components/orders/order-detail';
import { Button } from '@/components/ui/button';
import { hasOrderAccess } from '@/lib/order-access';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Order confirmed',
  robots: { index: false, follow: false },
};

type Params = Promise<{ number: string }>;

export default async function ConfirmationPage({ params }: { params: Params }) {
  const { number } = await params;

  const order = await prisma.order.findUnique({
    where: { number: number.toUpperCase() },
    include: { items: true, events: { orderBy: { createdAt: 'desc' } } },
  });

  if (!order) notFound();

  // An order number alone must not expose an address and phone number. The
  // reader is either signed in as the purchaser, an admin, or holding the
  // httpOnly grant this browser was given at checkout. The email address is
  // deliberately no longer accepted from the URL — see lib/order-access.ts.
  const session = await auth();
  const isOwner =
    (session?.user?.id && order.userId === session.user.id) ||
    session?.user?.role === 'ADMIN' ||
    (await hasOrderAccess(order.number));

  if (!isOwner) notFound();

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
        <h1 className="mt-5 text-display-lg">Thank you</h1>
        <p className="mt-4 text-body-lg text-muted-foreground">
          Your order is with the store in {site.location.town}.{' '}
          {order.paymentStatus === 'PENDING' && order.paymentMethod === 'RAZORPAY'
            ? 'A confirmation goes out as soon as the payment clears.'
            : `We have sent a confirmation to ${order.email}.`}
        </p>
        <p className="tabular mt-6 inline-block rounded-sm border border-border bg-card px-5 py-3 font-display text-xl">
          {order.number}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Keep this reference — it is all you need to track the order.
        </p>

        {order.paymentMethod === 'COD' && (
          <p className="mx-auto mt-6 max-w-md rounded-sm bg-muted p-4 text-sm leading-relaxed text-muted-foreground">
            You have chosen cash on delivery. Someone from the store will call you on the
            number you gave to confirm before anything is dispatched.
          </p>
        )}
      </div>

      <div className="mt-14">
        <OrderDetail order={order} />
      </div>

      <div className="mt-14 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild size="lg" variant="outline">
          <Link href="/shop">Keep looking</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href={`/orders/track?number=${order.number}`}>Track this order</Link>
        </Button>
      </div>
    </div>
  );
}
