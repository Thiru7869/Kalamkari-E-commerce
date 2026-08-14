import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { ProductGallery } from '@/components/shop/product-gallery';
import { AddToCart } from '@/components/shop/add-to-cart';
import { WishlistButton } from '@/components/shop/wishlist-button';
import { ProductCard, PRODUCT_GRID_GAP } from '@/components/shop/product-card';
import { RecordView } from '@/components/shop/record-view';
import { RecentlyViewed } from '@/components/shop/recently-viewed';
import { ReviewSection } from '@/components/shop/review-section';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Badge, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/primitives';
import { getProductBySlug, getRelatedProducts, getReviewEligibility } from '@/lib/queries';
import { getWishlistIds } from '@/lib/cart';
import { prisma } from '@/lib/prisma';
import { toList, primaryImage } from '@/lib/serialize';
import { formatPrice, averageRating, absoluteUrl, cn } from '@/lib/utils';
import { site } from '@/content/site';

type Params = Promise<{ slug: string }>;

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true },
  });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const image = primaryImage(product.images);

  return {
    title: product.name,
    description: `${product.summary} Hand-painted in ${site.location.town} with natural dyes only.`,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: 'website',
      title: product.name,
      description: product.summary,
      images: [{ url: image, width: 1200, height: 1600, alt: product.name }],
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status !== 'ACTIVE') notFound();

  const motifIds = product.motifs.map((m) => m.motifId);
  const [related, wishlistIds, reviewEligibility] = await Promise.all([
    getRelatedProducts(product.id, product.categoryId, motifIds),
    getWishlistIds(),
    getReviewEligibility(product.id),
  ]);

  const images = toList(product.images);
  const dyes = toList(product.naturalDyes);
  const care = toList(product.careNotes);
  const rating = averageRating(product.ratingSum, product.ratingCount);
  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;
  const soldOut = product.stock < 1;

  return (
    <>
      <div className="container pt-6 md:pt-8">
        <Breadcrumbs
          trail={[
            { label: 'Shop', href: '/shop' },
            { label: product.category.name, href: `/shop/${product.category.slug}` },
            { label: product.name },
          ]}
        />
      </div>

      <article className="container pb-16 pt-6 md:pb-24">
        <div className="lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14 xl:gap-20">
          <ProductGallery images={images} name={product.name} />

          <div className="mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-28">
              <div className="flex flex-wrap gap-2">
                {product.masterpiece && <Badge variant="gold">Signed piece</Badge>}
                {product.stock === 1 && !soldOut && <Badge variant="outline">One of one</Badge>}
                {soldOut && <Badge variant="muted">Sold</Badge>}
              </div>

              <h1 className="mt-3 text-display-md leading-tight">{product.name}</h1>

              <p className="mt-3 text-body-lg text-muted-foreground">{product.summary}</p>

              <div className="mt-6 flex flex-wrap items-baseline gap-3">
                <p className="tabular font-display text-3xl">{formatPrice(product.price)}</p>
                {onSale && (
                  <p className="tabular text-lg text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </p>
                )}
                {rating != null && (
                  <p className="text-sm text-muted-foreground">
                    <span aria-hidden="true">★ </span>
                    {rating.toFixed(1)}
                    <span className="sr-only"> out of 5</span> ({product.ratingCount})
                  </p>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Inclusive of all taxes.{' '}
                {product.price >= site.shipping.freeAbove
                  ? 'Shipping included.'
                  : `Shipping ${formatPrice(site.shipping.flatRate)}.`}
              </p>

              {/*
                Why it costs what it costs, at the point the question is asked.
                The site argues price-through-labour on every other page and
                then showed a bare number here. Both figures are real columns on
                the piece, not marketing: craftDays is what was recorded, and
                the dye count is the length of the list below.
              */}
              {(product.craftDays || dyes.length > 0) && (
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {product.craftDays
                    ? `${product.craftDays} days of one person's hand-work`
                    : 'Drawn freehand with a bamboo pen'}
                  {dyes.length > 0 && (
                    <>
                      , in {dyes.length} natural {dyes.length === 1 ? 'dye' : 'dyes'} prepared
                      separately
                    </>
                  )}
                  . Nothing here was repeated from a block or a screen, so this is the price
                  of the making rather than of a run.
                </p>
              )}

              <div className="mt-7 flex items-start gap-3">
                <AddToCart productId={product.id} stock={product.stock} className="flex-1" />
                {!soldOut && (
                  <WishlistButton
                    productId={product.id}
                    initialWishlisted={wishlistIds.has(product.id)}
                    className="mt-0 h-11 border border-input"
                  />
                )}
              </div>

              {/* The facts a buyer of hand-painted work actually needs. */}
              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-border py-6 text-sm">
                {product.fabric && (
                  <div>
                    <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Cloth</dt>
                    <dd className="mt-1">{product.fabric.name}</dd>
                  </div>
                )}
                {product.craftDays && (
                  <div>
                    <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      Hand-work
                    </dt>
                    <dd className="tabular mt-1">{product.craftDays} days</dd>
                  </div>
                )}
                {product.dimensions && (
                  <div className="col-span-2">
                    <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      Size
                    </dt>
                    <dd className="mt-1">{product.dimensions}</dd>
                  </div>
                )}
                {product.artisan && (
                  <div className="col-span-2">
                    <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      Painted by
                    </dt>
                    <dd className="mt-1">{product.artisan}</dd>
                  </div>
                )}
              </dl>

              {dyes.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Colours on this piece
                  </h2>
                  <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                    {dyes.map((dye) => (
                      <li key={dye} className="flex items-center gap-2 text-sm">
                        <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                        {dye}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    All from iron, root, bark, flower and rind. Nothing on this cloth came
                    out of a chemical dye packet.
                  </p>
                </div>
              )}

              <Accordion type="multiple" className="mt-8">
                <AccordionItem value="description">
                  <AccordionTrigger>About this piece</AccordionTrigger>
                  <AccordionContent>
                    {product.description.split('\n\n').map((para, i) => (
                      <p key={i} className={i > 0 ? 'mt-3' : undefined}>
                        {para}
                      </p>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {product.motifs.length > 0 && (
                  <AccordionItem value="motif">
                    <AccordionTrigger>The story in the drawing</AccordionTrigger>
                    <AccordionContent>
                      <ul className="flex flex-col gap-4">
                        {product.motifs.map(({ motif }) => (
                          <li key={motif.id}>
                            <h3 className="font-medium text-foreground">{motif.name}</h3>
                            <p className="mt-1">{motif.story}</p>
                            <Link
                              href={`/shop?motif=${motif.slug}`}
                              className="mt-2 inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                            >
                              See other {motif.name} pieces
                              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {(care.length > 0 || product.fabric?.careNote) && (
                  <AccordionItem value="care">
                    <AccordionTrigger>Care &amp; washing</AccordionTrigger>
                    <AccordionContent>
                      <ul className="flex list-disc flex-col gap-2 pl-4">
                        {care.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                        {product.fabric?.careNote && <li>{product.fabric.careNote}</li>}
                      </ul>
                      <Link
                        href="/care"
                        className="mt-4 inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                      >
                        Why naturally dyed cloth is cared for differently
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {product.fabric && (
                  <AccordionItem value="fabric">
                    <AccordionTrigger>About {product.fabric.name}</AccordionTrigger>
                    <AccordionContent>
                      <p>{product.fabric.description}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                <AccordionItem value="shipping">
                  <AccordionTrigger>Shipping &amp; returns</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Dispatched from {site.location.town}. Delivery across India in{' '}
                      {site.shipping.domesticDays}. Free over{' '}
                      {formatPrice(site.shipping.freeAbove)}; otherwise{' '}
                      {formatPrice(site.shipping.flatRate)}.
                    </p>
                    <p className="mt-3">{site.shipping.note}</p>
                    <p className="mt-3">
                      Small variations in line, colour depth and the border repeat are how
                      hand painting is identified. They are not defects and are not grounds
                      for return — but if a piece arrives damaged or is not what was
                      described, write to us and we will make it right.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <p className="mt-8 rounded-sm border border-border bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">
                Not sure? Every piece here went through{' '}
                <Link href="/process" className="text-primary underline underline-offset-4">
                  the same twenty-three steps
                </Link>
                . If you would like something painted specifically for you instead,{' '}
                <Link href="/custom" className="text-primary underline underline-offset-4">
                  tell us what you have in mind
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </article>

      <Suspense fallback={null}>
        <ReviewSection
          productId={product.id}
          reviews={product.reviews}
          rating={rating}
          count={product.ratingCount}
          canReview={reviewEligibility.canReview}
          ineligibleReason={reviewEligibility.reason}
        />
      </Suspense>

      {related.length > 0 && (
        <section className="border-t border-border section-y">
          <div className="container">
            <h2 className="text-display-sm">Painted in the same tradition</h2>
            <ul className={cn('mt-7 grid grid-cols-2 md:grid-cols-4', PRODUCT_GRID_GAP)}>
              {related.map((p) => (
                <li key={p.id} className="flex">
                  <ProductCard product={p} wishlisted={wishlistIds.has(p.id)} className="w-full" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Renders nothing. Records the view after paint, where a cookie may
          legally be set. */}
      <RecordView productId={product.id} />

      {/* Suppressed on its own page: the current piece is excluded, and with
          fewer than two others left the section does not render at all. */}
      <Suspense fallback={null}>
        <RecentlyViewed excludeId={product.id} />
      </Suspense>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.summary,
            image: images.map((i) => absoluteUrl(i)),
            sku: product.slug,
            category: product.category.name,
            material: product.fabric?.name,
            brand: { '@type': 'Brand', name: site.name },
            offers: {
              '@type': 'Offer',
              url: absoluteUrl(`/product/${product.slug}`),
              priceCurrency: 'INR',
              price: (product.price / 100).toFixed(2),
              availability: soldOut
                ? 'https://schema.org/SoldOut'
                : 'https://schema.org/InStock',
              itemCondition: 'https://schema.org/NewCondition',
              seller: { '@type': 'Organization', name: site.name },
            },
            ...(rating != null && product.ratingCount > 0
              ? {
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: rating,
                    reviewCount: product.ratingCount,
                  },
                }
              : {}),
          }),
        }}
      />
    </>
  );
}
