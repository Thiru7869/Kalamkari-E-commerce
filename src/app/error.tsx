'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { site } from '@/content/site';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with your error reporting service. The digest is the only part
    // safe to show a visitor — the message may contain internals.
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="container py-24 md:py-32">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-display-md">Something went wrong at our end</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Not your fault. Try again — and if it keeps happening, tell us and we will fix it.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={reset}>
            Try again
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">Back to the store</Link>
          </Button>
        </div>

        {error.digest && (
          <p className="tabular mt-8 text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          <a
            href={`mailto:${site.contact.email}`}
            className="text-primary underline underline-offset-4"
          >
            {site.contact.email}
          </a>
        </p>
      </div>
    </div>
  );
}
