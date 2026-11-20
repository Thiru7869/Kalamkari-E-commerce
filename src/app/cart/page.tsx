import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartLineControls } from '@/components/cart/cart-line-controls';
import { getCart } from '@/lib/cart';
import { formatPrice } from '@/lib/utils';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Your bag',
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const cart = await getCart();

  if (cart.lines.length === 0) {
    return (
      <div className="container section-y-lg">
        <div className="mx-auto max-w-md text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-5 text-display-md">Your bag is empty</h1>
          <p className="mt-4 text-muted-foreground">
            The store holds a small number of finished pieces at any one time, because each
            takes weeks of hand-work. Have a look at what is here now.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/">
                Browse the store
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/custom">Commission a piece</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const soldOutLines = cart.lines.filter((l) => l.stock < 1);

  return (
    <div className="container section-y-sm">
      <h1 className="text-display-lg">Your bag</h1>
      <p className="mt-2 text-muted-foreground">
        {cart.itemCount} {cart.itemCount === 1 ? 'piece' : 'pieces'}
      </p>

      {soldOutLines.length > 0 && (
        <div
          role="alert"
          className="mt-6 rounded-sm border border-destructive/40 bg-destructive/5 p-4 text-sm"
        >
          <p className="font-medium">Something in your bag has sold</p>
          <p className="mt-1 text-muted-foreground">
            {soldOutLines.map((l) => l.name).join(', ')} — these are one-of-one pieces and
            someone reached them first. Remove them to continue, or ask us to paint the same
            motif for you.
          </p>
        </div>
      )}

      <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <ul className="divide-y divide-border border-y border-border">
          {cart.lines.map((line) => (
            <li key={line.id} className="flex gap-4 py-5 md:gap-6">
              <Link
                href={`/product/${line.slug}`}
                className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-sm bg-cotton-300 md:w-28"
              >
                <Image
                  src={line.image}
                  alt={line.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                  <h2 className="font-display text-lg leading-snug">
                    <Link href={`/product/${line.slug}`} className="hover:text-primary">
                      {line.name}
                    </Link>
                  </h2>
                  <p className="tabular font-medium">
                    {formatPrice(line.price * line.quantity)}
                  </p>
                </div>

                {line.quantity > 1 && (
                  <p className="tabular mt-0.5 text-sm text-muted-foreground">
                    {formatPrice(line.price)} each
                  </p>
                )}

                {line.stock < 1 && (
                  <p className="mt-1.5 text-sm font-medium text-destructive">Sold</p>
                )}

                <div className="mt-auto pt-4">
                  <CartLineControls
                    itemId={line.id}
                    quantity={line.quantity}
                    maxQuantity={Math.max(1, line.stock)}
                    disabled={line.stock < 1}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="mt-10 lg:mt-0" aria-label="Order summary">
          <div className="rounded-sm border border-border bg-card p-5 lg:sticky lg:top-28">
            <h2 className="font-display text-xl">Summary</h2>

            <dl className="mt-5 flex flex-col gap-3 text-sm">
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

            {cart.freeShippingGap > 0 && (
              <p className="mt-4 rounded-sm bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
                {formatPrice(cart.freeShippingGap)} more for free shipping.
              </p>
            )}

            {/* A disabled <button> rather than a styled-dead <a>: a link that
                does nothing is invisible to keyboard and screen-reader users. */}
            {soldOutLines.length > 0 ? (
              <Button size="lg" className="mt-6 w-full" disabled>
                Remove sold pieces to continue
              </Button>
            ) : (
              <Button asChild size="lg" className="mt-6 w-full">
                <Link href="/checkout">
                  Checkout
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            )}

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Cash on delivery and online payment both available. Dispatched from{' '}
              {site.location.town} within {site.shipping.domesticDays}.
            </p>

            <Link
              href="/"
              className="mt-5 inline-block text-sm text-primary underline-offset-4 hover:underline"
            >
              Keep looking
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
