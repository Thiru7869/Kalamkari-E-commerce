'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { useLightbox, ExpandHint } from '@/components/ui/lightbox';
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
 *
 * **Both ways of getting closer are here, because they answer different
 * questions.** The pointer zoom answers "is that line drawn or printed" without
 * leaving the page or losing the price and the button — it is the gesture
 * somebody makes while still deciding. The full-screen view answers "show me
 * the whole cloth on the whole screen", and it is worth a modal. A site whose
 * entire claim is that the difference is visible up close cannot ship a
 * detail page where the largest the drawing ever gets is 560 pixels.
 *
 * The zoom is pointer-only by design. It is driven by `pointermove` on a fine
 * pointer, so a touch device never enters a state it cannot get out of — on a
 * phone the same picture is a tap away in the lightbox, at the full width of
 * the screen, with pinch-zoom available on top of it.
 */

/** How far in the pointer zoom goes. Enough to read a line; not enough to pixelate. */
const ZOOM = 2.1;

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoomable, setZoomable] = useState(false);
  const railRef = useRef<HTMLUListElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);

  const list = images.length > 0 ? images : ['/images/placeholder-cloth.jpg'];

  const altFor = useCallback(
    (i: number) => `${name} — ${VIEW_LABELS[i] ?? `view ${i + 1}`}, hand-painted Kalamkari`,
    [name],
  );

  const lightbox = useLightbox(
    list.map((src, i) => ({
      src,
      alt: altFor(i),
      caption: VIEW_LABELS[i]
        ? `${name} — ${VIEW_LABELS[i]}.`
        : undefined,
    })),
  );

  /*
    Zoom is offered only where it can actually be used, and the query is
    subscribed rather than sampled: a laptop with a touchscreen can change
    which pointer is in use mid-session, and a reader who plugs in a mouse
    should get the zoom without reloading.

    `any-pointer: fine` rather than `hover`, because the question is whether a
    precise pointer exists at all, not whether the primary one hovers.
  */
  useEffect(() => {
    const fine = window.matchMedia('(any-pointer: fine)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setZoomable(fine.matches && !still.matches);
    sync();
    fine.addEventListener('change', sync);
    still.addEventListener('change', sync);
    return () => {
      fine.removeEventListener('change', sync);
      still.removeEventListener('change', sync);
    };
  }, []);

  /*
    Written straight to `style`, never to state.

    A `pointermove` handler that calls `setState` re-renders the whole gallery
    on every mouse position — hundreds of React renders per second to move one
    background. This is the same rule the /process scroll work follows.
  */
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = zoomRef.current;
    if (!el || !zoomable) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.transformOrigin = `${x}% ${y}%`;
    el.style.transform = `scale(${ZOOM})`;
  };

  const onPointerLeave = () => {
    const el = zoomRef.current;
    if (!el) return;
    el.style.transform = 'scale(1)';
  };

  // Changing thumbnail while zoomed would otherwise leave the new picture
  // scaled to the old one's origin.
  useEffect(() => {
    const el = zoomRef.current;
    if (el) el.style.transform = 'scale(1)';
  }, [active]);

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
              {/*
                A button rather than a bare image. On a phone the lightbox is
                the only way to see the cloth at full width, so it has to be
                reachable by tap and by keyboard, and it has to say what it
                does.
              */}
              <button
                type="button"
                onClick={() => lightbox.open(i)}
                className="group relative block aspect-[3/4] w-full overflow-hidden rounded-sm bg-cotton-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Image
                  src={src}
                  alt={altFor(i)}
                  fill
                  sizes="85vw"
                  priority={i === 0}
                  className="object-cover"
                />
                <ExpandHint className="opacity-100" />
                <span className="sr-only">View full screen</span>
              </button>
            </li>
          ))}
        </ul>

        {list.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-3" aria-hidden="true">
            <span className="tabular text-xs text-muted-foreground">
              {active + 1} / {list.length}
            </span>
            <span className="flex gap-1.5">
            {list.map((src, i) => (
              <span
                key={src}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-200',
                  i === active ? 'w-5 bg-primary' : 'w-1.5 bg-foreground/25',
                )}
              />
            ))}
            </span>
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
                    // 5:6 like the cards. The *main* image below stays 3:4 —
                    // this is the one place on the site where the cloth should
                    // be as large as the column allows, and shrinking it would
                    // work against the reason the zoom was added.
                    'relative block aspect-[5/6] w-full overflow-hidden rounded-sm border-2 transition-colors',
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

        <div
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          className="group relative aspect-[3/4] flex-1 overflow-hidden rounded-sm bg-cotton-300"
        >
          {/*
            The moving layer is a wrapper, not the `Image`.

            next/image writes its own `style` on the element it renders, and
            scaling the same node the loader is managing is how you end up
            fighting it. A plain div around it also keeps `transform` owned by
            exactly one thing, which is the rule the rest of this codebase
            follows.
          */}
          <div
            ref={zoomRef}
            className="absolute inset-0 transition-transform duration-300 ease-out motion-reduce:transition-none"
          >
            <Image
              src={list[active]}
              alt={altFor(active)}
              fill
              sizes="(min-width: 1024px) 50vw, 90vw"
              priority
              className="object-cover"
            />
          </div>

          {/*
            The full-screen control, over the zoom surface.

            Deliberately a small button in the corner rather than the whole
            picture being clickable: the picture is already doing something on
            pointer-down-and-move, and a click target that covers a zoom
            surface fires every time somebody finishes inspecting a detail.
          */}
          <button
            type="button"
            onClick={() => lightbox.open(active)}
            className="absolute bottom-3 right-3 z-10 inline-flex h-11 items-center gap-2 rounded-sm border border-cotton-100/30 bg-kasim-950/55 px-3 text-cotton-50 backdrop-blur-sm transition-colors hover:bg-kasim-950/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cotton-100/70"
          >
            <ZoomIn className="h-4 w-4" aria-hidden="true" />
            <span className="font-inscription text-label uppercase tracking-[0.14em]">
              Full screen
            </span>
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Photographed in daylight, unretouched.{' '}
        {zoomable && <>Hover the picture to look closely at the line. </>}
        Natural dyes vary between pieces and screens vary between devices — the cloth in
        your hand will be close to this, not identical to it.
      </p>

      {lightbox.view}
    </div>
  );
}
