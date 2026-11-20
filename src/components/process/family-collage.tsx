import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { family } from '@/content/family';
import { site } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * The five hands, at the top of the process page.
 *
 * The twenty-three steps are a description of labour, and labour has people in
 * it. Putting the household beside the stat line answers the question the
 * numbers raise — *whose* forty-five days? — before the reader has to scroll to
 * find out.
 *
 * The arrangement is the household's own: the two founders on the first row,
 * their three children on the second. Off-white ground and hairline rules
 * rather than cards, so it reads as a plate in a book rather than as a widget.
 *
 * **Everybody in the plate is named.** The founders' row used to be captionless
 * on the grounds that five captions would crowd it, which quietly made the two
 * people who started the workshop the only anonymous faces on a page about who
 * does the work. The plate was given more room instead — the honest fix, since
 * the problem was never the captions but the size.
 *
 * Sized to the space it is given: the two portraits are wider than tall, the
 * three below are square, and both rows share one gap so the grid is even at
 * every width.
 */

/**
 * How a member is captioned inside the plate.
 *
 * Given name only. Every one of the five carries an initial and a surname, and
 * at plate width a full name wraps to two or three lines and the row stops
 * being a row. The full name and the full role are on the portrait's `alt` and
 * on /our-story, which is where somebody who wants them is going.
 */
function givenName(name: string) {
  const parts = name.split(' ');
  return parts.length > 1 ? parts.slice(1).join(' ') : name;
}
export function FamilyCollage({ className }: { className?: string }) {
  const founders = family.filter((m) => m.role === 'Founder');
  const children = family.filter((m) => m.role !== 'Founder');

  return (
    <figure
      className={cn(
        'rounded-sm border border-border bg-cotton-50 p-3 shadow-[0_24px_60px_-46px_rgb(0_0_0/0.6)] dark:bg-card md:p-4',
        className,
      )}
    >
      <figcaption className="px-0.5 pb-3.5">
        <p className="eyebrow text-label">The hands</p>
        <p className="mt-1.5 font-display text-base leading-snug md:text-lg">
          One household in {site.location.town}
        </p>
      </figcaption>

      {/* Row one — the two who started it. Wider than tall, and now named. */}
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        {founders.map((member) => (
          <div key={member.id}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2px] bg-cotton-300">
              <Image
                src={member.image}
                alt={`${member.name}, ${member.role.toLowerCase()}`}
                fill
                sizes="(min-width: 1024px) 15vw, 45vw"
                className="object-cover"
              />
            </div>
            <p className="mt-2 text-center text-label font-medium leading-tight md:text-xs">
              {givenName(member.name)}
              <span className="mt-0.5 block font-normal text-label uppercase tracking-[0.12em] text-muted-foreground">
                {member.role}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Row two — the three who paint. */}
      <div className="mt-3 grid grid-cols-3 gap-2 md:mt-4 md:gap-3">
        {children.map((member) => (
          <div key={member.id}>
            <div className="relative aspect-square overflow-hidden rounded-[2px] bg-cotton-300">
              <Image
                src={member.image}
                alt={`${member.name}, ${member.role}`}
                fill
                sizes="(min-width: 1024px) 10vw, 30vw"
                className="object-cover"
              />
            </div>
            <p className="mt-2 text-center text-label font-medium leading-tight md:text-xs">
              {givenName(member.name)}
            </p>
          </div>
        ))}
      </div>

      <Link
        href="/our-story"
        className="mt-3 inline-flex min-h-[2.25rem] items-center gap-1.5 px-0.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Meet them
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </figure>
  );
}
