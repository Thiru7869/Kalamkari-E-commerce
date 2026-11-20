import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ProductGrid } from '@/components/shop/product-card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { productCardSelect } from '@/lib/queries';
import { readGuestWishlist } from '@/lib/cart';

export const metadata: Metadata = {
  title: 'Your wishlist',
  robots: { index: false, follow: false },
};

export default async function WishlistPage() {
  const session = await auth();

  const isGuest = !session?.user?.id;

  // A signed-in visitor's list is a table; a guest's is a cookie of ids, read
  // here without writing anything (this is render). Both end as the same list
  // of cards, so everything below is one path.
  let products: Awaited<ReturnType<typeof loadSigned>>;
  if (session?.user?.id) {
    products = await loadSigned(session.user.id);
  } else {
    products = await loadGuest(await readGuestWishlist());
  }

  const sold = products.filter((p) => p.stock < 1).length;

  if (products.length === 0) {
    return (
      <div className="container section-y-lg">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card"><Heart className="h-6 w-6 text-primary" aria-hidden="true" /></span>
          <h1 className="mt-5 text-display-md">Nothing saved yet</h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Tap the heart on any piece to keep it here. It is worth doing on this
            catalogue in particular: almost everything is the only one of itself, so a
            piece you are still thinking about on Friday may not be there on Monday.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/shop">Browse the store</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/custom">Have one painted</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container section-y-sm">
      <PageHeader
        eyebrow="Saved"
        title="Your wishlist"
        description={
          <>
            {products.length} saved
            {sold > 0 && ` · ${sold} since sold`}
          </>
        }
        action={
          <Button asChild variant="outline">
            <Link href="/shop">Keep browsing</Link>
          </Button>
        }
      />

      {isGuest && (
        <p className="mt-4 text-sm text-muted-foreground">
          Saved on this device.{' '}
          <Link
            href="/signin?callbackUrl=/wishlist"
            className="text-primary underline underline-offset-4"
          >
            Sign in
          </Link>{' '}
          to keep them with your account.
        </p>
      )}

      <div className="mt-8 md:mt-10">
        <ProductGrid
          products={products}
          wishlistIds={new Set(products.map((p) => p.id))}
        />
      </div>
    </div>
  );
}

async function loadSigned(userId: string) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { product: { select: productCardSelect } },
  });
  return items.map((i) => i.product);
}

async function loadGuest(ids: string[]) {
  if (ids.length === 0) return [];
  const found = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: productCardSelect,
  });
  // The cookie's order is the order they were saved in, newest first.
  const rank = new Map(ids.map((id, i) => [id, i]));
  return found.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
}
