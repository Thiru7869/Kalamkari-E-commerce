import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { shopCategories } from '@/content/site';

export default function NotFound() {
  return (
    <div className="container section-y-lg">
      <div className="mx-auto max-w-lg text-center">
        <p className="font-display text-5xl text-primary/40">404</p>
        <h1 className="mt-5 text-display-md">This page is not here</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          The link may be old, or the piece may have sold — everything in this store is one
          of one, and sold pieces are eventually taken down.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/shop">See what is here now</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">Back to the store</Link>
          </Button>
        </div>

        <nav aria-label="Categories" className="mt-12">
          <p className="text-sm text-muted-foreground">Or go straight to:</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-2">
            {shopCategories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/shop/${c.slug}`}
                  className="inline-flex h-9 items-center rounded-sm border border-border px-3 text-sm transition-colors hover:border-foreground/40"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
