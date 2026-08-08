import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import Link from 'next/link';
import { naturalDyes } from '@/content/process';

export const metadata: Metadata = {
  title: 'Care & washing',
  description:
    'How to wash, dry and store naturally dyed Kalamkari so it improves rather than fades. Cold water, mild soap, shade — and why each of those matters.',
  alternates: { canonical: '/care' },
};

const rules = [
  {
    title: 'Cold water, always',
    body: 'Hot water opens the fibre and encourages anything not firmly bound to leave. In the first few washes there is always a little unbound dye left, however thoroughly a piece was finished. Cold water keeps it where it is.',
  },
  {
    title: 'Mild soap, never bleach',
    body: 'Strong alkaline detergent shifts the pH and dulls madder reds noticeably. Bleach has nothing synthetic in this cloth to attack, so it goes for the fibre and the dye directly.',
  },
  {
    title: 'Dry in shade',
    body: 'This surprises people, because the piece was made in full sun. But sun was used deliberately during making to lighten the ground. A finished piece left in the sun keeps doing that, and the contrast you paid for slowly flattens.',
  },
  {
    title: 'Wash separately at first',
    body: 'For the first three washes, wash the piece on its own. After that it behaves like any other cotton or silk.',
  },
  {
    title: 'Do not wring',
    body: 'Press the water out rather than twisting, particularly on mulmul, Kota, Chanderi and organza. Twisting distorts an open weave permanently.',
  },
  {
    title: 'Store in cloth, not plastic',
    body: 'Fold in unbleached muslin so the fibre can breathe, and refold along a different line every few months so a permanent crease does not set. Sheer pieces such as organza should be rolled rather than folded at all.',
  },
];

export default function CarePage() {
  return (
    <>
      <section className="border-b border-border bg-cotton-100 pb-12 pt-16 md:pb-16 md:pt-24 dark:bg-card">
        <div className="container">
          <div className="max-w-2xl">
            <Breadcrumbs trail={[{ label: 'Care & washing' }]} className="mb-6" />
            <p className="eyebrow">Care</p>
            <h1 className="mt-4 text-display-xl">Looking after naturally dyed cloth</h1>
            <p className="mt-7 text-body-lg text-muted-foreground">
              Short version: cold water, mild soap, dry in shade. Everything below is why.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-14 md:py-20">
        <div className="mx-auto max-w-[46rem]">
          <ol className="flex flex-col gap-9">
            {rules.map((rule, i) => (
              <li key={rule.title} className="flex gap-5">
                <span
                  className="tabular font-display text-2xl leading-none text-primary/60"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h2 className="font-display text-xl leading-snug">{rule.title}</h2>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{rule.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <section className="mt-14 rounded-sm border border-border bg-card p-6">
            <h2 className="font-display text-xl">What to expect over time</h2>
            <ul className="mt-4 flex list-disc flex-col gap-2.5 pl-5 leading-relaxed text-muted-foreground">
              <li>
                Cotton will soften with every wash and keep getting better in the hand for
                several years. There is no starch or finish in it to wash out.
              </li>
              <li>
                The reds will settle a little deeper over the first year rather than lighter.
              </li>
              <li>
                The black will not move. Iron tannate is formed inside the fibre and is the
                most permanent thing on the cloth.
              </li>
              <li>
                Indigo will soften gradually with heavy wear, in the way indigo always does.
                This is the one colour that visibly ages, and it ages well.
              </li>
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="text-display-sm">What each colour is, if you need to know</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {naturalDyes.map((dye) => (
                <li key={dye.colour} className="flex items-start gap-3">
                  <span
                    className="mt-1 h-5 w-5 shrink-0 rounded-full border border-foreground/15"
                    style={{ backgroundColor: dye.hex }}
                    aria-hidden="true"
                  />
                  <span className="text-sm">
                    <span className="block font-medium">{dye.colour}</span>
                    <span className="block text-muted-foreground">{dye.source}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-12 rounded-sm border border-border bg-muted/40 p-5 text-sm leading-relaxed text-muted-foreground">
            Still unsure about a particular piece?{' '}
            <Link href="/contact" className="text-primary underline underline-offset-4">
              Write to the store
            </Link>{' '}
            — tell us which piece and we will tell you exactly what is on it.
          </p>
        </div>
      </div>
    </>
  );
}
