import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowRight, MapPin } from 'lucide-react';
import { HeroScene } from '@/components/three/hero-scene';
import { WelcomeNote } from '@/components/home/welcome-note';
import { HeroBanner } from '@/components/home/hero-banner';
import { CollectionCards } from '@/components/home/collection-cards';
import { HowItsMade } from '@/components/craft/how-its-made';
import { TwoCrafts } from '@/components/home/two-crafts';
import { TrustStrip } from '@/components/layout/trust-strip';
import { ProductCard } from '@/components/shop/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/primitives';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { getFeaturedProducts, getCategories } from '@/lib/queries';
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
    label: 'Featured',
    title: 'Featured Sarees',
    blurb:
      'What the family would put in your hands first this week — chosen for the drawing, not the margin.',
    href: '/collections/featured-sarees',
    image: '/images/products/hero-sarees.jpg',
  },
  {
    label: 'Premium',
    title: 'Premium',
    blurb:
      'Signed and exhibition-grade work. Narrative pallus, dense jaal, the hardest drawing this workshop does.',
    href: '/collections/premium',
    image: '/images/products/hero-paintings.jpg',
  },
  {
    label: 'Custom',
    title: 'Custom Items',
    blurb:
      'Tell us the subject, the cloth and the occasion. Nothing here is printed, so nothing has to be chosen from a catalogue.',
    href: '/custom',
    image: '/images/products/hero-dupattas.jpg',
    accent: true,
  },
];

export default async function HomePage() {
  const [featured, categories, wishlistIds] = await Promise.all([
    getFeaturedProducts(6),
    getCategories(),
    getWishlistIds(),
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
          Scrim.

          The old one was a flat black wash at three opacities, which read as
          grey over every dye behind it and flattened the whole hero. This is
          built from the pots instead: indigo at the top where the cloth is
          still pale, catechu through the middle, and a deep madder-into-kasim
          at the foot. It still holds the text at AA over the full sweep — the
          alpha is unchanged — but the hero now sits in a colour rather than
          under a shadow.
        */}
        <div
          className="absolute inset-0 -z-10"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(to bottom,' +
              'rgb(27 41 66 / 0.62) 0%,' +
              'rgb(70 48 34 / 0.42) 34%,' +
              'rgb(69 24 19 / 0.46) 62%,' +
              'rgb(20 19 18 / 0.80) 100%)',
          }}
        />

        <div className="container relative py-14 md:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)] lg:gap-16">
            <div className="max-w-2xl">
              <p className="eyebrow text-cotton-200/90">
                {site.location.town} · {site.location.district} · {site.location.state}
              </p>

              <h1 className="mt-5 text-display-xl text-cotton-50">
                Every line drawn by hand.
                <span className="block text-myrobalan-300">Every colour from the earth.</span>
              </h1>

              <p className="mt-6 max-w-xl text-body-lg text-cotton-100/90">
                We are a family store painting Srikalahasti Kalamkari the way it has always
                been done — with a bamboo pen, on cloth prepared with myrobalan and buffalo
                milk, in colours fermented and boiled from iron, madder root and indigo.
                Twenty-three steps. Nothing synthetic at any of them.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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
              </div>
            </div>

            <HeroBanner className="mx-auto w-full max-w-sm lg:max-w-none" slides={bannerSlides} />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* The distinction that matters most, stated immediately               */}
      {/* ------------------------------------------------------------------ */}
      <TwoCrafts />

      {/* ------------------------------------------------------------------ */}
      {/* Categories                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-11 md:py-16">
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
            The collage. Two columns at every width, three from `lg`, with the
            two narrative-led categories taking the wide cells — so the same
            wide/narrow/narrow rhythm survives on a phone. Letting this fall to
            a single column would turn a composition into a list, which is
            precisely the thing worth keeping.
          */}
          <ul className="mt-7 grid grid-cols-2 gap-2.5 md:mt-9 md:gap-4 lg:grid-cols-3">
            {categories.map((category, i) => (
              <li
                key={category.id}
                className={i === 0 || i === 3 ? 'col-span-2' : ''}
              >
                <RevealOnScroll delay={i * 0.05}>
                  <Link
                    href={`/shop/${category.slug}`}
                    className="group relative flex h-full min-h-[8.5rem] flex-col justify-end overflow-hidden rounded-sm bg-kasim-800 p-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-[13rem] sm:p-5 md:min-h-[15rem] md:p-6"
                  >
                    <Image
                      src={category.heroImage}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 40vw, 50vw"
                      className="object-cover opacity-70 transition-transform duration-700 ease-out motion-safe:group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-kasim-950/85 via-kasim-950/30 to-transparent"
                      aria-hidden="true"
                    />
                    <div className="relative">
                      <h3 className="font-display text-base leading-tight text-cotton-50 sm:text-xl md:text-2xl">
                        {category.name}
                        {category.teluguName && (
                          <span className="ml-2 font-telugu text-[0.6875rem] text-cotton-200/70 sm:text-sm md:text-base">
                            {category.teluguName}
                          </span>
                        )}
                      </h3>
                      <p className="mt-1 line-clamp-2 max-w-md text-[0.6875rem] leading-snug text-cotton-100/80 sm:mt-1.5 sm:text-xs md:text-sm">
                        {category.tagline}
                      </p>
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
      <section className="py-12 md:py-20">
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
      {/* Featured pieces                                                     */}
      {/* ------------------------------------------------------------------ */}
      {featured.length > 0 && (
        <section className="border-y border-border bg-cotton-100 py-16 md:py-24 dark:bg-card">
          <div className="container">
            <RevealOnScroll>
              <p className="eyebrow">In the store now</p>
              <h2 className="mt-3 max-w-2xl text-display-md">
                Finished pieces, ready to send
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground">
                Each of these is the only one of itself. When it goes, it is gone — the
                same drawing is never made twice.
              </p>
            </RevealOnScroll>

            <ul className="mt-10 grid grid-cols-3 gap-x-2.5 gap-y-6 sm:gap-x-4 sm:gap-y-9 md:gap-x-6">
              {featured.map((product) => (
                <li key={product.id} className="flex">
                  <ProductCard
                    product={product}
                    wishlisted={wishlistIds.has(product.id)}
                    density="compact"
                    className="w-full"
                    sizes="(min-width: 768px) 30vw, 31vw"
                  />
                </li>
              ))}
            </ul>

            <div className="mt-12 flex justify-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/shop">
                  See everything in the store
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* What you are actually buying, and where each claim is set out. */}
      <TrustStrip />

      {/* ------------------------------------------------------------------ */}
      {/* The process, as an invitation                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-kasim-900 py-20 text-cotton-100 md:py-28">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <RevealOnScroll>
              <p className="eyebrow text-cotton-200/60">The making</p>
              <h2 className="mt-4 text-display-lg text-cotton-50">
                Twenty-three steps, and the colour arrives at step sixteen.
              </h2>
              <p className="mt-6 text-body-lg text-cotton-100/80">
                The strangest part of this craft is that the artist never touches a red
                pigment. They paint with a clear solution of alum onto cream cloth, and
                days later the whole thing goes into a boiling bath of madder root — where
                the colour binds only where the alum went, and washes out everywhere else.
              </p>
              <p className="mt-4 leading-relaxed text-cotton-100/65">
                We have built the full sequence as something you can move through, step by
                step, and watch happen.
              </p>
              <Button asChild size="lg" variant="outline" className="mt-8 border-cotton-100/40 text-cotton-50 hover:bg-cotton-50/10">
                <Link href="/process">
                  Walk through all 23 steps
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </RevealOnScroll>

            <RevealOnScroll delay={0.12}>
              <ol className="grid gap-px overflow-hidden rounded-sm bg-cotton-100/10">
                {[
                  { n: '04', t: 'Myrobalan and buffalo milk', d: 'The tannin that will later turn iron black soaks into every fibre.' },
                  { n: '10', t: 'Fermenting the iron liquor', d: 'Rusted iron and jaggery, sealed in an earthen pot for 21 days.' },
                  { n: '13', t: 'Painting with alum', d: 'The reds are laid down as a clear liquid you cannot see.' },
                  { n: '16', t: 'The madder bath', d: 'One boiling pot. Pink through maroon, decided days earlier by hand.' },
                  { n: '22', t: 'Washing and sunning', d: 'Up to twenty cycles, most of them to remove colour, not add it.' },
                ].map((step) => (
                  <li key={step.n} className="flex gap-5 bg-kasim-900 px-1 py-4">
                    <span className="tabular font-display text-2xl text-myrobalan-400/80">
                      {step.n}
                    </span>
                    <span>
                      <span className="block font-medium text-cotton-50">{step.t}</span>
                      <span className="mt-0.5 block text-sm text-cotton-100/60">{step.d}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* The family                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20">
            <RevealOnScroll>
              <div className="relative mx-auto aspect-[4/5] w-[62%] overflow-hidden rounded-sm bg-cotton-300 sm:w-[48%] lg:mx-0 lg:w-full">
                <Image
                  src={master.image}
                  alt={`${master.name} at work in the store in ${site.location.town}`}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
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
      {/* Visit                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-border bg-cotton-100 py-16 md:py-20 dark:bg-card">
        <div className="container">
          <RevealOnScroll className="mx-auto max-w-2xl text-center">
            <MapPin className="mx-auto h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-display-md">Come and see it being made</h2>
            <p className="mt-4 text-body-lg text-muted-foreground">
              The store is a working home in {site.location.town}, a short walk from the
              Swarnamukhi where the cloth is washed. {site.hours.note}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/contact">Plan a visit</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={site.location.mapsUrl} target="_blank" rel="noopener noreferrer">
                  Open in Google Maps
                </a>
              </Button>
            </div>
          </RevealOnScroll>
        </div>
      </section>

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
