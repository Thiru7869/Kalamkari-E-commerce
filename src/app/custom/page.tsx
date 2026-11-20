import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { CommissionForm } from '@/components/forms/commission-form';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { NarrativeNote } from '@/components/shop/narrative-note';
import { commissionTimeline } from '@/content/commission';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Commission a piece',
  description:
    'Have a Kalamkari saree, dupatta, painting or panel painted for you in Srikalahasti — freehand, in natural dyes, to your subject and cloth.',
  alternates: { canonical: '/custom' },
};

const stages = [
  {
    n: '01',
    title: 'You tell us what you want painted',
    body: 'A subject, an occasion, a colour you keep coming back to, a photograph of something you saw once. It does not have to be precise — most commissions start vague and get specific in conversation.',
  },
  {
    n: '02',
    title: 'We tell you honestly whether it suits the craft',
    body: 'Some things this tradition does beautifully and some it does badly. Portrait likeness, for example, is not what pen Kalamkari is for. We will say so rather than take the order.',
  },
  {
    n: '03',
    title: 'Cloth, scale and price are agreed',
    body: 'The cloth changes everything — how the dye strikes, how fine the line can be, how it drapes, and what it costs. We will talk through the options before anything is fixed.',
  },
  {
    n: '04',
    title: 'It is drawn, dyed and washed — the long way',
    body: `All twenty-three steps, the same as everything else in the store. Between ${site.craft.sareeDaysMin} and ${site.craft.sareeDaysMax} days for a saree, longer for a large narrative panel.`,
  },
  {
    n: '05',
    title: 'It is sent from Srikalahasti',
    body: 'Checked, folded in unbleached muslin, and dispatched. One of one, and yours.',
  },
];

export default function CommissionPage() {
  return (
    <>
      <section className="border-b border-border bg-cotton-100 pb-8 pt-8 md:pb-12 md:pt-10 dark:bg-card">
        <div className="container">
          <div className="max-w-3xl">
            <Breadcrumbs trail={[{ label: 'Commission' }]} />
            <p className="eyebrow">Commissions</p>
            <h1 className="mt-3 text-display-lg">Have it painted for you</h1>
            <p className="mt-4 text-body-lg text-muted-foreground">
              Because nothing here is printed, nothing here has to be chosen from a
              catalogue. If you want the Tree of Life on tussar rather than cotton, or a
              specific episode of the Ramayana across a pallu, or a panel for a particular
              wall in a particular light — that is simply a different drawing, and the
              store has been making different drawings for a long time.
            </p>
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
            <div>
              <h2 className="text-display-md">How it works</h2>
              <ol className="mt-8 flex flex-col gap-8">
                {stages.map((stage) => (
                  <li key={stage.n} className="flex gap-5">
                    <span
                      className="tabular font-display text-2xl leading-none text-primary/60"
                      aria-hidden="true"
                    >
                      {stage.n}
                    </span>
                    <div>
                      <h3 className="font-display text-lg leading-snug">{stage.title}</h3>
                      <p className="mt-2 leading-relaxed text-muted-foreground">
                        {stage.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-12 rounded-sm border border-border bg-muted/40 p-5 md:p-6">
                <h3 className="font-display text-lg">Two honest warnings</h3>
                <ul className="mt-4 flex list-disc flex-col gap-3 pl-4 text-sm leading-relaxed text-muted-foreground">
                  <li>
                    <strong className="font-medium text-foreground">
                      The monsoon stops everything.
                    </strong>{' '}
                    Every stage ends with the cloth going into the sun. A timeline agreed in
                    January is far more reliable than one agreed in July, and we would rather
                    say so than quietly miss a date.
                  </li>
                  <li>
                    <strong className="font-medium text-foreground">
                      Natural dye is not a colour picker.
                    </strong>{' '}
                    We can promise madder red, indigo blue and myrobalan gold. We cannot
                    promise an exact shade to match a paint chip, because the same bath gives
                    a slightly different result on different cloth in different weather.
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <div className="rounded-sm border border-border bg-card p-5 md:p-7 lg:sticky lg:top-24">
                <h2 className="text-display-sm">Tell us what you have in mind</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  There is no obligation in this, and no payment is taken here. It starts a
                  conversation.
                </p>
                <CommissionForm className="mt-7" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* What actually happens after you send                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-y border-border bg-cotton-100 section-y dark:bg-card">
        <div className="container">
          <RevealOnScroll>
            <p className="eyebrow">After you send it</p>
            <h2 className="mt-3 text-display-md">What happens, and when</h2>
            <p className="mt-4 max-w-2xl text-body-lg text-muted-foreground">
              Including the step where we say no. A commission that does not suit pen
              Kalamkari is better refused than taken.
            </p>
          </RevealOnScroll>

          <ol className="mt-10 grid gap-5 md:mt-14 md:grid-cols-5">
            {commissionTimeline.map((stage, i) => (
              <li key={stage.n}>
                <RevealOnScroll delay={i * 0.06}>
                  <div className="flex h-full flex-col border-t-2 border-primary/30 pt-4">
                    <span className="tabular font-display text-2xl leading-none text-primary/70">
                      {stage.n}
                    </span>
                    <h3 className="mt-3 font-display text-base leading-snug">{stage.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {stage.body}
                    </p>
                    <p className="mt-3 text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground/70">
                      {stage.when}
                    </p>
                  </div>
                </RevealOnScroll>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* The narrative traditions                                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="section-y">
        <div className="container">
          <RevealOnScroll>
            <NarrativeNote />
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
