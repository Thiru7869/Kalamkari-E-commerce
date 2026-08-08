import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProcessJourney } from '@/components/process/process-journey';
import { Button } from '@/components/ui/button';
import { processPhases, naturalDyes, totalSteps, whatWeDoNotUse } from '@/content/process';
import { site } from '@/content/site';
import { absoluteUrl } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'The 23 steps of Srikalahasti Kalamkari',
  description:
    'How a hand-painted Kalamkari saree is actually made: myrobalan and buffalo milk, tamarind charcoal, iron liquor fermented for 21 days, alum mordants, a boiling madder bath, indigo, and twenty cycles of river water and sun.',
  alternates: { canonical: '/process' },
  openGraph: {
    title: 'The 23 steps of Srikalahasti Kalamkari',
    description:
      'The full sequence, from washing the mill starch out of the cloth to the last of twenty sun-dryings.',
    images: ['/images/og/process.jpg'],
  },
};

export default function ProcessPage() {
  return (
    <>
      <section className="border-b border-border bg-cotton-100 pb-14 pt-16 md:pb-20 md:pt-24 dark:bg-card">
        <div className="container">
          <div className="max-w-3xl">
            <p className="eyebrow">The making of a Kalamkari saree</p>
            <h1 className="mt-4 text-display-xl">
              Twenty-three steps.
              <span className="block text-primary">Six weeks. One pen.</span>
            </h1>
            <p className="mt-7 text-body-lg text-muted-foreground">
              Nothing on this page is a metaphor. Every stage below is a real operation
              performed on real cloth in {site.location.town}, in this order, using these
              materials — and if any one of them is skipped, the piece fails.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Scroll through it. The cloth beside the text changes as the process does.
            </p>
          </div>

          <dl className="mt-12 grid gap-6 border-t border-border pt-8 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { k: `${totalSteps}`, v: 'steps, all by hand' },
              { k: `${site.craft.kasimFermentDays} days`, v: 'to ferment the black' },
              { k: `${site.craft.washCycles}×`, v: 'washed and sun-dried' },
              { k: `${site.craft.sareeDaysMin}–${site.craft.sareeDaysMax}`, v: 'days for one saree' },
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

      {/* The scroll-driven sequence. */}
      <ProcessJourney phases={processPhases} />

      {/* ------------------------------------------------------------------ */}
      {/* Dye reference                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section id="dyes" className="scroll-mt-24 border-y border-border bg-cotton-100 py-16 md:py-24 dark:bg-card">
        <div className="container">
          <div className="max-w-2xl">
            <p className="eyebrow">The palette</p>
            <h2 className="mt-3 text-display-md">Where each colour comes from</h2>
            <p className="mt-4 text-muted-foreground">
              Eight colours, and only three of them are painted on directly. The swatches
              are approximations — the real colour shifts with the cloth, the water and
              the season, which is a feature of natural dyeing rather than a fault in it.
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
      <section className="py-16 md:py-24">
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
