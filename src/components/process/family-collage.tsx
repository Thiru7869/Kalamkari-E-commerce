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
 * their three children on the second, each named. Off-white ground and
 * hairline rules rather than cards, so it reads as a plate in a book rather
 * than as a widget, and sits quietly beside the heading instead of competing
 * with it.
 *
 * Sized to the space it is given: the two portraits are wider than tall, the
 * three below are square, and both rows share one gap so the grid is even at
 * every width.
 */
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
      <figcaption className="px-0.5 pb-3">
        <p className="eyebrow text-[0.5625rem] md:text-[0.625rem]">The hands</p>
        <p className="mt-1.5 font-display text-[0.9375rem] leading-snug md:text-base">
          One household in {site.location.town}
        </p>
      </figcaption>

      {/* Row one — the founders. Wider than tall, and unnamed here: they are
          named in full on the story page, and two captions plus three below
          would crowd a plate this size. */}
      <div className="grid grid-cols-2 gap-2 md:gap-2.5">
        {founders.map((member) => (
          <div
            key={member.id}
            className="relative aspect-[4/3] overflow-hidden rounded-[2px] bg-cotton-300"
          >
            <Image
              src={member.image}
              alt={`${member.name}, ${member.role.toLowerCase()}`}
              fill
              sizes="(min-width: 1024px) 12vw, 40vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Row two — the three who paint, named. */}
      <div className="mt-2 grid grid-cols-3 gap-2 md:mt-2.5 md:gap-2.5">
        {children.map((member) => (
          <div key={member.id}>
            <div className="relative aspect-square overflow-hidden rounded-[2px] bg-cotton-300">
              <Image
                src={member.image}
                alt={`${member.name}, ${member.role}`}
                fill
                sizes="(min-width: 1024px) 8vw, 28vw"
                className="object-cover"
              />
            </div>
            <p className="mt-1.5 text-center text-[0.625rem] leading-tight text-muted-foreground md:text-[0.6875rem]">
              {/* Given name only: three full names at this width wrap to three
                  lines each and the row stops being a row. */}
              {member.name.split(' ').slice(1).join(' ')}
            </p>
          </div>
        ))}
      </div>

      <Link
        href="/our-story"
        className="mt-3 inline-flex min-h-[2.25rem] items-center gap-1.5 px-0.5 text-[0.8125rem] font-medium text-primary underline-offset-4 hover:underline"
      >
        Meet them
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </figure>
  );
}
