import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { PageHero } from '@/components/heritage/page-hero';
import { HeritagePageFooter } from '@/components/heritage/page-footer';
import { ProductGrid } from '@/components/shop/product-card';
import { getMotifWithPieces } from '@/lib/queries';
import { getWishlistIds } from '@/lib/cart';
import { prisma } from '@/lib/prisma';
import { primaryImage } from '@/lib/serialize';

/**
 * One motif: what it shows, and the pieces that carry it.
 *
 * The story is the motif's own `story` column, the same text the motif list
 * and the product page show, so the three cannot disagree. The pieces are read
 * from the `ProductMotif` relation — nothing here is written by hand.
 */

type Params = Promise<{ slug: string }>;

export const revalidate = 3600;

export async function generateStaticParams() {
  const motifs = await prisma.motif.findMany({ select: { slug: true } });
  return motifs.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const found = await getMotifWithPieces(slug);
  if (!found) return {};
  return {
    title: `${found.motif.name} — a Kalamkari motif`,
    description: found.motif.story.slice(0, 200),
    alternates: { canonical: `/heritage/motifs/${found.motif.slug}` },
  };
}

export default async function MotifPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [found, wishlistIds] = await Promise.all([getMotifWithPieces(slug), getWishlistIds()]);
  if (!found) notFound();

  const { motif, available, soldCount } = found;
  const lead = available[0] ?? null;
  const linkClass =
    'inline-flex min-h-[2.75rem] items-center text-primary underline underline-offset-4';

  return (
    <>
      <PageHero
        trail={[
          { label: 'Heritage & craft', href: '/heritage' },
          { label: 'Designs & motifs', href: '/heritage/motifs' },
          { label: motif.name },
        ]}
        eyebrow="Design & motif"
        title={motif.name}
        lede={motif.story}
        image={lead ? primaryImage(lead.images) : undefined}
        imageAlt={lead ? `${lead.name}, with the ${motif.name} motif` : undefined}
      />

      <section className="container section-y" aria-labelledby="pieces-heading">
        <RevealOnScroll>
          <h2 id="pieces-heading" className="text-display-sm">
            {available.length > 0
              ? `${motif.name} pieces you can buy now`
              : `No ${motif.name} piece is available right now`}
          </h2>
          {available.length === 0 && (
            <p className="mt-3 max-w-xl text-muted-foreground">
              Each piece is drawn once. You can commission one on this subject.
            </p>
          )}
        </RevealOnScroll>

        {available.length > 0 && (
          <div className="mt-7">
            <ProductGrid products={available} wishlistIds={wishlistIds} />
          </div>
        )}

        <p className="mt-9 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {soldCount > 0 && (
            <Link href="/archive" className={linkClass}>
              {soldCount} {soldCount === 1 ? 'piece' : 'pieces'} with this motif{' '}
              {soldCount === 1 ? 'has' : 'have'} already found a home
            </Link>
          )}
          <Link href={`/?motif=${motif.slug}`} className={linkClass}>
            Filter the shop by this motif
          </Link>
          <Link href="/custom" className={linkClass}>
            Commission a piece
          </Link>
        </p>
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
