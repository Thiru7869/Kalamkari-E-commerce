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
import { family, storyChapters } from '@/content/family';
import { site } from '@/content/site';

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

export default function OurStoryPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-kasim-900 pb-20 pt-24 text-cotton-100 md:pb-28 md:pt-32">
        <Image
          src="/images/store/store-wide.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="container relative">
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-end lg:gap-12">
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

            {/* Set to the right and kept modest — background to the section
                rather than the subject of it. Nothing autoplays. */}
            <WorkshopVideo poster="/images/store/store-wide.jpg" className="mt-10 lg:mt-0" />
          </div>
        </div>
      </section>

      {/*
        The town, the distinction, and the stakes.

        Each chapter shows its lead and hides the rest behind a disclosure, so
        the page opens at a readable length and the depth is one click away for
        whoever wants it. The section height does not change when it opens
        because nothing above it moves.
      */}
      {storyChapters.map((chapter, i) => (
        <section
          key={chapter.id}
          className={
            i % 2 === 1
              ? 'border-y border-border bg-cotton-100 py-14 md:py-20 dark:bg-card'
              : 'py-14 md:py-20'
          }
        >
          <div className="container">
            <RevealOnScroll className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
              <div>
                <p className="eyebrow">{chapter.eyebrow}</p>
                <h2 className="mt-4 text-display-md leading-tight">{chapter.title}</h2>
              </div>

              <KnowMore
                lead={<p className="text-body-lg leading-relaxed">{chapter.lead}</p>}
                panelClassName="flex flex-col gap-4 border-l-2 border-border pl-5"
              >
                {chapter.body.map((para, j) => (
                  <p key={j} className="leading-relaxed text-muted-foreground">
                    {para}
                  </p>
                ))}
              </KnowMore>
            </RevealOnScroll>
          </div>
        </section>
      ))}

      {/* The family. */}
      <section className="py-14 md:py-20">
        <div className="container">
          <RevealOnScroll className="max-w-2xl">
            <p className="eyebrow">Five people</p>
            <h2 className="mt-4 text-display-lg">The family</h2>
            <p className="mt-5 text-body-lg text-muted-foreground">
              What follows is only what is known and can be stood behind. Where the public
              record establishes something, it is stated. Where it does not, the page stays
              with the craft rather than inventing a life.
            </p>
          </RevealOnScroll>

          <div className="mt-12 flex flex-col gap-14 md:mt-16 md:gap-20">
            {family.map((member, i) => (
              <RevealOnScroll key={member.id} delay={Math.min(i, 4) * 0.06}>
                <article
                  className={`grid gap-7 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)] lg:gap-12 ${
                    i % 2 === 1 ? 'lg:[&>figure]:order-2' : ''
                  }`}
                >
                  {/* Smaller than before, and it opens. Cloth and a face both
                      need size to read, and the page cannot give both. */}
                  <StoryPortrait
                    src={member.image}
                    alt={`${member.name}, ${member.role}, at the store in ${site.location.town}`}
                    accentRing={member.accent.ring}
                  />

                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${member.accent.bg}`}
                      />
                      <h3 className="text-display-sm">{member.name}</h3>
                    </div>
                    <p
                      className={`mt-1.5 text-sm uppercase tracking-[0.12em] ${member.accent.text}`}
                    >
                      {member.role}
                    </p>

                    {member.honours && (
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {member.honours.map((honour) => (
                          <li key={honour}>
                            <Badge variant="gold">{honour}</Badge>
                          </li>
                        ))}
                      </ul>
                    )}

                    <KnowMore
                      lead={
                        <p className="mt-5 leading-relaxed text-muted-foreground">
                          {member.body[0]}
                        </p>
                      }
                      panelClassName="flex flex-col gap-4"
                    >
                      {[...member.body.slice(1), ...(member.more ?? [])].map((para, j) => (
                        <p key={j} className="leading-relaxed text-muted-foreground">
                          {para}
                        </p>
                      ))}
                    </KnowMore>

                    {member.quote && (
                      <blockquote
                        className={`mt-7 border-l-2 pl-5 ${member.accent.text.split(' ')[0].replace('text-', 'border-')}`}
                      >
                        <p className="font-display text-xl leading-snug">
                          &ldquo;{member.quote.text}&rdquo;
                        </p>
                        <footer className="mt-2 text-sm text-muted-foreground">
                          &mdash; {member.quote.attribution}
                        </footer>
                      </blockquote>
                    )}
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* How to tell one from the other, with evidence. */}
      <HandVsPrinted evidence={evidence} />

      {/* Recognition. */}
      <AwardsWall />

      <section className="border-t border-border bg-cotton-100 py-16 md:py-20 dark:bg-card">
        <div className="container">
          <RevealOnScroll className="mx-auto max-w-2xl text-center">
            <h2 className="text-display-md">See the work itself</h2>
            <p className="mt-4 text-body-lg text-muted-foreground">
              The story is the reason for the price. The pieces are the reason for the story.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/shop">
                  Browse the store
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/process">Walk through the 23 steps</Link>
              </Button>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
