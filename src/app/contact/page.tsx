import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { MapPin, Clock, Mail, Phone, MessageCircle } from 'lucide-react';
import { ContactForm } from '@/components/forms/contact-form';
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
      <section className="border-b border-border bg-cotton-100 pb-14 pt-16 md:pb-20 md:pt-24 dark:bg-card">
        <div className="container">
          <div className="max-w-2xl">
            <Breadcrumbs trail={[{ label: 'Visit us' }]} className="mb-6" />
            <p className="eyebrow">Visit us</p>
            <h1 className="mt-4 text-display-xl">Come and see it being made</h1>
            <p className="mt-7 text-body-lg text-muted-foreground">
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
                  <div>
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
                  <div>
                    <dt className="font-medium">When</dt>
                    <dd className="mt-1.5 leading-relaxed text-muted-foreground">
                      {site.hours.note}
                    </dd>
                  </div>
                </div>

                {phone && (
                  <div className="flex gap-4">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
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
                    <div>
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
                    <div>
                      <dt className="font-medium">Email</dt>
                      <dd className="mt-1.5 text-muted-foreground">
                        <a
                          href={`mailto:${email}`}
                          className="underline underline-offset-4 hover:text-foreground"
                        >
                          {email}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
              </dl>

              <div className="mt-10 rounded-sm border border-border bg-muted/40 p-5">
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
              <div className="rounded-sm border border-border bg-card p-5 md:p-7">
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
          }),
        }}
      />
    </>
  );
}
