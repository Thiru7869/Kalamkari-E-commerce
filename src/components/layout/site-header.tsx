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
import { ThemeToggle } from './theme-toggle';
import { AnnouncementBar } from './announcement-bar';
import { ExploreMenu } from './explore-menu';

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
      {/* Craft facts and shipping terms, moving. Pauses on hover and focus,
          rotates rather than scrolls under reduced motion, and closes. */}
      <AnnouncementBar />

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
          {/* Explore sits immediately before search, as the map before the
              index — one opens everything, the other finds one thing. */}
          <ExploreMenu />

          <Link
            href="/search"
            data-tour="search"
            className="inline-flex h-11 w-11 items-center justify-center rounded-sm transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Search className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
            <span className="sr-only">Search</span>
          </Link>

          <ThemeToggle className="hidden sm:inline-flex" data-tour="theme" />

          <Link
            href="/wishlist"
            className="hidden h-11 w-11 items-center justify-center rounded-sm transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
          >
            <Heart className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
            <span className="sr-only">Wishlist</span>
          </Link>

          <Link
            href="/cart"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-sm transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
