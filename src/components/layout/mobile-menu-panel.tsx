'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { site, contactPhone } from '@/content/site';
import { mainNav } from '@/content/nav';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';

/** The drawer. Loaded the first time the menu is opened; state is in `MobileMenu`. */
export function MobileMenuPanel({
  isSignedIn,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  isSignedIn: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
}) {
  const pathname = usePathname();
  const phone = contactPhone();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        side="left"
        className="flex flex-col p-0"
        closeLabel="Close menu"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DialogTitle className="border-b border-border px-5 py-4 font-display text-lg">
          Menu
        </DialogTitle>
        <DialogDescription className="sr-only">
          Site navigation and store contact details
        </DialogDescription>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-3" aria-label="Mobile">
          {/* The account is not in the bottom tab bar, so it leads the drawer
              rather than sitting at the end of a long list. */}
          <Link
            href={isSignedIn ? '/account' : '/signin'}
            className={cn(
              'mb-3 flex min-h-[3rem] items-center gap-3 rounded-sm border border-border px-3 transition-colors',
              pathname.startsWith('/account')
                ? 'border-primary/50 bg-primary/[0.07] text-primary'
                : 'hover:bg-foreground/5',
            )}
          >
            <User className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="font-display text-lg leading-snug">
              {isSignedIn ? 'Your account' : 'Sign in'}
            </span>
          </Link>

          <ul className="flex flex-col">
            {mainNav.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <li key={item.href} className="py-0.5">
                  <Link
                    href={item.href}
                    className={cn(
                      'flex min-h-[3rem] flex-col justify-center rounded-sm px-3 py-2 transition-colors',
                      isActive ? 'bg-primary/[0.07] text-primary' : 'hover:bg-foreground/5',
                    )}
                  >
                    <span className="font-display text-lg leading-snug">{item.label}</span>
                    {item.hint && (
                      <span className="text-xs text-muted-foreground">{item.hint}</span>
                    )}
                  </Link>

                  {item.children && (
                    <ul className="ml-3 mt-0.5 border-l border-border pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              'flex min-h-[2.75rem] items-center rounded-sm px-2 text-sm transition-colors',
                              pathname === child.href
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground',
                            )}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="my-4 h-px bg-border" />

          <ul className="flex flex-col">
            {[
              { href: '/wishlist', label: 'Wishlist' },
              { href: '/orders/track', label: 'Track an order' },
              { href: '/care', label: 'Care & washing' },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="flex min-h-[2.75rem] items-center rounded-sm px-3 text-sm transition-colors hover:bg-foreground/5"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-border bg-muted/40 px-5 py-4 text-sm">
          <a
            href={site.location.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {site.location.town}, {site.location.district}
              <span className="block text-xs">Open in Google Maps</span>
            </span>
          </a>
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="flex items-center gap-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
              Call the store
            </a>
          )}

          {/* The header toggle is desktop-only, so the drawer carries it here. */}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className="text-muted-foreground">Dark theme</span>
            <ThemeToggle />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
