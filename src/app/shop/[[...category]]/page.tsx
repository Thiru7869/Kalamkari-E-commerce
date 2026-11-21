import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { ShopView } from '@/components/shop/shop-view';
import { getCategoryBySlug } from '@/lib/queries';
import { shopCategories } from '@/content/site';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type Params = Promise<{ category?: string[] }>;

/**
 * `/shop/<category>` only. The bare `/shop` is the home page now and is
 * redirected there (next.config.mjs, permanent, query string kept); the
 * fallback below is the same redirect for any path that reaches the page.
 */
export function generateStaticParams() {
  return shopCategories.map((c) => ({ category: [c.slug] }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category } = await params;
  const slug = category?.[0];
  if (!slug) return {};

  const found = await getCategoryBySlug(slug);
  if (!found) return {};
  return {
    title: `${found.name} — hand-painted Kalamkari`,
    description: `${found.tagline} ${found.description}`.slice(0, 300),
    alternates: { canonical: `/shop/${found.slug}` },
  };
}

export default async function ShopCategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { category } = await params;
  const sp = await searchParams;

  if (!category || category.length === 0) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(sp)) {
      for (const v of Array.isArray(value) ? value : value === undefined ? [] : [value]) {
        query.append(key, v);
      }
    }
    permanentRedirect(query.size ? `/?${query}` : '/');
  }

  // One category deep; anything further is a bad URL.
  if (category.length > 1) notFound();

  return <ShopView categorySlug={category[0]} searchParams={sp} />;
}
