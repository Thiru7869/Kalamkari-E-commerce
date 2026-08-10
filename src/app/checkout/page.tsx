import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { getCart } from '@/lib/cart';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isRazorpayConfigured } from '@/lib/payments';
import { formatPrice } from '@/lib/utils';
import { site } from '@/content/site';
import { Wordmark } from '@/components/layout/wordmark';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const cart = await getCart();
  if (cart.lines.length === 0) redirect('/cart');

  const session = await auth();
  const savedAddress = session?.user?.id
    ? await prisma.address.findFirst({
        where: { userId: session.user.id },
        orderBy: [{ isDefault: 'desc' }, { id: 'desc' }],
      })
    : null;

  return (
    <div className="min-h-svh bg-cotton-100 dark:bg-background">
      {/* Distraction-free header: the only link out is back to the bag. */}
      <div className="border-b border-border bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" aria-label={`${site.name}, home`}>
            <Wordmark compact />
          </Link>
          <Link
            href="/cart"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Back to bag
          </Link>
        </div>
      </div>

      <div className="container section-y-sm">
        <h1 className="text-display-md">Checkout</h1>

        <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-12">
          <div className="order-2 lg:order-1">
            <CheckoutForm
              defaultEmail={session?.user?.email ?? ''}
              savedAddress={
                savedAddress
                  ? {
                      fullName: savedAddress.fullName,
                      phone: savedAddress.phone,
                      line1: savedAddress.line1,
                      line2: savedAddress.line2 ?? '',
                      city: savedAddress.city,
                      state: savedAddress.state,
                      postalCode: savedAddress.postalCode,
                    }
                  : null
              }
              isSignedIn={Boolean(session?.user)}
              razorpayAvailable={isRazorpayConfigured()}
            />
          </div>

          {/* Summary first in the DOM on mobile so buyers see what they are
              paying for before the form; visually reordered on desktop. */}
          <aside className="order-1 mb-8 lg:order-2 lg:mb-0" aria-label="Order summary">
            <div className="rounded-sm border border-border bg-background p-5 lg:sticky lg:top-8">
              <h2 className="font-display text-lg">
                {cart.itemCount} {cart.itemCount === 1 ? 'piece' : 'pieces'}
              </h2>

              <ul className="mt-5 flex flex-col gap-4">
                {cart.lines.map((line) => (
                  <li key={line.id} className="flex gap-3">
                    <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-sm bg-cotton-300">
                      <Image
                        src={line.image}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">{line.name}</p>
                      {line.quantity > 1 && (
                        <p className="tabular text-xs text-muted-foreground">
                          × {line.quantity}
                        </p>
                      )}
                    </div>
                    <p className="tabular shrink-0 text-sm">
                      {formatPrice(line.price * line.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <dl className="mt-6 flex flex-col gap-2.5 border-t border-border pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular">{formatPrice(cart.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="tabular">
                    {cart.shipping === 0 ? 'Included' : formatPrice(cart.shipping)}
                  </dd>
                </div>
                <div className="mt-2 flex justify-between border-t border-border pt-4 text-base font-medium">
                  <dt>Total</dt>
                  <dd className="tabular">{formatPrice(cart.total)}</dd>
                </div>
              </dl>

              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Inclusive of all taxes. Dispatched from {site.location.town} in{' '}
                {site.shipping.domesticDays}.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
