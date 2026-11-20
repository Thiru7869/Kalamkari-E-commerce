'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Option = { value: string; label: string };

const selectClass =
  'mt-1.5 h-11 w-full rounded-sm border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/**
 * A two-question shortcut into the shop: which cloth, and how much.
 *
 * It builds nothing the shop cannot already read — `?fabric=` and `?max=` are
 * the same parameters the filters write — so it is a faster way into an
 * existing page, not a second filter system. Both questions are optional; an
 * unanswered one is simply left out of the URL rather than sent empty, which
 * the shop would read as a filter that matches nothing.
 *
 * Cloth options come from the catalogue's own filter options and budget
 * ceilings from its real price range, both computed by the page.
 */
export function PieceChooser({
  cloths,
  budgets,
}: {
  cloths: Option[];
  /** `value` is a ceiling in paise, as a string. */
  budgets: Option[];
}) {
  const router = useRouter();
  const [cloth, setCloth] = useState('');
  const [budget, setBudget] = useState('');

  function go(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (cloth) params.set('fabric', cloth);
    if (budget) params.set('max', budget);
    params.set('available', '1');
    router.push(`/shop?${params.toString()}`);
  }

  return (
    <form
      onSubmit={go}
      className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]"
      aria-label="Find a piece"
    >
      <label className="block text-sm font-medium">
        On which cloth?
        <select value={cloth} onChange={(e) => setCloth(e.target.value)} className={selectClass}>
          <option value="">Any cloth</option>
          {cloths.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium">
        Up to what price?
        <select value={budget} onChange={(e) => setBudget(e.target.value)} className={selectClass}>
          <option value="">Any price</option>
          {budgets.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </label>

      <Button type="submit" size="lg">
        Show pieces
        <ArrowRight aria-hidden="true" />
      </Button>
    </form>
  );
}
