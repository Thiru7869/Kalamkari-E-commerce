'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Checkbox,
} from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { FilterTrigger } from './shop-subnav';

type Options = {
  fabrics: { slug: string; name: string; family: string; _count: { products: number } }[];
  motifs: { slug: string; name: string; _count: { products: number } }[];
  minPrice: number;
  maxPrice: number;
};

const FAMILY_LABELS: Record<string, string> = {
  cotton: 'Cotton',
  silk: 'Silk',
  blended: 'Blends',
  sheer: 'Sheer',
};

/**
 * Filters live entirely in the URL. That means a filtered view is shareable,
 * bookmarkable, survives a refresh, and works with the browser's back button —
 * all of which client-side filter state silently breaks.
 *
 * Desktop shows the panel inline; phones get it in a bottom sheet, because a
 * sidebar on a 390px viewport is not a sidebar.
 */
export function ShopFilters({
  options,
  basePath,
  selected,
  triggerOnly = false,
}: {
  options: Options;
  basePath: string;
  selected: { fabrics: string[]; motifs: string[] };
  /**
   * Render only the sheet and its trigger, for placing inside the sticky
   * sub-navbar. Without this the component would also render its desktop
   * sidebar a second time.
   */
  triggerOnly?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const activeCount = selected.fabrics.length + selected.motifs.length;

  const toggle = (key: 'fabric' | 'motif', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll(key);
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    params.delete(key);
    next.forEach((v) => params.append(key, v));
    // Any filter change invalidates the current page number.
    params.delete('page');

    startTransition(() => {
      router.push(`${basePath}${params.toString() ? `?${params}` : ''}`, { scroll: false });
    });
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('fabric');
    params.delete('motif');
    params.delete('page');
    startTransition(() => {
      router.push(`${basePath}${params.toString() ? `?${params}` : ''}`, { scroll: false });
    });
  };

  const groupedFabrics = options.fabrics.reduce<Record<string, Options['fabrics']>>(
    (acc, fabric) => {
      (acc[fabric.family] ??= []).push(fabric);
      return acc;
    },
    {},
  );

  const panel = (
    <div className="flex flex-col gap-8">
      {activeCount > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Filtering by</h3>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-primary underline-offset-4 hover:underline"
            >
              Clear all
            </button>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {selected.fabrics.map((slug) => {
              const fabric = options.fabrics.find((f) => f.slug === slug);
              return (
                <li key={`f-${slug}`}>
                  <button
                    type="button"
                    onClick={() => toggle('fabric', slug)}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1 text-xs transition-colors hover:border-foreground/40"
                  >
                    {fabric?.name ?? slug}
                    <X className="h-3 w-3" aria-hidden="true" />
                    <span className="sr-only">Remove filter</span>
                  </button>
                </li>
              );
            })}
            {selected.motifs.map((slug) => {
              const motif = options.motifs.find((m) => m.slug === slug);
              return (
                <li key={`m-${slug}`}>
                  <button
                    type="button"
                    onClick={() => toggle('motif', slug)}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1 text-xs transition-colors hover:border-foreground/40"
                  >
                    {motif?.name ?? slug}
                    <X className="h-3 w-3" aria-hidden="true" />
                    <span className="sr-only">Remove filter</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {options.motifs.length > 0 && (
        <fieldset>
          <legend className="text-sm font-medium">Story &amp; motif</legend>
          <p className="mt-1 text-xs text-muted-foreground">
            Kalamkari is narrative art. This is the most useful way to browse it.
          </p>
          <ul className="mt-4 flex flex-col gap-1">
            {options.motifs.map((motif) => (
              <li key={motif.slug}>
                <label className="flex min-h-[2.5rem] cursor-pointer items-center gap-3 rounded-sm px-1 text-sm transition-colors hover:bg-foreground/[0.04]">
                  <Checkbox
                    checked={selected.motifs.includes(motif.slug)}
                    onCheckedChange={() => toggle('motif', motif.slug)}
                  />
                  <span className="flex-1">{motif.name}</span>
                  <span className="tabular text-xs text-muted-foreground">
                    {motif._count.products}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      {options.fabrics.length > 0 && (
        <fieldset>
          <legend className="text-sm font-medium">Cloth</legend>
          <p className="mt-1 text-xs text-muted-foreground">
            The cloth changes how the dye behaves and how the piece drapes.
          </p>
          <div className="mt-4 flex flex-col gap-5">
            {Object.entries(groupedFabrics).map(([family, fabrics]) => (
              <div key={family}>
                <h4 className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {FAMILY_LABELS[family] ?? family}
                </h4>
                <ul className="mt-2 flex flex-col gap-1">
                  {fabrics.map((fabric) => (
                    <li key={fabric.slug}>
                      <label className="flex min-h-[2.5rem] cursor-pointer items-center gap-3 rounded-sm px-1 text-sm transition-colors hover:bg-foreground/[0.04]">
                        <Checkbox
                          checked={selected.fabrics.includes(fabric.slug)}
                          onCheckedChange={() => toggle('fabric', fabric.slug)}
                        />
                        <span className="flex-1">{fabric.name}</span>
                        <span className="tabular text-xs text-muted-foreground">
                          {fabric._count.products}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );

  return (
    <>
      {/*
        The sheet, opened from the trigger in the sticky sub-navbar.

        The trigger used to be a full-width button inside its own sticky
        wrapper, which meant two sticky bars stacked on a phone and forty
        pixels of chrome doing one job. It now lives in the bar with
        everything else.
      */}
      <div className="lg:hidden">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <FilterTrigger count={activeCount} />
          </DialogTrigger>
          <DialogContent side="bottom" className="max-h-[85svh] rounded-t-lg p-0">
            <DialogTitle className="border-b border-border px-5 py-4 font-display text-lg">
              Filter
            </DialogTitle>
            <DialogDescription className="sr-only">
              Narrow the pieces shown by motif and cloth
            </DialogDescription>
            <div className="overflow-y-auto overscroll-contain px-5 py-5">{panel}</div>
            <div className="border-t border-border bg-background p-4">
              <Button className="w-full" size="lg" onClick={() => setOpen(false)}>
                Show results
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop: inline sidebar. Suppressed when this instance exists only
          to supply the sub-navbar's trigger, or it would render twice. */}
      {!triggerOnly && (
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-32">{panel}</div>
        </aside>
      )}
    </>
  );
}
