import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { WelcomeNote } from '@/components/home/welcome-note';
import { EditorialHero } from '@/components/home/editorial-hero';
import { CollectionCards } from '@/components/home/collection-cards';
import { WhatIsKalamkari } from '@/components/home/what-is-kalamkari';
import { ShopByCloth } from '@/components/home/shop-by-cloth';
import { JournalRow } from '@/components/home/journal-row';
import { QuickStore } from '@/components/home/quick-store';
import { ArrivalQuestions } from '@/components/home/arrival-questions';
import { WorkshopInvitation } from '@/components/home/workshop-invitation';
import { TrustStrip } from '@/components/layout/trust-strip';
import { BestWorks } from '@/components/home/best-works';
import { CraftModules } from '@/components/home/craft-modules';
import { DyePots } from '@/components/home/dye-pots';
import { Badge } from '@/components/ui/primitives';
import { ProductCard } from '@/components/shop/product-card';
import { PieceChooser } from '@/components/home/piece-chooser';
import { SectionIndex } from '@/components/home/section-index';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { Parallax } from '@/components/motion/parallax';
import {
  getQuickStore,
  getCategories,
  getBestWorks,
  getFilterOptions,
  getBlogPosts,
  getCategoryStats,
  getRecentlySold,
} from '@/lib/queries';
import { getWishlistIds } from '@/lib/cart';
import { site } from '@/content/site';
import { family, homeFamilyNote } from '@/content/family';
import { homeCollectionCards } from '@/content/catalogue';
import { absoluteUrl, formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Hand-painted Kalamkari from Srikalahasti — natural dyes only',
  description: site.description,
  alternates: { canonical: '/' },
};

export const revalidate = 300;

/**
 * The hero photograph.
 *
 * This path is the project's designated hero image, and what is at it today is
 * a generated placeholder swatch (see `scripts/generate-placeholders.mjs`), not
 * a photograph. The alt text describes the photograph that belongs here. When
 * store photography replaces the file the page needs no change.
 */
const heroImage = {
  src: '/images/products/hero-sarees.jpg',
  alt: 'A hand-painted Kalamkari saree with a narrative pallu in madder red and iron black.',
};

/**
 * The order of this page, top to bottom, in four acts:
 *
 *   arrive     hero → trust row
 *   shop       categories → the pieces → cloth and the chooser → recently gone
 *   believe    best works → the short craft introduction → the pots → the family
 *   take home  commissions → questions → journal → welcome and visit → footer
 *              (which carries the newsletter).
 *
 * Whoever came to buy meets everything for sale in one stretch, before any
 * story. Whoever is unsure reaches the argument straight after, and it builds
 * from the finished work to how it is made, the colour, and the people.
 *
 * The long "What is Kalamkari" and "Two crafts, one name" sections used to
 * follow the hero. They now live at /process#what-is-kalamkari and /heritage,
 * and the eight-stage viewer is on /process; this page keeps the short
 * introduction and a way to each.
 */
export default async function HomePage() {
  const [
    quickStore,
    categories,
    wishlistIds,
    bestWorksItems,
    filterOptions,
    posts,
    categoryStats,
    recentlySold,
  ] = await Promise.all([
    getQuickStore(10),
    getCategories(),
    getWishlistIds(),
    getBestWorks(6),
    getFilterOptions(),
    getBlogPosts(),
    getCategoryStats(),
    getRecentlySold(4),
  ]);

  // The chooser's two questions, both read from the catalogue. Budget ceilings
  // are the range split in thirds and rounded to a whole thousand rupees
  // (100,000 paise); a range too narrow to split yields no budget question.
  const cloths = filterOptions.fabrics
    .filter((f) => f._count.products > 0)
    .map((f) => ({ value: f.slug, label: f.name }));
  const STEP = 100_000;
  const span = filterOptions.maxPrice - filterOptions.minPrice;
  const ceilings = [1, 2]
    .map((n) => Math.ceil((filterOptions.minPrice + (span * n) / 3) / STEP) * STEP)
    .filter((v, i, all) => v > 0 && all.indexOf(v) === i && v < filterOptions.maxPrice);
  const budgets = ceilings.map((v) => ({ value: String(v), label: `Up to ${formatPrice(v)}` }));

  const sectionEntries = [
    { id: 'categories', label: 'The store' },
    { id: 'pieces', label: 'The pieces' },
    { id: 'craft', label: 'The craft' },
    { id: 'family', label: 'The family' },
    { id: 'commission', label: 'Commission' },
    { id: 'visit', label: 'Visit' },
  ];

  const master = family.find((m) => m.id === 'viswanath-reddy')!;

  return (
    <div className="home-tight">
      {/* ------------------------------------------------------------------ */}
      {/* Hero — one photograph, the claim, two ways in                       */}
      {/* ------------------------------------------------------------------ */}
      <EditorialHero src={heroImage.src} alt={heroImage.alt} />
      <SectionIndex entries={sectionEntries} />

      {/* What you are actually buying, and where each claim is set out. */}
      <TrustStrip showProof />

      {/* ------------------------------------------------------------------ */}
      {/* Categories                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section id="categories" className="section-y scroll-mt-20">
        <div className="container">
          <RevealOnScroll>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">The store</p>
                <h2 className="mt-3 text-display-md">What we make</h2>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                See everything
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </RevealOnScroll>

          {/*
            The collage. Two columns at every width, three from `lg`. Letting
            this fall to a single column would turn a composition into a list,
            which is precisely the thing worth keeping.

            Only the first cell is wide, and that is a fix rather than a taste.
            Spanning both `i === 0` and `i === 3` laid five categories out as
            2+1 / 2+1 / 1 — six cells across the first two rows, leaving the
            fifth category alone on a third row beside two empty ones. On the
            three-column grid that hole is a third of the section's width and
            reads as a card that failed to load. Spanning only the first fills
            exactly two rows, 2+1 then 1+1+1, and still opens the collage with a
            wide plate, which is what the span was for. On the two-column phone
            grid the same rule gives a full-width opener and two clean pairs.
          */}
          <ul className="mt-5 grid grid-cols-2 gap-2.5 md:mt-6 md:gap-3 lg:grid-cols-3">
            {categories.map((category, i) => (
              <li
                key={category.id}
                className={i === 0 ? 'col-span-2' : ''}
              >
                <RevealOnScroll delay={i * 0.05}>
                  <Link
                    href={`/shop/${category.slug}`}
                    // Plate heights down about 10%, in step with the product
                    // cards: 8.5→7.75, 11→10, 12.5→11.25rem. The padding comes
                    // with them at the top end so the type does not end up
                    // sitting in proportionally more air than it did.
                    className="group relative flex h-full min-h-[7.75rem] flex-col justify-end overflow-hidden rounded-sm bg-kasim-800 p-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-[10rem] sm:p-4 md:min-h-[11.25rem] md:p-5"
                  >
                    <Image
                      src={category.heroImage}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 40vw, 50vw"
                      className="object-cover opacity-70 transition-transform [transition-duration:900ms] ease-out motion-safe:group-hover:scale-[1.06]"
                    />

                    {/* Two scrims, not one. The vertical gradient holds the
                        type; the flat kasim veil lifts on hover, so the whole
                        photograph warms slightly as the cursor arrives rather
                        than only moving. */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-kasim-950/88 via-kasim-950/35 to-kasim-950/5"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute inset-0 bg-kasim-950/20 transition-opacity duration-700 group-hover:opacity-0"
                      aria-hidden="true"
                    />

                    {/* The hairline frame used on the narrative panels and the
                        welcome portrait. It is the site's one piece of shared
                        framing language, and it is what makes these read as
                        mounted plates rather than as tiles. */}
                    <span
                      className="pointer-events-none absolute inset-2 border border-cotton-100/15 transition-colors duration-500 group-hover:border-cotton-100/30"
                      aria-hidden="true"
                    />

                    <div className="relative">
                      {/* Telugu on its own line rather than trailing the
                          English at a third of its size. It is the name the
                          cloth is actually asked for by in this town. */}
                      {category.teluguName && (
                        <span className="block font-telugu text-[0.6875rem] leading-none text-myrobalan-300/85 sm:text-xs md:text-sm">
                          {category.teluguName}
                        </span>
                      )}
                      <h3 className="mt-1 font-display text-base leading-tight text-cotton-50 sm:text-lg md:text-xl">
                        {category.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 max-w-md text-[0.6875rem] leading-snug text-cotton-100/75 sm:mt-1.5 sm:text-xs md:text-[0.8125rem]">
                        {category.tagline}
                      </p>
                      {/* Read from the catalogue; a category with nothing in
                          stock states nothing rather than "0 pieces". */}
                      {categoryStats.get(category.id) && (
                        <p className="tabular mt-1.5 text-[0.6875rem] font-medium text-myrobalan-300 sm:text-xs">
                          {categoryStats.get(category.id)!.count} available · from{' '}
                          {formatPrice(categoryStats.get(category.id)!.from)}
                        </p>
                      )}

                      {/* The affordance, drawn rather than stated. It costs no
                          height at rest — the rule grows from nothing. */}
                      <span
                        className="mt-2 block h-px w-0 bg-myrobalan-300/70 transition-[width] duration-500 ease-out motion-safe:group-hover:w-10"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                </RevealOnScroll>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* The quick store — ten pieces, chosen to be unlike each other        */}
      {/* ------------------------------------------------------------------ */}
      {/*
        The selection is spread across motif, cloth and price band rather than
        ordered by recency: featured ordering follows what came off the line
        most recently, and work comes off the line in runs, so a recency list
        is routinely four variations of one drawing on one cloth.
        `getQuickStore` spreads the ten; the section states the resulting range
        rather than asserting one. It is not a "new arrivals" list and is not
        labelled as one.
      */}
      <div id="pieces" className="scroll-mt-20">
        <QuickStore items={quickStore} wishlistIds={wishlistIds} />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Choose by cloth                                                     */}
      {/* ------------------------------------------------------------------ */}
      {/* Below the pieces rather than above them: pieces first puts something
          to buy in front of the visitor sooner, and this section is the
          refinement for whoever did not see theirs. It also restores the
          plain / cream alternation between the neighbouring sections. */}
      <ShopByCloth
        fabrics={filterOptions.fabrics}
        chooser={cloths.length > 0 ? <PieceChooser cloths={cloths} budgets={budgets} /> : null}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Pieces that have already gone                                       */}
      {/* ------------------------------------------------------------------ */}
      {/*
        Shown only when there is something to show. Stock is the signal, not
        orders: a cancelled order returns its piece, so a piece at zero stock is
        genuinely gone. The card marks it sold on its own.
      */}
      {recentlySold.length >= 4 && (
        <section className="section-y" aria-labelledby="sold-heading">
          <div className="container">
            <RevealOnScroll>
              <p className="eyebrow">Already found a home</p>
              <h2 id="sold-heading" className="mt-3 max-w-2xl text-display-sm">
                Recently gone — and not coming back
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Each of these was drawn once. If one of them was the piece you wanted, a
                sibling can be drawn on purpose.
              </p>
            </RevealOnScroll>
            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4 md:gap-x-5">
              {recentlySold.map((product) => (
                <li key={product.id} className="flex">
                  <ProductCard
                    product={product}
                    wishlisted={wishlistIds?.has(product.id)}
                    className="w-full"
                    sizes="(min-width: 768px) 22vw, 46vw"
                  />
                </li>
              ))}
            </ul>
            <p className="mt-7 text-sm">
              <Link
                href="/custom"
                className="inline-flex min-h-[2.75rem] items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
              >
                Have a similar piece painted
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Best works                                                          */}
      {/* ------------------------------------------------------------------ */}
      {/*
        The rhythm reason: the quick store and the introduction above are both
        `bg-cotton-100`, so the page would otherwise run cream into cream and
        read as one block — this section is the paragraph break. The argument
        reason: a visitor who has just read how the cloth is made is holding a
        simpler question — can these people actually draw? One large plate of
        the hardest work the house does, with what it took beside it, answers
        it in a glance.
      */}
      <BestWorks works={bestWorksItems} />

      {/* ------------------------------------------------------------------ */}
      {/* What Kalamkari is, and how it is made — the short version           */}
      {/* ------------------------------------------------------------------ */}
      <div id="craft" className="scroll-mt-20">
        <WhatIsKalamkari />
      </div>

      <CraftModules />

      {/* Where the colour comes from — the same closed set the shop filters on. */}
      <DyePots />

      {/* ------------------------------------------------------------------ */}
      {/* The family                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section id="family" className="section-y-lg scroll-mt-20">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-12">
            <RevealOnScroll>
              {/* Capped rather than filling its column. At `lg:w-full` this
                  portrait grew with the viewport until it was the tallest
                  thing on the page, and the biography beside it — which is
                  the point of the section — read as its caption. */}
              <div className="relative mx-auto aspect-[4/5] w-[62%] overflow-hidden rounded-sm bg-cotton-300 sm:w-[48%] lg:mx-0 lg:w-full lg:max-w-[21rem] xl:max-w-[24rem]">
                {/*
                  The portrait drifts inside its own frame as the section
                  passes — a photograph moving against a fixed mount is what a
                  mounted photograph does when you walk past it.

                  `-inset-y-12` is the overscan the drift needs. At speed 0.045
                  over a ~500px frame the layer travels about ±35px, so a layer
                  the exact size of the frame would show the cotton ground at
                  the top or bottom edge for most of the scroll. The extra 48px
                  each way is clipped by the frame's `overflow-hidden` and is
                  never seen.

                  `Parallax` owns `transform` on this element, so nothing
                  inside it may animate `transform` as well.
                */}
                <Parallax speed={0.045} className="absolute -inset-y-12 inset-x-0">
                  <Image
                    src={master.image}
                    alt={`${master.name} at work in the store in ${site.location.town}`}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                </Parallax>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.1} className="flex flex-col justify-center">
              <p className="eyebrow">The family</p>
              <h2 className="mt-4 text-display-md">
                One household, holding one part of a craft
              </h2>

              <blockquote className="mt-5 border-l-2 border-primary pl-5">
                <p className="font-display text-xl leading-snug md:text-2xl">
                  “{master.quote!.text}”
                </p>
                <footer className="mt-3 text-sm text-muted-foreground">
                  — {master.quote!.attribution}, {master.role}
                </footer>
              </blockquote>

              {homeFamilyNote.map((paragraph, i) => (
                <p
                  key={i}
                  className={i === 0 ? 'mt-7 leading-relaxed text-muted-foreground' : 'mt-4 leading-relaxed text-muted-foreground'}
                >
                  {paragraph}
                </p>
              ))}

              <div className="mt-6 flex flex-wrap gap-3">
                <Badge variant="gold">National Award, 2008 · Pen Kalamkari</Badge>
                <Badge variant="outline">Registered GI craft</Badge>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1">
                <Link
                  href="/our-story"
                  className="inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Meet the family
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/custom"
                  className="inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Have a piece painted
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="#visit"
                  className="inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Visit the store
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Commissions — and the two named collections                         */}
      {/* ------------------------------------------------------------------ */}
      <section id="commission" className="section-y scroll-mt-20">
        <div className="container">
          <RevealOnScroll>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Three ways in</p>
                <h2 className="mt-3 text-display-md">Take one, or start one</h2>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Everything in the store
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.08} className="mt-5 md:mt-7">
            <CollectionCards cards={homeCollectionCards} />
          </RevealOnScroll>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* The questions people actually arrive with                           */}
      {/* ------------------------------------------------------------------ */}
      {/*
        Where a shop page usually puts testimonials. It is not one, and the
        reasoning is at the top of `src/content/arrival.ts`: nobody has left a
        review on this site yet, and inventing five would be the least honest
        thing on a site whose whole argument is that its claims can be checked.
      */}
      <ArrivalQuestions />

      {/* ------------------------------------------------------------------ */}
      {/* The journal                                                         */}
      {/* ------------------------------------------------------------------ */}
      <JournalRow posts={posts} />

      {/* ------------------------------------------------------------------ */}
      {/* Come in, and come and see it being made                             */}
      {/* ------------------------------------------------------------------ */}
      {/*
        The welcome film band used to open the page, ahead of the hero. It now
        sits with the visit invitation it leads into: "Come in. The pen is still
        moving." and the hours and the address belong side by side. The
        newsletter follows in the footer.
      */}
      <WelcomeNote />
      <div id="visit" className="scroll-mt-20">
        <WorkshopInvitation />
      </div>

      {/* Structured data: the store as a local business. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Store',
            name: site.name,
            description: site.description,
            url: absoluteUrl(),
            image: absoluteUrl('/images/og/default.jpg'),
            address: {
              '@type': 'PostalAddress',
              streetAddress: site.location.street,
              addressLocality: site.location.town,
              addressRegion: site.location.state,
              postalCode: site.location.postalCode,
              addressCountry: 'IN',
            },
            hasMap: site.location.mapsUrl,
            // No openingHoursSpecification: the closing time is not published,
            // and schema.org has no way to state an opening time alone without
            // asserting a closing one we would be inventing.
            makesOffer: {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Product',
                name: 'Hand-painted Srikalahasti Kalamkari',
                material: 'Natural dyes on cotton and silk',
              },
            },
          }),
        }}
      />
    </div>
  );
}
