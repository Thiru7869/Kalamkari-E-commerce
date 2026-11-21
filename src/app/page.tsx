import type { Metadata } from 'next';
import { ShopView } from '@/components/shop/shop-view';
import { site } from '@/content/site';
import { absoluteUrl } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Hand-painted Kalamkari from Srikalahasti — natural dyes only',
  description: site.description,
  alternates: { canonical: '/' },
};

/**
 * The home page is the shop.
 *
 * A first-time buyer lands on the pieces, with the filters, the types and the
 * sort in reach, and the rest of the site (collections, the craft, the sold
 * archive, commissions) one link away. The listing itself is `ShopView`, shared
 * with `/shop/<category>`; `/shop` redirects here with its query string intact.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  return (
    <>
      <ShopView searchParams={sp} />

      {/* Structured data: the store as a local business. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Store',
            name: site.name,
            description: site.description,
            url: absoluteUrl(),
            image: absoluteUrl('/images/og/default.jpg'),
            address: {
              '@type': 'PostalAddress',
              streetAddress: site.location.street,
              addressLocality: site.location.town,
              addressRegion: site.location.state,
              postalCode: site.location.postalCode,
              addressCountry: 'IN',
            },
            hasMap: site.location.mapsUrl,
            // No openingHoursSpecification: the closing time is not published,
            // and schema.org has no way to state an opening time alone without
            // asserting a closing one we would be inventing.
            makesOffer: {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Product',
                name: 'Hand-painted Srikalahasti Kalamkari',
                material: 'Natural dyes on cotton and silk',
              },
            },
          }),
        }}
      />
    </>
  );
}
