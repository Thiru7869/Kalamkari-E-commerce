'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { exploreSections } from '@/content/site';
import { cn } from '@/lib/utils';

/** The map itself. Loaded the first time Explore is opened; state is in `ExploreMenu`. */
export function ExploreMenuPanel({
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
}) {
  const pathname = usePathname();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        side="center"
        onCloseAutoFocus={onCloseAutoFocus}
        // Centred with `inset-0` + auto margins + `h-fit`, not the variant's
        // `-translate-*` — the open/close animation owns `transform`, and a
        // centring translate would be replaced by it (see CLAUDE.md).
        className="inset-0 m-auto h-fit max-h-[86svh] translate-x-0 translate-y-0 overflow-y-auto rounded-sm p-0 sm:max-w-3xl"
      >
        <DialogTitle className="border-b border-border px-5 py-4 font-display text-lg">
          Explore the store
        </DialogTitle>
        <DialogDescription className="sr-only">
          Ten sections of the site, with a line on what each one is
        </DialogDescription>

        <div className="px-5 py-5">
          {exploreSections.map((group, gi) => (
            <div key={group.title} className={cn(gi > 0 && 'mt-7')}>
              <p className="eyebrow">{group.title}</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {group.items.map((item) => {
                  // Anchors point within a page, so compare the path only.
                  const path = item.href.split('#')[0];
                  const active = pathname === path;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex min-h-[2.75rem] flex-col justify-center rounded-sm border px-3.5 py-2.5 transition-colors',
                          active
                            ? 'border-primary/50 bg-primary/[0.06]'
                            : 'border-border hover:border-primary/40 hover:bg-foreground/[0.03]',
                        )}
                      >
                        <span className="font-display text-base leading-tight">
                          {item.label}
                        </span>
                        <span className="mt-0.5 text-xs leading-snug text-muted-foreground">
                          {item.hint}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
