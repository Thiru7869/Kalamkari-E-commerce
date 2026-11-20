import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import Link from 'next/link';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Terms',
  description: 'The terms on which the store sells.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="container section-y">
      <div className="mx-auto max-w-[46rem]">
        <Breadcrumbs trail={[{ label: 'Terms' }]} />
        <h1 className="text-display-lg">Terms</h1>

        <div className="mt-12 flex flex-col gap-10">
          <section>
            <h2 className="text-display-sm">Who you are buying from</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {site.name}, a family store in {site.location.town}, {site.location.district},{' '}
              {site.location.state}, India.
            </p>
          </section>

          <section>
            <h2 className="text-display-sm">The pieces</h2>
            <ul className="mt-4 flex list-disc flex-col gap-2.5 pl-5 leading-relaxed text-muted-foreground">
              <li>
                Everything sold here is hand-painted with natural dyes. No piece is printed,
                blocked or screened, and no synthetic colour is used at any stage.
              </li>
              <li>
                Almost every piece is unique. Where a piece is marked as one of one, only one
                exists, and once it is sold it will not be remade identically.
              </li>
              <li>
                Photographs are taken in daylight and unretouched, but screens differ. The
                cloth will be close to the photograph rather than identical to it.
              </li>
              <li>
                Variation in line, colour depth and border repeat is inherent to hand
                painting. See{' '}
                <Link href="/shipping" className="text-primary underline underline-offset-4">
                  shipping &amp; returns
                </Link>{' '}
                for what counts as a defect and what does not.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-display-sm">Orders and prices</h2>
            <ul className="mt-4 flex list-disc flex-col gap-2.5 pl-5 leading-relaxed text-muted-foreground">
              <li>
                All prices are in Indian rupees and include applicable taxes. Shipping is
                shown separately at checkout before you commit.
              </li>
              <li>
                An order is a request to buy. It is accepted when we confirm it — for cash on
                delivery, that is usually a phone call from the store.
              </li>
              <li>
                Because pieces are unique, two people can occasionally reach the same piece at
                once. If that happens, we will tell you promptly and refund in full. Nothing
                is charged for an order we cannot fulfil.
              </li>
              <li>
                If a price is listed in obvious error, we will contact you rather than
                silently cancel or silently charge the correct amount.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-display-sm">Commissions</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Commissioned work is agreed in conversation before anything begins — subject,
              cloth, scale, price and a realistic timeline. Because a commission is painted
              specifically for one person over several weeks, it cannot be returned on change
              of mind. Timelines are given in good faith and depend on weather: nothing in
              this process dries without sun.
            </p>
          </section>

          <section>
            <h2 className="text-display-sm">Images and designs</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The photographs, text and drawings on this site belong to the store. Please do
              not reproduce them commercially — including to sell printed imitations, which is
              a live problem for this craft. Sharing a photograph of a piece you own is
              welcome and always will be.
            </p>
          </section>

          <section>
            <h2 className="text-display-sm">Governing law</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              These terms are governed by Indian law, and disputes fall to the courts of
              Andhra Pradesh.
            </p>
          </section>
        </div>

        <p className="mt-12 rounded-sm border border-border bg-muted/40 p-5 text-sm leading-relaxed text-muted-foreground">
          Written plainly rather than in legal language, and intended as a starting point.
          Have it reviewed by a lawyer before the store trades on it.
        </p>
      </div>
    </div>
  );
}
