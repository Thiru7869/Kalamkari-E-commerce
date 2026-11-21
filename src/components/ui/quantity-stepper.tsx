'use client';


import { Minus, Plus } from 'lucide-react';

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label = 'Quantity',
  disabled,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
  disabled?: boolean;
}) {
  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div className="inline-flex items-center rounded-sm border border-input" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || atMin}
        className="inline-flex h-11 w-11 items-center justify-center rounded-l-sm transition-colors hover:bg-foreground/5 disabled:opacity-40"
        aria-label={`Decrease ${label.toLowerCase()}`}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span
        className="tabular w-12 text-center text-sm font-medium"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="sr-only">{label}: </span>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || atMax}
        className="inline-flex h-11 w-11 items-center justify-center rounded-r-sm transition-colors hover:bg-foreground/5 disabled:opacity-40"
        aria-label={`Increase ${label.toLowerCase()}`}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
