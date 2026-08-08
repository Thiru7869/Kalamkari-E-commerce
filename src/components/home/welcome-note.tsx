import Image from 'next/image';
import { site } from '@/content/site';
import { family } from '@/content/family';

/**
 * The first thing on the site: a doorway, not a banner.
 *
 * A visitor arriving here has usually just left a marketplace listing selling
 * a printed polyester saree as "Kalamkari". The job of these two lines is to
 * establish, before anything is sold, that this is a house where somebody is
 * currently painting — and that they would be welcome in it.
 *
 * One image, and it is a person rather than a product. The arch is the shape
 * of a temple niche, which is where this craft's subjects come from.
 */
export function WelcomeNote() {
  const master = family.find((m) => m.id === 'viswanath-reddy')!;

  return (
    <aside
      aria-label="A welcome from the store"
      className="cloth-texture border-b border-border bg-cotton-50 dark:bg-kasim-900"
    >
      <div className="container flex items-center gap-4 py-4 md:gap-7 md:py-6">
        <div className="relative shrink-0">
          <div
            className="relative h-[3.75rem] w-[3.25rem] overflow-hidden bg-cotton-300 md:h-[5.5rem] md:w-[4.5rem]"
            // A temple niche: semicircular head, straight shoulders.
            style={{ borderRadius: '999px 999px 3px 3px' }}
          >
            <Image
              src={master.image}
              alt={`${master.name}, painting in the front room in ${site.location.town}`}
              fill
              sizes="72px"
              priority
              className="object-cover"
            />
          </div>
          <span
            className="absolute -inset-1 -z-10 opacity-70"
            style={{
              borderRadius: '999px 999px 5px 5px',
              border: '1px solid hsl(var(--primary) / 0.35)',
            }}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0">
          <p className="eyebrow text-[0.625rem] md:text-eyebrow">
            {site.location.town} · The front room · Open most days
          </p>
          <p className="mt-1.5 font-display text-[1.0625rem] italic leading-snug md:mt-2 md:text-2xl">
            Come in — the cloth on the roof is still wet.
          </p>
          <p className="mt-1.5 max-w-2xl text-[0.8125rem] leading-relaxed text-muted-foreground md:mt-2 md:text-sm">
            Somebody is always painting here. If you have travelled far you will be given
            tea before you are shown anything, and nothing you are shown was made by a
            machine.
          </p>
        </div>
      </div>
    </aside>
  );
}
