import Image from 'next/image';
import Link from 'next/link';
import { Check, Package } from 'lucide-react';
import {
  TRACKING_STEPS,
  statusIndex,
  statusLabel,
  statusDescription,
  statusNarrative,
  isCancelled,
} from '@/lib/orders';
import { formatPrice, formatDate } from '@/lib/utils';
import { contactEmail } from '@/content/site';
import { cn } from '@/lib/utils';

type OrderItemRow = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
};

type OrderEventRow = { id: string; status: string; message: string; createdAt: Date };

export type OrderView = {
  number: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  email: string;
  shipName: string;
  shipLine1: string;
  shipLine2: string | null;
  shipCity: string;
  shipState: string;
  shipPostalCode: string;
  shipCountry: string;
  subtotal: number;
  shipping: number;
  total: number;
  courier: string | null;
  trackingNumber: string | null;
  customerNote: string | null;
  placedAt: Date;
  items: OrderItemRow[];
  events: OrderEventRow[];
};

export function OrderDetail({ order }: { order: OrderView }) {
  const cancelled = isCancelled(order.status);
  const current = statusIndex(order.status);
  const storeEmail = contactEmail();

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-14">
      <div>
        {/* Timeline */}
        <section aria-labelledby="progress-heading">
          <h2 id="progress-heading" className="font-display text-xl">
            Progress
          </h2>

          {cancelled ? (
            <p className="mt-4 rounded-sm border border-border bg-muted/40 p-4 text-sm">
              {statusDescription('CANCELLED')}
            </p>
          ) : (
            <ol className="mt-6">
              {TRACKING_STEPS.map((step, i) => {
                const done = current >= i;
                const isCurrent = current === i;
                const isLast = i === TRACKING_STEPS.length - 1;

                return (
                  <li key={step} className="relative flex gap-4 pb-8 last:pb-0">
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute left-[0.6875rem] top-7 h-[calc(100%-1.75rem)] w-px',
                          done ? 'bg-primary' : 'bg-border',
                        )}
                      />
                    )}

                    <span
                      aria-hidden="true"
                      className={cn(
                        'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                        done
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background',
                      )}
                    >
                      {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>

                    <div className="-mt-0.5">
                      <p
                        className={cn(
                          'font-medium',
                          isCurrent && 'text-primary',
                          !done && 'text-muted-foreground',
                        )}
                      >
                        {statusLabel(step)}
                        {isCurrent && <span className="sr-only"> — current stage</span>}
                      </p>
                      {isCurrent && (
                        <>
                          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                            {statusDescription(step)}
                          </p>
                          {/*
                            What is actually happening to the cloth. At
                            IN_PRODUCTION this is the difference between a bar
                            that has not moved for three weeks and a customer
                            who knows that is exactly right.
                          */}
                          {statusNarrative(step) && (
                            <p className="mt-2.5 max-w-md border-l-2 border-border pl-3.5 text-sm leading-relaxed text-muted-foreground">
                              {statusNarrative(step)}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {order.trackingNumber && (
            <div className="mt-4 rounded-sm border border-border bg-muted/40 p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Package className="h-4 w-4" aria-hidden="true" />
                {order.courier ?? 'Courier'}
              </p>
              <p className="tabular mt-1 text-sm text-muted-foreground">
                Tracking number: {order.trackingNumber}
              </p>
            </div>
          )}
        </section>

        {/* Event log */}
        {order.events.length > 0 && (
          <section aria-labelledby="history-heading" className="mt-10">
            <h2 id="history-heading" className="font-display text-xl">
              History
            </h2>
            <ul className="mt-4 flex flex-col gap-4 border-l border-border pl-5">
              {order.events.map((event) => (
                <li key={event.id}>
                  <p className="text-sm">{event.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(event.createdAt)} · {statusLabel(event.status)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Items */}
        <section aria-labelledby="items-heading" className="mt-10">
          <h2 id="items-heading" className="font-display text-xl">
            {order.items.length} {order.items.length === 1 ? 'piece' : 'pieces'}
          </h2>
          <ul className="mt-5 divide-y divide-border border-y border-border">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4">
                <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-sm bg-cotton-300">
                  <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug">
                    <Link href={`/product/${item.slug}`} className="hover:text-primary">
                      {item.name}
                    </Link>
                  </p>
                  {item.quantity > 1 && (
                    <p className="tabular mt-0.5 text-sm text-muted-foreground">
                      × {item.quantity}
                    </p>
                  )}
                </div>
                <p className="tabular shrink-0 font-medium">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="flex flex-col gap-6">
        <div className="rounded-sm border border-border bg-card p-5">
          <h2 className="font-display text-lg">Summary</h2>
          <dl className="mt-4 flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="tabular">
                {order.shipping === 0 ? 'Included' : formatPrice(order.shipping)}
              </dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-3.5 text-base font-medium">
              <dt>Total</dt>
              <dd className="tabular">{formatPrice(order.total)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-3.5">
              <dt className="text-muted-foreground">Payment</dt>
              <dd>
                {order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Online'}
                {order.paymentStatus === 'PAID' && ' · Paid'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-sm border border-border bg-card p-5">
          <h2 className="font-display text-lg">Delivering to</h2>
          <address className="mt-3 text-sm not-italic leading-relaxed text-muted-foreground">
            {order.shipName}
            <br />
            {order.shipLine1}
            <br />
            {order.shipLine2 && (
              <>
                {order.shipLine2}
                <br />
              </>
            )}
            {order.shipCity}, {order.shipState} {order.shipPostalCode}
            <br />
            {order.shipCountry}
          </address>
        </div>

        {order.customerNote && (
          <div className="rounded-sm border border-border bg-card p-5">
            <h2 className="font-display text-lg">Your note</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {order.customerNote}
            </p>
          </div>
        )}

        <div className="rounded-sm border border-border bg-muted/40 p-5">
          <h2 className="font-display text-lg">Something wrong?</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Write to the store quoting {order.number} and someone will pick it up.
          </p>
          {storeEmail ? (
            <a
              href={`mailto:${storeEmail}?subject=${encodeURIComponent(`Order ${order.number}`)}`}
              className="mt-3 inline-block text-sm text-primary underline underline-offset-4 [overflow-wrap:anywhere]"
            >
              {storeEmail}
            </a>
          ) : (
            <Link
              href="/contact"
              className="mt-3 inline-block text-sm text-primary underline underline-offset-4"
            >
              Write to the store
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}
