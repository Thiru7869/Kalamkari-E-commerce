import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { SectionHeader } from '@/components/layout/section-header';
import { ProductGrid } from '@/components/shop/product-card';
import { NarrativeNote } from '@/components/shop/narrative-note';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { Button } from '@/components/ui/button';
import { getCollectionProducts } from '@/lib/queries';
import { getWishlistIds } from '@/lib/cart';
import { collectionDefs, findCollection } from '@/content/catalogue';
import { formatPrice } from '@/lib/utils';

/**
 * Collections are real pages, not redirects into /shop with a query string.
 *
 * The distinction matters because a collection makes a claim — "this is what
 * the family would hand you first", "this is exhibition grade" — and a claim
 * needs somewhere to be stated and defended. A filtered grid states nothing.
 */

type Params = Promise<{ slug: string }>;

export const revalidate = 300;

export function generateStaticParams() {
  return collectionDefs.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const collection = findCollection(slug);
  if (!collection) return {};

  return {
    title: collection.title,
    description: collection.blurb,
    alternates: { canonical: `/collections/${collection.slug}` },
    openGraph: { title: collection.title, description: collection.blurb },
  };
}

export default async function CollectionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const collection = findCollection(slug);
  if (!collection) notFound();

  const [{ items, total }, wishlistIds] = await Promise.all([
    getCollectionProducts(collection.kind, collection.category, 24),
    getWishlistIds(),
  ]);

  const available = items.filter((p) => p.stock > 0);
  const cheapest = available.length
    ? Math.min(...available.map((p) => p.price))
    : null;

  return (
    <>
      <header className="border-b border-border bg-cotton-100 pb-12 pt-12 md:pb-16 md:pt-16 dark:bg-card">
        <div className="container">
          <Breadcrumbs
            trail={[{ label: 'Collections', href: '/collections' }, { label: collection.label }]}
            className="mb-6"
          />

          <SectionHeader
            as="h1"
            size="lg"
            eyebrow={collection.eyebrow}
            title={collection.title}
            lead={collection.blurb}
          />

          <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-5 border-t border-border pt-7">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                In this collection
              </dt>
              <dd className="tabular mt-1.5 font-display text-2xl leading-none">
                {total} {total === 1 ? 'piece' : 'pieces'}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Available now
              </dt>
              <dd className="tabular mt-1.5 font-display text-2xl leading-none">
                {available.length}
              </dd>
            </div>
            {cheapest != null && (
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  From
                </dt>
                <dd className="tabular mt-1.5 font-display text-2xl leading-none">
                  {formatPrice(cheapest)}
                </dd>
              </div>
            )}
          </dl>

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">What this selects on:</span>{' '}
            {collection.criterion}
          </p>
        </div>
      </header>

      <div className="container section-y-sm">
        {items.length > 0 ? (
          <>
            <ProductGrid products={items} wishlistIds={wishlistIds} />

            {total > items.length && (
              <div className="mt-12 flex justify-center">
                <Button asChild variant="outline" size="lg">
                  <Link
                    href={
                      collection.kind === 'new'
                        ? '/shop?sort=newest'
                        : `/shop?collection=${collection.kind}`
                    }
                  >
                    See all {total} in the shop
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center">
            <h2 className="font-display text-2xl">Nothing in this collection right now</h2>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted-foreground">
              The store holds a small number of pieces at any time, because each one is
              weeks of hand-work. This selection refills as work comes off the line.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" variant="outline">
                <Link href="/shop">See everything in the store</Link>
              </Button>
              <Button asChild size="lg">
                <Link href="/custom">Have a piece painted</Link>
              </Button>
            </div>
          </div>
        )}

        <RevealOnScroll className="mt-16">
          <NarrativeNote />
        </RevealOnScroll>

        {/* The other two collections, so this is not a dead end. */}
        <RevealOnScroll className="mt-14" delay={0.05}>
          <h2 className="text-display-sm">Also worth seeing</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {collectionDefs
              .filter((c) => c.slug !== collection.slug)
              .map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/collections/${other.slug}`}
                    className="group flex h-full flex-col rounded-sm border border-border bg-card p-5 transition-colors hover:border-foreground/25"
                  >
                    <p className="eyebrow">{other.eyebrow}</p>
                    <h3 className="mt-2 font-display text-xl">{other.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {other.blurb}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      Open
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </RevealOnScroll>
      </div>
    </>
  );
}
