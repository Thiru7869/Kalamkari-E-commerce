'use client';

import Image from 'next/image';
import { useMediaQuery } from '@/components/layout/use-media-query';
import { cn } from '@/lib/utils';

/**
 * The second photograph on a product card, shown on hover or keyboard focus.
 *
 * It is only requested where a pointer can hover. On a phone it can never be
 * shown, but an `opacity-0` image still downloads once its card scrolls near
 * the viewport, so every visible card used to cost two photographs and the
 * second was invisible. Mounted after hydration and only for `(hover: hover)`,
 * a phone fetches one image per card. Decorative: the first image carries the
 * alt text.
 */
export function HoverImage({ src, sizes }: { src: string; sizes: string }) {
  const canHover = useMediaQuery('(hover: hover)');
  if (!canHover) return null;

  return (
    <Image
      src={src}
      alt=""
      aria-hidden="true"
      fill
      sizes={sizes}
      className={cn(
        'pointer-events-none object-cover opacity-0',
        'transition-opacity duration-300 ease-out motion-reduce:transition-none',
        'group-hover:opacity-100 group-focus-within:opacity-100',
      )}
    />
  );
}
