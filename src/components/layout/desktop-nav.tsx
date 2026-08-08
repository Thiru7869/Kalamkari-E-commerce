'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { NavItem } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * Desktop navigation with a single-level dropdown for Shop.
 *
 * Built on a real <button> with aria-expanded rather than CSS :hover, so it is
 * operable by keyboard and announced correctly. Hover opens it for mouse users;
 * a short close delay stops the menu snapping shut when the pointer crosses the
 * gap between trigger and panel.
 */
export function DesktopNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenIndex(null), 140);
  };

  useEffect(() => {
    setOpenIndex(null);
  }, [pathname]);

  useEffect(() => {
    if (openIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIndex(null);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenIndex(null);
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [openIndex]);

  useEffect(() => () => cancelClose(), []);

  return (
    <nav ref={navRef} className="hidden md:block" aria-label="Main">
      <ul className="flex items-center">
        {items.map((item, i) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const hasChildren = Boolean(item.children?.length);
          const isOpen = openIndex === i;

          return (
            <li
              key={item.href}
              className="relative"
              onMouseEnter={() => {
                if (!hasChildren) return;
                cancelClose();
                setOpenIndex(i);
              }}
              onMouseLeave={hasChildren ? scheduleClose : undefined}
            >
              {hasChildren ? (
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className={cn(
                    'flex h-11 items-center gap-1 rounded-sm px-3 text-sm font-medium transition-colors',
                    'hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive ? 'text-primary' : 'text-foreground/80',
                  )}
                >
                  {item.label}
                  <ChevronDown
                    className={cn('h-3.5 w-3.5 transition-transform duration-200', isOpen && 'rotate-180')}
                    aria-hidden="true"
                  />
                </button>
              ) : (
                <Link
                  href={item.href}
              data-tour={
                item.href === '/shop'
                  ? 'shop'
                  : item.href === '/process'
                    ? 'process'
                    : item.href === '/custom'
                      ? 'custom'
                      : undefined
              }
                  className={cn(
                    'flex h-11 items-center rounded-sm px-3 text-sm font-medium transition-colors',
                    'hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive ? 'text-primary' : 'text-foreground/80',
                  )}
                >
                  {item.label}
                </Link>
              )}

              {hasChildren && isOpen && (
                <div
                  className="absolute left-0 top-full z-50 w-[19rem] animate-rise-in pt-1"
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                >
                  <ul className="rounded-sm border border-border bg-popover p-1.5 shadow-lg">
                    <li>
                      <Link
                        href={item.href}
                        className="block rounded-sm px-3 py-2.5 text-sm font-medium transition-colors hover:bg-foreground/5"
                      >
                        All {item.label}
                        {item.hint && (
                          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                            {item.hint}
                          </span>
                        )}
                      </Link>
                    </li>
                    <li aria-hidden="true" className="my-1.5 h-px bg-border" />
                    {item.children!.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block rounded-sm px-3 py-2.5 text-sm transition-colors hover:bg-foreground/5"
                        >
                          {child.label}
                          {child.hint && (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {child.hint}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
