'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

type Chip = {
  key: string;
  label: string;
  param: string;
  value?: string;
  /** Drawn as a dot before the label, for the colour chips. */
  swatch?: string;
};

/**
 * What is currently narrowing the list, shown above it.
 *
 * The filter panel already renders these, but on a phone the panel is a sheet
 * — so once it closes, the reader is looking at a short list of pieces with no
 * visible reason why it is short. On a catalogue this small that reads as an
 * empty store rather than an applied filter, which is the worst possible
 * misreading for a shop whose whole argument is that each piece takes weeks.
 *
 * Every chip removes exactly its own filter. `Clear everything` appears only
 * when there is more than one, because with a single chip it would be a second
 * button doing the same thing.
 */
export function AppliedFilters({
  basePath,
  fabrics,
  motifs,
  dyes,
  className,
}: {
  basePath: string;
  fabrics: { slug: string; name: string }[];
  motifs: { slug: string; name: string }[];
  dyes: { slug: string; name: string; hex: string }[];
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const chips: Chip[] = [];

  for (const slug of searchParams.getAll('fabric')) {
    chips.push({
      key: `fabric-${slug}`,
      label: fabrics.find((f) => f.slug === slug)?.name ?? slug,
      param: 'fabric',
      value: slug,
    });
  }

  for (const slug of searchParams.getAll('motif')) {
    chips.push({
      key: `motif-${slug}`,
      label: motifs.find((m) => m.slug === slug)?.name ?? slug,
      param: 'motif',
      value: slug,
    });
  }

  for (const slug of searchParams.getAll('dye')) {
    const dye = dyes.find((d) => d.slug === slug);
    chips.push({
      key: `dye-${slug}`,
      label: dye?.name ?? slug,
      param: 'dye',
      value: slug,
      swatch: dye?.hex,
    });
  }

  const min = searchParams.get('min');
  const max = searchParams.get('max');
  if (min || max) {
    const from = min ? formatPrice(Number(min)) : null;
    const to = max ? formatPrice(Number(max)) : null;
    chips.push({
      key: 'price',
      label: from && to ? `${from} – ${to}` : from ? `From ${from}` : `Up to ${to}`,
      param: 'price',
    });
  }

  if (searchParams.get('available') === '1') {
    chips.push({ key: 'available', label: 'Available now', param: 'available' });
  }

  const q = searchParams.get('q');
  if (q) chips.push({ key: 'q', label: `“${q}”`, param: 'q' });

  if (chips.length === 0) return null;

  const navigate = (params: URLSearchParams) => {
    params.delete('page');
    startTransition(() => {
      router.push(`${basePath}${params.toString() ? `?${params}` : ''}`, { scroll: false });
    });
  };

  const remove = (chip: Chip) => {
    const params = new URLSearchParams(searchParams.toString());

    if (chip.param === 'price') {
      params.delete('min');
      params.delete('max');
    } else if (chip.value) {
      const remaining = params.getAll(chip.param).filter((v) => v !== chip.value);
      params.delete(chip.param);
      remaining.forEach((v) => params.append(chip.param, v));
    } else {
      params.delete(chip.param);
    }

    navigate(params);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of ['fabric', 'motif', 'dye', 'min', 'max', 'available', 'q'])
      params.delete(key);
    navigate(params);
  };

  return (
    <div className={className}>
      <h2 className="sr-only">Filters applied</h2>
      <ul className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <li key={chip.key}>
            <button
              type="button"
              onClick={() => remove(chip)}
              className="inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-sm border border-border bg-card px-3 text-sm transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* The dot carries no information the label does not — it is
                  there so a row of chips reads as colours at a glance, and it
                  keeps its own hairline so myrobalan cream is still a disc on
                  a cream ground. */}
              {chip.swatch && (
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-inset ring-foreground/25"
                  style={{ backgroundColor: chip.swatch }}
                />
              )}
              {chip.label}
              <X className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Remove this filter</span>
            </button>
          </li>
        ))}

        {chips.length > 1 && (
          <li>
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex min-h-[2.25rem] items-center px-2 text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Clear everything
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
