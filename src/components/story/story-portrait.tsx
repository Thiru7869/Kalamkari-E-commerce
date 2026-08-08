'use client';

import Image from 'next/image';
import { useLightbox, ExpandHint } from '@/components/ui/lightbox';
import { cn } from '@/lib/utils';

/**
 * A portrait on the story page.
 *
 * Smaller than it used to be, and it opens. The page has to give room to both
 * a face and several paragraphs, and a portrait that fills a third of the
 * viewport wins that competition without earning it — so the picture is set at
 * a size that reads comfortably in the flow, and anybody who wants to look
 * properly gets the full screen.
 *
 * The accent ring is the person's own colour, drawn outside the frame so the
 * photograph is never tinted by it.
 */
export function StoryPortrait({
  src,
  alt,
  accentRing,
  className,
}: {
  src: string;
  alt: string;
  /** Tailwind ring token from the member's accent. */
  accentRing: string;
  className?: string;
}) {
  const lightbox = useLightbox([{ src, alt }]);

  return (
    <figure className={cn('m-0', className)}>
      <button
        type="button"
        onClick={() => lightbox.open(0)}
        className={cn(
          'group relative block aspect-[4/5] w-full max-w-[17rem] overflow-hidden rounded-sm bg-cotton-300 ring-1 transition-all duration-500',
          'hover:ring-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'lg:max-w-none',
          accentRing,
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 22vw, 60vw"
          className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.03]"
        />
        <ExpandHint />
        <span className="sr-only">Open full screen</span>
      </button>

      {lightbox.view}
    </figure>
  );
}
