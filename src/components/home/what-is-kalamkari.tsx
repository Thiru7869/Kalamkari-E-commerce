import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { whatIsKalamkari } from '@/content/kalamkari';

/**
 * "What is Kalamkari?" — the doorway question, answered near the top.
 *
 * This is the first thing on the page that is not either a greeting or a
 * picture, and it is placed there because of who arrives here. A visitor who
 * has just left a marketplace listing selling printed polyester as "Kalamkari"
 * does not yet know there is a distinction to be drawn, and every section
 * further down this page — the pots, the eight stages, the price of a saree —
 * is unreadable until they do.
 *
 * So: the word, the pen, the town, the pots, and one test they can apply to
 * somebody else's cloth. Then a door out to the full sequence.
 *
 * It is a server component. There is no state here, nothing to hydrate, and
 * the section sits high enough on the page to matter to LCP — the only client
 * code in it is the reveal wrapper, which every section already carries.
 */
export function WhatIsKalamkari() {
  return (
    <section
      className="relative isolate overflow-hidden border-b border-border section-y"
      aria-labelledby="what-is-kalamkari-heading"
    >
      {/*
        The madder wash behind the heading column.

        Very low alpha, and it is the reason this section does not read as a
        block of text after a photographic hero: it gives the page one warm
        breath between the banner and the pots without introducing a fourth
        surface colour. `-z-10` keeps it under everything; it is decorative and
        carries nothing.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(75% 60% at 8% 0%, hsl(var(--primary) / 0.07), transparent 62%)',
        }}
      />

      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          {/* ---- The claim -------------------------------------------------- */}
          <RevealOnScroll>
            <p className="eyebrow">{whatIsKalamkari.eyebrow}</p>

            <h2
              id="what-is-kalamkari-heading"
              className="mt-4 text-display-lg font-semibold tracking-[-0.015em]"
            >
              {whatIsKalamkari.heading}
            </h2>

            {/*
              The kalam's own line, drawn under the heading.

              The site already owns this mark — it is the stroke under the nib
              in the header wordmark — and this is the one other place it earns
              a second outing, because the sentence above it is literally about
              what a pen does to a line. It draws once, on arrival, and then
              stops; under reduced motion it is simply present, complete.
            */}
            <svg
              viewBox="0 0 220 12"
              className="mt-5 h-3 w-[13.75rem] max-w-full text-primary/70"
              aria-hidden="true"
              fill="none"
            >
              <path
                d="M2 8C40 2 62 2 100 8s60 6 118 0"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                pathLength="1"
                strokeDasharray="1"
                className="motion-safe:animate-draw-stroke"
                style={{ strokeDashoffset: 0 }}
              />
            </svg>

            <p className="mt-6 max-w-xl text-body-lg leading-relaxed text-muted-foreground">
              {whatIsKalamkari.lead}
            </p>

            {/*
              The test, set apart.

              This is the one sentence on the landing page a visitor can take
              away and use on a piece of cloth in front of them somewhere else,
              which makes it the most valuable thing in the section. It is set
              as a pull rather than as a fourth paragraph so it survives being
              skimmed.
            */}
            <blockquote className="mt-8 border-l-2 border-primary bg-primary/[0.045] py-4 pl-5 pr-4">
              <p className="font-display text-lg italic leading-snug md:text-xl">
                {whatIsKalamkari.test}
              </p>
            </blockquote>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={whatIsKalamkari.cta.href}>
                  {whatIsKalamkari.cta.label}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/shop">See what is in the store</Link>
              </Button>
            </div>
          </RevealOnScroll>

          {/* ---- The three facets ------------------------------------------- */}
          {/*
            A numbered list rather than three cards.

            Cards would say these are three parallel options; they are three
            successive answers to one question, and the reader is meant to go
            down them in order. The rule between them and the counter down the
            left are what a numbered argument looks like in print.
          */}
          <ol className="flex flex-col">
            {whatIsKalamkari.facets.map((facet, i) => (
              <li key={facet.id}>
                <RevealOnScroll delay={0.06 + i * 0.07}>
                  <div className="group border-t border-border py-6 first:border-t-0 first:pt-0 md:py-7">
                    <div className="flex items-baseline gap-3.5">
                      <span
                        aria-hidden="true"
                        className="tabular font-inscription text-sm text-primary/70"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-inscription text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground">
                        {facet.label}
                      </span>
                      {/* Grows from nothing, so it costs no height at rest. */}
                      <span
                        aria-hidden="true"
                        className="ml-auto block h-px w-0 bg-primary/50 transition-[width] duration-700 ease-out motion-safe:group-hover:w-12"
                      />
                    </div>

                    <h3 className="mt-3 font-display text-display-sm leading-snug">
                      {facet.heading}
                    </h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">{facet.body}</p>
                  </div>
                </RevealOnScroll>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
