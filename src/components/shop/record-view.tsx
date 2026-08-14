'use client';

import { useEffect } from 'react';
import { recordProductView } from '@/app/actions/product-view';

/**
 * Renders nothing; records that this piece was opened.
 *
 * An effect rather than anything in the render path, for two reasons. The
 * action sets a cookie, which a Server Component render may not do. And a view
 * counter must never be on the critical path of the page it is counting — this
 * fires after paint, and if it fails the visitor is not told, because nothing
 * they came for depends on it.
 *
 * Deliberately not awaited and deliberately not retried. A dropped count is a
 * dropped count.
 */
export function RecordView({ productId }: { productId: string }) {
  useEffect(() => {
    let cancelled = false;
    // Guarded so a unmount mid-flight cannot surface a rejection from a page
    // the reader has already left.
    void recordProductView(productId).catch(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  return null;
}
