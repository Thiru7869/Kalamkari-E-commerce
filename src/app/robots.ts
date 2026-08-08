import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Nothing here is secret, but none of it is useful in an index, and
        // crawling it wastes crawl budget on a small catalogue.
        disallow: [
          '/api/',
          '/admin',
          '/account',
          '/cart',
          '/checkout',
          '/wishlist',
          '/signin',
          '/search',
          '/offline',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl(),
  };
}
