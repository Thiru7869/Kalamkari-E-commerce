import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { WishlistButton } from './wishlist-button';
import { formatPrice, averageRating } from '@/lib/utils';
import { primaryImage, toList } from '@/lib/serialize';
import type { ProductCardData } from '@/lib/queries';
import { cn } from '@/lib/utils';

export function ProductCard({
  product,
  wishlisted = false,
  priority = false,
  className,
  sizes = '(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw',
}: {
  product: ProductCardData;
  wishlisted?: boolean;
  /** Set on the first row above the fold so LCP is a real product image. */
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const image = primaryImage(product.images);
  /*
    The second photograph of the piece, where there is one. It is already in
    `images` — most pieces carry a detail or a reverse as their second frame —
    so showing it costs no query and no new asset.
  */
  const secondImage = toList(product.images)[1];
  const rating = averageRating(product.ratingSum, product.ratingCount);
  const soldOut = product.stock < 1;
  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;

  return (
    <article className={cn('group relative flex flex-col', className)}>
      {/*
        5:6, not 3:4.

        At a fixed column width the card's height is set entirely by this
        ratio: 3:4 makes the plate 1.333 times its own width, 5:6 makes it
        1.2 — exactly 10% shorter, with nothing else on the card touched. It is
        expressed as a ratio rather than a height so it holds at every column
        width, from the two-up phone grid to the four-up desktop one.

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
          The second view, on hover and on keyboard focus.

          Only where a pointer can hover. On a touch screen `:hover` sticks to
          whatever was last tapped, so without the media query a phone would
          leave one card showing its second photograph for no reason a visitor
          could see. Phones get the second view on the piece's own page, where
          the gallery has a swipeable rail.

          Decorative — the first image carries the alt text — and withheld from
          sold pieces, whose first image is already dimmed and which nobody is
          choosing between.
        */}
        {secondImage && !soldOut && (
          <Image
            src={secondImage}
            alt=""
            aria-hidden="true"
            fill
            sizes={sizes}
            className={cn(
              'pointer-events-none object-cover opacity-0',
              'transition-opacity duration-300 ease-out motion-reduce:transition-none',
              '[@media(hover:hover)]:group-hover:opacity-100',
              'group-focus-within:opacity-100',
            )}
          />
        )}

        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1.5">
          {product.masterpiece && <Badge variant="gold">Signed piece</Badge>}
          {soldOut ? (
            <Badge variant="muted">Sold</Badge>
          ) : product.stock === 1 ? (
            <Badge variant="outline" className="bg-background/90">
              One of one
            </Badge>
          ) : null}
          {onSale && !soldOut && <Badge>Reduced</Badge>}
        </div>

        <div className="absolute right-2 top-2">
          <WishlistButton productId={product.id} initialWishlisted={wishlisted} />
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-2.5">
        <h3 className="font-display text-lg leading-snug">
          <Link
            href={`/product/${product.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
          {product.summary}
        </p>

        {/* The cloth only. */}
        {product.fabric && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span>{product.fabric.name}</span>
          </div>
        )}

        {/*
          Days of hand-work, as a plain line.

          A saree is priced on how many days one person spent drawing it, so the
          figure stays on the card. It used to sit on the photograph in a blurred
          chip, which covered part of the drawing; it now stands under the cloth,
          in the same tracked capitals the site uses for every label.
        */}
        {product.craftDays != null && !soldOut && (
          <p className="tabular mt-1.5 font-inscription text-label uppercase tracking-[0.12em] text-muted-foreground">
            {product.craftDays} days by hand
          </p>
        )}

        {/*
          Who drew it.

          On its own line rather than appended to the cloth row: that row is
          specification, and this is not. It is the one fact on the card that
          names a person.

          Only where the store has confirmed it — 15 of the 43 pieces. The rest
          say nothing rather than "artisan unknown", which would read as a gap
          in the record instead of what it is, which is the store not having
          told us yet.
        */}
        {product.artisan && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {/* The nib, at 10px. The site's one mark for "a hand did this". */}
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

        <div className="mt-auto flex items-baseline gap-2 pt-2.5">
          <span className="tabular font-medium">{formatPrice(product.price)}</span>
          {onSale && (
            <span className="tabular text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
          {rating != null && (
            <span className="ml-auto text-xs text-muted-foreground">
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
 * Stated once and imported, because there are several of these grids — the shop
 * listing, the type and collection pages and the related pieces on a product
 * page — and they were carrying hand-copied gap strings that had already begun
 * to disagree.
 *
 * A row gap is read against the height of the thing it separates, so the row
 * gap stays modest under a 5:6 plate: a larger one would add air between rows
 * while the page is supposed to be getting calmer.
 */
export const PRODUCT_GRID_GAP =
  'gap-x-2.5 gap-y-5 sm:gap-x-3.5 sm:gap-y-7 md:gap-x-5';

/**
 * The listing grid.
 *
 * Two across on a phone, three from `md`, four from `xl`. Two-up lets the card
 * carry everything it has — name, cloth, days, price, the wishlist heart at a
 * proper touch size — where the three-up grid it replaced had to strip all of
 * that away on a phone to fit a column of about 105px.
 *
 * `withSidebar` is for the shop listing, which gives the filters a 16rem column
 * from `lg`. Four columns in what is left would make each plate roughly 205px
 * at `xl`, smaller than the three-up they replace, so that grid stays at three
 * until `2xl`, where the container stops growing and four fit comfortably.
 */
export function ProductGrid({
  products,
  wishlistIds,
  priorityCount = 6,
  groupEvery,
  withSidebar = false,
}: {
  products: ProductCardData[];
  wishlistIds?: Set<string>;
  priorityCount?: number;
  /**
   * Break the run every N cards with a quiet marker.
   *
   * Thirty cards in one column is a wall — there is no way to say "about two
   * thirds down" to yourself, and no way to find your place again after opening
   * a piece and coming back. A rule and a number every ten gives the run a
   * scale without turning it back into pages.
   *
   * Omitted, the grid is one unbroken block, which is what a short rail wants.
   */
  groupEvery?: number;
  /** The grid sits beside the filter column, so it has less width to spend. */
  withSidebar?: boolean;
}) {
  if (!groupEvery || products.length <= groupEvery) {
    return (
      <Grid
        products={products}
        wishlistIds={wishlistIds}
        priorityCount={priorityCount}
        withSidebar={withSidebar}
      />
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
              withSidebar={withSidebar}
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
              <span className="tabular font-inscription text-label uppercase tracking-[0.2em] text-muted-foreground/70">
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
  withSidebar,
}: {
  products: ProductCardData[];
  wishlistIds?: Set<string>;
  priorityCount: number;
  withSidebar: boolean;
}) {
  return (
    <ul
      className={cn(
        'grid grid-cols-2 md:grid-cols-3',
        withSidebar ? '2xl:grid-cols-4' : 'xl:grid-cols-4',
        PRODUCT_GRID_GAP,
      )}
    >
      {products.map((product, i) => (
        <li key={product.id} className="flex">
          <ProductCard
            product={product}
            wishlisted={wishlistIds?.has(product.id)}
            priority={i < priorityCount}
            className="w-full"
          />
        </li>
      ))}
    </ul>
  );
}
