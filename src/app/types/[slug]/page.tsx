import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { SectionHeader } from '@/components/layout/section-header';
import { TrustStrip } from '@/components/layout/trust-strip';
import { NarrativeNote } from '@/components/shop/narrative-note';
import { HowThisIsMade, WhatToLookFor } from '@/components/shop/craft-notes';
import { ReadyToSend } from '@/components/types/ready-to-send';
import { TypeCatalogue } from '@/components/types/type-catalogue';
import { ClothGuide, type GuideFamily } from '@/components/types/cloth-guide';
import { DyePots, type PotStory } from '@/components/types/dye-pots';
import { MakingSteps } from '@/components/types/making-steps';
import { PriceAndCare, QuestionsAccordion } from '@/components/types/auto-open-panels';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { Button } from '@/components/ui/button';
import {
  getTypeVarieties,
  getTypeDyes,
  getTypeMotifs,
  getTypePriceRange,
  getTypeFabricFromPrices,
  getTypeProducts,
  getCategoryBySlug,
  type ProductCardData,
} from '@/lib/queries';
import { getWishlistIds } from '@/lib/cart';
import {
  typeDefs,
  findType,
  FAMILY_LABELS,
  FAMILY_NOTES,
  isNarrativeMotif,
} from '@/content/catalogue';
import { colourStories } from '@/content/process';
import { typeMaking } from '@/content/type-making';
import { resolvedFaqs } from '@/content/faq';
import { commissionTimeline } from '@/content/commission';
import { formatPrice, absoluteUrl } from '@/lib/utils';
import { site } from '@/content/site';

/**
 * One page per kind of thing the workshop makes, built to be used.
 *
 * A visitor to this page wants a piece, so the pieces come first and the
 * explanation follows for whoever wants it. In order:
 *
 *   1. what this is and what is in stock (the fold)
 *   2. pieces ready to send, mixed across every cloth — eight, then sixteen more
 *   3. every piece of this kind, by cloth, in numbered pages of eight
 *   4. how this kind of piece is made
 *   5. what each cloth is and how it behaves — explained in place
 *   6. the colours, one at a time, each with how it is made
 *   7. the practical facts, the subjects, how to tell hand from print, questions
 *
 * Nothing on the page is a photograph: there are none for these categories yet.
 * The layout is built from catalogue data and written content only, so adding
 * photography later improves the cards without any structural change.
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

/** The `Dye` slug each colour account in `process.ts` belongs to. */
const POT_STORY: Record<string, string> = {
  'kasim-black': 'black',
  'madder-red': 'red',
  pink: 'pink',
  'myrobalan-yellow': 'yellow',
  indigo: 'blue',
  green: 'green',
  'katha-brown': 'brown',
  'myrobalan-cream': 'cream',
};

/**
 * One piece from each cloth in turn, so the first screen shows the range
 * rather than a run of whichever cloth came off the line most recently. Order
 * inside each cloth is the catalogue's own (signed work and featured first).
 */
function mixAcrossCloths(items: ProductCardData[], take: number): ProductCardData[] {
  const groups = new Map<string, ProductCardData[]>();
  for (const p of items) {
    if (p.stock < 1) continue;
    const key = p.fabric?.slug ?? 'other';
    const list = groups.get(key) ?? [];
    list.push(p);
    groups.set(key, list);
  }
  const lists = [...groups.values()];
  const out: ProductCardData[] = [];
  for (let round = 0; out.length < take; round++) {
    let added = false;
    for (const list of lists) {
      if (list[round]) {
        out.push(list[round]);
        added = true;
        if (out.length >= take) break;
      }
    }
    if (!added) break;
  }
  return out;
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

  const requestedCloth = Array.isArray(sp.fabric) ? sp.fabric[0] : sp.fabric;

  const [category, varieties, motifs, dyes, range, { items, soldTotal }, wishlistIds, fromPrices] =
    await Promise.all([
      getCategoryBySlug(type.category),
      getTypeVarieties(type.category),
      getTypeMotifs(type.category),
      getTypeDyes(type.category),
      getTypePriceRange(type.category),
      // The whole category, once: the catalogue filters and pages it in the
      // browser. Capped so a very large catalogue cannot bloat the page.
      getTypeProducts(type.category, 200),
      getWishlistIds(),
      getTypeFabricFromPrices(type.category),
    ]);

  if (!category) notFound();

  const families = [
    ...type.familyOrder.filter((f) => varieties.has(f)),
    ...[...varieties.keys()].filter((f) => !type.familyOrder.includes(f)),
  ];

  const cloths = families.flatMap((family) =>
    (varieties.get(family) ?? []).map((f) => ({ slug: f.slug, name: f.name, family })),
  );
  const initialCloth = cloths.some((c) => c.slug === requestedCloth) ? requestedCloth : undefined;

  const wishlist = [...wishlistIds];
  const ready = mixAcrossCloths(items, 24);

  const guide: GuideFamily[] = families.map((family) => ({
    family,
    label: FAMILY_LABELS[family] ?? family,
    note: FAMILY_NOTES[family] ?? null,
    cloths: (varieties.get(family) ?? []).map((f) => {
      const from = fromPrices.get(f.id);
      return {
        slug: f.slug,
        name: f.name,
        description: f.description,
        careNote: f.careNote || null,
        count: f._count.products,
        from: from != null ? formatPrice(from) : null,
      };
    }),
  }));

  const pots: PotStory[] = dyes.flatMap((dye) => {
    const story = colourStories.find((s) => s.id === POT_STORY[dye.slug]);
    if (!story) return [];
    return [
      {
        slug: dye.slug,
        name: story.name,
        localName: story.localName,
        hex: story.hex,
        ink: story.ink,
        source: story.source,
        method: story.method,
        body: story.body,
        note: story.note,
        usedFor: story.usedFor,
        routes: story.routes,
        count: dye._count.products,
      },
    ];
  });

  const narrative = motifs.filter((m) => isNarrativeMotif(m.slug));
  const otherMotifs = motifs.filter((m) => !isNarrativeMotif(m.slug));
  const label = type.label;
  const making = typeMaking[type.slug];

  // Real, answered questions about buying and living with a piece — the same
  // entries /faq publishes; nothing is written for this page.
  const questions = resolvedFaqs()
    .filter((f) => f.group === 'buying' || f.group === 'care')
    .slice(0, 5);

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* The fold                                                            */}
      {/* ------------------------------------------------------------------ */}
      <header className="border-b border-border bg-cotton-100 pb-10 pt-10 md:pb-14 md:pt-14 dark:bg-card">
        <div className="container">
          <Breadcrumbs
            trail={[{ label: 'Shop', href: '/' }, { label }]}
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
            <p className="mt-6 text-body-lg text-muted-foreground">{type.blurb}</p>
          </div>

          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5 border-t border-border pt-6">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Ready to send
              </dt>
              <dd className="tabular mt-1.5 font-display text-2xl leading-none">
                {range.available}
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
              <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Cloths</dt>
              <dd className="tabular mt-1.5 font-display text-2xl leading-none">
                {cloths.length}
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="#ready">
                Browse all {label.toLowerCase()}
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
      {/* Ready to send — a mix across every cloth                            */}
      {/* ------------------------------------------------------------------ */}
      <section id="ready" className="scroll-mt-20 section-y" aria-labelledby="ready-heading">
        <div className="container">
          <SectionHeader
            eyebrow="In the store now"
            title={`${label} ready to send`}
            lead={`A selection across every cloth, one from each in turn.`}
            id="ready-heading"
          />
          <div className="mt-8">
            {ready.length > 0 ? (
              <ReadyToSend products={ready} wishlistIds={wishlist} label={label} />
            ) : (
              <p className="max-w-xl leading-relaxed text-muted-foreground">
                Nothing of this kind is finished at the moment. Work comes off the line
                continuously — or ask for one to be painted.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Every piece, by cloth                                               */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="catalogue"
        className="scroll-mt-20 border-t border-border section-y"
        aria-labelledby="catalogue-heading"
      >
        <div className="container">
          <SectionHeader
            eyebrow="The full list"
            title={`All ${label.toLowerCase()}, by cloth`}
            lead="Choose a cloth to see only those. Eight to a page."
            id="catalogue-heading"
          />
          <div className="mt-8">
            <TypeCatalogue
              key={initialCloth ?? 'all'}
              products={items}
              cloths={cloths}
              familyLabels={FAMILY_LABELS}
              wishlistIds={wishlist}
              label={label}
              initialCloth={initialCloth}
            />
          </div>
          {soldTotal > 0 && (
            <p className="mt-6 text-sm text-muted-foreground">
              <Link
                href="/archive"
                className="inline-flex min-h-[2.75rem] items-center text-primary underline underline-offset-4"
              >
                {soldTotal} {soldTotal === 1 ? 'piece' : 'pieces'} of this kind{' '}
                {soldTotal === 1 ? 'has' : 'have'} already found a home
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* How this kind of piece is made                                      */}
      {/* ------------------------------------------------------------------ */}
      {making ? <MakingSteps making={making} /> : <HowThisIsMade typeLabel={label} />}

      {/* ------------------------------------------------------------------ */}
      {/* What each cloth is                                                  */}
      {/* ------------------------------------------------------------------ */}
      {guide.length > 0 && (
        <section id="cloths" className="scroll-mt-20 section-y" aria-labelledby="cloths-heading">
          <div className="container">
            <RevealOnScroll>
              <SectionHeader
                eyebrow="Choosing a cloth"
                title="What each cloth is, and how it behaves"
                lead={type.varietyNote}
                id="cloths-heading"
              />
            </RevealOnScroll>
            <div className="mt-8">
              <ClothGuide families={guide} />
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* The colours                                                         */}
      {/* ------------------------------------------------------------------ */}
      {pots.length > 1 && (
        <DyePots
          pots={pots}
          category={type.category}
          eyebrow="Colours"
          title={`The colours on these ${label.toLowerCase()}`}
          lead="Every colour here was boiled, fermented or dipped from something that grew or rusted. Choose one to see how it is made."
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Practical facts and the two questions that follow them              */}
      {/* ------------------------------------------------------------------ */}
      <section className="section-y" aria-labelledby="facts-heading">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <h2 id="facts-heading" className="text-display-sm">
                The practical facts
              </h2>
              <dl className="mt-5 flex flex-col divide-y divide-border border-y border-border">
                {type.facts.map((fact) => (
                  <div key={fact.label} className="flex flex-wrap gap-x-4 py-3 text-sm">
                    <dt className="w-32 shrink-0 text-[0.6875rem] uppercase tracking-[0.1em] text-muted-foreground">
                      {fact.label}
                    </dt>
                    <dd className="flex-1">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <h2 className="text-display-sm">Price, and living with it</h2>
              <PriceAndCare sections={type.deepDive} />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* By subject — kept short: a way to a filtered list, not an essay     */}
      {/* ------------------------------------------------------------------ */}
      {motifs.length > 0 && (
        <section className="border-t border-border section-y-sm" aria-labelledby="subjects-heading">
          <div className="container">
            <h2 id="subjects-heading" className="text-display-sm">
              Browse by subject
            </h2>
            {narrative.length > 0 && (
              <div className="mt-5">
                <NarrativeNote variant="inline" />
              </div>
            )}
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {[...narrative, ...otherMotifs].map((motif) => (
                <li key={motif.slug}>
                  <Link
                    href={`/shop/${type.category}?motif=${motif.slug}`}
                    className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-sm border border-border bg-background px-4 text-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {motif.name}
                    <span className="tabular text-xs text-muted-foreground">
                      {motif._count.products}
                    </span>
                    {isNarrativeMotif(motif.slug) && (
                      <span className="rounded-sm border border-primary/30 bg-primary/[0.06] px-1.5 py-0.5 text-[0.625rem] uppercase tracking-[0.1em] text-primary">
                        Commission first
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* How to tell it from a print                                         */}
      {/* ------------------------------------------------------------------ */}
      <WhatToLookFor typeLabel={label} />

      {/* ------------------------------------------------------------------ */}
      {/* Questions                                                           */}
      {/* ------------------------------------------------------------------ */}
      {questions.length > 0 && (
        <section
          className="border-t border-border section-y"
          aria-labelledby="type-faq-heading"
        >
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
              <div>
                <p className="eyebrow">Before you decide</p>
                <h2 id="type-faq-heading" className="mt-3 text-display-md">
                  Questions people ask first
                </h2>
                <Link
                  href="/faq"
                  className="mt-5 inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  All the questions
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <QuestionsAccordion
                items={questions.map(({ id, question, answer, link }) => ({ id, question, answer, link }))}
              />
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Not here? Have it drawn                                             */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="border-y border-border bg-cotton-100 section-y dark:bg-card"
        aria-labelledby="type-commission-heading"
      >
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="eyebrow">Not quite what you had in mind</p>
              <h2 id="type-commission-heading" className="mt-3 text-display-md">
                Have {label.toLowerCase()} drawn for you
              </h2>
            </div>
            <Button asChild size="lg">
              <Link href="/custom">
                Start a commission
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {commissionTimeline.map((step) => (
              <li key={step.n} className="border-t border-border pt-4">
                <span className="tabular font-inscription text-sm text-primary/80">{step.n}</span>
                <h3 className="mt-1.5 font-display text-base leading-snug">{step.title}</h3>
                <p className="mt-1.5 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                  {step.when}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <TrustStrip />

      {/* ------------------------------------------------------------------ */}
      {/* The other types                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="section-y-sm">
        <div className="container">
          <h2 className="text-display-sm">The rest of what the workshop makes</h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {typeDefs
              .filter((t) => t.slug !== type.slug)
              .map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/types/${other.slug}`}
                    className="inline-flex min-h-[2.75rem] items-center rounded-sm border border-border bg-background px-4 text-sm transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {other.label}
                  </Link>
                </li>
              ))}
            <li>
              <Link
                href="/"
                className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-sm border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-chay-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
