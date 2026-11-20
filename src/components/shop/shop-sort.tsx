'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useId } from 'react';

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'craft', label: 'Most days of hand-work' },
];

/**
 * A native <select>. Deliberately not a Radix Select: sorting is a single,
 * infrequent choice, and the platform control is smaller, faster, keyboard-
 * complete, and renders as the OS picker wheel on a phone.
 */
export function ShopSort({ current }: { current?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const id = useId();

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'featured') params.delete('sort');
    else params.set('sort', value);
    params.delete('page');
    router.push(`${pathname}${params.toString() ? `?${params}` : ''}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm text-muted-foreground">
        Sort
      </label>
      <select
        id={id}
        value={current ?? 'featured'}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-sm border border-input bg-card px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
