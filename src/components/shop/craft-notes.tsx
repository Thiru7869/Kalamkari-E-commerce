import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { SectionHeader } from '@/components/layout/section-header';
import { mainStages, TOTAL_MAIN_STAGES } from '@/content/stages';
import { handVsPrinted } from '@/content/family';
import { totalSteps } from '@/content/process';
import { site } from '@/content/site';

/**
 * Two sections the type pages did not have, and both are the same argument.
 *
 * A type page told a visitor what a dupatta is, which cloths it comes in, what
 * colours the pots give and what is drawn on it — and then sold them one. What
 * it never did was answer the two questions that decide whether somebody buys
 * hand-painted Kalamkari at this price at all:
 *
 *   1. What actually happened to this piece before it reached me?
 *   2. How would I know, holding it, that it is not a print?
 *
 * Both are answered elsewhere on the site, at length, on pages the visitor has
 * not read and mostly will not. So the short forms live here, on the page where
 * the decision is made, each pointing at the long form for anybody who wants it.
 *
 * Nothing in either section is written twice. The stages are read from
 * `stages.ts` and the comparison from `family.ts`; a store that changes its
 * process description changes both of these with it.
 */

/* -------------------------------------------------------------------------- */
/* How one of these is made                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The four stages worth showing on a page where somebody is choosing.
 *
 * Not the first four, and not an even spread. These are the four that a buyer
 * standing over a piece would find surprising: the ground is a nut rather than
 * bleach, the black grows in the cloth instead of sitting on it, the red is
 * painted invisibly and arrives days later in a pot, and most of the month is
 * spent taking colour off again.
 *
 * Stated as stage numbers rather than copied, so the prose has one home.
 */
const HIGHLIGHT_STAGES = [3, 9, 10, 12];

export function HowThisIsMade({ typeLabel }: { typeLabel: string }) {
  const stages = HIGHLIGHT_STAGES.map((n) => mainStages.find((s) => s.n === n)).filter(
    (s): s is NonNullable<typeof s> => Boolean(s),
  );

  return (
    <section
      className="border-y border-border bg-cotton-100 section-y dark:bg-card"
      aria-labelledby="how-made-heading"
    >
      <div className="container">
        <RevealOnScroll>
          <SectionHeader
            eyebrow="Before it reached the shelf"
            title={`How one of these ${typeLabel.toLowerCase()} is made`}
            lead={`Four of the ${TOTAL_MAIN_STAGES} stages, chosen because they are the ones people do not expect. Every piece on this page went through all of them, and through all ${totalSteps} operations inside them.`}
            id="how-made-heading"
          />
        </RevealOnScroll>

        <ol className="mt-9 grid gap-x-6 gap-y-8 sm:grid-cols-2 md:mt-12 lg:grid-cols-4">
          {stages.map((stage, i) => (
            <li key={stage.n} className="flex">
              <RevealOnScroll delay={i * 0.07} className="flex w-full">
                {/*
                  A rule that draws itself in on hover, and a numeral in the
                  workshop's own gold. The card has no border and no fill: four
                  bordered boxes in a row on a page that already carries a cloth
                  rail, a variety grid, a colour grid and a motif grid would be
                  the fifth set of boxes on one page.
                */}
                <div className="group flex w-full flex-col border-t-2 border-border pt-5 transition-colors duration-500 hover:border-primary/50">
                  <div className="flex items-baseline gap-3">
                    <span
                      aria-hidden="true"
                      className="tabular font-display text-2xl leading-none text-primary/70 transition-colors duration-500 group-hover:text-primary"
                    >
                      {String(stage.n).padStart(2, '0')}
                    </span>
                    <span className="font-inscription text-label uppercase tracking-[0.16em] text-muted-foreground">
                      Stage {stage.n} of {TOTAL_MAIN_STAGES}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-lg leading-snug">{stage.title}</h3>

                  {/* The note rather than the body: it is one sentence, it is
                      the surprising one, and four paragraphs of process on a
                      page somebody is shopping on is a page they leave. */}
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {stage.note ?? stage.body[0]}
                  </p>

                  {stage.duration && (
                    <p className="mt-3 font-inscription text-label uppercase tracking-[0.14em] text-muted-foreground/75">
                      {stage.duration}
                    </p>
                  )}
                </div>
              </RevealOnScroll>
            </li>
          ))}
        </ol>

        <RevealOnScroll delay={0.1}>
          <div className="mt-11 flex flex-col gap-4 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl leading-relaxed text-muted-foreground">
              Between {site.craft.sareeDaysMin} and {site.craft.sareeDaysMax} days pass
              between the first wash and the last pressing, and the monsoon can stop all of
              it — nothing in the process works without sun to dry between stages.
            </p>
            <Button asChild size="lg" className="shrink-0">
              <Link href="/process">
                Walk through all {TOTAL_MAIN_STAGES} stages
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* What to look for                                                           */
/* -------------------------------------------------------------------------- */

/**
 * The comparison, as something a buyer can apply with the piece in their hands.
 *
 * Read from `handVsPrinted` in `family.ts`, where it is deliberately phrased as
 * things that can be *checked* rather than as claims about quality — "takes six
 * weeks" is verifiable, "superior craftsmanship" is not.
 *
 * It is on the type pages because this is where it is useful. On /our-story it
 * is an argument the store is making about itself; here it is an instrument
 * somebody can take to a different shop, which is a much stronger thing to
 * publish and the reason it is worth repeating.
 *
 * Two columns from `sm`, and a real `<table>` underneath at every width — the
 * relationship between "the repeat", "never identical" and "mechanically
 * identical along the whole border" is a row, and flattening it into cards
 * would lose the comparison, which is the entire content.
 */
export function WhatToLookFor({ typeLabel }: { typeLabel: string }) {
  return (
    <section className="section-y" aria-labelledby="look-for-heading">
      <div className="container">
        <RevealOnScroll>
          <SectionHeader
            eyebrow="Take this with you"
            title={`How to tell a hand-painted ${typeLabel.toLowerCase().replace(/s$/, '')} from a printed one`}
            lead="None of these need a specialist, and all of them work in somebody else's shop as well as in ours. Most cloth sold under this name is block- or screen-printed; those are real trades, and this is how you tell which one you are holding."
            id="look-for-heading"
          />
        </RevealOnScroll>

        <RevealOnScroll delay={0.06}>
          <div className="mt-9 overflow-x-auto md:mt-12">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <caption className="sr-only">
                Six checks that distinguish hand-drawn pen Kalamkari from block- or
                screen-printed cloth
              </caption>
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="py-3 pr-6 font-medium">
                    What to check
                  </th>
                  <th scope="col" className="py-3 pr-6 font-medium text-primary">
                    Drawn by hand
                  </th>
                  <th scope="col" className="py-3 font-medium text-muted-foreground">
                    Block or screen printed
                  </th>
                </tr>
              </thead>
              <tbody>
                {handVsPrinted.map((row) => (
                  <tr
                    key={row.point}
                    className="group border-b border-border/60 transition-colors duration-300 hover:bg-primary/[0.03]"
                  >
                    <th scope="row" className="py-4 pr-6 text-left align-top font-medium">
                      {row.point}
                    </th>
                    <td className="py-4 pr-6 align-top leading-relaxed">{row.hand}</td>
                    <td className="py-4 align-top leading-relaxed text-muted-foreground">
                      {row.printed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <div className="mt-10 rounded-sm border border-border bg-card p-6 md:p-8">
            <h3 className="font-display text-display-sm">The one that settles it</h3>
            <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
              Turn the cloth over. Dye drawn with a pen onto myrobalan-treated cotton
              strikes into the fibre, so the back of a hand-painted piece reads almost as
              strongly as the face. Print sits on the surface, and the reverse is
              noticeably paler. It takes two seconds and needs no expertise at all.
            </p>
            <Link
              href="/our-story"
              className="mt-5 inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              See it photographed, side by side
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
