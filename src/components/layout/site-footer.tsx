import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { footerNav, site } from '@/content/site';
import { NewsletterForm } from '@/components/forms/newsletter-form';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-kasim-900 text-cotton-200">
      <div className="container py-14 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          <div className="max-w-sm">
            <p className="font-display text-2xl leading-tight text-cotton-50">{site.name}</p>
            <p className="mt-3 text-sm leading-relaxed text-cotton-200/80">
              {site.description}
            </p>

            <a
              href={site.location.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-start gap-2.5 rounded-sm text-sm text-cotton-200/90 underline-offset-4 transition-colors hover:text-cotton-50 hover:underline"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {site.location.town}, {site.location.district}
                <br />
                {site.location.state} {site.location.postalCode}
              </span>
            </a>

            <div className="mt-8">
              <NewsletterForm />
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {footerNav.map((group) => (
              <div key={group.title}>
                <h2 className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-cotton-200/55">
                  {group.title}
                </h2>
                <ul className="mt-4 flex flex-col gap-0.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="-mx-1 inline-flex min-h-[2.25rem] items-center rounded-sm px-1 text-sm text-cotton-200/85 transition-colors hover:text-cotton-50"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 border-t border-cotton-200/15 pt-7">
          <div className="flex flex-col gap-4 text-xs text-cotton-200/60 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {site.name}. Every piece hand-painted in {site.location.town}.
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              <li>
                <Link href="/privacy" className="transition-colors hover:text-cotton-50">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-cotton-50">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="transition-colors hover:text-cotton-50">
                  Shipping &amp; Returns
                </Link>
              </li>
            </ul>
          </div>

          <p className="mt-5 max-w-2xl text-xs leading-relaxed text-cotton-200/45">
            Srikalahasti Kalamkari holds a registered Geographical Indication. Small
            irregularities in line, colour depth and repeat are inherent to hand painting
            with natural dye — they are how the work is identified, not defects.
          </p>
        </div>
      </div>
    </footer>
  );
}
