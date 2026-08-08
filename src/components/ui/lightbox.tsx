'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Full-screen viewing for a set of pictures.
 *
 * Cloth is the one thing a small image cannot convey — the whole argument of
 * this site is that the line is drawn rather than printed, and that is only
 * visible up close. So every substantial picture on the story and award
 * sections opens.
 *
 * Behaves as a real modal: focus is trapped and returned, the background does
 * not scroll, Escape closes, and the arrow keys move between pictures. The
 * previously focused element is restored on close, which for a grid of ten
 * awards is the difference between carrying on and hunting for your place.
 */

export type LightboxItem = {
  src: string;
  alt: string;
  /** Shown under the picture when open. */
  caption?: string;
};

export function useLightbox(items: LightboxItem[]) {
  const [index, setIndex] = useState<number | null>(null);

  const open = useCallback((i: number) => setIndex(i), []);
  const close = useCallback(() => setIndex(null), []);

  const view =
    index === null ? null : (
      <Lightbox items={items} index={index} onIndex={setIndex} onClose={close} />
    );

  return { open, close, view, isOpen: index !== null };
}

function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: LightboxItem[];
  index: number;
  onIndex: (next: number) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const current = items[index];

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowRight') {
        onIndex((index + 1) % items.length);
        return;
      }
      if (e.key === 'ArrowLeft') {
        onIndex((index - 1 + items.length) % items.length);
        return;
      }
      if (e.key !== 'Tab') return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href]',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [index, items.length, onIndex, onClose]);

  const many = items.length > 1;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={current.alt}
      className="fixed inset-0 z-[80] flex flex-col bg-kasim-950/94 backdrop-blur-sm motion-safe:animate-rise-in"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="tabular font-inscription text-[0.6875rem] uppercase tracking-[0.18em] text-cotton-200/70">
          {index + 1} of {items.length}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-sm text-cotton-100/80 transition-colors hover:bg-cotton-50/10 hover:text-cotton-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cotton-100/60"
        >
          <X className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Close</span>
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4">
        {many && (
          <button
            type="button"
            onClick={() => onIndex((index - 1 + items.length) % items.length)}
            className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-cotton-100/25 bg-kasim-950/50 text-cotton-100 opacity-40 backdrop-blur-sm transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cotton-100/60 md:left-6"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Previous</span>
          </button>
        )}

        <div className="relative h-full w-full max-w-5xl">
          <Image
            src={current.src}
            alt={current.alt}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>

        {many && (
          <button
            type="button"
            onClick={() => onIndex((index + 1) % items.length)}
            className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-cotton-100/25 bg-kasim-950/50 text-cotton-100 opacity-40 backdrop-blur-sm transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cotton-100/60 md:right-6"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Next</span>
          </button>
        )}
      </div>

      {current.caption && (
        <p className="px-6 pb-6 text-center text-sm leading-relaxed text-cotton-100/75">
          {current.caption}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * The affordance that says a picture opens.
 *
 * Drawn on the image rather than beside it, low-contrast until hovered, so a
 * grid of them does not read as a grid of buttons.
 */
export function ExpandHint({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-sm',
        'border border-cotton-100/30 bg-kasim-950/45 text-cotton-50 backdrop-blur-sm',
        'opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100',
        className,
      )}
    >
      <Expand className="h-3.5 w-3.5" />
    </span>
  );
}
