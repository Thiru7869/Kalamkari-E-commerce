import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { PageHero } from '@/components/heritage/page-hero';
import { HeritagePageFooter } from '@/components/heritage/page-footer';
import { colourStories, whatWeDoNotUse } from '@/content/process';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Natural colours & materials: where each colour comes from',
  description:
    'Iron, madder, indigo, myrobalan and nothing synthetic. Each colour on a Srikalahasti Kalamkari piece, where it comes from and how it is made.',
  alternates: { canonical: '/heritage/colours' },
};

export const revalidate = 86400;

/** The shop's dye filter uses its own slugs; the colour stories use shorter ids. */
const DYE_SLUG: Record<string, string> = {
  cream: 'myrobalan-cream',
  black: 'kasim-black',
  red: 'madder-red',
  pink: 'pink',
  yellow: 'myrobalan-yellow',
  blue: 'indigo',
  green: 'green',
  brown: 'katha-brown',
};

export default function ColoursPage() {
  return (
    <>
      <PageHero
        trail={[{ label: 'Heritage & craft', href: '/heritage' }, { label: 'Natural colours' }]}
        eyebrow="Natural colours & materials"
        title={`${colourStories.length} colours, all from the earth`}
        lede="Every colour on the cloth is boiled, fermented or dipped out of something that grew or rusted. Nothing synthetic goes near it."
        image="/images/journal/natural-dye.jpg"
        imageAlt="Cloth being dyed with natural colours"
      >
        <Link
          href="/process#colours"
          className="inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          See them in the 23 steps
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </PageHero>

      <section className="container section-y" aria-label="The colours">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {colourStories.map((c, i) => (
            <li key={c.id}>
              <RevealOnScroll delay={(i % 4) * 0.05} className="h-full">
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-swift ease-swift hover:border-primary/40">
                  <div
                    className={cn(
                      'flex h-28 items-end p-4',
                      c.ink === 'light' ? 'text-cotton-50' : 'text-kasim-900',
                    )}
                    style={{ backgroundColor: c.hex }}
                  >
                    <div>
                      <h2 className="font-display text-lg leading-tight">{c.name}</h2>
                      {c.localName && <p className="text-xs opacity-80">{c.localName}</p>}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      {c.method}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.source}</p>
                    <p className="mt-3 text-sm leading-relaxed">{c.note}</p>
                    <Link
                      href={`/?dye=${DYE_SLUG[c.id] ?? ''}`}
                      className="mt-auto inline-flex min-h-[2.75rem] items-center gap-1 pt-3 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Shop this colour
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </RevealOnScroll>
            </li>
          ))}
        </ul>
      </section>

      <section className="container pb-4" aria-labelledby="not-used">
        <div className="rounded-3xl border border-border bg-cotton-100 p-6 dark:bg-card sm:p-9">
          <h2 id="not-used" className="font-display text-xl md:text-2xl">
            What we do not use
          </h2>
          <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {whatWeDoNotUse.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <HeritagePageFooter
        currentId="colours"
        shop={[
          { label: 'Sarees', href: '/types/sarees' },
          { label: 'Dupattas', href: '/types/dupattas' },
          { label: 'Shop all', href: '/' },
        ]}
      />
    </>
  );
}
