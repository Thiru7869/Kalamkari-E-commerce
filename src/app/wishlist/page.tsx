import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ProductGrid } from '@/components/shop/product-card';
import { Button } from '@/components/ui/button';
import { productCardSelect } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Your wishlist',
  robots: { index: false, follow: false },
};

export default async function WishlistPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="container py-20 md:py-28">
        <div className="mx-auto max-w-md text-center">
          <Heart className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-5 text-display-md">Sign in to see your wishlist</h1>
          <p className="mt-4 text-muted-foreground">
            Because every piece here is one of one, a wishlist is genuinely useful — it
            tells you if something you were considering has gone.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/signin?callbackUrl=/wishlist">Sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { product: { select: productCardSelect } },
  });

  const products = items.map((i) => i.product);
  const sold = products.filter((p) => p.stock < 1).length;

  if (products.length === 0) {
    return (
      <div className="container py-20 md:py-28">
        <div className="mx-auto max-w-md text-center">
          <Heart className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-5 text-display-md">Nothing saved yet</h1>
          <p className="mt-4 text-muted-foreground">
            Tap the heart on any piece to keep it here.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/shop">Browse the store</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-14">
      <h1 className="text-display-lg">Your wishlist</h1>
      <p className="mt-2 text-muted-foreground">
        {products.length} saved
        {sold > 0 && ` · ${sold} since sold`}
      </p>

      <div className="mt-10">
        <ProductGrid
          products={products}
          wishlistIds={new Set(products.map((p) => p.id))}
        />
      </div>
    </div>
  );
}
