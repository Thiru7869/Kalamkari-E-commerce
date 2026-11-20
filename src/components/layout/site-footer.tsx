import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { footerNav, site } from '@/content/site';
import { NewsletterForm } from '@/components/forms/newsletter-form';
import { SocialLinks } from './social-links';
import { BrandName } from './wordmark';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-kasim-900 text-cotton-200">
      <div className="container section-y">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          <div className="max-w-sm">
            {/*
              The store's own lettering, and the one repeating animation on
              the site outside the header's kalam.

              `motion-safe:` — under reduced motion the sheen is not attached
              at all and the name renders in flat cream, which is the whole
              content of the element. Nothing is lost.
            */}
            <BrandName
              as="p"
              align="left"
              className="brand-sheen text-[1.75rem] text-cotton-50 motion-safe:animate-name-sheen"
            />
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

            {/* Renders nothing at all until the store publishes a handle — a
                row of icons where two go nowhere reads as an abandoned site. */}
            <SocialLinks className="mt-7" tone="inverse" size="sm" />
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {footerNav.map((group) => (
              <div key={group.title}>
                <h2 className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-cotton-200/60">
                  <span aria-hidden="true" className="mr-1.5 font-normal text-cotton-200/40">[</span>
                  {group.title}
                  <span aria-hidden="true" className="ml-1.5 font-normal text-cotton-200/40">]</span>
                </h2>
                <ul className="mt-4 flex flex-col gap-0.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      {/*
                        `flex`, not `inline-flex`. An inline-flex box sizes to
                        max-content, so "Shipping & Returns" held its full
                        151px inside a 118px column on a 320px phone and hung
                        off the side of the page. As a block-level flex item it
                        takes the column's width and the label wraps — and the
                        whole row becomes the touch target, which is the better
                        answer on a phone anyway.
                      */}
                      <Link
                        href={link.href}
                        className="-mx-1 flex min-h-[2.25rem] items-center rounded-sm px-1 text-sm text-cotton-200/85 transition-colors duration-swift ease-swift hover:text-cotton-50"
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

          <p className="mt-5 max-w-2xl text-xs leading-relaxed text-cotton-200/70">
            Srikalahasti Kalamkari holds a registered Geographical Indication. Small
            irregularities in line, colour depth and repeat are inherent to hand painting
            with natural dye — they are how the work is identified, not defects.
          </p>
        </div>

        {/*
          The name, set once at the width of the page.

          Decorative: the real name is already in the footer as text, so this is
          `aria-hidden` and carries no information. Sized in vw so it fits the
          viewport rather than clipping — 18 characters of Fraunces run about
          9.6em, and 9.4vw leaves the line at roughly 81vw. No overflow-hidden:
          if it ever grows past the edge the layout audit should say so.
        */}
        <div aria-hidden="true" className="mt-14 select-none text-center">
          <span
            className="mx-auto block h-px w-full max-w-md"
            style={{
              backgroundImage:
                'linear-gradient(to right, transparent, hsl(var(--gold) / 0.7) 30%, hsl(var(--gold) / 0.7) 70%, transparent)',
            }}
          />
          <p className="mt-8 font-display text-3xl font-semibold leading-tight tracking-tight text-cotton-50/80 sm:text-4xl md:text-5xl">
            Sri Vijaya Lakshmi
          </p>
          <p className="mt-3 font-inscription text-[0.6875rem] uppercase tracking-[0.36em] text-cotton-200/50 sm:text-xs">
            Fine Kalamkari Arts
          </p>
        </div>
      </div>
    </footer>
  );
}
