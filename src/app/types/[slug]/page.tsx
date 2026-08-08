import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { SectionHeader } from '@/components/layout/section-header';
import { ProductGrid } from '@/components/shop/product-card';
import { NarrativeNote } from '@/components/shop/narrative-note';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { KnowMore } from '@/components/ui/know-more';
import { Button } from '@/components/ui/button';
import {
  getTypeVarieties,
  getTypeMotifs,
  getTypePriceRange,
  getTypeProducts,
  getCategoryBySlug,
} from '@/lib/queries';
import { getWishlistIds } from '@/lib/cart';
import {
  typeDefs,
  findType,
  FAMILY_LABELS,
  FAMILY_NOTES,
  isNarrativeMotif,
} from '@/content/catalogue';
import { formatPrice, absoluteUrl } from '@/lib/utils';
import { site } from '@/content/site';

/**
 * One page per kind of thing the workshop makes.
 *
 * These are not `/shop` with a category pre-selected. `/shop` is the working
 * grid — everything, filterable, paginated. This is the page that answers the
 * question somebody arriving from a search engine actually has, which is
 * usually "what is a Kalamkari dupatta and which cloth should I choose", not
 * "show me twelve product cards".
 *
 * The varieties section is the substance: every fabric the store genuinely
 * stocks in this category, grouped by family, counted live, each linking into
 * the filtered grid. Nothing is listed that cannot currently be supplied.
 */

type Params = Promise<{ slug: string }>;

export const revalidate = 300;

export function generateStaticParams() {
  return typeDefs.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const type = findType(slug);
  if (!type) return {};

  return {
    title: type.title,
    description: type.blurb,
    alternates: { canonical: `/types/${type.slug}` },
    openGraph: { title: type.title, description: type.blurb },
  };
}

export default async function TypePage({ params }: { params: Params }) {
  const { slug } = await params;
  const type = findType(slug);
  if (!type) notFound();

  const [category, varieties, motifs, range, { items, total }, wishlistIds] = await Promise.all([
    getCategoryBySlug(type.category),
    getTypeVarieties(type.category),
    getTypeMotifs(type.category),
    getTypePriceRange(type.category),
    getTypeProducts(type.category, 8),
    getWishlistIds(),
  ]);

  if (!category) notFound();

  // Families in the order this type wants them, then anything unexpected.
  const families = [
    ...type.familyOrder.filter((f) => varieties.has(f)),
    ...[...varieties.keys()].filter((f) => !type.familyOrder.includes(f)),
  ];

  const narrative = motifs.filter((m) => isNarrativeMotif(m.slug));
  const otherMotifs = motifs.filter((m) => !isNarrativeMotif(m.slug));

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* The fold                                                            */}
      {/* ------------------------------------------------------------------ */}
      <header className="border-b border-border bg-cotton-100 pb-12 pt-12 md:pb-16 md:pt-16 dark:bg-card">
        <div className="container">
          <Breadcrumbs
            trail={[{ label: 'Shop', href: '/shop' }, { label: type.label }]}
            className="mb-6"
          />

          <div className="max-w-3xl">
            <p className="eyebrow">{type.eyebrow}</p>
            <h1 className="mt-4 text-display-xl">
              {type.title}
              {category.teluguName && (
                <span className="ml-3 font-telugu text-2xl text-muted-foreground md:text-3xl">
                  {category.teluguName}
                </span>
              )}
            </h1>
            <p className="mt-7 text-body-lg text-muted-foreground">{type.blurb}</p>
          </div>

          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-border pt-7">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                In the store
              </dt>
              <dd className="tabular mt-1.5 font-display text-2xl leading-none">
                {range.available} {range.available === 1 ? 'piece' : 'pieces'}
              </dd>
            </div>
            {range.min != null && (
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  From
                </dt>
                <dd className="tabular mt-1.5 font-display text-2xl leading-none">
                  {formatPrice(range.min)}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Varieties of cloth
              </dt>
              <dd className="tabular mt-1.5 font-display text-2xl leading-none">
                {[...varieties.values()].reduce((n, list) => n + list.length, 0)}
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={`/shop/${type.category}`}>
                Browse all {type.label.toLowerCase()}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/custom">Have one painted for you</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* What this kind of piece is                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-14 md:py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
            <RevealOnScroll>
              <h2 className="text-display-md">About {type.label.toLowerCase()}</h2>

              {/* The first paragraph carries the point; the rest is one click
                  away. These pages are read standing in a shop as often as
                  sitting down, and a wall of prose above the stock is the
                  fastest way to lose somebody who came to look. */}
              <KnowMore
                lead={
                  <p className="mt-6 text-body-lg leading-relaxed text-muted-foreground">
                    {type.body[0]}
                  </p>
                }
                panelClassName="flex flex-col gap-4 border-l-2 border-border pl-5"
              >
                {type.body.slice(1).map((para, i) => (
                  <p key={i} className="leading-relaxed text-muted-foreground">
                    {para}
                  </p>
                ))}
              </KnowMore>
            </RevealOnScroll>

            <RevealOnScroll delay={0.08}>
              <div className="rounded-sm border border-border bg-card p-6 md:p-7">
                <h3 className="font-display text-lg">The practical facts</h3>
                <dl className="mt-5 flex flex-col divide-y divide-border">
                  {type.facts.map((fact) => (
                    <div key={fact.label} className="flex flex-wrap gap-x-4 py-3 text-sm">
                      <dt className="w-32 shrink-0 uppercase tracking-[0.1em] text-muted-foreground/80 text-[0.6875rem]">
                        {fact.label}
                      </dt>
                      <dd className="flex-1">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
                <Link
                  href="/process"
                  className="mt-5 inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  All twenty-three steps
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* A few pieces                                                        */}
      {/* ------------------------------------------------------------------ */}
      {items.length > 0 && (
        <section className="border-t border-border py-12 md:py-16">
          <div className="container">
            <RevealOnScroll>
              <SectionHeader
                eyebrow="In the store now"
                title={`${type.label} ready to send`}
                action={{ label: `All ${total}`, href: `/shop/${type.category}` }}
              />
            </RevealOnScroll>

            <div className="mt-8">
              <ProductGrid products={items} wishlistIds={wishlistIds} />
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Varieties — the substance of the page                               */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="varieties"
        className="scroll-mt-24 border-y border-border bg-cotton-100 py-14 md:py-20 dark:bg-card"
      >
        <div className="container">
          <RevealOnScroll>
            <SectionHeader
              eyebrow="Choose by cloth"
              title={`The varieties of ${type.label.toLowerCase()} in the store`}
              lead={type.varietyNote}
            />
          </RevealOnScroll>

          {families.length === 0 ? (
            <p className="mt-8 max-w-xl text-muted-foreground">
              Nothing of this kind is finished at the moment. Work comes off the line
              continuously — or ask for one to be painted.
            </p>
          ) : (
            <div className="mt-10 flex flex-col gap-10 md:mt-14 md:gap-14">
              {families.map((family, fi) => {
                const fabrics = varieties.get(family) ?? [];
                return (
                  <RevealOnScroll key={family} delay={fi * 0.04}>
                    <div className="border-t border-border pt-7">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                        <h3 className="font-display text-display-sm">
                          {FAMILY_LABELS[family] ?? family}
                        </h3>
                        <p className="tabular text-sm text-muted-foreground">
                          {fabrics.reduce((n, f) => n + f._count.products, 0)} in this group
                        </p>
                      </div>

                      {FAMILY_NOTES[family] && (
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                          {FAMILY_NOTES[family]}
                        </p>
                      )}

                      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {fabrics.map((fabric) => (
                          <li key={fabric.slug}>
                            <Link
                              href={`/shop/${type.category}?fabric=${fabric.slug}`}
                              className="group flex h-full flex-col rounded-sm border border-border bg-background p-4 transition-colors hover:border-primary/40"
                            >
                              <div className="flex items-baseline justify-between gap-3">
                                <h4 className="font-display text-lg leading-snug">
                                  {fabric.name}
                                </h4>
                                <span className="tabular shrink-0 text-sm text-muted-foreground">
                                  {fabric._count.products}
                                </span>
                              </div>
                              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                {fabric.description}
                              </p>
                              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                                See these
                                <ArrowRight
                                  className="h-3.5 w-3.5 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5"
                                  aria-hidden="true"
                                />
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </RevealOnScroll>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* What is drawn on them                                               */}
      {/* ------------------------------------------------------------------ */}
      {motifs.length > 0 && (
        <section className="py-14 md:py-20">
          <div className="container">
            <RevealOnScroll>
              <SectionHeader
                eyebrow="Choose by story"
                title={`What is drawn on ${type.label.toLowerCase()}`}
                lead="Kalamkari is narrative art, so the motif is often the more useful way in. Each of these is a tradition rather than a pattern."
              />
            </RevealOnScroll>

            {narrative.length > 0 && (
              <RevealOnScroll className="mt-8">
                <NarrativeNote variant="inline" />
              </RevealOnScroll>
            )}

            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...narrative, ...otherMotifs].map((motif, i) => (
                <li key={motif.slug}>
                  <RevealOnScroll delay={Math.min(i, 5) * 0.04}>
                    <Link
                      href={`/shop/${type.category}?motif=${motif.slug}`}
                      className="group flex h-full flex-col rounded-sm border border-border bg-card p-5 transition-colors hover:border-primary/40"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-display text-lg leading-snug">{motif.name}</h3>
                        <span className="tabular shrink-0 text-sm text-muted-foreground">
                          {motif._count.products}
                        </span>
                      </div>
                      {isNarrativeMotif(motif.slug) && (
                        <span className="mt-2 w-fit rounded-sm border border-primary/30 bg-primary/[0.06] px-2 py-0.5 text-[0.6875rem] uppercase tracking-[0.1em] text-primary">
                          Commission first
                        </span>
                      )}
                      <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {motif.story}
                      </p>
                    </Link>
                  </RevealOnScroll>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* The other types                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-border bg-cotton-100 py-14 md:py-20 dark:bg-card">
        <div className="container">
          <h2 className="text-display-sm">The rest of what the workshop makes</h2>
          <ul className="mt-7 flex flex-wrap gap-3">
            {typeDefs
              .filter((t) => t.slug !== type.slug)
              .map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/types/${other.slug}`}
                    className="inline-flex min-h-[2.75rem] items-center rounded-sm border border-border bg-background px-4 text-sm transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {other.label}
                  </Link>
                </li>
              ))}
            <li>
              <Link
                href="/shop"
                className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-sm border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-chay-700"
              >
                Everything together
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: type.title,
            description: type.blurb,
            url: absoluteUrl(`/types/${type.slug}`),
            isPartOf: { '@type': 'WebSite', name: site.name, url: absoluteUrl() },
            about: {
              '@type': 'Thing',
              name: 'Srikalahasti pen Kalamkari',
              description: 'Hand-drawn Kalamkari in natural dyes only.',
            },
          }),
        }}
      />
    </>
  );
}
