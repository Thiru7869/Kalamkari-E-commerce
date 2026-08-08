import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/primitives';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { family, storyChapters } from '@/content/family';
import { site } from '@/content/site';

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
          <p className="eyebrow text-cotton-200/70">
            {site.location.town} · {site.location.state}
          </p>
          <h1 className="mt-5 max-w-3xl text-display-xl text-cotton-50">
            A house where the cloth dries on the roof
          </h1>
          <p className="mt-7 max-w-2xl text-body-lg text-cotton-100/85">
            This is not a workshop that people commute to. It is a home with pots of dye in
            the yard, work laid out on the floor of whichever room has the best light, and
            five people who learned to hold a bamboo pen before they learned anything else.
          </p>
        </div>
      </section>

      {/* Chapters about the town and the craft. */}
      {storyChapters.map((chapter, i) => (
        <section
          key={chapter.id}
          className={
            i % 2 === 1
              ? 'border-y border-border bg-cotton-100 py-16 md:py-24 dark:bg-card'
              : 'py-16 md:py-24'
          }
        >
          <div className="container">
            <RevealOnScroll className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
              <div>
                <p className="eyebrow">{chapter.eyebrow}</p>
                <h2 className="mt-4 text-display-md leading-tight">{chapter.title}</h2>
              </div>
              <div className="flex flex-col gap-5">
                {chapter.body.map((para, j) => (
                  <p
                    key={j}
                    className={
                      j === 0
                        ? 'text-body-lg leading-relaxed'
                        : 'leading-relaxed text-muted-foreground'
                    }
                  >
                    {para}
                  </p>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </section>
      ))}

      {/* The family. */}
      <section className="py-16 md:py-24">
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

          <div className="mt-14 flex flex-col gap-16 md:gap-24">
            {family.map((member, i) => (
              <RevealOnScroll key={member.id} delay={Math.min(i, 4) * 0.07}>
                <article
                  className={`grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14 ${
                    i % 2 === 1 ? 'lg:[&>figure]:order-2' : ''
                  }`}
                >
                  <figure className="m-0">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-cotton-300">
                      <Image
                        src={member.image}
                        alt={`${member.name}, ${member.role}, at the store in ${site.location.town}`}
                        fill
                        sizes="(min-width: 1024px) 32vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  </figure>

                  <div className="flex flex-col justify-center">
                    <h3 className="text-display-sm">{member.name}</h3>
                    <p className="mt-1.5 text-sm uppercase tracking-[0.12em] text-primary">
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

                    <div className="mt-5 flex flex-col gap-4">
                      {member.body.map((para, j) => (
                        <p key={j} className="leading-relaxed text-muted-foreground">
                          {para}
                        </p>
                      ))}
                    </div>

                    {member.quote && (
                      <blockquote className="mt-7 border-l-2 border-primary pl-5">
                        <p className="font-display text-xl leading-snug">
                          “{member.quote.text}”
                        </p>
                        <footer className="mt-2 text-sm text-muted-foreground">
                          — {member.quote.attribution}
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
