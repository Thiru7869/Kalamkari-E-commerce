'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Paintbrush, PencilLine, User } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Five destinations, chosen by what a phone visitor actually does.
 *
 * Custom earns its place: on a catalogue that is almost entirely one-of-one,
 * the commonest reason a visitor leaves empty-handed is that the piece they
 * wanted has already sold — and the answer to that is a commission, not a
 * second lap of the shop.
 */
const tabs = [
  { label: 'Home', href: '/', Icon: Home },
  { label: 'Shop', href: '/shop', Icon: LayoutGrid },
  { label: 'Custom', href: '/custom', Icon: PencilLine },
  { label: 'Process', href: '/process', Icon: Paintbrush },
  { label: 'Account', href: '/account', Icon: User },
];

/**
 * Phone tab bar. This is the single biggest contributor to the site feeling
 * like an installed app rather than a website, so it follows platform
 * conventions rather than inventing its own: fixed to the bottom, four
 * destinations, persistent labels, safe-area aware, and it does not hide on
 * scroll — a nav bar that disappears is a nav bar you cannot rely on.
 *
 * Hidden on checkout, where any navigation away is a lost order.
 */
export function MobileTabBar() {
  const pathname = usePathname();

  const hidden =
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/signin');

  if (hidden) return null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {tabs.map(({ label, href, Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href}>
              <Link
                href={href}
                data-tour={href === '/shop' ? 'shop' : href === '/custom' ? 'custom' : href === '/process' ? 'process' : undefined}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex h-[4.25rem] flex-col items-center justify-center gap-1 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {/* Active indicator sits on the top edge, aligned with the border. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-x-[22%] top-0 h-0.5 rounded-full bg-primary transition-opacity duration-200',
                    isActive ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <Icon
                  className="h-[1.3rem] w-[1.3rem]"
                  strokeWidth={isActive ? 2.2 : 1.75}
                  aria-hidden="true"
                />
                <span className="text-[0.625rem] font-medium leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
