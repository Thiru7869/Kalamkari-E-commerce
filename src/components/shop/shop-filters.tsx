'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Checkbox,
} from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FilterTrigger } from './shop-subnav';

type Options = {
  fabrics: { slug: string; name: string; family: string; _count: { products: number } }[];
  motifs: { slug: string; name: string; _count: { products: number } }[];
  dyes: {
    slug: string;
    name: string;
    source: string;
    hex: string;
    _count: { products: number };
  }[];
  /** Paise, like all money in this codebase. */
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
 * Price, in bands rather than on a slider.
 *
 * A two-handle range slider is the default here and it is the wrong control
 * for this catalogue. It needs a custom `role="slider"` pair with correct
 * `aria-valuetext` to be usable at all without sight, it is a precision drag
 * on a touchscreen, and it invites a reader to tune a boundary to the rupee
 * across a catalogue of forty-three pieces where the gaps between prices are
 * thousands wide. Four bands are one tap, need no ARIA beyond a native radio,
 * and answer the question somebody actually has.
 *
 * Struck against the real spread of the store — ₹1,450 to ₹68,000, median
 * around ₹11,500 — so each band holds a meaningful number of pieces rather
 * than splitting the range into four equal and mostly empty quarters. Bands
 * with nothing in the current scope are dropped before rendering, so a
 * category where everything is under ₹5,000 does not offer three dead options.
 *
 * Paise, like all money in this codebase. `formatPrice` is the only place it
 * becomes text.
 */
type PriceBand = { id: string; label: string; min?: number; max?: number };

const PRICE_BANDS: PriceBand[] = [
  { id: 'under-5k', label: 'Under ₹5,000', max: 500_000 - 1 },
  { id: '5k-15k', label: '₹5,000 – ₹15,000', min: 500_000, max: 1_500_000 },
  { id: '15k-30k', label: '₹15,000 – ₹30,000', min: 1_500_000, max: 3_000_000 },
  { id: 'over-30k', label: '₹30,000 and above', min: 3_000_000 },
];

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
  price,
  triggerOnly = false,
}: {
  options: Options;
  basePath: string;
  selected: { fabrics: string[]; motifs: string[]; dyes: string[] };
  /** Whatever the URL currently says, in paise. Both sides are optional. */
  price: { min?: number; max?: number };
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

  const activeCount =
    selected.fabrics.length +
    selected.motifs.length +
    selected.dyes.length +
    (price.min != null || price.max != null ? 1 : 0);

  const toggle = (key: 'fabric' | 'motif' | 'dye', value: string) => {
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

  /** One band at a time: a price range is a single interval, not a set. */
  const setBand = (band: PriceBand | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('min');
    params.delete('max');
    if (band?.min != null) params.set('min', String(band.min));
    if (band?.max != null) params.set('max', String(band.max));
    params.delete('page');

    startTransition(() => {
      router.push(`${basePath}${params.toString() ? `?${params}` : ''}`, { scroll: false });
    });
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('fabric');
    params.delete('motif');
    params.delete('dye');
    params.delete('min');
    params.delete('max');
    params.delete('page');
    startTransition(() => {
      router.push(`${basePath}${params.toString() ? `?${params}` : ''}`, { scroll: false });
    });
  };

  /*
    Only bands that can return something in the current scope.

    A band overlaps if its own interval intersects the scope's real [min, max].
    Without this, /shop/blouses — where nothing is over ₹9,000 — would offer
    two bands guaranteed to produce the empty state, which is a filter that
    lies about the catalogue.
  */
  const bands = PRICE_BANDS.filter(
    (band) =>
      (band.min ?? 0) <= options.maxPrice &&
      (band.max ?? Number.MAX_SAFE_INTEGER) >= options.minPrice,
  );

  /** Which band the URL currently describes, if it describes one exactly. */
  const activeBand =
    bands.find(
      (band) => (band.min ?? undefined) === price.min && (band.max ?? undefined) === price.max,
    )?.id ?? null;

  const groupedFabrics = options.fabrics.reduce<Record<string, Options['fabrics']>>(
    (acc, fabric) => {
      (acc[fabric.family] ??= []).push(fabric);
      return acc;
    },
    {},
  );

  const panel = (
    <div className="flex flex-col gap-8">
      {/*
        A count and a way out, not a second copy of the chips.

        `AppliedFilters` renders every applied filter as a dismissible chip
        directly above the grid, on every viewport, and it knows about more
        than this panel does — it also carries the price band, the availability
        toggle and the search term. Repeating a subset of it here gave the
        desktop two chip rows a few hundred pixels apart that disagreed about
        how many filters were on. The controls below already show what is
        selected; this only has to say how many, and offer the way out.
      */}
      {activeCount > 0 && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">
            <span className="tabular">{activeCount}</span>{' '}
            {activeCount === 1 ? 'filter' : 'filters'} applied
          </h3>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-primary underline-offset-4 hover:underline"
          >
            Clear all
          </button>
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

      {options.dyes.length > 0 && (
        <fieldset>
          <legend className="text-sm font-medium">Colour</legend>
          <p className="mt-1 text-xs text-muted-foreground">
            Eight pots, and nothing else goes on the cloth. A piece is listed under
            every colour it actually carries.
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-1.5">
            {options.dyes.map((dye) => {
              const on = selected.dyes.includes(dye.slug);
              return (
                <li key={dye.slug}>
                  <button
                    type="button"
                    onClick={() => toggle('dye', dye.slug)}
                    aria-pressed={on}
                    className={cn(
                      'flex min-h-[2.75rem] w-full items-center gap-2.5 rounded-sm border px-2 py-1.5 text-left transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      on
                        ? 'border-primary bg-primary/[0.06]'
                        : 'border-border hover:border-foreground/35',
                    )}
                  >
                    {/*
                      The swatch keeps a hairline ring of its own. Myrobalan
                      cream is within a few percent of the page's ground, and
                      without the ring that one swatch is an invisible button.
                    */}
                    <span
                      aria-hidden="true"
                      className="h-6 w-6 shrink-0 rounded-[2px] ring-1 ring-inset ring-foreground/25"
                      style={{ backgroundColor: dye.hex }}
                    />
                    {/*
                      Wraps rather than truncates.

                      Two of the eight pots are "Myrobalan yellow" and
                      "Myrobalan cream", and in a 16rem sidebar at two columns
                      `truncate` rendered both of them as "Myrobala…" — two
                      different filters with the same visible name, told apart
                      only by a swatch. A label that ellipsises away the word
                      that distinguishes it is worse than a label on two lines.
                    */}
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.8125rem] leading-tight">{dye.name}</span>
                      <span className="tabular mt-0.5 block text-[0.6875rem] leading-tight text-muted-foreground">
                        {dye._count.products}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
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

      {bands.length > 1 && (
        <fieldset>
          <legend className="text-sm font-medium">Price</legend>
          <p className="mt-1 text-xs text-muted-foreground">
            Set by the days of drawing in a piece rather than by its size.
          </p>
          <ul className="mt-4 flex flex-col gap-1">
            <li>
              <label className="flex min-h-[2.5rem] cursor-pointer items-center gap-3 rounded-sm px-1 text-sm transition-colors hover:bg-foreground/[0.04]">
                <input
                  type="radio"
                  name="price-band"
                  checked={activeBand === null}
                  onChange={() => setBand(null)}
                  className="h-4 w-4 accent-[hsl(var(--primary))]"
                />
                <span className="flex-1">Any price</span>
              </label>
            </li>
            {bands.map((band) => (
              <li key={band.id}>
                <label className="flex min-h-[2.5rem] cursor-pointer items-center gap-3 rounded-sm px-1 text-sm transition-colors hover:bg-foreground/[0.04]">
                  <input
                    type="radio"
                    name="price-band"
                    checked={activeBand === band.id}
                    onChange={() => setBand(band)}
                    className="h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                  <span className="tabular flex-1">{band.label}</span>
                </label>
              </li>
            ))}
          </ul>
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
