import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { PageHero } from '@/components/heritage/page-hero';
import { HeritagePageFooter } from '@/components/heritage/page-footer';
import { Badge } from '@/components/ui/badge';
import { family, principalAward } from '@/content/family';
import { heritageSections } from '@/content/heritage';
import { renderInlineMarkdown } from '@/lib/markdown';

export const metadata: Metadata = {
  title: 'Artisans & their work: the people who draw',
  description:
    'The five people who draw every piece, the National Award for pen Kalamkari, and the town of artisans around them in Srikalahasti.',
  alternates: { canonical: '/heritage/artisans' },
};

export const revalidate = 86400;

export default function ArtisansPage() {
  const town = heritageSections.find((s) => s.id === 'who-it-helps')!;
  const master = family.find((m) => m.id === 'viswanath-reddy');

  return (
    <>
      <PageHero
        trail={[{ label: 'Heritage & craft', href: '/heritage' }, { label: 'Artisans & their work' }]}
        eyebrow="Artisans & their work"
        title="Five people, one house, every piece"
        lede="The drawing cannot be fixed later, so it is done by the senior hands. Here is who they are."
        image={master?.image}
        imageAlt={master ? `${master.name} at work` : undefined}
      />

      <section className="container section-y" aria-labelledby="the-family">
        <h2 id="the-family" className="sr-only">
          The family
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {family.map((m, i) => (
            <li key={m.id}>
              <RevealOnScroll delay={(i % 3) * 0.05} className="h-full">
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-swift ease-swift hover:border-primary/40">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={m.image}
                      alt={`${m.name}, ${m.role}`}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg leading-snug">{m.name}</h3>
                    <p className={`mt-0.5 text-sm font-medium ${m.accent.text}`}>{m.role}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.short}</p>
                    {m.honours && m.honours.length > 0 && (
                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {m.honours.map((h) => (
                          <li key={h}>
                            <Badge variant="gold">{h}</Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              </RevealOnScroll>
            </li>
          ))}
        </ul>
      </section>

      <section className="container" aria-labelledby="the-award">
        <div className="grid gap-6 rounded-3xl bg-kasim-900 p-6 text-cotton-100 sm:p-9 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
          <p className="font-display text-5xl leading-none text-cotton-50 tabular md:text-6xl">
            {principalAward.year}
          </p>
          <div>
            <h2 id="the-award" className="font-display text-xl text-cotton-50 md:text-2xl">
              {principalAward.name}, {principalAward.discipline}
            </h2>
            <p className="mt-1 text-sm text-cotton-200/80">{principalAward.recipient}</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cotton-200/85">
              {principalAward.what}
            </p>
          </div>
        </div>
      </section>

      <section className="container section-y" aria-labelledby="the-town">
        <div className="mx-auto max-w-[46rem]">
          <h2 id="the-town" className="text-display-md">
            {town.heading}
          </h2>
          <div className="mt-6 flex flex-col gap-5">
            {town.body.map((paragraph, i) => (
              <p
                key={i}
                className="leading-[1.75] text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(paragraph) }}
              />
            ))}
          </div>
          <Link
            href="/our-story"
            className="mt-6 inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            The full story of the family
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <HeritagePageFooter
        currentId="artisans"
        shop={[
          { label: 'Premium and signed work', href: '/collections/premium' },
          { label: 'Sarees', href: '/types/sarees' },
          { label: 'New arrivals', href: '/collections/new-arrivals' },
        ]}
      />
    </>
  );
}
