import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { PageHero } from '@/components/heritage/page-hero';
import { HeritagePageFooter } from '@/components/heritage/page-footer';
import { prisma } from '@/lib/prisma';
import { primaryImage } from '@/lib/serialize';

export const metadata: Metadata = {
  title: 'Traditional designs & motifs: what each one shows',
  description:
    'Ramayana, Mahabharata, Krishna Leela, Tree of Life and the temple border: the stories drawn on Srikalahasti Kalamkari, with the pieces that carry them.',
  alternates: { canonical: '/heritage/motifs' },
};

export const revalidate = 3600;

export default async function MotifsPage() {
  // Every motif, with one piece that carries it, so each story has a face.
  const motifs = await prisma.motif.findMany({
    orderBy: { position: 'asc' },
    select: {
      slug: true,
      name: true,
      story: true,
      products: {
        where: { product: { status: 'ACTIVE' } },
        take: 1,
        select: { product: { select: { name: true, images: true } } },
      },
    },
  });

  return (
    <>
      <PageHero
        trail={[{ label: 'Heritage & craft', href: '/heritage' }, { label: 'Designs & motifs' }]}
        eyebrow="Designs & motifs"
        title="The stories on the cloth"
        lede="Each motif is a story or a symbol. Here is what it shows, and where to find it in the store."
        image="/images/products/krishna-leela-soft-silk-saree-1.jpg"
        imageAlt="A Krishna Leela saree"
      />

      <section className="container section-y" aria-label="Motifs">
        <ul className="flex flex-col gap-4 md:gap-5">
          {motifs.map((motif, i) => {
            const piece = motif.products[0]?.product;
            const src = piece ? primaryImage(piece.images) : '';
            return (
              <li key={motif.slug}>
                <RevealOnScroll>
                  <article className="grid overflow-hidden rounded-sm border border-border bg-card transition-colors duration-swift ease-swift hover:border-primary/40 sm:grid-cols-[minmax(0,14rem)_1fr]">
                    <div className="relative aspect-[16/9] bg-muted sm:aspect-auto sm:min-h-[11rem]">
                      {src && (
                        <Image
                          src={src}
                          alt={piece ? `${piece.name}, with the ${motif.name} motif` : ''}
                          fill
                          sizes="(min-width: 640px) 14rem, 92vw"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-col justify-center p-5 sm:p-7">
                      <p className="tabular font-inscription text-[0.6875rem] tracking-[0.14em] text-primary/70">
                        {String(i + 1).padStart(2, '0')}
                      </p>
                      <h2 className="mt-1 font-display text-xl leading-snug">{motif.name}</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        {motif.story}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-x-6">
                        <Link
                          href={`/heritage/motifs/${motif.slug}`}
                          className="inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          About {motif.name}
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <Link
                          href={`/?motif=${motif.slug}`}
                          className="inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          See {motif.name} pieces
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </RevealOnScroll>
              </li>
            );
          })}
        </ul>
      </section>

      <HeritagePageFooter
        currentId="motifs"
        shop={[
          { label: 'Sarees', href: '/types/sarees' },
          { label: 'Paintings', href: '/types/paintings' },
          { label: 'Shop all', href: '/' },
        ]}
      />
    </>
  );
}
