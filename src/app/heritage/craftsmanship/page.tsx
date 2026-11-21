import Image from 'next/image';
import type { Metadata } from 'next';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { PageHero } from '@/components/heritage/page-hero';
import { HeritagePageFooter } from '@/components/heritage/page-footer';
import { whatIsKalamkari } from '@/content/kalamkari';
import { workshopNotes } from '@/content/family';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Art & craftsmanship: the pen, the line and the hands',
  description:
    'A bamboo pen, a freehand line and the senior artists who draw every figure. How Srikalahasti Kalamkari is actually made by hand.',
  alternates: { canonical: '/heritage/craftsmanship' },
};

export const revalidate = 86400;

/** One photograph per facet. Placeholders until real photographs are supplied. */
const FACET_IMAGES: Record<string, { src: string; alt: string }> = {
  pen: { src: '/images/journal/telling-the-difference.jpg', alt: 'A freehand line drawn with a bamboo pen' },
  town: { src: '/images/journal/two-traditions.jpg', alt: 'Drawn and printed Kalamkari compared' },
  colour: { src: '/images/journal/natural-dye.jpg', alt: 'Natural dyes' },
};

export default function CraftsmanshipPage() {
  return (
    <>
      <PageHero
        trail={[{ label: 'Heritage & craft', href: '/heritage' }, { label: 'Art & craftsmanship' }]}
        eyebrow="Art & craftsmanship"
        title="One pen. One line. No block."
        lede={whatIsKalamkari.lead}
        image="/images/journal/telling-the-difference.jpg"
        imageAlt="A freehand line, close up"
      />

      {/* Three facets, set as alternating picture and text rows. */}
      <section className="container section-y" aria-label="The pen, the town and the colour">
        <ol className="flex flex-col gap-10 md:gap-14">
          {whatIsKalamkari.facets.map((facet, i) => {
            const img = FACET_IMAGES[facet.id];
            return (
              <li key={facet.id}>
                <RevealOnScroll
                  className={cn(
                    'grid items-center gap-6 md:grid-cols-2 md:gap-12',
                    i % 2 === 1 && 'md:[&>*:first-child]:order-2',
                  )}
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-border">
                    {img && (
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        sizes="(min-width: 768px) 46vw, 92vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="eyebrow text-primary">{facet.label}</p>
                    <h2 className="mt-3 text-display-sm leading-tight">{facet.heading}</h2>
                    <p className="mt-4 leading-relaxed text-muted-foreground">{facet.body}</p>
                  </div>
                </RevealOnScroll>
              </li>
            );
          })}
        </ol>
      </section>

      {/* The test, as one pulled line. */}
      <section className="container" aria-label="How to tell">
        <RevealOnScroll>
          <p className="mx-auto max-w-3xl rounded-sm bg-kasim-900 p-7 text-center font-display text-lg leading-snug text-cotton-50 sm:p-10 md:text-2xl">
            {whatIsKalamkari.test}
          </p>
        </RevealOnScroll>
      </section>

      <section className="container section-y" aria-labelledby="in-the-workshop">
        <h2 id="in-the-workshop" className="text-display-md">
          In the workshop
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {workshopNotes.map((note, i) => (
            <li
              key={note.id}
              className="rounded-sm border border-border bg-card p-6 transition-colors duration-swift ease-swift hover:border-primary/40"
            >
              <p className="tabular font-inscription text-label tracking-[0.14em] text-primary/70">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-1 font-display text-lg leading-snug">{note.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{note.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <HeritagePageFooter
        currentId="craftsmanship"
        shop={[
          { label: 'Sarees', href: '/types/sarees' },
          { label: 'Paintings', href: '/types/paintings' },
          { label: 'Premium work', href: '/collections/premium' },
        ]}
      />
    </>
  );
}
