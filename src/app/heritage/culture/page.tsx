import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { PageHero } from '@/components/heritage/page-hero';
import { HeritagePageFooter } from '@/components/heritage/page-footer';
import { heritageSections } from '@/content/heritage';
import { storyMethod } from '@/content/family';
import { narrativeMotifs, narrativeMotifNames } from '@/content/catalogue';
import { renderInlineMarkdown } from '@/lib/markdown';

export const metadata: Metadata = {
  title: 'Culture & traditions: cloth made to be read',
  description:
    'Srikalahasti Kalamkari grew up serving the temple. Why the subjects are epics, how a scene is laid out, and how that carries onto a saree.',
  alternates: { canonical: '/heritage/culture' },
};

export const revalidate = 86400;

export default function CulturePage() {
  const section = heritageSections.find((s) => s.id === 'what-it-was-for')!;

  return (
    <>
      <PageHero
        trail={[{ label: 'Heritage & craft', href: '/heritage' }, { label: 'Culture & traditions' }]}
        eyebrow="Culture & traditions"
        title={section.heading}
        lede="This craft grew up serving the temple, not the export trade. That one fact explains how every piece looks."
        image="/images/products/dashavatara-pure-silk-saree-1.jpg"
        imageAlt="A Dashavatara saree"
      />

      {/* The reading: one measure, then the story-telling rules as a numbered strip. */}
      <section className="container section-y" aria-label="What the cloth was for">
        <div className="mx-auto flex max-w-[46rem] flex-col gap-5">
          {section.body.map((paragraph, i) => (
            <RevealOnScroll key={i} delay={i * 0.04}>
              <p
                className="leading-[1.75] text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(paragraph) }}
              />
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <section className="container pb-4" aria-labelledby="how-to-read">
        <h2 id="how-to-read" className="text-display-md">
          How to read a painted cloth
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {storyMethod.map((m, i) => (
            <li
              key={m.id}
              className="rounded-2xl border border-border bg-card p-6 transition-colors duration-swift ease-swift hover:border-primary/40"
            >
              <span
                aria-hidden="true"
                className="tabular font-display text-2xl leading-none text-primary/60"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 font-display text-lg leading-snug">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container section-y" aria-labelledby="the-stories">
        <div className="flex flex-col gap-5 rounded-3xl border border-border bg-cotton-100 p-6 dark:bg-card sm:p-9 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="the-stories" className="font-display text-xl md:text-2xl">
              The stories on the cloth
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {narrativeMotifs.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/shop?motif=${slug}`}
                    className="inline-flex min-h-[2.5rem] items-center rounded-full border border-border bg-background px-4 text-sm transition-colors duration-swift ease-swift hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {narrativeMotifNames[slug]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/heritage/motifs"
            className="inline-flex min-h-[2.75rem] shrink-0 items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            What each one shows
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <HeritagePageFooter
        currentId="culture"
        shop={[
          { label: 'Sarees', href: '/types/sarees' },
          { label: 'Paintings', href: '/types/paintings' },
          { label: 'Shop all', href: '/shop' },
        ]}
      />
    </>
  );
}
