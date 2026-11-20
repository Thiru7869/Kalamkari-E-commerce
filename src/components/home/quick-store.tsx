import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/shop/product-card';
import { Button } from '@/components/ui/button';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import type { QuickStoreItem } from '@/lib/queries';
import { formatPrice } from '@/lib/utils';

/**
 * The quick store — ten finished pieces, deliberately unlike each other.
 *
 * The selection is done in `getQuickStore` and it is the whole point: ten by
 * plain featured-ordering came back as four Tree of Life tussars within a few
 * thousand rupees of each other, because work comes off the line in runs. A
 * visitor scrolling that concludes the shop makes one thing. The spread pass
 * there takes the highest-ranked piece whose motif, cloth and price band are
 * all new, which is what makes this section an argument about range rather
 * than a row of stock.
 *
 * Two layouts, and the break is at `lg` rather than `sm`:
 *
 *   - **Below `lg` it is a snap rail.** Ten cards will not lay out honestly in
 *     a three-column phone grid — 3+3+3+1 leaves a single orphan on a fourth
 *     row, which reads as a card that failed to load. A rail also lets each
 *     card keep its comfortable density, so the cloth, the artisan and the
 *     hand-days are all legible on a phone, which they are not at 105px.
 *   - **From `lg` it is five across, twice.** Ten divides properly, and the
 *     grid says "here is the range" in one glance in a way a rail cannot.
 *
 * The rail carries a real scrollbar rather than arrow buttons. Arrows on a
 * touch device are two 44px targets buying nothing, and on a desktop the row
 * is a grid by then anyway.
 */
export function QuickStore({
  items,
  wishlistIds,
}: {
  items: QuickStoreItem[];
  wishlistIds?: Set<string>;
}) {
  if (items.length === 0) return null;

  // Stated rather than asserted. The range is the claim this section makes, so
  // it is read off the pieces actually rendered instead of written down.
  const prices = items.map((p) => p.price);
  const cloths = new Set(items.map((p) => p.fabric?.name).filter(Boolean)).size;

  return (
    <section
      className="border-y border-border bg-cotton-100 section-y-lg dark:bg-card"
      aria-labelledby="quick-store-heading"
    >
      <div className="container">
        <RevealOnScroll>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
            <div className="max-w-2xl">
              <p className="eyebrow">The quick store</p>
              <h2 id="quick-store-heading" className="mt-3 text-display-md leading-tight">
                Ten pieces. Ten drawings that will not be drawn again.
              </h2>
              <p className="mt-4 text-body-lg leading-relaxed text-muted-foreground">
                Chosen to be unlike each other — {cloths} different cloths, different
                stories, and everything from {formatPrice(Math.min(...prices))} to{' '}
                {formatPrice(Math.max(...prices))}. Every one of them is finished, checked
                and ready to send.
              </p>
            </div>

            <Button asChild size="lg" className="shrink-0">
              <Link href="/shop">
                Shop now
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </RevealOnScroll>

        {/* ---- Below lg: a snap rail ------------------------------------- */}
        {/*
          `-mx-*` then `px-*` so the rail bleeds to the edge of the screen and
          still starts flush with the container's text above it. A rail that
          stops at the container's right padding looks like a grid that ran
          out; one that runs off the edge is legibly scrollable without a
          single instruction.
        */}
        <div
          className="-mx-5 mt-5 overflow-x-auto pb-2 [scrollbar-width:thin] sm:-mx-6 md:mt-6 lg:hidden"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          <ul className="flex w-max gap-3.5 px-5 sm:gap-4 sm:px-6">
            {items.map((product, i) => (
              <li
                key={product.id}
                className="w-[62vw] max-w-[17rem] shrink-0 sm:w-[38vw]"
                style={{ scrollSnapAlign: 'start' }}
              >
                <ProductCard
                  product={product}
                  wishlisted={wishlistIds?.has(product.id)}
                  priority={i < 2}
                  className="h-full"
                  sizes="(min-width: 640px) 38vw, 62vw"
                />
              </li>
            ))}
          </ul>
        </div>

        {/* ---- From lg: five across, twice ------------------------------- */}
        <ul className="mt-6 hidden grid-cols-5 gap-x-4 gap-y-6 lg:grid">
          {items.map((product) => (
            <li key={product.id} className="flex">
              <ProductCard
                product={product}
                wishlisted={wishlistIds?.has(product.id)}
                className="w-full"
                sizes="(min-width: 1280px) 17vw, 18vw"
              />
            </li>
          ))}
        </ul>

        <RevealOnScroll delay={0.06}>
          <p className="mt-6 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
            Almost everything here is one of one. There is no device anywhere in this craft
            that would make a second, so when a piece goes, its drawing goes with it — and
            the nearest thing to having it again is having a sibling drawn on purpose.{' '}
            <Link
              href="/custom"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Start a commission
            </Link>
            .
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
