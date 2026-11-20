'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/primitives';
import { exploreSections } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * Everything worth reading, in one panel.
 *
 * The header nav can hold six items before it stops being a nav, and this site
 * has considerably more than six things worth finding — the twenty-three
 * steps, the dye index, the care guide, the journal, the type pages. Rather
 * than growing the nav until it is a wall, one control opens the whole map.
 *
 * Ten sections, each with a line saying what it actually is. Grouped, because
 * an undifferentiated list of ten links is a list nobody reads to the bottom.
 */
export function ExploreMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-1.5 rounded-sm px-2.5 text-sm transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
        >
          <Compass className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
          <span className="hidden sm:inline">Explore</span>
          <span className="sr-only sm:hidden">Explore the site</span>
        </button>
      </DialogTrigger>

      <DialogContent
        side="center"
        // Centred with `inset-0` + auto margins + `h-fit`, not the variant's
        // `-translate-*` — the open/close animation owns `transform`, and a
        // centring translate would be replaced by it (see CLAUDE.md).
        className="inset-0 m-auto h-fit max-h-[86svh] translate-x-0 translate-y-0 overflow-y-auto rounded-lg p-0 sm:max-w-3xl"
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
                        <span className="font-display text-[0.9375rem] leading-tight">
                          {item.label}
                        </span>
                        <span className="mt-0.5 text-[0.75rem] leading-snug text-muted-foreground">
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
