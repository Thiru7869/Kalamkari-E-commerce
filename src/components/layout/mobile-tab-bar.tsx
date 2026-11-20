'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Home, LayoutGrid, Search, ShoppingBag } from 'lucide-react';
import { SearchOverlay } from '@/components/shop/search-overlay';
import { cn } from '@/lib/utils';

/**
 * Five things a phone shopper does most: start, browse, look for something,
 * come back to what they saved, and check out.
 *
 * Story, Process, Custom, Journal, Visit and the account are not here. They
 * are reading and one-off tasks rather than shopping loops, and they are all in
 * the menu drawer behind the header's menu button — with the account first.
 *
 * Search opens the same panel the header's search does, over the current page,
 * rather than navigating away. The bag takes its count as a slot from the
 * server (`BagCount`), because the cart is read there.
 */
type Tab =
  | { label: string; href: string; Icon: typeof Home; kind?: undefined }
  | { label: string; href?: undefined; Icon: typeof Home; kind: 'search' };

const tabs: Tab[] = [
  { label: 'Home', href: '/', Icon: Home },
  { label: 'Shop', href: '/shop', Icon: LayoutGrid },
  { label: 'Search', Icon: Search, kind: 'search' },
  { label: 'Wishlist', href: '/wishlist', Icon: Heart },
  { label: 'Bag', href: '/cart', Icon: ShoppingBag },
];

const cell =
  'relative flex h-[4.25rem] w-full flex-col items-center justify-center gap-1 transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring';

/**
 * Phone tab bar. Follows platform conventions rather than inventing its own:
 * fixed to the bottom, persistent labels, safe-area aware, and it does not hide
 * on scroll — a nav bar that disappears is a nav bar you cannot rely on.
 *
 * Hidden on checkout, where any navigation away is a lost order.
 */
export function MobileTabBar({ bagCount }: { bagCount?: React.ReactNode }) {
  const pathname = usePathname();

  const hidden =
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/signin');

  if (hidden) return null;

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {tabs.map((tab) => {
          const { label, Icon } = tab;

          const icon = (active: boolean) => (
            <>
              {/* Active indicator sits on the top edge, aligned with the border. */}
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-x-[22%] top-0 h-0.5 rounded-full bg-primary transition-opacity duration-200 motion-reduce:transition-none',
                  active ? 'opacity-100' : 'opacity-0',
                )}
              />
              <span className="relative">
                <Icon
                  className="h-[1.3rem] w-[1.3rem]"
                  strokeWidth={active ? 2.2 : 1.75}
                  aria-hidden="true"
                />
                {label === 'Bag' && bagCount}
              </span>
              <span className="text-[0.625rem] font-medium leading-none">{label}</span>
            </>
          );

          if (tab.kind === 'search') {
            return (
              <li key={label}>
                <SearchOverlay>
                  <button type="button" className={cn(cell, 'text-muted-foreground')}>
                    {icon(false)}
                  </button>
                </SearchOverlay>
              </li>
            );
          }

          const href = tab.href;
          const isActive =
            href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={label}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(cell, isActive ? 'text-primary' : 'text-muted-foreground')}
              >
                {icon(isActive)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
