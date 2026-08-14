import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { Parallax } from '@/components/motion/parallax';
import { Button } from '@/components/ui/button';
import { heritageIntro, heritageSections, heritageClose } from '@/content/heritage';
import { renderInlineMarkdown } from '@/lib/markdown';
import { site } from '@/content/site';
import { absoluteUrl } from '@/lib/utils';

/**
 * /heritage — the long view of the craft.
 *
 * Reachable from the footer and from nowhere else inside the site. That is a
 * deliberate placement rather than an oversight: this is an essay, and a header
 * built for shopping has nothing to gain from a nav item that competes with
 * "Shop" and sends the winner to eight screens of reading. It is in the sitemap
 * regardless — see the note in `src/app/sitemap.ts`.
 *
 * ---------------------------------------------------------------------------
 * The shape
 * ---------------------------------------------------------------------------
 *
 * A single measure, one column, no cards. Five sections of prose with a pulled
 * line in four of them and a link out of each to the page where its claims are
 * set out in full. There is no interactive apparatus at all, and that is the
 * point — /process already has the 3D cloth and the eight-stage rail, and a
 * second interactive treatment of the same material would compete with it
 * rather than add to it. This page is for reading.
 *
 * The motion budget is one thing: sections arrive on scroll. The banner has a
 * slow parallax on its photograph and nothing else moves anywhere.
 *
 * ---------------------------------------------------------------------------
 * Why the copy lives in a content file
 * ---------------------------------------------------------------------------
 *
 * `src/content/heritage.ts`, per the rule for the whole site — and with an
 * unusually long note at the top of it about what this page is permitted to
 * claim. It is the one page here that describes a *tradition* rather than
 * something the store did last week, which makes it the easiest place on the
 * site to write a pleasant sentence nobody can check. Read that note before
 * editing a word of it.
 */

export const metadata: Metadata = {
  title: 'The heritage of Kalamkari — the pen, the pots, and what it is for',
  description:
    'What Kalamkari actually is, how the colour is grown in the cloth rather than painted on, what the work has been used for, and what a freehand pen tradition in Srikalahasti contributes. Written by a family that practises it.',
  alternates: { canonical: '/heritage' },
  openGraph: {
    title: 'The heritage of Kalamkari',
    description:
      'A pen cut from bamboo, a pot of fermented iron, and cloth that was made to be read. What the craft is, how it works, and why it still matters.',
    url: absoluteUrl('/heritage'),
    type: 'article',
  },
};

export const revalidate = 86400;

export default function HeritagePage() {
  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* The banner                                                          */}
      {/* ------------------------------------------------------------------ */}
      <header className="relative isolate overflow-hidden border-b border-border">
        <Parallax speed={0.05} className="absolute -inset-y-16 inset-x-0 -z-10">
          <Image
            src="/images/store/store-wide.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.2] dark:opacity-[0.14]"
          />
        </Parallax>

        {/* The wash has to follow the theme — the heading is `text-foreground`,
            which is ink on cream in one and cotton on indigo in the other. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cotton-50/85 dark:hidden" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 hidden bg-background/85 dark:block"
        />

        <div className="container section-y-lg">
          <div className="max-w-3xl">
            <p className="eyebrow text-primary">{heritageIntro.eyebrow}</p>
            <h1 className="mt-4 text-display-xl leading-[1.05] text-foreground">
              {heritageIntro.heading}
            </h1>
            <p className="mt-6 max-w-2xl text-body-lg leading-relaxed text-muted-foreground">
              {heritageIntro.standfirst}
            </p>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Contents                                                            */}
      {/* ------------------------------------------------------------------ */}
      {/*
        A real table of contents, because this page is long and somebody
        arriving from a search for "is kalamkari printed" wants one section of
        it. Plain anchors — no JavaScript, works with the smooth scroller and
        without it, and each carries the site's underline treatment, which
        cannot shift the row it sits in.
      */}
      <nav aria-label="On this page" className="border-b border-border bg-cotton-100 dark:bg-card">
        <div className="container py-5">
          <ol className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
            {heritageSections.map((section, i) => (
              <li key={section.id} className="flex items-baseline gap-2">
                <span
                  aria-hidden="true"
                  className="tabular font-inscription text-[0.625rem] text-primary/70"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <a
                  href={`#${section.id}`}
                  className="link-underline rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {section.eyebrow}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* The essay                                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="container section-y-lg">
        <div className="mx-auto max-w-[46rem]">
          {heritageSections.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              /* `scroll-mt` clears the sticky header when an anchor lands. */
              className="scroll-mt-28 border-t border-border pt-12 first:border-t-0 first:pt-0 [&+section]:mt-16"
              aria-labelledby={`${section.id}-heading`}
            >
              <RevealOnScroll>
                <p className="eyebrow">
                  <span className="tabular mr-2 text-primary/70">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {section.eyebrow}
                </p>
                <h2
                  id={`${section.id}-heading`}
                  className="mt-4 text-display-md leading-tight"
                >
                  {section.heading}
                </h2>
              </RevealOnScroll>

              <RevealOnScroll delay={0.06}>
                <div className="mt-6 flex flex-col gap-5">
                  {section.body.map((paragraph, p) => (
                    <p
                      key={p}
                      className="leading-[1.75] text-muted-foreground"
                      /* Emphasis and links are authored in the content file so
                         a foreign word can be italicised where it is written
                         rather than split into three spans here. The helper
                         escapes before it formats — see markdown.ts. */
                      dangerouslySetInnerHTML={{
                        __html: renderInlineMarkdown(paragraph),
                      }}
                    />
                  ))}
                </div>
              </RevealOnScroll>

              {section.pull && (
                <RevealOnScroll delay={0.1}>
                  {/* The one sentence the section is actually about, set as a
                      drawn rule and a larger measure. Not a decorative blockquote:
                      every one of these is a claim the paragraphs above earned. */}
                  <p className="mt-9 border-l-2 border-primary py-1 pl-6 font-display text-xl leading-snug text-foreground md:text-2xl">
                    {section.pull}
                  </p>
                </RevealOnScroll>
              )}

              {section.link && (
                <RevealOnScroll delay={0.12}>
                  <Link
                    href={section.link.href}
                    className="mt-8 inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {section.link.label}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </RevealOnScroll>
              )}
            </section>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* The close                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-border bg-cotton-100 section-y dark:bg-card">
        <div className="container">
          <RevealOnScroll className="mx-auto max-w-[46rem]">
            <h2 className="text-display-sm leading-tight">{heritageClose.heading}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">{heritageClose.body}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/contact">
                  Plan a visit
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/process">Watch it being made</Link>
              </Button>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/*
        No `<BackToTop />` here.

        It is already mounted globally by `FloatingDock`, together with the
        assistant. Adding a second one to this page — which is long enough to
        want one, which is why it was nearly added — puts two controls doing one
        job on top of each other in the same corner of a phone. `/faq` carries a
        note saying the same thing, for the same reason.
      */}

      {/*
        Structured data: an Article rather than a Product or a FAQPage.

        `about` names the craft rather than the shop, which is what this page is
        actually about — and is the honest signal to send for a page that makes
        no offer and sells nothing.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: heritageIntro.heading,
            description: heritageIntro.standfirst,
            url: absoluteUrl('/heritage'),
            about: {
              '@type': 'Thing',
              name: 'Srikalahasti Kalamkari',
              description:
                'A freehand pen-drawn textile tradition from Srikalahasti, Andhra Pradesh, using natural mordant dyes.',
            },
            author: { '@type': 'Organization', name: site.name },
            publisher: { '@type': 'Organization', name: site.name },
            inLanguage: 'en-IN',
          }),
        }}
      />
    </>
  );
}
