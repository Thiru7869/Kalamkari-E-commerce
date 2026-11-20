import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { absoluteUrl } from '@/lib/utils';
import { shopCategories } from '@/content/site';
import { typeDefs, collectionDefs } from '@/content/catalogue';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/collections'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/archive'), lastModified: now, changeFrequency: 'weekly', priority: 0.4 },
    // The process page is the store's strongest claim to authority and the
    // most linkable thing on the site.
    { url: absoluteUrl('/process'), lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: absoluteUrl('/our-story'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    // Reachable from the footer alone inside the site, and deliberately still
    // here. That rule is about how the site navigates — an essay does not
    // belong in a header built for shopping — not an instruction to hide the
    // page. It answers "what is Kalamkari and why does it matter", which is a
    // thing people search for without knowing this store exists.
    { url: absoluteUrl('/heritage'), lastModified: now, changeFrequency: 'yearly', priority: 0.8 },
    { url: absoluteUrl('/heritage/history'), lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: absoluteUrl('/heritage/craftsmanship'), lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: absoluteUrl('/heritage/culture'), lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: absoluteUrl('/heritage/artisans'), lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: absoluteUrl('/heritage/motifs'), lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: absoluteUrl('/heritage/colours'), lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: absoluteUrl('/custom'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/journal'), lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: absoluteUrl('/contact'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    // Ranked with the guides rather than the legal pages: it answers the
    // questions people actually search ("is kalamkari printed", "how to wash
    // kalamkari") and carries FAQPage structured data.
    { url: absoluteUrl('/faq'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/care'), lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: absoluteUrl('/shipping'), lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: absoluteUrl('/orders/track'), lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: absoluteUrl('/privacy'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: absoluteUrl('/terms'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  return [
    ...staticRoutes,
    ...shopCategories.map((c) => ({
      url: absoluteUrl(`/shop/${c.slug}`),
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    // The editorial type pages answer the question a search engine visitor
    // actually arrives with, so they rank above the filtered grid.
    ...typeDefs.map((t) => ({
      url: absoluteUrl(`/types/${t.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...collectionDefs.map((c) => ({
      url: absoluteUrl(`/collections/${c.slug}`),
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.75,
    })),
    ...products.map((p) => ({
      url: absoluteUrl(`/product/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: absoluteUrl(`/journal/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
