import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { MapPin, Clock, Mail, Phone, MessageCircle } from 'lucide-react';
import { ContactForm } from '@/components/forms/contact-form';
import { WorkshopInvitation } from '@/components/home/workshop-invitation';
import { site, contactEmail, contactPhone, whatsappHref } from '@/content/site';
import { absoluteUrl } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Visit us in Srikalahasti',
  description: `Find the store in ${site.location.town}, ${site.location.district}, Andhra Pradesh. Come and watch Kalamkari being painted, or write to us.`,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  // Any channel the store has not published is omitted entirely rather than
  // rendered dead — the form below is always available regardless.
  const email = contactEmail();
  const phone = contactPhone();
  const whatsapp = whatsappHref();

  return (
    <>
      <section className="border-b border-border bg-cotton-100 pb-8 pt-8 md:pb-12 md:pt-10 dark:bg-card">
        <div className="container">
          <div className="max-w-2xl">
            <Breadcrumbs trail={[{ label: 'Visit us' }]} className="mb-4" />
            <p className="eyebrow">Visit us</p>
            <h1 className="mt-3 text-display-lg">Come and see it being made</h1>
            <p className="mt-4 text-body-lg text-muted-foreground">
              Photographs of Kalamkari are not very convincing. The cloth in your hands is.
              If you are anywhere near {site.location.town} — and if you are visiting the
              temple, you are — the store is worth an hour.
            </p>
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20">
            <div>
              <h2 className="text-display-md">Finding the store</h2>

              <dl className="mt-8 flex flex-col gap-7">
                <div className="flex gap-4">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="font-medium">Where</dt>
                    <dd className="mt-1.5 leading-relaxed text-muted-foreground">
                      {site.name}
                      <br />
                      {site.location.town}, {site.location.district}
                      <br />
                      {site.location.state} {site.location.postalCode}, {site.location.country}
                      <br />
                      <a
                        href={site.location.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-primary underline underline-offset-4"
                      >
                        Open in Google Maps
                      </a>
                    </dd>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="font-medium">When</dt>
                    <dd className="mt-1.5 leading-relaxed text-muted-foreground">
                      {site.hours.note}
                    </dd>
                  </div>
                </div>

                {phone && (
                  <div className="flex gap-4">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div className="min-w-0">
                      <dt className="font-medium">Call</dt>
                      <dd className="mt-1.5 text-muted-foreground">
                        <a
                          href={`tel:${phone.replace(/\s/g, '')}`}
                          className="underline underline-offset-4 hover:text-foreground"
                        >
                          {phone}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}

                {whatsapp && (
                  <div className="flex gap-4">
                    <MessageCircle
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <dt className="font-medium">WhatsApp</dt>
                      <dd className="mt-1.5 text-muted-foreground">
                        <a
                          href={whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-4 hover:text-foreground"
                        >
                          Message the store
                        </a>
                        <span className="mt-1 block text-sm">
                          The quickest way to ask about a specific piece.
                        </span>
                      </dd>
                    </div>
                  </div>
                )}

                {email && (
                  <div className="flex gap-4">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div className="min-w-0">
                      <dt className="font-medium">Email</dt>
                      <dd className="mt-1.5 text-muted-foreground">
                        {/*
                          `anywhere`, not `break-word`.

                          The store's address is forty characters with no space
                          in it, and nothing in an email address is a break
                          opportunity to a browser — not the `@`, not the dots.
                          At the body size that is a single 320px word, which on
                          a 320px phone pushed this page 56px past its own right
                          edge and took the tab bar and the WhatsApp button with
                          it. `min-w-0` on the row above lets the column shrink;
                          this is what lets the word inside it shrink too.

                          The two differ in exactly the way that matters here:
                          `overflow-wrap: break-word` breaks the line but does
                          not reduce the element's *min-content* contribution,
                          so the flex row would still have been sized by the
                          unbroken address. `anywhere` reduces it, which is what
                          actually removes the floor.
                        */}
                        <a
                          href={`mailto:${email}`}
                          className="inline-block py-2 -my-2 underline underline-offset-4 [overflow-wrap:anywhere] hover:text-foreground"
                        >
                          {email}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
              </dl>

              <div className="mt-10 rounded-2xl border border-border bg-muted/40 p-5">
                <h3 className="font-display text-lg">Before you travel</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  Send a message first. The store is a working home, and the difference
                  between arriving unannounced and arriving expected is the difference
                  between seeing a shop and having someone sit with you while they paint.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  If you want to see dyeing rather than drawing, say so — the dye pots run
                  on their own schedule, and the monsoon stops them entirely.
                </p>
              </div>
            </div>

            <div>
              <div className="rounded-2xl border border-border bg-card p-5 md:p-7">
                <h2 className="text-display-sm">Write to us</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  About a piece, a visit, wholesale, an exhibition, or a question about the
                  craft. We read everything.
                </p>
                <ContactForm className="mt-7" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Come and see it being made: the offer that sets the store apart. */}
      <WorkshopInvitation />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Store',
            name: site.name,
            url: absoluteUrl('/contact'),
            address: {
              '@type': 'PostalAddress',
              addressLocality: site.location.town,
              addressRegion: site.location.state,
              postalCode: site.location.postalCode,
              addressCountry: 'IN',
            },
            hasMap: site.location.mapsUrl,
            /*
              Contact channels, spread in only when published.

              These read through the same guards as the visible page rather
              than `site.contact` directly, so the two can never disagree — an
              unpublished channel is absent from the markup and absent from the
              structured data, instead of being hidden on the page while a
              crawler is still told an empty string.
            */
            ...(email ? { email } : {}),
            ...(phone ? { telephone: phone } : {}),
          }),
        }}
      />
    </>
  );
}
