'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { handVsPrinted } from '@/content/family';
import { useLightbox, ExpandHint } from '@/components/ui/lightbox';
import { cn } from '@/lib/utils';

/**
 * Hand-drawn against printed, as a table anybody can apply in a shop.
 *
 * Every row is something a buyer can *check* standing in front of the cloth —
 * the repeat, the reverse, the weight of the outline. Deliberately not a list
 * of adjectives: "superior craftsmanship" is unfalsifiable, and this site does
 * not make claims it cannot support.
 *
 * The tick and the cross are drawn with the accent colours rather than green
 * and red. A green tick beside a red cross reads as a verdict on the other
 * trade; madder beside a muted grey reads as a distinction, which is what this
 * actually is.
 */
export function HandVsPrinted({
  evidence,
  className,
}: {
  /** Supporting pictures for the small carousel. Three to five. */
  evidence: { src: string; alt: string; caption: string }[];
  className?: string;
}) {
  return (
    <section
      className={cn('border-y border-border bg-cotton-100 section-y dark:bg-card', className)}
      aria-labelledby="hand-vs-printed-heading"
    >
      <div className="container">
        <div className="max-w-2xl">
          <p className="eyebrow">How to tell</p>
          <h2 id="hand-vs-printed-heading" className="mt-3 text-display-md">
            Hand-drawn, or printed
          </h2>
          <p className="mt-4 text-body-lg text-muted-foreground">
            Six things you can check yourself, with the cloth in your hands and without
            taking anybody&rsquo;s word for it — including ours.
          </p>
        </div>

        {/* ---- The table ------------------------------------------------- */}
        <div className="mt-10 overflow-x-auto md:mt-14">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <caption className="sr-only">
              Differences between hand-drawn pen Kalamkari and printed cloth
            </caption>
            <thead>
              <tr className="border-b border-border text-left">
                <th scope="col" className="w-40 py-3 pr-4 font-medium">
                  What to look at
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <Tick />
                    Drawn by hand
                  </span>
                </th>
                <th scope="col" className="py-3 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <Cross />
                    Printed
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {handVsPrinted.map((row) => (
                <tr key={row.point} className="border-b border-border/60 align-top">
                  <th scope="row" className="py-4 pr-4 text-left font-medium">
                    {row.point}
                  </th>
                  <td className="py-4 pr-4">
                    <span className="flex gap-2.5">
                      <Tick className="mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{row.hand}</span>
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="flex gap-2.5 text-muted-foreground">
                      <Cross className="mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{row.printed}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {evidence.length > 0 && <EvidenceCarousel items={evidence} className="mt-12" />}
      </div>
    </section>
  );
}

function Tick({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/12 text-primary',
        className,
      )}
    >
      <Check className="h-3 w-3" strokeWidth={3} />
    </span>
  );
}

function Cross({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex h-5 w-5 items-center justify-center rounded-full bg-foreground/8 text-muted-foreground',
        className,
      )}
    >
      <X className="h-3 w-3" strokeWidth={3} />
    </span>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * A small carousel of supporting pictures.
 *
 * One at a time rather than a grid, because each needs a caption doing real
 * work — a thumbnail of a border repeat with no explanation proves nothing.
 * Arrows are low-contrast until hovered, matching the frame on /process.
 */
function EvidenceCarousel({
  items,
  className,
}: {
  items: { src: string; alt: string; caption: string }[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const lightbox = useLightbox(items.map((i) => ({ src: i.src, alt: i.alt, caption: i.caption })));
  const current = items[index];

  const go = (next: number) => setIndex((next + items.length) % items.length);

  return (
    <div className={className}>
      <div className="group relative overflow-hidden rounded-sm border border-border bg-background">
        <button
          type="button"
          onClick={() => lightbox.open(index)}
          className="relative block aspect-[16/9] w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <Image
            src={current.src}
            alt={current.alt}
            fill
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.02]"
          />
          <ExpandHint />
          <span className="sr-only">Open full screen</span>
        </button>

        <button
          type="button"
          onClick={() => go(index - 1)}
          className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cotton-100/30 bg-kasim-950/45 text-cotton-50 opacity-25 backdrop-blur-sm transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cotton-100/60"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Previous picture</span>
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cotton-100/30 bg-kasim-950/45 text-cotton-50 opacity-25 backdrop-blur-sm transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cotton-100/60"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Next picture</span>
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground" role="status" aria-live="polite">
          {current.caption}
        </p>

        <ol className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
          {items.map((item, i) => (
            <li key={item.src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === index ? 'w-6 bg-primary' : 'w-1.5 bg-border hover:bg-foreground/30',
                )}
                tabIndex={-1}
              />
            </li>
          ))}
        </ol>
      </div>

      {lightbox.view}
    </div>
  );
}
