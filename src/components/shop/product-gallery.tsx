'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const VIEW_LABELS = [
  'the full piece',
  'a detail of the drawing',
  'the reverse, showing dye penetration',
  'the piece in use',
];

/**
 * Product gallery.
 *
 * Phones get a snap-scrolling rail — a native, momentum-correct gesture rather
 * than a JS carousel. Desktop gets thumbnails plus a main image.
 *
 * The reverse-of-cloth view is deliberately part of the default set: showing
 * dye penetration through to the back is the strongest single piece of evidence
 * that a piece is hand-dyed rather than surface-printed, and a buyer cannot
 * check it themselves online.
 */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLUListElement>(null);

  const list = images.length > 0 ? images : ['/images/placeholder-cloth.jpg'];

  const altFor = (i: number) =>
    `${name} — ${VIEW_LABELS[i] ?? `view ${i + 1}`}, hand-painted Kalamkari`;

  return (
    <div>
      {/* Phone: horizontal snap rail */}
      <div className="md:hidden">
        <ul
          ref={railRef}
          className="snap-rail -mx-5 px-5"
          onScroll={(e) => {
            const el = e.currentTarget;
            const width = el.clientWidth || 1;
            setActive(Math.round(el.scrollLeft / width));
          }}
        >
          {list.map((src, i) => (
            <li key={src} className="w-[85vw] first:ml-0">
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-cotton-300">
                <Image
                  src={src}
                  alt={altFor(i)}
                  fill
                  sizes="85vw"
                  priority={i === 0}
                  className="object-cover"
                />
              </div>
            </li>
          ))}
        </ul>

        {list.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
            {list.map((src, i) => (
              <span
                key={src}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-200',
                  i === active ? 'w-5 bg-primary' : 'w-1.5 bg-foreground/25',
                )}
              />
            ))}
          </div>
        )}
        <p className="sr-only" aria-live="polite">
          Image {active + 1} of {list.length}
        </p>
      </div>

      {/* Desktop: main image + thumbnails */}
      <div className="hidden md:flex md:gap-4">
        {list.length > 1 && (
          <ul className="flex w-20 shrink-0 flex-col gap-3">
            {list.map((src, i) => (
              <li key={src}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show ${VIEW_LABELS[i] ?? `view ${i + 1}`}`}
                  aria-current={i === active}
                  className={cn(
                    'relative block aspect-[3/4] w-full overflow-hidden rounded-sm border-2 transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    i === active ? 'border-primary' : 'border-transparent hover:border-border',
                  )}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="relative aspect-[3/4] flex-1 overflow-hidden rounded-sm bg-cotton-300">
          <Image
            src={list[active]}
            alt={altFor(active)}
            fill
            sizes="(min-width: 1024px) 50vw, 90vw"
            priority
            className="object-cover"
          />
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Photographed in daylight, unretouched. Natural dyes vary between pieces and screens
        vary between devices — the cloth in your hand will be close to this, not identical
        to it.
      </p>
    </div>
  );
}
