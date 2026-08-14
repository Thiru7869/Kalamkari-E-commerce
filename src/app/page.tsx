import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { HeroScene } from '@/components/three/hero-scene';
import { WelcomeNote } from '@/components/home/welcome-note';
import { HeroBanner } from '@/components/home/hero-banner';
import { CollectionCards } from '@/components/home/collection-cards';
import { WhatIsKalamkari } from '@/components/home/what-is-kalamkari';
import { HowItsMade } from '@/components/craft/how-its-made';
import { TwoCrafts } from '@/components/home/two-crafts';
import { QuickStore } from '@/components/home/quick-store';
import { ArrivalQuestions } from '@/components/home/arrival-questions';
import { WorkshopInvitation } from '@/components/home/workshop-invitation';
import { TrustStrip } from '@/components/layout/trust-strip';
import { BestWorks } from '@/components/home/best-works';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/primitives';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { Parallax } from '@/components/motion/parallax';
import { Entrance } from '@/components/motion/entrance';
import { getQuickStore, getCategories, getBestWorks } from '@/lib/queries';
import { getWishlistIds } from '@/lib/cart';
import { site } from '@/content/site';
import { family } from '@/content/family';
import { absoluteUrl } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Hand-painted Kalamkari from Srikalahasti — natural dyes only',
  description: site.description,
  alternates: { canonical: '/' },
};

export const revalidate = 300;

/**
 * The hero banner's four frames. Deliberately one per discipline rather than
 * four sarees — the first thing a visitor should learn is the range of what a
 * bamboo pen is used for here.
 */
const bannerSlides = [
  {
    src: '/images/products/hero-sarees.jpg',
    alt: 'A hand-painted Kalamkari saree with a narrative pallu in madder red and iron black.',
    label: 'Sarees',
    caption: 'Nine yards, drawn end to end. Six weeks of one person’s hand.',
    href: '/shop/sarees',
  },
  {
    src: '/images/products/hero-paintings.jpg',
    alt: 'A narrative Kalamkari panel showing an episode from the epics.',
    label: 'Paintings',
    caption: 'The old work: an episode, painted to be read across a room.',
    href: '/shop/paintings',
  },
  {
    src: '/images/products/hero-dupattas.jpg',
    alt: 'A Kalamkari dupatta in indigo and myrobalan gold.',
    label: 'Dupattas',
    caption: 'Indigo is the one colour that is dipped, never painted.',
    href: '/shop/dupattas',
  },
  {
    src: '/images/products/hero-home-decor.jpg',
    alt: 'Kalamkari cushion covers and a table runner in natural dyes.',
    label: 'For the home',
    caption: 'Cloth that gets used, washed, and softens into the house.',
    href: '/shop/home-decor',
  },
  {
    src: '/images/products/hero-blouses.jpg',
    alt: 'A painted Kalamkari blouse piece in silk cotton.',
    label: 'Blouse pieces',
    caption: 'A metre of cloth, and the densest filling this workshop does.',
    href: '/shop/blouses',
  },
  {
    src: '/images/store/store-wide.jpg',
    alt: 'The front room of the store in Srikalahasti, with cloth laid out on the floor.',
    label: 'The store',
    caption: 'A working home. Somebody is painting in it most days of the year.',
    href: '/contact',
  },
];

/** The three ways into the catalogue, shown under the eight stages. */
const collectionCards = [
  {
    title: 'Featured Sarees',
    blurb:
      'What the family would put in your hands first this week — chosen for the drawing, not the margin.',
    href: '/collections/featured-sarees',
    image: '/images/products/hero-sarees.jpg',
  },
  {
    title: 'Premium',
    blurb:
      'Signed and exhibition-grade work. Narrative pallus, dense jaal, the hardest drawing this workshop does.',
    href: '/collections/premium',
    image: '/images/products/hero-paintings.jpg',
  },
  {
    title: 'Custom Items',
    blurb:
      'Tell us the subject, the cloth and the occasion. Nothing here is printed, so nothing has to be chosen from a catalogue.',
    href: '/custom',
    image: '/images/products/hero-dupattas.jpg',
    accent: true,
  },
];

export default async function HomePage() {
  const [quickStore, categories, wishlistIds, bestWorksItems] = await Promise.all([
    getQuickStore(10),
    getCategories(),
    getWishlistIds(),
    getBestWorks(6),
  ]);

  const master = family.find((m) => m.id === 'viswanath-reddy')!;

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* The doorway, before anything is sold                                */}
      {/* ------------------------------------------------------------------ */}
      <WelcomeNote />

      {/* ------------------------------------------------------------------ */}
      {/* Hero — the claim, the 3D that demonstrates it, and four real pieces */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative isolate overflow-hidden">
        <HeroScene className="absolute inset-0 -z-10 h-full w-full" />

        {/*
          Scrim — three pots, and madder holds the middle.

          The previous sweep ran indigo → catechu → deep madder → black. It was
          honest and it was dull: catechu is a quiet bark brown, so the whole
          centre of the hero — which is where the headline, the claim and both
          buttons sit — was laid over the least saturated colour in the
          workshop, and the banner beside it did all the talking.

          This is the same idea with the dominant colour changed. Deep indigo
          at the head, where the cloth in the scene is still pale and a cool
          tone gives it depth; **chay-600 madder through the whole middle
          third**, which is the store's primary and the colour the site is
          actually about; a deeper chay under it; and kasim at the foot to sit
          the buttons on.

          The alpha at every stop is greater than or equal to the sweep it
          replaces (0.62 / 0.48 / 0.55 / 0.82 against 0.62 / 0.42 / 0.46 /
          0.80), so text contrast over the scene can only have improved. That
          is the constraint this layer exists under: it is a legibility device
          first and a colour second, and it is measured, not eyeballed.
        */}
        <div
          className="absolute inset-0 -z-10"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(to bottom,' +
              'rgb(35 53 83 / 0.62) 0%,' + // indigo-700
              'rgb(142 47 34 / 0.48) 36%,' + // chay-600 — the dominant band
              'rgb(91 30 23 / 0.55) 66%,' + // chay-800
              'rgb(20 19 18 / 0.82) 100%)', // kasim-950
          }}
        />

        {/*
          The third pot: myrobalan gold, as a bloom rather than a band.

          Gold is this site's one *pointing* colour and is deliberately kept
          out of the 60-30-10 body of the page, so it cannot be a stop in the
          gradient above without becoming decoration. As a soft radial behind
          the banner column it does the one thing the old hero was missing —
          it puts a warm light source in the frame, so the madder reads as lit
          cloth rather than as a flat wash.

          Placed at 78% across, which is the banner's column on a wide screen
          and empty ground on a narrow one. It never sits behind the headline,
          so it cannot lift the ground under the text and cost contrast.
        */}
        <div
          className="absolute inset-0 -z-10"
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(58% 46% at 78% 16%, rgb(212 163 55 / 0.20) 0%, ' +
              'rgb(212 163 55 / 0.07) 45%, transparent 72%)',
          }}
        />

        <div className="container relative section-y">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)] lg:gap-16">
            <div className="max-w-2xl">
              {/* The district is dropped below `sm`. Three place-names in
                  tracked capitals wrap to two lines on every phone, and a
                  two-line eyebrow reads as a caption rather than as the label
                  above a headline. Town and state locate the store on their
                  own; the district is the token a reader can most afford to
                  lose. */}
              {/*
                The hero arrives in four beats. The headline is `step={0}` and
                therefore has no delay at all — it is the LCP element on this
                page, and an element still at `opacity: 0` is not eligible to
                be the largest contentful paint. The eyebrow leads visually but
                costs nothing to hold back, so it takes the later step instead.
              */}
              <Entrance as="p" step={1} className="eyebrow text-cotton-200/90">
                {site.location.town}
                <span className="hidden sm:inline"> · {site.location.district}</span> ·{' '}
                {site.location.state}
              </Entrance>

              <Entrance as="h1" className="mt-5 text-display-xl text-cotton-50">
                Every line drawn by hand.
                <span className="block text-myrobalan-300">Every colour from the earth.</span>
              </Entrance>

              <Entrance as="p" step={2} className="mt-6 max-w-xl text-body-lg text-cotton-100/90">
                We are a family store painting Srikalahasti Kalamkari the way it has always
                been done — with a bamboo pen, on cloth prepared with myrobalan and buffalo
                milk, in colours fermented and boiled from iron, madder root and indigo.
                Twenty-three steps. Nothing synthetic at any of them.
              </Entrance>

              <Entrance step={3} className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/shop">
                    See what is in the store
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-cotton-100/45 bg-cotton-50/5 text-cotton-50 hover:bg-cotton-50/15"
                >
                  <Link href="/process">Watch how it is made</Link>
                </Button>
              </Entrance>
            </div>

            {/*
              Capped, not fluid.

              At `lg:max-w-none` this filled its 0.85fr column, which on a wide
              laptop is ~480px — and at `aspect-[5/5.6]` that is a 540px-tall
              photograph before its caption and rail. Together with the headline
              beside it the hero ran past 900px, so the paragraph carrying the
              actual claim of the site sat below the fold on the most common
              laptop screen there is. A hero the reader has to scroll to finish
              reading is a slide, not a hero.
            */}
            <Entrance step={4}>
              <HeroBanner
                className="mx-auto w-full max-w-[19rem] sm:max-w-sm lg:max-w-[24rem] xl:max-w-[26rem]"
                slides={bannerSlides}
              />
            </Entrance>
          </div>

          {/*
            The scroll cue.

            One line and one word, and it is doing a real job rather than
            decorating the fold: this page now runs to eleven sections, and the
            hero ends on a photograph that looks like a natural stopping place.
            The rule below draws downward on a slow loop, which is the smallest
            possible statement that there is more underneath.

            Desktop only. On a phone the hero is already taller than the
            viewport and the next section's heading is visible at the fold, so
            a cue there would be pointing at something the reader can see.

            `aria-hidden` — it is an instruction to a mouse, and a screen
            reader user is already at the next heading.
          */}
          <div
            className="pointer-events-none mt-14 hidden justify-center lg:flex"
            aria-hidden="true"
          >
            <span className="flex flex-col items-center gap-2.5">
              <span className="font-inscription text-[0.625rem] uppercase tracking-[0.22em] text-cotton-200/60">
                Twenty-three steps below
              </span>
              <span className="relative block h-10 w-px overflow-hidden bg-cotton-100/15">
                <span className="motion-safe:animate-scroll-hint absolute inset-x-0 top-0 block h-4 bg-myrobalan-300/85" />
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* What the word actually means — before anything is argued about it   */}
      {/* ------------------------------------------------------------------ */}
      {/*
        Placed second, and it is the biggest structural change on this page.

        Everything below — the pots, the eight stages, the price of a saree,
        the whole "two crafts, one name" argument — assumes the reader already
        knows that Kalamkari can mean two different things. Most arrive here
        from a marketplace listing selling printed polyester under the word and
        do not know that. The distinction used to be made first, by TwoCrafts,
        which is a section that says "this is not the other one" to somebody
        who has not yet been told there is another one.

        So the definition comes first and the distinction second. TwoCrafts is
        unchanged and still does the harder half of the job.
      */}
      <WhatIsKalamkari />

      {/* ------------------------------------------------------------------ */}
      {/* The distinction that matters most                                   */}
      {/* ------------------------------------------------------------------ */}
      <TwoCrafts />

      {/* ------------------------------------------------------------------ */}
      {/* Categories                                                          */}
      {/* ------------------------------------------------------------------ */}
      {/* `data-tour-section` — where the quick tour travels for its first stop.
          The ring stays on the "Shop" link in the header; the page comes here,
          which is what that link actually leads to. See the note on `section`
          in src/content/welcome.ts. */}
      <section className="section-y" data-tour-section="shop">
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
          <ul className="mt-7 grid grid-cols-2 gap-2.5 md:mt-9 md:gap-4 lg:grid-cols-3">
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
                      className="object-cover opacity-70 transition-transform duration-[900ms] ease-out motion-safe:group-hover:scale-[1.06]"
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
      {/* Eight stages of one cloth — the interactive centrepiece             */}
      {/* ------------------------------------------------------------------ */}
      <HowItsMade />

      {/* ------------------------------------------------------------------ */}
      {/* Three ways in: Featured, Premium, Custom                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="section-y" data-tour-section="custom">
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

          <RevealOnScroll delay={0.08} className="mt-7 md:mt-10">
            <CollectionCards cards={collectionCards} />
          </RevealOnScroll>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* The quick store — ten pieces, chosen to be unlike each other        */}
      {/* ------------------------------------------------------------------ */}
      {/*
        This replaces a six-card "featured" grid, and the change is in the
        selection rather than in the count. Featured ordering follows what came
        off the line most recently, and work comes off the line in runs — so
        the six were routinely four variations of one drawing on one cloth
        within a few thousand rupees of each other, which is the opposite of
        what a landing page needs to prove. `getQuickStore` spreads the ten
        across motif, cloth and price band; the section states the resulting
        range rather than asserting one.
      */}
      <QuickStore items={quickStore} wishlistIds={wishlistIds} />

      {/* What you are actually buying, and where each claim is set out. */}
      <TrustStrip />

      {/* ------------------------------------------------------------------ */}
      {/* The questions people actually arrive with                           */}
      {/* ------------------------------------------------------------------ */}
      {/*
        Where a shop page usually puts testimonials. It is not one, and the
        reasoning is at the top of `src/content/arrival.ts`: nobody has left a
        review on this site yet, and inventing five would be the least honest
        thing on a site whose whole argument is that its claims can be checked.

        Six real questions, answered from the same notes that back the
        assistant, does the same job by the better route — the doubt a
        testimonial is trying to talk somebody out of is the doubt this
        section simply answers.
      */}
      <ArrivalQuestions />

      {/* ------------------------------------------------------------------ */}
      {/* Best works — and the turn from selling to introducing               */}
      {/* ------------------------------------------------------------------ */}
      {/*
        This replaced `HeritageNumbers`, six counted figures on a dark ground.
        That component and the `heritageNumbers` list behind it have been
        deleted rather than left in the tree — every figure they carried is
        still stated on the page each one linked to, which is where it was
        defensible in the first place.

        Two reasons, and the second is the real one. The rhythm reason: the
        quick store and the trust strip above are both `bg-cotton-100`, so the
        page ran cream into cream and read as one block — this section is the
        paragraph break, and a rail whose ground changes colour with every
        piece breaks it harder than a fixed dark band did.

        The argument reason: "forty artisans in the cluster" is a fact about an
        industry, and a visitor who has just read eight sections about how the
        cloth is made is holding a simpler question — can these people actually
        draw? Six figures cannot answer it. One large plate of the hardest work
        the house does, with what it took beside it, answers it in a glance.

        The numbers were not deleted, only moved off the front: every one of
        them is still stated on the page it links to, which is where each was
        defensible in the first place.
      */}
      <BestWorks works={bestWorksItems} />

      {/*
        "The making" used to stand here: a second, darker restatement of the
        same argument the eight-stage section above already makes, ending in a
        second button to the same page. It was the largest piece of duplicated
        content on the landing page. Its one genuinely surprising fact — that
        the reds go down as a clear liquid — now sits under the eight stages,
        beside the single permanent route through to /process, and the five
        numbered steps it listed are the opening of that page rather than a
        preview of it.
      */}

      {/* ------------------------------------------------------------------ */}
      {/* The family                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="section-y-lg">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20">
            <RevealOnScroll>
              {/* Capped rather than filling its column. At `lg:w-full` this
                  portrait grew with the viewport until it was the tallest
                  thing on the page, and the biography beside it — which is
                  the point of the section — read as its caption. */}
              <div className="relative mx-auto aspect-[4/5] w-[62%] overflow-hidden rounded-sm bg-cotton-300 sm:w-[48%] lg:mx-0 lg:w-full lg:max-w-[21rem] xl:max-w-[24rem]">
                {/*
                  The portrait drifts inside its own frame as the section
                  passes — the one piece of real depth on this page, and the
                  right place for it, because a photograph moving against a
                  fixed mount is what a mounted photograph does when you walk
                  past it.

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

              <blockquote className="mt-7 border-l-2 border-primary pl-5">
                <p className="font-display text-xl leading-snug md:text-2xl">
                  “{master.quote!.text}”
                </p>
                <footer className="mt-3 text-sm text-muted-foreground">
                  — {master.quote!.attribution}, {master.role}
                </footer>
              </blockquote>

              <p className="mt-7 leading-relaxed text-muted-foreground">
                The store was founded by M Muni Reddy and M Rajeshwari, and takes its
                name from their daughter. Their three children — M Muniratnamma,
                P Vijaya Lakshmi and M Viswanath Reddy — all learned the craft the way it
                passes through Srikalahasti households: not as a course taken, but by
                sitting beside it from childhood.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                They work alongside roughly forty other artisans in the Srikalahasti
                cluster. This has always been a town-scale tradition, and the survival of
                any one workshop is bound up with the survival of the rest.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Badge variant="gold">National Award, 2008 · Pen Kalamkari</Badge>
                <Badge variant="outline">Registered GI craft</Badge>
              </div>

              <Link
                href="/our-story"
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Meet the family
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Come and see it being made                                          */}
      {/* ------------------------------------------------------------------ */}
      {/*
        What stood here was a centred heading, one sentence and two buttons on
        a cream band — about 260px of page doing the work of a link, in the
        last position before the footer, carrying the one offer that most
        separates this store from a marketplace listing. It now answers the
        three questions somebody actually has before travelling: what will I
        see, when is it open, and where exactly is it.
      */}
      <WorkshopInvitation />

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
    </>
  );
}
