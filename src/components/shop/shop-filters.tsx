'use client';

import dynamic from 'next/dynamic';
import { useState, startTransition } from 'react';
import { FilterTrigger } from './shop-subnav';
import { useIdlePreload, useOpener } from '@/components/ui/use-opener';

type Options = {
  fabrics: {
    slug: string;
    name: string;
    family: string;
    _count: { products: number };
  }[];
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

const loadPanel = () => import('./shop-filters-panel');
const ShopFiltersPanel = dynamic(() => loadPanel().then((m) => m.ShopFiltersPanel), {
  ssr: false,
});

/**
 * The Filter button. The sheet behind it (every option list, plus the Radix
 * Dialog that holds them) is requested when the button is first approached or
 * pressed, so a visitor who never filters never downloads it.
 *
 * Filters live in the URL, not in state: the panel pushes `?fabric=…` and the
 * server renders the result.
 */
export function ShopFilters({
  options,
  basePath,
  selected,
  price,
}: {
  options: Options;
  basePath: string;
  selected: { fabrics: string[]; motifs: string[]; dyes: string[] };
  /** Whatever the URL currently says, in paise. Both sides are optional. */
  price: { min?: number; max?: number };
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { remember, restore } = useOpener();
  useIdlePreload(loadPanel);

  const activeCount =
    selected.fabrics.length +
    selected.motifs.length +
    selected.dyes.length +
    (price.min != null || price.max != null ? 1 : 0);

  return (
    <>
      <FilterTrigger
        count={activeCount}
        expanded={open}
        onHint={loadPanel}
        onClick={(event) => {
          remember(event);
          startTransition(() => {
            setMounted(true);
            setOpen(true);
          });
        }}
      />
      {mounted && (
        <ShopFiltersPanel
          options={options}
          basePath={basePath}
          selected={selected}
          price={price}
          open={open}
          onOpenChange={setOpen}
          onCloseAutoFocus={restore}
        />
      )}
    </>
  );
}
