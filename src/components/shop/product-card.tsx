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
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-cotton-300">
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

      <div className={cn('flex flex-1 flex-col', compact ? 'pt-2 sm:pt-3' : 'pt-3')}>
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

        <div
          className={cn(
            'mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground',
            compact && 'hidden sm:flex',
          )}
        >
          {product.fabric && <span>{product.fabric.name}</span>}
          {product.fabric && product.craftDays && <span aria-hidden="true">·</span>}
          {product.craftDays && (
            <span>
              {product.craftDays} days<span className="sr-only"> of hand-work</span>
            </span>
          )}
        </div>

        <div
          className={cn(
            'mt-auto flex items-baseline gap-2',
            compact ? 'pt-1.5 sm:pt-3' : 'pt-3',
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
 * The listing grid.
 *
 * Three across on a phone, which is what the store asked for and what suits a
 * catalogue of cloth: at two-up the eye reads one piece at a time, at three-up
 * it reads the collection. The card switches to its compact density at the
 * same breakpoint so the extra column costs no legibility.
 */
export function ProductGrid({
  products,
  wishlistIds,
  priorityCount = 6,
}: {
  products: ProductCardData[];
  wishlistIds?: Set<string>;
  priorityCount?: number;
}) {
  return (
    <ul className="grid grid-cols-3 gap-x-2.5 gap-y-6 sm:gap-x-4 sm:gap-y-9 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
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
