'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Three ways into the catalogue: Featured, Premium, Custom.
 *
 * The tilt is not ornament — it is the reason these read as *cloth* rather
 * than as tiles. A real piece catches light differently as you move your head
 * past it, and a 3–4° perspective tilt with a travelling sheen is the cheapest
 * honest approximation of that. It runs on the compositor (transform and
 * opacity only), is pointer-driven so it costs nothing until touched, and is
 * skipped entirely for coarse pointers and reduced motion.
 */

export type CollectionCard = {
  title: string;
  blurb: string;
  href: string;
  image: string;
  /** Set on the one card that is an invitation rather than a shelf. */
  accent?: boolean;
};

function TiltCard({ card, index }: { card: CollectionCard; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const frame = useRef(0);

  const onPointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    if (frame.current) return;

    const { clientX, clientY } = e;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const rect = el.getBoundingClientRect();
      // −0.5 … 0.5 from the centre of the card.
      const px = (clientX - rect.left) / rect.width - 0.5;
      const py = (clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty('--tilt-x', `${-py * 7}deg`);
      el.style.setProperty('--tilt-y', `${px * 9}deg`);
      el.style.setProperty('--sheen-x', `${(px + 0.5) * 100}%`);
      el.style.setProperty('--sheen-o', '0.16');
    });
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
    el.style.setProperty('--sheen-o', '0');
  };

  return (
    <Link
      ref={ref}
      href={card.href}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      onBlur={reset}
      style={{ perspective: '1100px' }}
      className="group block w-full focus-visible:outline-none"
    >
      <article
        className={cn(
          'relative flex h-full flex-col overflow-hidden rounded-sm border',
          'transition-[transform,box-shadow,border-color] duration-300 ease-out',
          'group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2',
          card.accent
            ? 'border-primary/35 bg-primary/[0.04]'
            : 'border-border bg-card hover:border-primary/30',
          'motion-safe:[transform:rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))]',
          'motion-safe:group-hover:shadow-[0_30px_60px_-38px_rgb(0_0_0/0.6)]',
        )}
      >
        {/* 16:9 rather than 16:10 — the same 10% off the plate as the product
            cards, so the two grids shrink together rather than drifting apart. */}
        <div className="relative aspect-[16/9] overflow-hidden bg-cotton-300">
          <Image
            src={card.image}
            alt=""
            fill
            sizes="(min-width: 768px) 32vw, 92vw"
            className="object-cover transition-transform [transition-duration:900ms] ease-out motion-safe:group-hover:scale-[1.07]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-kasim-950/70 via-transparent to-transparent"
            aria-hidden="true"
          />

          {/* The travelling sheen. */}
          <span
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: 'var(--sheen-o, 0)',
              background:
                'radial-gradient(38rem 22rem at var(--sheen-x,50%) 0%, rgba(255,255,255,0.75) 0%, transparent 62%)',
            }}
            aria-hidden="true"
          />

          {/*
            The numeral alone. This badge used to read "02 · PREMIUM" directly
            above a heading that read "Premium" — the same word twice, once in
            tracked capitals over the image and once as the card's actual
            title. The numeral is the part that does work here: it marks these
            as an ordered set of three ways in. The name belongs to the
            heading, which is where a screen reader and a search engine both
            look for it.
          */}
          <span
            className="tabular absolute left-3 top-3 rounded-sm bg-kasim-950/55 px-2 py-1 font-inscription text-label uppercase tracking-[0.16em] text-cotton-100 backdrop-blur-sm"
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-2.5 md:p-5">
          <h3 className="font-display text-base sm:text-lg">
            {card.title}
          </h3>
          {/* The row of three is kept at every width, so at phone widths each
              cell is ~100px. A paragraph there is not reading, it is decoration
              — the label, title and arrow carry the card instead. */}
          <p className="mt-2 hidden flex-1 text-sm leading-relaxed text-muted-foreground sm:block md:text-sm">
            {card.blurb}
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-label font-medium text-primary sm:mt-3.5 sm:gap-1.5 sm:text-sm md:mt-4 md:text-sm">
            <span className="truncate">{card.accent ? 'Start a design' : 'See the pieces'}</span>
            <ArrowRight
              className="h-3 w-3 shrink-0 transition-transform duration-300 motion-safe:group-hover:translate-x-1 sm:h-3.5 sm:w-3.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </article>
    </Link>
  );
}

export function CollectionCards({ cards }: { cards: CollectionCard[] }) {
  return (
    // Three across on every screen from `sm` up. Below that they stay in a
    // three-column grid too — narrower, but the row of three is the point.
    <ul className="grid grid-cols-3 gap-3 md:gap-6">
      {cards.map((card, i) => (
        <li key={card.href} className="flex">
          <TiltCard card={card} index={i} />
        </li>
      ))}
    </ul>
  );
}
