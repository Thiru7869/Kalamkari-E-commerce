import Link from 'next/link';
import { Suspense } from 'react';
import { Heart, Search, ShoppingBag } from 'lucide-react';
import { getCartCount } from '@/lib/cart';
import { auth } from '@/auth';
import { mainNav, site } from '@/content/site';
import { MobileMenu } from './mobile-menu';
import { DesktopNav } from './desktop-nav';
import { Wordmark } from './wordmark';
import { HeaderShell } from './header-shell';

async function CartBadge() {
  const count = await getCartCount();
  if (count === 0) return null;
  return (
    <span
      className="tabular absolute -right-0.5 -top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-semibold text-primary-foreground"
      aria-hidden="true"
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}

async function CartCountLabel() {
  const count = await getCartCount();
  return <span className="sr-only">{count === 0 ? 'Cart, empty' : `Cart, ${count} items`}</span>;
}

export async function SiteHeader() {
  const session = await auth();

  return (
    <HeaderShell>
      {/*
        The announcement bar states the one fact that most distinguishes this
        store, on every page. It is not a promotion and does not rotate.
      */}
      <div className="border-b border-border/60 bg-kasim-900 text-cotton-200">
        <div className="container flex h-9 items-center justify-center gap-2 text-center">
          <p className="text-[0.6875rem] uppercase tracking-[0.14em]">
            Hand-painted in {site.location.town} · Natural dyes only · No blocks, no prints
          </p>
        </div>
      </div>

      <div className="container flex h-16 items-center gap-3 md:h-20">
        <div className="flex items-center gap-1 md:hidden">
          <MobileMenu isSignedIn={Boolean(session?.user)} />
        </div>

        <Link
          href="/"
          className="flex shrink-0 items-center rounded-sm focus-visible:ring-2 focus-visible:ring-ring md:mr-2"
          aria-label={`${site.name}, home`}
        >
          <Wordmark />
        </Link>

        <DesktopNav items={mainNav} />

        <div className="ml-auto flex items-center gap-0.5">
          <Link
            href="/search"
            className="inline-flex h-11 w-11 items-center justify-center rounded-sm transition-colors hover:bg-foreground/5"
          >
            <Search className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
            <span className="sr-only">Search</span>
          </Link>

          <Link
            href="/wishlist"
            className="hidden h-11 w-11 items-center justify-center rounded-sm transition-colors hover:bg-foreground/5 sm:inline-flex"
          >
            <Heart className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
            <span className="sr-only">Wishlist</span>
          </Link>

          <Link
            href="/cart"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-sm transition-colors hover:bg-foreground/5"
          >
            <ShoppingBag className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
            <Suspense fallback={null}>
              <CartBadge />
            </Suspense>
            <Suspense fallback={<span className="sr-only">Cart</span>}>
              <CartCountLabel />
            </Suspense>
          </Link>
        </div>
      </div>
    </HeaderShell>
  );
}
