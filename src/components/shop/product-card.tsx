import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/primitives';
import { WishlistButton } from './wishlist-button';
import { formatPrice, averageRating } from '@/lib/utils';
import { primaryImage } from '@/lib/serialize';
import type { ProductCardData } from '@/lib/queries';
import { cn } from '@/lib/utils';

export function ProductCard({
  product,
  wishlisted = false,
  priority = false,
  className,
  sizes = '(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 31vw',
  density = 'comfortable',
}: {
  product: ProductCardData;
  wishlisted?: boolean;
  /** Set on the first row above the fold so LCP is a real product image. */
  priority?: boolean;
  className?: string;
  sizes?: string;
  /**
   * `compact` is the three-up mobile grid, where a column is roughly 105px.
   *
   * At that width the secondary rows — summary, cloth, hand-days, rating —
   * stop being readable and start being noise, and a 44x44 wishlist target
   * would cover nearly half the image. So below `sm` the card carries the
   * piece, its name and its price, and everything else returns at `sm`.
   * Fewer, larger targets is what makes a dense grid feel deliberate rather
   * than cramped.
   */
  density?: 'comfortable' | 'compact';
}) {
  const compact = density === 'compact';
  const image = primaryImage(product.images);
  const rating = averageRating(product.ratingSum, product.ratingCount);
  const soldOut = product.stock < 1;
  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;

  return (
    <article className={cn('group relative flex flex-col', className)}>
      {/*
        5:6, not 3:4.

        At a fixed column width the card's height is set entirely by this
        ratio: 3:4 makes the plate 1.333 times its own width, 5:6 makes it
        1.2 — exactly 10% shorter, with nothing else on the card touched. That
        is the whole size reduction, and it is expressed as a ratio rather than
        a height so it holds at every column width from the 105px phone grid to
        the 300px desktop one.

        It stops at 5:6 rather than going squarer. A saree photographed for
        this catalogue is a tall object — pallu at the top, body falling away —
        and past about 5:6 the crop starts cutting the drop rather than framing
        it, which costs the one thing the card is for.
      */}
      <div className="relative aspect-[5/6] overflow-hidden rounded-sm bg-cotton-300">
        <Image
          src={image}
          alt={`${product.name} — hand-painted Kalamkari`}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(
            'object-cover transition-transform duration-700 ease-out',
            'motion-safe:group-hover:scale-[1.035]',
            soldOut && 'opacity-70',
          )}
        />

        {/*
          Dye bleeding into the weave.

          A madder bloom that swells from the lower third of the plate as the
          cursor arrives — the thing a drop of chay actually does when it meets
          myrobalan-treated cotton, which is to creep along the thread rather
          than to spread evenly in a circle. Hence the elongated radial and the
          `screen`-free, plain-alpha implementation.

          It is two composited properties, opacity and a static gradient. No
          canvas, no filter, no blend mode: this card appears up to forty-eight
          times on a shop page and the one thing a hover flourish must not do
          is put forty-eight new compositing layers on a phone. It costs
          nothing until the pointer is over one card.

          Suppressed under reduced motion, and it carries no information — the
          cloth, the price and the days are all in the markup underneath.
        */}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 opacity-0',
            'transition-opacity duration-1000 ease-out',
            'motion-safe:group-hover:opacity-100 motion-reduce:hidden',
          )}
          style={{
            backgroundImage:
              'radial-gradient(120% 55% at 50% 108%, rgb(142 47 34 / 0.30) 0%, ' +
              'rgb(142 47 34 / 0.12) 38%, transparent 72%)',
          }}
        />

        {/*
          Days of hand-work, on the plate.

          This was already on the card, filed in a grey specification row
          between the cloth and the rating — which is where a reader's eye goes
          last, and it is the single number that explains the price. A saree is
          priced on how many days one person spent drawing it; putting that
          figure on the photograph is the shortest honest argument this card
          can make.

          Same `sm` rule as the rest of the secondary content: on the three-up
          phone grid a column is about 105px and a chip would cover the
          drawing. It returns the moment there is room.
        */}
        {product.craftDays != null && !soldOut && (
          <span
            className={cn(
              'tabular pointer-events-none absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-sm',
              'bg-kasim-950/62 px-1.5 py-0.5 font-inscription text-[0.5625rem] uppercase tracking-[0.12em] text-cotton-50',
              'backdrop-blur-[2px] sm:bottom-2 sm:left-2 sm:px-2 sm:py-1 sm:text-[0.625rem]',
              compact && 'hidden sm:flex',
            )}
          >
            {product.craftDays} days by hand
          </span>
        )}

        <div
          className={cn(
            'pointer-events-none absolute left-1.5 top-1.5 flex flex-col items-start gap-1.5 sm:left-2 sm:top-2',
            compact && '[&_*]:text-[0.5625rem] sm:[&_*]:text-inherit',
          )}
        >
          {/* On the compact grid only the one badge that changes a decision. */}
          {product.masterpiece && (
            <Badge variant="gold" className={cn(compact && 'hidden sm:inline-flex')}>
              Signed piece
            </Badge>
          )}
          {soldOut ? (
            <Badge variant="muted">Sold</Badge>
          ) : product.stock === 1 ? (
            <Badge
              variant="outline"
              className={cn('bg-background/90', compact && 'hidden sm:inline-flex')}
            >
              One of one
            </Badge>
          ) : null}
          {onSale && !soldOut && (
            <Badge className={cn(compact && 'hidden sm:inline-flex')}>Reduced</Badge>
          )}
        </div>

        <div className={cn('absolute right-2 top-2', compact && 'hidden sm:block')}>
          <WishlistButton productId={product.id} initialWishlisted={wishlisted} />
        </div>
      </div>

      <div className={cn('flex flex-1 flex-col', compact ? 'pt-2 sm:pt-2.5' : 'pt-2.5')}>
        <h3
          className={cn(
            'font-display leading-snug',
            compact ? 'line-clamp-2 text-[0.8125rem] sm:line-clamp-none sm:text-[1.0625rem]' : 'text-[1.0625rem]',
          )}
        >
          <Link
            href={`/product/${product.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {product.name}
          </Link>
        </h3>

        <p
          className={cn(
            'mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground',
            compact && 'hidden sm:line-clamp-2 sm:block',
          )}
        >
          {product.summary}
        </p>

        {/* The cloth only. Hand-days used to run in behind it here, in grey,
            at the size of a footnote — it is now on the plate above, where the
            number can actually do its job. Repeating it would say it twice on
            one card. */}
        {product.fabric && (
          <div
            className={cn(
              'mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground',
              compact && 'hidden sm:flex',
            )}
          >
            <span>{product.fabric.name}</span>
          </div>
        )}

        {/*
          Who drew it.

          On its own line rather than appended to the cloth-and-days row: that
          row is specification, and this is not. It is the one fact on the card
          that names a person, and running it in behind "Tussar Silk · 42 days"
          would file a hand under a list of measurements.

          Only where the store has confirmed it — 15 of the 43 pieces. The rest
          say nothing rather than "artisan unknown", which would read as a gap
          in the record instead of what it is, which is the store not having
          told us yet.

          It follows the same `sm` rule as the row above, so the three-up phone
          grid — where a column is about 105px — gains no height from it.
        */}
        {product.artisan && (
          <p
            className={cn(
              'mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground',
              compact && 'hidden sm:flex',
            )}
          >
            {/* The nib, at 10px. The site's one mark for "a hand did this",
                and the reason this line now reads as an attribution rather
                than as another grey specification. */}
            <svg
              viewBox="0 0 24 24"
              className="h-2.5 w-2.5 shrink-0 text-primary/75"
              aria-hidden="true"
              fill="none"
            >
              <path
                d="M17.8 3.4 20.6 6.2 9.9 16.9l-4.2 1.4 1.4-4.2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            Painted by{' '}
            <span className="font-medium text-foreground/85">{product.artisan}</span>
          </p>
        )}

        <div
          className={cn(
            'mt-auto flex items-baseline gap-2',
            compact ? 'pt-1.5 sm:pt-2.5' : 'pt-2.5',
          )}
        >
          <span className={cn('tabular font-medium', compact && 'text-[0.8125rem] sm:text-base')}>
            {formatPrice(product.price)}
          </span>
          {onSale && (
            <span
              className={cn(
                'tabular text-sm text-muted-foreground line-through',
                compact && 'hidden sm:inline',
              )}
            >
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
          {rating != null && (
            <span
              className={cn(
                'ml-auto text-xs text-muted-foreground',
                compact && 'hidden sm:inline',
              )}
            >
              <span aria-hidden="true">★ </span>
              {rating.toFixed(1)}
              <span className="sr-only">
                {' '}
                out of 5, from {product.ratingCount} reviews
              </span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * The gaps every grid of pieces uses.
 *
 * Stated once and imported, because there are three of these grids — the shop
 * listing, the home page's featured row and the related pieces on a product
 * page — and they were carrying three hand-copied gap strings that had already
 * begun to disagree.
 *
 * Tightened along with the 10% the plates lost. A row gap is read against the
 * height of the thing it separates, so leaving `gap-y-9` under a card that is
 * now a tenth shorter would have *increased* the apparent air between rows
 * while the page was supposed to be getting calmer. The column gaps come in a
 * step at the top end for the same reason.
 */
export const PRODUCT_GRID_GAP =
  'gap-x-2.5 gap-y-5 sm:gap-x-3.5 sm:gap-y-7 md:gap-x-5';

/**
 * The listing grid.
 *
 * Three across at every width. On a phone that is what the store asked for and
 * what suits a catalogue of cloth: at two-up the eye reads one piece at a time,
 * at three-up it reads the collection, and the card switches to its compact
 * density so the extra column costs no legibility.
 *
 * It used to widen to four at `xl`. It no longer does, and that is a decision
 * rather than an oversight — a hand-painted piece is the unit of interest here,
 * and a fourth column buys density by making every drawing smaller on exactly
 * the screens with room to show them properly. Three columns of larger cards
 * shows the work; four shows the inventory.
 */
export function ProductGrid({
  products,
  wishlistIds,
  priorityCount = 6,
  groupEvery,
}: {
  products: ProductCardData[];
  wishlistIds?: Set<string>;
  priorityCount?: number;
  /**
   * Break the run every N cards with a quiet marker.
   *
   * Thirty cards in one column is ten rows, and ten rows with nothing between
   * them is a wall — there is no way to say "about two thirds down" to
   * yourself, and no way to find your place again after opening a piece and
   * coming back. A rule and a number every ten gives the run a scale without
   * turning it back into pages.
   *
   * Omitted, the grid is one unbroken block, which is what a six-card rail on
   * the home page wants.
   */
  groupEvery?: number;
}) {
  if (!groupEvery || products.length <= groupEvery) {
    return (
      <Grid products={products} wishlistIds={wishlistIds} priorityCount={priorityCount} />
    );
  }

  const groups: ProductCardData[][] = [];
  for (let i = 0; i < products.length; i += groupEvery) {
    groups.push(products.slice(i, i + groupEvery));
  }

  return (
    <div>
      {groups.map((group, gi) => {
        const offset = gi * groupEvery;
        return (
          <div key={offset}>
            <Grid
              products={group}
              wishlistIds={wishlistIds}
              // Priority is counted across the whole run, not per group:
              // `i < priorityCount` inside each group would mark the first six
              // of every ten as LCP candidates and eagerly load eighteen images.
              priorityCount={Math.max(0, priorityCount - offset)}
            />

            {/*
              The marker.

              Not a link and not a control — every one of these cards is on
              this page already, and a number that looks like a pager but does
              nothing is worse than no number. It is a reference mark, so it is
              `aria-hidden` and the count beside it carries the same
              information in words for anybody who cannot see the rule.
            */}
            <div className="flex items-center gap-4 py-7 md:py-9" aria-hidden="true">
              <span className="h-px flex-1 bg-border" />
              <span className="tabular font-inscription text-[0.6875rem] uppercase tracking-[0.2em] text-muted-foreground/70">
                {gi + 1}
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** One unbroken block of cards. The grid itself, without the grouping. */
function Grid({
  products,
  wishlistIds,
  priorityCount,
}: {
  products: ProductCardData[];
  wishlistIds?: Set<string>;
  priorityCount: number;
}) {
  return (
    <ul className={cn('grid grid-cols-3', PRODUCT_GRID_GAP)}>
      {products.map((product, i) => (
        <li key={product.id} className="flex">
          <ProductCard
            product={product}
            wishlisted={wishlistIds?.has(product.id)}
            priority={i < priorityCount}
            density="compact"
            className="w-full"
          />
        </li>
      ))}
    </ul>
  );
}
