import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/primitives';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { KnowMore } from '@/components/ui/know-more';
import { HandVsPrinted } from '@/components/story/hand-vs-printed';
import { AwardsWall } from '@/components/story/awards-wall';
import { WorkshopVideo } from '@/components/story/workshop-video';
import { StoryPortrait } from '@/components/story/story-portrait';
import { Parallax } from '@/components/motion/parallax';
import { ProductCard } from '@/components/shop/product-card';
import { getBestWorks } from '@/lib/queries';
import { getWishlistIds } from '@/lib/cart';
import { family, storyChapters, storyMethod, workshopNotes } from '@/content/family';
import { site } from '@/content/site';

/**
 * Our story, in five sections and no more.
 *
 * The page used to run: hero, three separate story chapters each with its own
 * disclosure, five family biographies, the hand-against-printed carousel, the
 * awards wall, and a closing call to action — eight blocks, three of which were
 * making versions of the same argument. A reader looking for the family had to
 * get past two thousand words about the town first.
 *
 * It is now:
 *
 *   1. **About** — one section, one "Know more". The three chapters are still
 *      here in full; they are the disclosure rather than three sections.
 *   2. **The family** — five people, portraits at one size, each with the lead
 *      paragraph and a "Read more".
 *   3. **How we tell the story** — new. The page explained who the family are
 *      and what the craft is, and never explained the thing they actually do
 *      all day, which is tell stories on cloth.
 *   4. **Best works** — new, and read from the database rather than written
 *      down. The store's own `masterpiece` flag decides what appears.
 *   5. **Awards** — unchanged.
 *
 * The closing call to action went with the rest. The best-works section ends on
 * real pieces that link into the shop, which is a better door than a pair of
 * buttons under a heading that says "See the work itself".
 */

/**
 * Pictures for the hand-against-printed carousel.
 *
 * Every caption points at something visible in the frame. Replace the paths
 * with real detail photographs of the two kinds of cloth side by side; the
 * captions describe what each shot needs to show.
 */
const evidence = [
  {
    src: '/images/products/ramayana-pallu-cotton-saree-madder-2.jpg',
    alt: 'A hand-drawn border repeat, photographed close.',
    caption:
      'The same border unit, drawn four times. Look along it: the spacing drifts, the vine leans differently each time. A block would have printed four identical units.',
  },
  {
    src: '/images/products/tree-of-life-tussar-silk-saree-3.jpg',
    alt: 'The reverse of a hand-drawn piece.',
    caption:
      'The reverse of a hand-drawn piece. Dye laid with a pen onto myrobalan-treated cotton strikes into the fibre, so the back reads almost as strongly as the face.',
  },
  {
    src: '/images/products/krishna-leela-soft-silk-saree-2.jpg',
    alt: 'An iron-black outline at close range.',
    caption:
      'The outline swells where the hand slowed and thins where it lifted. A printed line holds one weight from end to end.',
  },
  {
    src: '/images/products/lotus-pond-indigo-chanderi-saree-4.jpg',
    alt: 'Natural indigo over myrobalan yellow.',
    caption:
      'Green here is not a dye. It is indigo dipped over an area already painted yellow — two operations, days apart, in that order only.',
  },
];

export const metadata: Metadata = {
  title: 'Our story — the family behind the kalam',
  description:
    'M Muni Reddy, M Rajeshwari, M Muniratnamma, P Vijaya Lakshmi and M Viswanath Reddy — a Srikalahasti family painting Kalamkari the long way, with natural dyes only.',
  alternates: { canonical: '/our-story' },
  openGraph: { images: ['/images/og/our-story.jpg'] },
};

export const revalidate = 300;

export default async function OurStoryPage() {
  const [bestWorks, wishlistIds] = await Promise.all([getBestWorks(6), getWishlistIds()]);

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* The fold                                                            */}
      {/* ------------------------------------------------------------------ */}
      {/*
        The fold, taken full-bleed and cinematic.

        It was a 25%-opacity photograph behind a heading — an image used as a
        texture, which is the one job a photograph of the actual store should
        never be given. It is now the frame: `min-h-[78svh]` so it fills a
        phone without the 100vh address-bar jump, the picture at full strength,
        and the type sitting at the foot of it on a gradient rather than
        floating in the middle of a wash.

        `svh` rather than `vh` deliberately. On mobile Safari and Chrome, `vh`
        is the *largest* viewport height, so a `100vh` hero is taller than the
        screen until the address bar retracts — the reader arrives to a heading
        cut off at the bottom, and the section reflows under them as they
        scroll. `svh` is the small viewport, which is the one actually visible
        on arrival.

        The clip is what the fill image needs and nothing else; the section has
        no bleeding decoration and no descendant that could hide behind it.
      */}
      <section className="relative isolate flex min-h-[78svh] flex-col justify-end overflow-hidden bg-kasim-900 pb-14 pt-24 text-cotton-100 md:min-h-[82svh] md:pb-20 md:pt-32">
        <Image
          src="/images/store/store-wide.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/*
          Two layers, and both are legibility rather than mood.

          The vertical gradient carries the type at the foot; the flat kasim
          veil pulls the whole photograph back far enough for body copy to sit
          on it at AA. At full image strength the first alone was not enough —
          the store's front room is a bright, pale room, and the paragraph
          crosses a sunlit doorway.
        */}
        <div aria-hidden="true" className="absolute inset-0 bg-kasim-950/45" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-kasim-950/92 via-kasim-950/45 to-kasim-950/25"
        />

        <div className="container relative">
          {/* The film's column is up from 24/30rem to 27/34rem — about 13%.
              A deliberately small step: it is still background to the section
              rather than the subject of it, and past roughly 36rem it starts
              taking width off the headline beside it, which is the one thing on
              this banner that has to land first. */}
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:items-end lg:gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] xl:gap-16">
            <div>
              <p className="eyebrow text-cotton-200/70">
                {site.location.town} · {site.location.state}
              </p>
              <h1 className="mt-5 max-w-3xl text-display-xl text-cotton-50">
                A house where the cloth dries on the roof
              </h1>
              <p className="mt-7 max-w-2xl text-body-lg text-cotton-100/85">
                This is not a workshop that people commute to. It is a home with pots of dye
                in the yard, work laid out on the floor of whichever room has the best
                light, and five people who learned to hold a bamboo pen before they learned
                anything else.
              </p>
            </div>

            {/* Set to the right of the heading — background to the section
                rather than the subject of it. Nothing autoplays. */}
            <WorkshopVideo
              src="/video/opening.mp4"
              poster="/images/store/store-wide.jpg"
              caption="The store’s own film, shot in Srikalahasti. No sound until you press it."
              className="mt-10 lg:mt-0"
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 1 · About                                                           */}
      {/* ------------------------------------------------------------------ */}
      {/*
        One section, one disclosure.

        This was three sections — the town, the distinction, the stakes — each
        with its own heading, its own alternating background and its own "Know
        more". Three disclosures in a row is not restraint, it is a reader
        clicking three times to read one argument. The chapters are all still
        here, in full and in order; they are now the inside of a single control.
      */}
      <section className="section-y" aria-labelledby="about-heading">
        <div className="container">
          <RevealOnScroll className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <p className="eyebrow">About the store</p>
              <h2 id="about-heading" className="mt-4 text-display-lg leading-tight">
                One household, holding one part of a craft
              </h2>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                The store was founded by M Muni Reddy and M Rajeshwari and takes its name
                from their daughter. It works alongside roughly forty other artisans in the{' '}
                {site.location.town} cluster.
              </p>
            </div>

            <KnowMore
              label="Know more"
              closeLabel="Show less"
              lead={
                <div className="flex flex-col gap-5">
                  {storyChapters.map((chapter) => (
                    <p key={chapter.id} className="text-body-lg leading-relaxed">
                      {chapter.lead}
                    </p>
                  ))}
                </div>
              }
              panelClassName="mt-6 flex flex-col gap-10 border-l-2 border-border pl-5"
            >
              {storyChapters.map((chapter) => (
                <div key={chapter.id}>
                  <h3 className="font-display text-display-sm leading-snug">
                    {chapter.title}
                  </h3>
                  <div className="mt-3 flex flex-col gap-4">
                    {chapter.body.map((para, j) => (
                      <p key={j} className="leading-relaxed text-muted-foreground">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </KnowMore>
          </RevealOnScroll>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2 · The family                                                      */}
      {/* ------------------------------------------------------------------ */}
      {/*
        A grid, not five alternating rows.

        The portraits were already `aspect-[4/5]`, so they were the same shape;
        what made them look unequal was the layout around them, which flipped
        the image from left to right on every second person and let each row
        find its own height from however much biography that person has. Five
        people in five differently-weighted rows reads as a ranking.

        One grid, one cell size, one portrait size, the lead paragraph and a
        "Read more" — so the page says what it means, which is that these are
        five members of one household.
      */}
      <section className="border-y border-border bg-cotton-100 section-y dark:bg-card" aria-labelledby="family-heading">
        <div className="container">
          <RevealOnScroll className="max-w-2xl">
            <p className="eyebrow">Five people</p>
            <h2 id="family-heading" className="mt-4 text-display-lg">
              The family
            </h2>
            <p className="mt-5 text-body-lg text-muted-foreground">
              What follows is only what is known and can be stood behind. Where the public
              record establishes something, it is stated. Where it does not, the page stays
              with the craft rather than inventing a life.
            </p>
          </RevealOnScroll>

          <ul className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
            {family.map((member, i) => (
              <li key={member.id} className="flex">
                <RevealOnScroll delay={Math.min(i, 4) * 0.06} className="flex w-full">
                  <article className="flex w-full flex-col">
                    {/* One size, every person. `w-full` inside an equal grid
                        cell with a fixed ratio is what makes that true, rather
                        than five max-widths that happen to agree. */}
                    <StoryPortrait
                      src={member.image}
                      alt={`${member.name}, ${member.role}, at the store in ${site.location.town}`}
                      accentRing={member.accent.ring}
                      className="w-full [&>button]:max-w-none"
                    />

                    <div className="mt-5 flex flex-1 flex-col">
                      <div className="flex items-center gap-2.5">
                        <span
                          aria-hidden="true"
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${member.accent.bg}`}
                        />
                        <h3 className="font-display text-display-sm leading-tight">
                          {member.name}
                        </h3>
                      </div>
                      <p
                        className={`mt-1.5 text-xs uppercase tracking-[0.12em] ${member.accent.text}`}
                      >
                        {member.role}
                      </p>

                      {member.honours && (
                        <ul className="mt-3.5 flex flex-wrap gap-2">
                          {member.honours.map((honour) => (
                            <li key={honour}>
                              <Badge variant="gold">{honour}</Badge>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/*
                        The lead paragraph, then everything else behind one
                        control. "Read more", not "Know more" — this is a
                        person, and the label should sound like it.

                        Top-aligned, deliberately. `mt-auto` here pushed the
                        whole block — lead included — to the bottom of its cell,
                        so five biographies of five different lengths started at
                        five different heights and the row read as ragged. The
                        buttons no longer line up; the paragraphs do, and the
                        paragraphs are what somebody is reading.
                      */}
                      <KnowMore
                        label="Read more"
                        closeLabel="Show less"
                        lead={
                          <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
                            {member.body[0]}
                          </p>
                        }
                        panelClassName="mt-4 flex flex-col gap-4"
                      >
                        {[...member.body.slice(1), ...(member.more ?? [])].map((para, j) => (
                          <p
                            key={j}
                            className="text-[0.9375rem] leading-relaxed text-muted-foreground"
                          >
                            {para}
                          </p>
                        ))}

                        {member.quote && (
                          <blockquote
                            className={`border-l-2 pl-4 ${member.accent.text
                              .split(' ')[0]
                              .replace('text-', 'border-')}`}
                          >
                            <p className="font-display text-lg italic leading-snug">
                              &ldquo;{member.quote.text}&rdquo;
                            </p>
                            <footer className="mt-2 text-sm text-muted-foreground">
                              &mdash; {member.quote.attribution}
                            </footer>
                          </blockquote>
                        )}
                      </KnowMore>
                    </div>
                  </article>
                </RevealOnScroll>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Full-bleed: the cloth on the roof                                   */}
      {/* ------------------------------------------------------------------ */}
      {/*
        One picture, edge to edge, and the only thing on the page that breaks
        the container.

        It earns the break by being the page's title image made literal — the
        heading at the top is "a house where the cloth dries on the roof", and
        this is a full-width band of exactly that, standing between the people
        and the work they do. It is also a rest: the sections either side are
        both dense with type, and a reader who has just come through five
        biographies needs somewhere to put their eyes down.

        No heading over it and no button in it. A full-bleed image with a call
        to action on top is an advertisement; this is a photograph, and the one
        line on it is a caption.

        Fixed heights rather than an aspect ratio, for the same reason as the
        visit banner: a wide ratio is a letterbox on a phone and a wall on a
        desktop. The parallax layer owns `transform`, so nothing inside it may
        animate `transform` as well.
      */}
      <section className="relative isolate h-[22rem] overflow-hidden bg-kasim-900 md:h-[30rem] lg:h-[34rem]">
        <Parallax speed={0.06} className="absolute -inset-y-16 inset-x-0 -z-10">
          <Image
            src="/images/store/store-wide.jpg"
            alt="Lengths of painted cloth drying in the sun on the roof of the store in Srikalahasti."
            fill
            sizes="100vw"
            className="object-cover"
          />
        </Parallax>

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-kasim-950/85 via-transparent to-kasim-950/30"
        />

        <div className="container flex h-full flex-col justify-end pb-8 md:pb-10">
          <p className="max-w-xl text-body-lg leading-relaxed text-cotton-100/90">
            Between stages, every piece goes up onto the roof. A saree crosses this
            distance twenty times before it is finished — which is why a wet week stops
            the colour work completely, and why nothing here can be hurried.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3 · How we tell the story                                           */}
      {/* ------------------------------------------------------------------ */}
      {/*
        The section the page did not have.

        It explained who the family are and what the craft is, and never
        explained what they actually do all day — which is tell stories on
        cloth. Every piece in the store is a narrative composition built to
        rules this section states, and the hand-against-printed evidence
        underneath is the same argument continued: here is how we compose it,
        and here is how you can see it was composed by a hand.
      */}
      <section className="section-y" aria-labelledby="storytelling-heading">
        <div className="container">
          <RevealOnScroll className="max-w-2xl">
            <p className="eyebrow">The subject, not the surface</p>
            <h2 id="storytelling-heading" className="mt-4 text-display-lg leading-tight">
              How we tell the story
            </h2>
            <p className="mt-5 text-body-lg text-muted-foreground">
              Kalamkari from this town is narrative art before it is textile. The cloth was
              a storyteller&rsquo;s instrument, and every rule below is a solution to that
              job rather than a stylistic choice made later.
            </p>
          </RevealOnScroll>

          <ol className="mt-10 grid gap-x-10 gap-y-8 md:mt-14 md:grid-cols-2 lg:grid-cols-3">
            {storyMethod.map((method, i) => (
              <li key={method.id}>
                <RevealOnScroll delay={Math.min(i, 4) * 0.06}>
                  <div className="group flex h-full flex-col border-t border-border pt-6">
                    <div className="flex items-baseline gap-3.5">
                      <span
                        aria-hidden="true"
                        className="tabular font-inscription text-sm text-primary/70"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        aria-hidden="true"
                        className="ml-auto block h-px w-0 bg-primary/50 transition-[width] duration-700 ease-out motion-safe:group-hover:w-12"
                      />
                    </div>
                    <h3 className="mt-3 font-display text-display-sm leading-snug">
                      {method.title}
                    </h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">{method.body}</p>
                  </div>
                </RevealOnScroll>
              </li>
            ))}
          </ol>

          <RevealOnScroll delay={0.08}>
            <div className="mt-12 flex flex-col gap-4 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl leading-relaxed text-muted-foreground">
                The four narrative traditions are drawn to order. The same composition is
                never painted twice, so a piece of your own is a commission rather than a
                restock.
              </p>
              <Button asChild size="lg" variant="outline" className="shrink-0">
                <Link href="/custom">
                  Start a commission
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* How the work is divided                                             */}
      {/* ------------------------------------------------------------------ */}
      {/*
        The workshop as an organisation, not as a craft.

        Everything above this point describes what is done to the cloth. This
        describes who does which part of it, and where the raw material is
        bought — the questions a visitor cannot answer from a photograph of a
        finished piece, and the ones that make the price legible. It comes from
        the store's own brochure; see the note above `workshopNotes`.

        Placed after the narrative method and before the hand-versus-printed
        evidence, because it is the bridge between them: it explains why the
        drawing is the expensive part, which is exactly what the evidence
        section then shows you how to look for.
      */}
      <section
        className="border-y border-border bg-cotton-100 section-y dark:bg-card"
        aria-labelledby="division-heading"
      >
        <div className="container">
          <RevealOnScroll className="max-w-2xl">
            <p className="eyebrow">Inside the house</p>
            <h2 id="division-heading" className="mt-4 text-display-lg leading-tight">
              Who does which part of it
            </h2>
            <p className="mt-5 text-body-lg text-muted-foreground">
              A piece is not made by one person start to finish. The drawing and the filling
              are different skills, done by different hands, and knowing which is which is
              most of what tells you where the months went.
            </p>
          </RevealOnScroll>

          <ul className="mt-10 grid gap-x-12 gap-y-9 md:mt-12 md:grid-cols-2">
            {workshopNotes.map((note, i) => (
              <li key={note.id}>
                <RevealOnScroll delay={Math.min(i, 3) * 0.06}>
                  <div className="group flex h-full flex-col border-t border-border pt-6">
                    <div className="flex items-baseline gap-3.5">
                      <span
                        aria-hidden="true"
                        className="tabular font-inscription text-sm text-primary/70"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {/* Costs no height at rest — the rule grows from nothing,
                          the same mark the method cards above use. */}
                      <span
                        aria-hidden="true"
                        className="ml-auto block h-px w-0 bg-primary/50 transition-[width] duration-700 ease-out motion-safe:group-hover:w-12"
                      />
                    </div>
                    <h3 className="mt-3 font-display text-display-sm leading-snug">
                      {note.title}
                    </h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">{note.body}</p>
                  </div>
                </RevealOnScroll>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How to tell one from the other, with evidence. */}
      <HandVsPrinted evidence={evidence} />

      {/* ------------------------------------------------------------------ */}
      {/* 4 · Best works                                                      */}
      {/* ------------------------------------------------------------------ */}
      {/*
        Read from the database, not written down.

        The store's own `masterpiece` flag decides what appears here — the same
        flag that drives the Premium collection — so this section is correct on
        the day a new piece is signed and on the day an old one sells, without
        anybody editing a content file. Sold pieces stay: this is the argument
        that the workshop can do this, and a Ramayana pallu that went last
        spring is evidence in exactly the way one still in stock is.
      */}
      {bestWorks.length > 0 && (
        <section
          className="border-y border-border bg-cotton-100 section-y dark:bg-card"
          aria-labelledby="best-works-heading"
        >
          <div className="container">
            <RevealOnScroll>
              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                <div className="max-w-2xl">
                  <p className="eyebrow">Signed and exhibition grade</p>
                  <h2 id="best-works-heading" className="mt-4 text-display-lg leading-tight">
                    Best works
                  </h2>
                  <p className="mt-5 text-body-lg text-muted-foreground">
                    The pieces that took a month of somebody&rsquo;s undivided attention —
                    narrative pallus, dense jaal, the finest line this workshop draws. Some
                    have sold. They are here because of what they show, not because they are
                    for sale.
                  </p>
                </div>

                <Link
                  href="/collections/premium"
                  className="inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  The whole premium collection
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </RevealOnScroll>

            <ul className="mt-9 grid grid-cols-2 gap-x-4 gap-y-8 md:mt-12 md:grid-cols-3 md:gap-x-6">
              {bestWorks.map((product, i) => (
                <li key={product.id} className="flex">
                  <RevealOnScroll delay={Math.min(i, 5) * 0.05} className="flex w-full">
                    <ProductCard
                      product={product}
                      wishlisted={wishlistIds.has(product.id)}
                      className="w-full"
                      sizes="(min-width: 768px) 30vw, 45vw"
                    />
                  </RevealOnScroll>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 5 · Awards                                                          */}
      {/* ------------------------------------------------------------------ */}
      <AwardsWall />
    </>
  );
}
