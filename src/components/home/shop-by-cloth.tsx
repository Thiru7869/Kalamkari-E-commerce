import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { FAMILY_LABELS, FAMILY_NOTES } from '@/content/catalogue';

type ClothOption = {
  slug: string;
  name: string;
  family: string;
  _count: { products: number };
};

/**
 * Choose by cloth.
 *
 * Kalamkari is bought by cloth as often as by anything else — the same drawing
 * behaves differently on cotton and on tussar — and until now the only way to
 * start from a cloth was to open a type page. Every cloth listed here is read
 * from the catalogue's own filter options, so a cloth the store cannot
 * currently supply is simply absent rather than offered and then empty.
 *
 * Text-led on purpose. A cloth has no photograph of its own in the data, and
 * inventing one would be worse than a clean typographic card: the family's
 * name and the one line the catalogue already writes about it are the
 * content, and each cloth links to the shop filtered to it.
 */
/**
 * One dye colour per cloth family, so each card has an identity without a
 * photograph that does not exist. Static strings, so Tailwind can see them.
 */
const BAND: Record<string, string> = {
  cotton: 'bg-chay-600',
  silk: 'bg-indigo-600',
  blended: 'bg-myrobalan-600',
  sheer: 'bg-pachcha-600',
};

/** Rows shown before the rest fold away, so the four cards stay level. */
const VISIBLE = 4;

export function ShopByCloth({
  fabrics,
  chooser,
}: {
  fabrics: ClothOption[];
  /** The two-question shortcut, shown as a bar above the cards. */
  chooser?: ReactNode;
}) {
  const available = fabrics.filter((f) => f._count.products > 0);
  if (available.length === 0) return null;

  const byFamily = new Map<string, ClothOption[]>();
  for (const fabric of available) {
    const list = byFamily.get(fabric.family) ?? [];
    list.push(fabric);
    byFamily.set(fabric.family, list);
  }

  // The catalogue's own order first, then any family it has not heard of.
  const known = Object.keys(FAMILY_LABELS).filter((f) => byFamily.has(f));
  const families = [...known, ...[...byFamily.keys()].filter((f) => !known.includes(f))];

  return (
    <section className="section-y" aria-labelledby="by-cloth-heading">
      <div className="container">
        <RevealOnScroll>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="eyebrow">Choose by cloth</p>
              <h2 id="by-cloth-heading" className="mt-3 text-display-md">
                Start from the cloth
              </h2>
              <p className="mt-3 text-muted-foreground">
                Each cloth takes natural dye in its own way, so the same drawing looks
                different on every one.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              See everything
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </RevealOnScroll>

        {chooser && (
          <RevealOnScroll delay={0.04}>
            <div className="mt-5 gap-6 rounded-sm border border-border bg-cotton-100 p-4 dark:bg-card md:p-5 lg:flex lg:items-end">
              <div className="mb-3 lg:mb-0 lg:w-60 lg:shrink-0">
                <p className="text-sm font-medium">Not sure where to start?</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Pick a cloth, a price, or both. The shop opens already filtered to pieces
                  available now.
                </p>
              </div>
              <div className="min-w-0 flex-1">{chooser}</div>
            </div>
          </RevealOnScroll>
        )}

        <ul className="mt-5 grid gap-3 sm:grid-cols-2 md:mt-6 lg:grid-cols-4 lg:gap-4">
          {families.map((family, i) => (
            <li key={family}>
              <RevealOnScroll delay={i * 0.05} className="h-full">
                <div className="group/card flex h-full flex-col overflow-hidden rounded-sm border border-border bg-card transition-[transform,box-shadow,border-color] duration-300 ease-out hover:border-myrobalan-500/60 hover:shadow-lg motion-safe:hover:-translate-y-1">
                  {/* The header is the cloth's own colour, with a fine weave laid
                      over it and the family's initial set large and faint. */}
                  <div
                    className={`relative overflow-hidden px-5 pb-5 pt-6 text-cotton-50 ${BAND[family] ?? 'bg-myrobalan-600'}`}
                  >
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 opacity-[0.12]"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 7px), repeating-linear-gradient(-45deg, #fff 0 1px, transparent 1px 7px)',
                      }}
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-6 -right-1 select-none font-display text-[7.5rem] font-semibold leading-none text-cotton-50/15"
                    >
                      {(FAMILY_LABELS[family] ?? family).charAt(0)}
                    </span>
                    <p className="relative font-inscription text-[0.6875rem] uppercase tracking-[0.24em] text-cotton-50/80">
                      {String(i + 1).padStart(2, '0')}
                      <span className="sr-only"> of {families.length}</span>
                    </p>
                    <h3 className="relative mt-3 font-display text-2xl leading-tight">
                      {FAMILY_LABELS[family] ?? family}
                    </h3>
                    <p className="tabular relative mt-1 text-sm text-cotton-50/85">
                      {(byFamily.get(family) ?? []).reduce((n, c) => n + c._count.products, 0)}{' '}
                      pieces
                    </p>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    {FAMILY_NOTES[family] && (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {FAMILY_NOTES[family]}
                      </p>
                    )}

                    <ClothList cloths={byFamily.get(family) ?? []} />
                  </div>
                </div>
              </RevealOnScroll>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ClothRow({ cloth }: { cloth: ClothOption }) {
  return (
    <li className="border-b border-border/60 last:border-b-0">
      <Link
        href={`/shop?fabric=${cloth.slug}`}
        className="flex min-h-[2.75rem] items-center justify-between gap-3 text-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>{cloth.name}</span>
        <span className="tabular text-xs text-muted-foreground">
          <span className="sr-only">{cloth._count.products} pieces</span>
          <span aria-hidden="true">{cloth._count.products}</span>
        </span>
      </Link>
    </li>
  );
}

/** The first few cloths, then the rest behind a native disclosure. */
function ClothList({ cloths }: { cloths: ClothOption[] }) {
  const shown = cloths.slice(0, VISIBLE);
  const rest = cloths.slice(VISIBLE);

  return (
    <div className="mt-4 border-t border-border">
      <ul className="flex flex-col">
        {shown.map((cloth) => (
          <ClothRow key={cloth.slug} cloth={cloth} />
        ))}
      </ul>
      {rest.length > 0 && (
        <details className="group/more">
          <summary className="flex min-h-[2.75rem] cursor-pointer list-none items-center text-sm font-medium text-primary marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-open/more:hidden [&::-webkit-details-marker]:hidden">
            + {rest.length} more
          </summary>
          <ul className="flex flex-col">
            {rest.map((cloth) => (
              <ClothRow key={cloth.slug} cloth={cloth} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
