import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProcessJourney } from '@/components/process/process-journey';
import { ColourWalk } from '@/components/process/colour-walk';
import { FamilyCollage } from '@/components/process/family-collage';
import { Button } from '@/components/ui/button';
import {
  processPhases,
  naturalDyes,
  totalSteps,
  whatWeDoNotUse,
  dyeWash,
  colourStories,
} from '@/content/process';
import { mainStages, TOTAL_MAIN_STAGES } from '@/content/stages';
import { whatIsKalamkari, kalamkariInFull } from '@/content/kalamkari';
import { site } from '@/content/site';
import { absoluteUrl } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'How a Kalamkari saree is made — the 14 stages, step by step',
  description:
    'The full Srikalahasti pen Kalamkari process: myrobalan and buffalo milk, the bamboo kalam, kasim kaaram fermented from rusted iron for 21 days, alum mordants, a boiling chay-root bath, the indigo vat, and twenty cycles of river water and sun.',
  alternates: { canonical: '/process' },
  openGraph: {
    title: 'How a Kalamkari saree is made — all 14 stages',
    description:
      'Fourteen stages and twenty-three operations, from washing the mill starch out of the cloth to the last of twenty sun-dryings.',
    images: ['/images/og/process.jpg'],
  },
};

export default function ProcessPage() {
  return (
    <>
      <section className="border-b border-border bg-cotton-100 pb-14 pt-16 md:pb-20 md:pt-24 dark:bg-card">
        <div className="container">
          {/* The heading and the household, side by side. The collage fills the
              space the heading leaves at the top right on wide screens, and
              drops under it below lg rather than shrinking to nothing. */}
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] xl:gap-14">
          <div className="max-w-3xl">
            <Breadcrumbs trail={[{ label: 'The process' }]} className="mb-6" />
            <p className="eyebrow">The making of a Kalamkari saree</p>
            <h1 className="mt-4 text-display-xl">
              Fourteen stages.
              <span className="block text-primary">
                Twenty-three operations. One pen.
              </span>
            </h1>
            <p className="mt-7 text-body-lg text-muted-foreground">
              Nothing on this page is a metaphor. Every stage below is real work performed
              on real cloth in {site.location.town}, in this order, with these materials —
              and if any one of them is skipped, the piece fails.
            </p>
            {/*
              Both numbers, and why there are two of them.

              Fourteen is the shape of the work — the stages an artisan would
              name if you asked what they were doing this week. Twenty-three is
              the count of individual operations, and it is the figure this site
              states everywhere else. A reader who meets "fourteen" here after
              reading "twenty-three" on the home page is owed the explanation in
              the same breath rather than being left to assume one of the two is
              marketing.
            */}
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The {TOTAL_MAIN_STAGES} stages are how the work is actually divided; the{' '}
              {totalSteps} steps are the individual operations inside them, and each stage
              carries its own. Scroll through it: the cloth in the frame beside the text
              advances as you read, and the ground behind the page warms and cools with the
              pots.
            </p>
          </div>

            <FamilyCollage className="mt-10 lg:mt-1.5" />
          </div>

          <dl className="mt-12 grid gap-6 border-t border-border pt-8 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { k: `${TOTAL_MAIN_STAGES}`, v: 'main stages' },
              { k: `${totalSteps}`, v: 'operations, all by hand' },
              { k: `${site.craft.kasimFermentDays} days`, v: 'to ferment the black' },
              { k: `${site.craft.washCycles}×`, v: 'washed and sun-dried' },
              { k: '0', v: 'synthetic ingredients' },
            ].map((stat) => (
              <div key={stat.v}>
                <dt className="sr-only">{stat.v}</dt>
                <dd>
                  <span className="tabular block font-display text-3xl leading-none text-primary">
                    {stat.k}
                  </span>
                  <span className="mt-2 block text-sm text-muted-foreground">{stat.v}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* What the word means                                                 */}
      {/* ------------------------------------------------------------------ */}
      {/*
        The target of every "What is Kalamkari?" link on the site — the home
        page section, the Process menu and the footer's Craft column all point
        at this anchor.

        It is here rather than on a page of its own on purpose. A standalone
        /kalamkari route would have to restate the pen, the town, the two
        traditions and the pots, all of which are said on this page and on
        /our-story already, and this content layer does not keep two copies of
        an argument. Putting the definition at the head of the sequence it
        introduces also means the reader who came for the definition is already
        standing at the top of the answer.

        Every clause is read from `src/content/kalamkari.ts`; the landing page
        renders the same object, shorter.
      */}
      <section
        id="what-is-kalamkari"
        className="scroll-mt-24 border-b border-border section-y"
        aria-labelledby="what-is-kalamkari-heading"
      >
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
            <div>
              <p className="eyebrow">{whatIsKalamkari.eyebrow}</p>
              <h2
                id="what-is-kalamkari-heading"
                className="mt-4 text-display-lg font-semibold tracking-[-0.015em]"
              >
                {whatIsKalamkari.heading}
              </h2>
              <p className="mt-6 text-body-lg leading-relaxed text-muted-foreground">
                {whatIsKalamkari.lead}
              </p>

              {/* The two paragraphs this page gets and the landing page does
                  not. The section there is a doorway; a doorway that takes
                  four screens to walk through is a corridor. */}
              {kalamkariInFull.map((para, i) => (
                <p key={i} className="mt-4 leading-relaxed text-muted-foreground">
                  {para}
                </p>
              ))}

              <blockquote className="mt-8 border-l-2 border-primary bg-primary/[0.045] py-4 pl-5 pr-4">
                <p className="font-display text-lg italic leading-snug md:text-xl">
                  {whatIsKalamkari.test}
                </p>
              </blockquote>
            </div>

            <ol className="flex flex-col">
              {whatIsKalamkari.facets.map((facet, i) => (
                <li
                  key={facet.id}
                  className="group border-t border-border py-6 first:border-t-0 first:pt-0 md:py-7"
                >
                  <div className="flex items-baseline gap-3.5">
                    <span
                      aria-hidden="true"
                      className="tabular font-inscription text-sm text-primary/70"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-inscription text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground">
                      {facet.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className="ml-auto block h-px w-0 bg-primary/50 transition-[width] duration-700 ease-out motion-safe:group-hover:w-12"
                    />
                  </div>
                  <h3 className="mt-3 font-display text-display-sm leading-snug">
                    {facet.heading}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{facet.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* The scroll-driven sequence: dye wash, framed cloth, fourteen stages,
          and all twenty-three operations inside the stages that contain them. */}
      <ProcessJourney stages={mainStages} tones={dyeWash} />

      {/* The palette, one colour at a time. */}
      <ColourWalk colours={colourStories} />

      {/* ------------------------------------------------------------------ */}
      {/* Dye reference                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section id="dyes" className="scroll-mt-24 border-y border-border bg-cotton-100 section-y-lg dark:bg-card">
        <div className="container">
          <div className="max-w-2xl">
            <p className="eyebrow">The reference</p>
            <h2 className="mt-3 text-display-md">The same eight, as a table</h2>
            <p className="mt-4 text-muted-foreground">
              For anyone who would rather read it than walk through it. The swatches are
              approximations — the real colour shifts with the cloth, the water and the
              season, which is a feature of natural dyeing rather than a fault in it.
            </p>
          </div>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-sm">
              <caption className="sr-only">
                Natural dyes used in Srikalahasti Kalamkari, their sources and how each is
                applied
              </caption>
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="py-3 pr-4 font-medium">Colour</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Source</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Local name</th>
                  <th scope="col" className="py-3 font-medium">How it is applied</th>
                </tr>
              </thead>
              <tbody>
                {naturalDyes.map((dye) => (
                  <tr key={dye.colour} className="border-b border-border/60">
                    <th scope="row" className="py-4 pr-4 text-left font-medium">
                      <span className="flex items-center gap-3">
                        <span
                          className="h-7 w-7 shrink-0 rounded-full border border-foreground/15"
                          style={{ backgroundColor: dye.hex }}
                          aria-hidden="true"
                        />
                        {dye.colour}
                      </span>
                    </th>
                    <td className="py-4 pr-4 text-muted-foreground">{dye.source}</td>
                    <td className="py-4 pr-4 text-muted-foreground">
                      {'localName' in dye && dye.localName ? (
                        <em className="not-italic">{dye.localName}</em>
                      ) : (
                        <span aria-hidden="true">—</span>
                      )}
                    </td>
                    <td className="py-4 text-muted-foreground">{dye.how}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 rounded-sm border border-border bg-background p-6 md:p-8">
            <h3 className="font-display text-display-sm">And what is never in the pot</h3>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2.5">
              {whatWeDoNotUse.map((item) => (
                <li key={item} className="text-sm text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      <section className="section-y-lg">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-display-md">Now that you know what it takes</h2>
            <p className="mt-4 text-body-lg text-muted-foreground">
              Every piece in the store went through all twenty-three of those steps.
              That is what you are looking at when you look at the price.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/shop">
                  See the finished work
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/custom">Have a piece painted for you</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How Srikalahasti pen Kalamkari is made',
            description:
              'The traditional 23-step process for hand-painted Kalamkari using only natural dyes.',
            totalTime: 'P45D',
            supply: naturalDyes.map((d) => ({ '@type': 'HowToSupply', name: d.source })),
            tool: [
              { '@type': 'HowToTool', name: 'Bamboo kalam (pen)' },
              { '@type': 'HowToTool', name: 'Burnt tamarind charcoal' },
              { '@type': 'HowToTool', name: 'Earthen fermentation pot' },
            ],
            step: processPhases.flatMap((phase) =>
              phase.steps.map((step) => ({
                '@type': 'HowToStep',
                position: step.n,
                name: step.title,
                text: step.body,
                url: absoluteUrl(`/process#step-${step.n}`),
              })),
            ),
          }),
        }}
      />
    </>
  );
}
