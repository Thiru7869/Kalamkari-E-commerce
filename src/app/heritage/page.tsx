import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { PageHero } from '@/components/heritage/page-hero';
import { ModuleCard } from '@/components/heritage/module-card';
import { Button } from '@/components/ui/button';
import { heritageModules } from '@/content/heritage-modules';
import { site } from '@/content/site';
import { absoluteUrl } from '@/lib/utils';

/**
 * /heritage: the hub.
 *
 * It used to be the long essay. The essay is now /heritage/history, and this is
 * the page that says what there is to read and sends each reader to the one
 * thing they came for. Eight modules, each with a photograph and a sentence;
 * nothing here argues anything, because every argument has a page of its own.
 */

export const metadata: Metadata = {
  title: 'Heritage & craft: the story of Srikalahasti Kalamkari',
  description:
    'History, craftsmanship, saree making, culture, artisans, motifs and natural colours: everything about hand-drawn Srikalahasti Kalamkari, written by the family that practises it.',
  alternates: { canonical: '/heritage' },
  openGraph: {
    title: 'Heritage & craft',
    description: 'Eight ways into the story of hand-drawn Srikalahasti Kalamkari.',
    url: absoluteUrl('/heritage'),
    type: 'website',
  },
};

export const revalidate = 86400;

export default function HeritagePage() {
  return (
    <>
      <PageHero
        trail={[{ label: 'Heritage & craft' }]}
        eyebrow="Heritage & craft"
        title="Hand-drawn in Srikalahasti"
        lede="Every piece here is drawn freehand with a bamboo pen and coloured with natural dyes. Pick where you want to start."
        image="/images/store/store-wide.jpg"
        imageAlt={`The workshop in ${site.location.town}`}
      >
        <Button asChild size="lg" className="rounded-full">
          <Link href="/process">See how it is made</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full">
          <Link href="/shop">Shop the work</Link>
        </Button>
      </PageHero>

      <section className="container section-y" aria-labelledby="modules-heading">
        <h2 id="modules-heading" className="sr-only">
          Eight ways into the craft
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {heritageModules.map((module, i) => (
            <li key={module.id}>
              <RevealOnScroll delay={(i % 4) * 0.05} className="h-full">
                <ModuleCard module={module} index={i} />
              </RevealOnScroll>
            </li>
          ))}
        </ul>
      </section>

      <section className="container pb-16 md:pb-20" aria-labelledby="authentic-heading">
        <div className="flex flex-col gap-5 rounded-3xl border border-border bg-cotton-100 p-6 dark:bg-card sm:p-9 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 id="authentic-heading" className="font-display text-xl md:text-2xl">
              Is it really hand-painted?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Srikalahasti Kalamkari holds a registered Geographical Indication. Our journal
              shows how to tell drawn work from a print, on any cloth.
            </p>
          </div>
          <Link
            href="/journal"
            className="inline-flex min-h-[2.75rem] shrink-0 items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            How to tell the difference
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
