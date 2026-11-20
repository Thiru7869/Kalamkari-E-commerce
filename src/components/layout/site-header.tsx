import Link from 'next/link';
import { Suspense } from 'react';
import { Heart, Search, ShoppingBag } from 'lucide-react';
import { getCartCount } from '@/lib/cart';
import { auth } from '@/auth';
import { site } from '@/content/site';
import { mainNav } from '@/content/nav';
import { MobileMenu } from './mobile-menu';
import { DesktopNav } from './desktop-nav';
import { Wordmark } from './wordmark';
import { HeaderShell } from './header-shell';
import { ThemeToggle } from './theme-toggle';
import { AnnouncementBar } from './announcement-bar';
import { ExploreMenu } from './explore-menu';
import { HeaderSearch } from '@/components/shop/header-search';
import { SearchOverlay } from '@/components/shop/search-overlay';

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

      {/* `relative`: the Shop mega panel is positioned against this row, so it
          spans the container instead of hanging off one nav item. */}
      <div className="container relative flex h-16 items-center gap-2 md:h-20 md:gap-3">
        {/* Follows `DesktopNav`, which now appears at `lg` rather than `md` —
            see the note there. The drawer is the navigation for everything
            below that, tablets included. */}
        <div className="flex shrink-0 items-center gap-1 lg:hidden">
          <MobileMenu isSignedIn={Boolean(session?.user)} />
        </div>

        {/*
          `min-w-0`, not `shrink-0`. A flex item defaults to `min-width:auto`,
          which refuses to shrink below its content — so the wordmark used to
          hold its full 256px on a 320px screen and push the cart button off
          the edge rather than give up a pixel.
        */}
        <Link
          href="/"
          // `lg:mr-5` buys the gutter the nav swallowed. With the nav arriving
          // at `lg`, "Sri Vijaya Lakshmi" and "Shop" ended up eight pixels
          // apart — the name read as the first item of the menu rather than as
          // the shop it belongs to. The nav gives the space back through its
          // own tightened padding at the same breakpoint, so the row is no
          // wider than it was.
          className="flex min-w-0 items-center rounded-sm focus-visible:ring-2 focus-visible:ring-ring md:mr-2 lg:mr-5"
          aria-label={`${site.name}, home`}
        >
          <Wordmark />
        </Link>

        <DesktopNav items={mainNav} />

        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          {/* Explore sits immediately before search, as the map before the
              index — one opens everything, the other finds one thing.

              Below `sm` it is icon-only and its whole contents are already in
              the menu drawer beside it, so it is the one header control that
              can go to buy the wordmark the width it needs. The tour skips
              steps whose target is absent, so it drops out cleanly too. */}
          <div className="hidden sm:block">
            <ExploreMenu />
          </div>

          {/*
            Both of these open the panel over the current page rather than
            navigating to /search. Looking something up should not cost the
            visitor the page they were reading — and on a site made of
            long-form pages, it used to cost them two navigations to change
            their mind. /search is still there, and Enter still goes to it.
          */}
          {/*
            The inline search field costs about 200px and now waits for `xl`.

            At `lg` the row is 960px of content against a 500px nav and a
            420px control cluster — the field was the difference between the
            wordmark having 204px and having 4px, and a search box is worth
            less than the name of the shop. The icon below opens the identical
            overlay, so nothing is lost between 1024px and 1279px except a
            visible input.
          */}
          <div className="hidden xl:block">
            <HeaderSearch className="mx-1" />
          </div>

          <SearchOverlay>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-sm transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:hidden"
            >
              <Search className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
              <span className="sr-only">Search</span>
            </button>
          </SearchOverlay>

          <ThemeToggle className="hidden sm:inline-flex" />

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
