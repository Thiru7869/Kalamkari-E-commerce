import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import Link from 'next/link';
import { contactEmail } from '@/content/site';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What we collect, why, and what we do not do with it.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  const email = contactEmail();

  return (
    <div className="container section-y">
      <div className="mx-auto max-w-[46rem]">
        <Breadcrumbs trail={[{ label: 'Privacy' }]} />
        <h1 className="text-display-lg">Privacy</h1>
        <p className="mt-5 text-body-lg text-muted-foreground">
          A small family store does not need much data, and we do not collect much.
        </p>

        <div className="mt-12 flex flex-col gap-10">
          <section>
            <h2 className="text-display-sm">What we collect</h2>
            <ul className="mt-4 flex list-disc flex-col gap-2.5 pl-5 leading-relaxed text-muted-foreground">
              <li>
                <strong className="font-medium text-foreground">To send you an order:</strong>{' '}
                your name, delivery address, phone number and email. We cannot post a parcel
                without these.
              </li>
              <li>
                <strong className="font-medium text-foreground">If you sign in:</strong> your
                email, and your name and profile image if you use Google. This is what lets
                you see your order history and wishlist.
              </li>
              <li>
                <strong className="font-medium text-foreground">If you write to us:</strong>{' '}
                whatever you put in the form, so we can reply.
              </li>
              <li>
                <strong className="font-medium text-foreground">A cart cookie:</strong> a
                random identifier so your bag survives a page refresh. It contains no
                personal information.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-display-sm">What we do not do</h2>
            <ul className="mt-4 flex list-disc flex-col gap-2.5 pl-5 leading-relaxed text-muted-foreground">
              <li>We do not sell or rent your details to anyone.</li>
              <li>We do not run advertising trackers or third-party analytics pixels.</li>
              <li>
                We do not add you to a mailing list because you bought something. The
                newsletter is opt-in only.
              </li>
              <li>We do not store card details. We never see them.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-display-sm">Who else sees your data</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Only the parties that are necessary to complete what you asked for: the
              courier that carries your parcel (name, address, phone), and the payment
              processor if you pay online — payment details go directly to them and never
              reach our server. Both act as processors on our behalf.
            </p>
          </section>

          <section>
            <h2 className="text-display-sm">How long we keep it</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Order records are kept for as long as tax and accounting rules require.
              Enquiries are kept while they are useful and deleted once they are not. If you
              want your account and its data removed, write to us and we will do it.
            </p>
          </section>

          <section>
            <h2 className="text-display-sm">Your rights</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              You can ask what we hold about you, ask us to correct it, or ask us to delete
              it. Write to{' '}
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="text-primary underline underline-offset-4 [overflow-wrap:anywhere]"
                >
                  {email}
                </a>
              ) : (
                <Link href="/contact" className="text-primary underline underline-offset-4">
                  the store
                </Link>
              )}{' '}
              and a person — not a system — will read it.
            </p>
          </section>
        </div>

        <p className="mt-12 rounded-sm border border-border bg-muted/40 p-5 text-sm leading-relaxed text-muted-foreground">
          This page describes how the site is built and is written in plain language rather
          than legal language. Before launch it should be reviewed against the Digital
          Personal Data Protection Act, 2023 and any other regime the store sells into.
        </p>
      </div>
    </div>
  );
}
