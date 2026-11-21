'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { catalogueHref, FAMILY_PREFIX } from '@/lib/type-catalogue';

export type ClothGroup = {
  family: string;
  label: string;
  count: number;
  cloths: { slug: string; name: string; count: number }[];
};

/**
 * The cloth control.
 *
 * It is a real `<form method="get">` around a native `<select>`, so with no
 * script the choice still works (a button inside `<noscript>` submits it); with
 * script, changing it navigates to the filtered URL inside a transition, so the
 * control stays responsive while the server renders the new list. A native
 * select is still the most accessible dropdown there is, and the one every
 * phone draws with its own picker.
 *
 * The selected value is held locally and re-synced from the URL, so the control
 * shows the visitor's choice immediately instead of snapping back until the new
 * page arrives.
 */
export function ClothSelect({
  basePath,
  value,
  allLabel,
  groups,
}: {
  basePath: string;
  /** `''` for everything, a cloth slug, or `family:<name>`. */
  value: string;
  allLabel: string;
  groups: ClothGroup[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  const choose = (next: string) => {
    setLocal(next);
    const state = next.startsWith(FAMILY_PREFIX)
      ? { family: next.slice(FAMILY_PREFIX.length), page: 1 }
      : next
        ? { cloth: next, page: 1 }
        : { page: 1 };
    startTransition(() => router.push(catalogueHref(basePath, state), { scroll: false }));
  };

  return (
    <form action={`${basePath}#catalogue-top`} method="get" className="sm:w-80">
      <label htmlFor="cloth-select" className="text-sm font-medium">
        Cloth
      </label>
      <div className="mt-1.5 flex gap-2">
        <select
          id="cloth-select"
          name="fabric"
          value={local}
          onChange={(event) => choose(event.target.value)}
          aria-busy={pending}
          className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-busy:opacity-70"
        >
          <option value="">{allLabel}</option>
          {groups.map((group) => (
            <optgroup key={group.family} label={group.label}>
              <option value={`${FAMILY_PREFIX}${group.family}`}>
                All {group.label.toLowerCase()} ({group.count})
              </option>
              {group.cloths.map((cloth) => (
                <option key={cloth.slug} value={cloth.slug}>
                  {cloth.name} ({cloth.count})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <noscript>
          <button
            type="submit"
            className="h-11 rounded-sm border border-border px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Show
          </button>
        </noscript>
      </div>
      <span role="status" className="sr-only">
        {pending ? 'Updating the list' : ''}
      </span>
    </form>
  );
}
