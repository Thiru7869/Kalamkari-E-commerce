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
import { TypeBanner, type BannerSlide } from '@/components/shop/type-banner';
import { ClothSubnav, type ClothLink } from '@/components/shop/cloth-subnav';
import { HowThisIsMade, WhatToLookFor } from '@/components/shop/craft-notes';
import { primaryImage } from '@/lib/serialize';
import {
  getTypeVarieties,
  getTypeDyes,
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
import { formatPrice, absoluteUrl, cn } from '@/lib/utils';
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
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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

export default async function TypePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const type = findType(slug);
  if (!type) notFound();

  /*
    The cloth filter, applied in place.

    A single `fabric` slug, not a list. `/shop` supports multi-select because it
    is the working grid; this page's cloth cards are one-per-card, so a second
    value could only arrive from a hand-edited URL. Taking the first is the
    behaviour that surprises nobody.
  */
  const activeFabric = Array.isArray(sp.fabric) ? sp.fabric[0] : sp.fabric;

  const [category, varieties, motifs, dyes, range, { items, total }, wishlistIds] =
    await Promise.all([
      getCategoryBySlug(type.category),
      getTypeVarieties(type.category),
      getTypeMotifs(type.category),
      getTypeDyes(type.category),
      getTypePriceRange(type.category),
      // Thirty when a cloth is chosen, eight otherwise. Unfiltered, this grid
      // is a sample above an editorial page and eight is the right size for
      // it; filtered, it is the answer to the question the reader just asked,
      // and cutting that to eight would send them to /shop for the rest —
      // which is the navigation this change exists to remove.
      getTypeProducts(type.category, activeFabric ? 30 : 8, activeFabric),
      getWishlistIds(),
    ]);

  if (!category) notFound();

  /** The chosen cloth, resolved for the heading. Undefined if the slug is unknown. */
  const activeFabricName = activeFabric
    ? [...varieties.values()]
        .flat()
        .find((f) => f.slug === activeFabric)?.name
    : undefined;

  // Families in the order this type wants them, then anything unexpected.
  const families = [
    ...type.familyOrder.filter((f) => varieties.has(f)),
    ...[...varieties.keys()].filter((f) => !type.familyOrder.includes(f)),
  ];

  const narrative = motifs.filter((m) => isNarrativeMotif(m.slug));
  const otherMotifs = motifs.filter((m) => !isNarrativeMotif(m.slug));

  /*
    The banner.

    The opening frame is the category's own photograph — the one image here
    that is about the kind of thing rather than about one piece. Everything
    after it is a piece currently in the store, captioned and linked, so the
    carousel is a window onto the stock rather than an ornament above it. With
    nothing finished in this category the banner is that single frame, which
    is the honest state and not a broken carousel.
  */
  const bannerSlides: BannerSlide[] = [
    {
      src: `/images/products/hero-${type.category}.jpg`,
      alt: `Hand-painted Kalamkari ${type.label.toLowerCase()} from the workshop in ${site.location.town}.`,
    },
    ...items.slice(0, 5).map((product) => ({
      src: primaryImage(product.images),
      alt: product.name,
      caption: product.name,
      href: `/product/${product.slug}`,
    })),
  ];

  /* The cloth rail: every variety this category actually holds, in the order
     the type wants its families, with live counts. */
  const clothGroups = families.map((family) => ({
    family,
    cloths: (varieties.get(family) ?? []).map<ClothLink>((fabric) => ({
      slug: fabric.slug,
      name: fabric.name,
      count: fabric._count.products,
      family,
    })),
  }));

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

          {/* The banner sits above the heading rather than beside it: these
              pages are most often arrived at from a search engine, and the
              first thing that should happen is seeing the work. */}
          <TypeBanner slides={bannerSlides} className="mb-10" />

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

      {/* Every cloth this category actually holds, one tap from the top.
          Kalamkari is chosen by cloth more often than by anything else. */}
      <ClothSubnav
        category={type.category}
        groups={clothGroups}
        familyLabels={FAMILY_LABELS}
      />

      {/* ------------------------------------------------------------------ */}
      {/* What this kind of piece is                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="section-y">
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

                {/* The two questions that actually follow "what is this" for
                    each kind of piece — usually what it costs and why, and
                    what living with it is like. Behind the same disclosure,
                    so the default view stays skimmable. */}
                {type.deepDive.map((section) => (
                  <section key={section.title} className="mt-2">
                    <h3 className="font-display text-lg leading-snug">{section.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      {section.body}
                    </p>
                  </section>
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
      {/*
        The grid, and the target of every "choose by cloth" card on this page.

        It renders whenever a cloth has been chosen, even with nothing in it —
        that is the whole difference between a filter and a link. Scrolling
        somebody to a section that has silently vanished because their cloth is
        out of stock leaves them at whatever section happens to be there
        instead, with no idea their choice was registered.
      */}
      {(items.length > 0 || activeFabric) && (
        <section
          id="pieces"
          className="scroll-mt-28 border-t border-border section-y md:scroll-mt-32"
        >
          <div className="container">
            <RevealOnScroll>
              <SectionHeader
                eyebrow={activeFabricName ? 'Filtered by cloth' : 'In the store now'}
                title={
                  activeFabricName
                    ? `${activeFabricName} ${type.label.toLowerCase()}`
                    : `${type.label} ready to send`
                }
                action={
                  activeFabric
                    ? { label: 'Clear the cloth filter', href: `/types/${type.slug}#pieces` }
                    : { label: `All ${total}`, href: `/shop/${type.category}` }
                }
              />
            </RevealOnScroll>

            {items.length > 0 ? (
              <div className="mt-8">
                {/* Grouped only when the filter is on, because only then can
                    this run reach thirty. Ten cards need no signposting. */}
                <ProductGrid
                  products={items}
                  wishlistIds={wishlistIds}
                  groupEvery={activeFabric ? 10 : undefined}
                />
              </div>
            ) : (
              <div className="mt-8 rounded-sm border border-border bg-cotton-100 p-7 dark:bg-card">
                <p className="max-w-xl leading-relaxed text-muted-foreground">
                  Nothing on {activeFabricName ?? 'this cloth'} is finished at the moment.
                  Every piece here is one of one and takes weeks, so a cloth empties and
                  fills again — try another below, or ask for one to be painted.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button asChild variant="outline">
                    <Link href={`/types/${type.slug}#varieties`}>Try another cloth</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/custom">Commission one</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* What happened to it before it reached the shelf                     */}
      {/* ------------------------------------------------------------------ */}
      {/*
        Placed straight after the pieces rather than at the foot of the page,
        and that is the whole point of adding it. A visitor who has just looked
        at a price is the one with the question this section answers; a visitor
        who has already scrolled past the varieties, the colours and the motifs
        has either decided or gone.

        It also breaks up what was four consecutive grids of cards — pieces,
        cloths, colours, motifs — with a section that is prose and numerals.
      */}
      <HowThisIsMade typeLabel={type.label} />

      {/* ------------------------------------------------------------------ */}
      {/* Varieties — the substance of the page                               */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="varieties"
        className="scroll-mt-24 border-y border-border bg-cotton-100 section-y dark:bg-card"
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

                      {/*
                        Each card filters this page rather than leaving it.

                        `?fabric=<slug>#pieces` does all three things the brief
                        asks for in one plain anchor: it stays on this page, it
                        applies the filter, and the fragment scrolls to the
                        grid. No click handler, no `scrollIntoView`, no state —
                        which means it also survives JavaScript being off, can
                        be opened in a new tab, and can be linked to from
                        outside. `scroll-mt` on the target clears the sticky
                        header.

                        The card is marked as the current one when its own
                        filter is on, so somebody returning to this section
                        after scrolling up can see which cloth they chose.
                      */}
                      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {fabrics.map((fabric) => {
                          const on = activeFabric === fabric.slug;
                          return (
                            <li key={fabric.slug}>
                              <div
                                className={cn(
                                  'group flex h-full flex-col rounded-sm border bg-background p-4 transition-colors',
                                  on
                                    ? 'border-primary/60 bg-primary/[0.04]'
                                    : 'border-border hover:border-primary/40',
                                )}
                              >
                                <div className="flex items-baseline justify-between gap-3">
                                  <h4 className="font-display text-lg leading-snug">
                                    {fabric.name}
                                  </h4>
                                  <span className="tabular shrink-0 text-sm text-muted-foreground">
                                    {fabric._count.products}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                  {fabric.description}
                                </p>

                                {/*
                                  Two controls, and `mt-auto` so they sit on the
                                  same line across a row of cards whose
                                  descriptions differ in length. The clamp came
                                  off the description above for the same reason
                                  the brief asks for "read more": a card that
                                  truncates and then offers to show you the
                                  cloth is hiding the sentence that would help
                                  you choose it.
                                */}
                                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-4">
                                  <Link
                                    href={`/types/${type.slug}?fabric=${fabric.slug}#pieces`}
                                    className="inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                                    aria-current={on ? 'true' : undefined}
                                  >
                                    {on ? 'Showing these' : 'See these'}
                                    <ArrowRight
                                      className="h-3.5 w-3.5 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5"
                                      aria-hidden="true"
                                    />
                                  </Link>

                                  <Link
                                    href={`/types/${type.slug}?fabric=${fabric.slug}#pieces`}
                                    className="inline-flex min-h-[2.75rem] items-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                  >
                                    Read more
                                  </Link>
                                </div>
                              </div>
                            </li>
                          );
                        })}
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
      {/* Choose by colour — the same idea as the varieties, one axis over    */}
      {/* ------------------------------------------------------------------ */}
      {/*
        Deliberately lighter than the cloth section above it.

        Cloth is a decision with consequences — it changes how the dye strikes,
        how the piece drapes and how it must be washed — so it gets a card each,
        with the description and the care note behind it. Colour is a
        preference. It gets a swatch, a name, its source and a count, and it
        goes straight to the filtered grid.

        The source line is the part worth keeping: "Indigo — dipped, never
        painted" tells somebody something true about how this cloth is made,
        which a colour chip on any other shop does not.
      */}
      {dyes.length > 1 && (
        <section
          id="colours"
          /*
            The bottom rule is load-bearing, not decoration.

            The motif section below carries no border of its own — it never
            needed one, because the varieties section above it is tinted and
            bordered and did the separating. Dropping this section in between
            took that away and left two untinted `section-y` blocks stacked,
            which is 144px of unbroken ground at desktop and reads as the page
            having run out rather than having moved on.
          */
          className="scroll-mt-24 border-b border-border section-y"
          aria-labelledby="type-colours-heading"
        >
          <div className="container">
            <RevealOnScroll>
              <SectionHeader
                eyebrow="Choose by colour"
                title={`The pots these ${type.label.toLowerCase()} come out of`}
                lead="Every colour on this cloth was boiled, fermented or dipped from something that grew or rusted. Nothing here is mixed to a swatch — these are the pots the workshop keeps, and a piece is listed under each one it actually carries."
                id="type-colours-heading"
              />
            </RevealOnScroll>

            <RevealOnScroll delay={0.06}>
              <ul className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:mt-10 lg:grid-cols-4">
                {dyes.map((dye) => (
                  <li key={dye.slug}>
                    <Link
                      href={`/shop/${type.category}?dye=${dye.slug}`}
                      className="group flex h-full items-start gap-3 rounded-sm border border-border bg-background p-3 transition-colors hover:border-primary/40 sm:p-3.5"
                    >
                      {/* Keeps its own hairline: myrobalan cream is within a
                          few percent of the page ground and would otherwise be
                          an invisible swatch. */}
                      <span
                        aria-hidden="true"
                        className="mt-0.5 h-8 w-8 shrink-0 rounded-[2px] ring-1 ring-inset ring-foreground/20 transition-transform duration-500 motion-safe:group-hover:scale-[1.06]"
                        style={{ backgroundColor: dye.hex }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="font-display text-[0.9375rem] leading-tight">
                            {dye.name}
                          </span>
                          <span className="tabular shrink-0 text-xs text-muted-foreground">
                            {dye._count.products}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs leading-snug text-muted-foreground">
                          {dye.source}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </RevealOnScroll>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* What is drawn on them                                               */}
      {/* ------------------------------------------------------------------ */}
      {motifs.length > 0 && (
        <section className="section-y">
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
      {/* How to tell it from a print                                         */}
      {/* ------------------------------------------------------------------ */}
      {/*
        Last before the cross-links, because it is the section a visitor takes
        away rather than acts on. It is also the most useful thing this site can
        give somebody who is not going to buy from it: six checks that work in
        any shop, on any cloth, with no expertise.
      */}
      <WhatToLookFor typeLabel={type.label} />

      {/* ------------------------------------------------------------------ */}
      {/* The other types                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-border bg-cotton-100 section-y dark:bg-card">
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
