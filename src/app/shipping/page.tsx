import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/content/site';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Shipping & returns',
  description: `How orders are packed and sent from ${site.location.town}, what delivery costs, and what can and cannot be returned.`,
  alternates: { canonical: '/shipping' },
};

export default function ShippingPage() {
  return (
    <div className="container py-14 md:py-20">
      <div className="mx-auto max-w-[46rem]">
        <h1 className="text-display-lg">Shipping &amp; returns</h1>

        <section className="mt-12">
          <h2 className="text-display-sm">Shipping</h2>
          <dl className="mt-6 flex flex-col gap-5">
            <div>
              <dt className="font-medium">Within India</dt>
              <dd className="mt-1 leading-relaxed text-muted-foreground">
                {formatPrice(site.shipping.flatRate)} flat, or free on orders over{' '}
                {formatPrice(site.shipping.freeAbove)}. Delivery usually{' '}
                {site.shipping.domesticDays} from dispatch.
              </dd>
            </div>
            <div>
              <dt className="font-medium">International</dt>
              <dd className="mt-1 leading-relaxed text-muted-foreground">
                We do ship abroad, but not through this checkout yet.{' '}
                <Link href="/contact" className="text-primary underline underline-offset-4">
                  Write to us
                </Link>{' '}
                with the piece and your country and we will quote you properly rather than
                guess.
              </dd>
            </div>
            <div>
              <dt className="font-medium">How it is packed</dt>
              <dd className="mt-1 leading-relaxed text-muted-foreground">
                {site.shipping.note} Nothing is shipped in plastic against the cloth.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Dispatch timing</dt>
              <dd className="mt-1 leading-relaxed text-muted-foreground">
                Finished pieces are dispatched within two working days. Commissions run to
                the timeline agreed with you — and, honestly, to the weather. Nothing in this
                craft dries without sun, so the monsoon stretches everything.
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-14">
          <h2 className="text-display-sm">Returns</h2>

          <div className="mt-6 flex flex-col gap-6">
            <div>
              <h3 className="font-display text-lg">What we will always put right</h3>
              <ul className="mt-2 flex list-disc flex-col gap-2 pl-5 leading-relaxed text-muted-foreground">
                <li>A piece that arrives damaged in transit.</li>
                <li>A piece that is materially not what was described or photographed.</li>
                <li>The wrong item sent.</li>
              </ul>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Tell us within 7 days of delivery, with a photograph, and we will replace it,
                repair it or refund it — whichever you prefer.
              </p>
            </div>

            <div>
              <h3 className="font-display text-lg">What is not a defect</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                We want to be straightforward about this rather than have you discover it
                on arrival. In hand-painted work with natural dye, the following are
                inherent and are how the craft is identified:
              </p>
              <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 leading-relaxed text-muted-foreground">
                <li>Slight variation in line weight and in the border repeat.</li>
                <li>
                  Colour depth varying across the cloth, and between a piece and its
                  photograph.
                </li>
                <li>Slubs and irregularities in handloom and wild-silk fibre.</li>
                <li>
                  A cream ground rather than a bright white — it was never bleached.
                </li>
                <li>A faint natural smell in a new piece, which goes with airing.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-display text-lg">Changed your mind</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                Write to us within 7 days of delivery. If the piece comes back unworn,
                unwashed and undamaged, we will refund it less the return postage.
                Commissioned pieces cannot be returned on change of mind — they were painted
                for you specifically, over several weeks, and cannot be sold to anyone else.
              </p>
            </div>
          </div>
        </section>

        <p className="mt-12 rounded-sm border border-border bg-muted/40 p-5 text-sm leading-relaxed text-muted-foreground">
          Anything unclear?{' '}
          <Link href="/contact" className="text-primary underline underline-offset-4">
            Ask us
          </Link>{' '}
          before you order rather than after. We would much rather answer a question than
          process a return.
        </p>
      </div>
    </div>
  );
}
