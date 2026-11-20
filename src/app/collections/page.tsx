import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { SectionHeader } from '@/components/layout/section-header';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { collectionDefs } from '@/content/catalogue';

/**
 * The index of the collection pages.
 *
 * Every line on it comes from `collectionDefs`, the same list the collection
 * pages themselves read, so the index cannot promise a shelf that does not
 * exist or describe one differently from the page it links to.
 */

export const metadata: Metadata = {
  title: 'Collections',
  description:
    'Featured, premium and new work from the Srikalahasti workshop — each collection states how its pieces are chosen.',
  alternates: { canonical: '/collections' },
};

export default function CollectionsPage() {
  return (
    <>
      <header className="border-b border-border bg-cotton-100 pb-12 pt-12 md:pb-16 md:pt-16 dark:bg-card">
        <div className="container">
          <Breadcrumbs trail={[{ label: 'Collections' }]} />
          <SectionHeader
            as="h1"
            size="lg"
            eyebrow="The store"
            title="Collections"
            lead="Each collection shows how its pieces are chosen. A piece can belong to more than one."
          />
        </div>
      </header>

      <section className="section-y">
        <div className="container">
          <ul className="grid gap-5 md:grid-cols-3">
            {collectionDefs.map((c, i) => (
              <li key={c.slug}>
                <RevealOnScroll delay={i * 0.05}>
                  <Link
                    href={`/collections/${c.slug}`}
                    className="group flex h-full flex-col rounded-sm border border-border bg-card p-6 transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <p className="eyebrow text-primary">{c.eyebrow}</p>
                    <h2 className="mt-2 font-display text-2xl leading-tight">{c.title}</h2>
                    <p className="mt-3 text-sm text-muted-foreground">{c.blurb}</p>
                    <p className="mt-4 text-xs text-muted-foreground">{c.criterion}</p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-primary">
                      View the collection
                      <ArrowRight
                        className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </RevealOnScroll>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-sm text-muted-foreground">
            Looking for something that is not here?{' '}
            <Link href="/custom" className="text-primary underline underline-offset-4">
              Have a piece painted
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
