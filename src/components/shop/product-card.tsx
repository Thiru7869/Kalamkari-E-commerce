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
  sizes = '(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw',
}: {
  product: ProductCardData;
  wishlisted?: boolean;
  /** Set on the first row above the fold so LCP is a real product image. */
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
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

      <div className="flex flex-1 flex-col pt-3">
        <h3 className="font-display text-[1.0625rem] leading-snug">
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

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {product.fabric && <span>{product.fabric.name}</span>}
          {product.fabric && product.craftDays && <span aria-hidden="true">·</span>}
          {product.craftDays && (
            <span>
              {product.craftDays} days<span className="sr-only"> of hand-work</span>
            </span>
          )}
        </div>

        <div className="mt-auto flex items-baseline gap-2 pt-3">
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

export function ProductGrid({
  products,
  wishlistIds,
  priorityCount = 4,
}: {
  products: ProductCardData[];
  wishlistIds?: Set<string>;
  priorityCount?: number;
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
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
