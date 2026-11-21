import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { heritageModules } from '@/content/heritage-modules';

/**
 * Which heritage modules take a turn between rows of the shop grid.
 *
 * Only modules that lead somewhere a buyer can use: the colours (and the pieces
 * each one is on), the motifs, how a saree is made, and who draws.
 */
const TURNS = ['colours', 'motifs', 'saree-making', 'artisans'] as const;

/**
 * A single story card between two rows of pieces.
 *
 * Nothing is written here. The title, sentence, image and destination all come
 * from `heritageModules`, the one list the heritage hub already reads, so the
 * card cannot say something the destination page does not. It changes with the
 * page of results so a second page does not repeat the first page's card.
 */
export function GridStory({ page }: { page: number }) {
  const id = TURNS[(Math.max(1, page) - 1) % TURNS.length];
  const entry = heritageModules.find((m) => m.id === id);
  if (!entry) return null;

  return (
    <aside aria-label="From the heritage of the craft" className="my-6 md:my-9">
      <Link
        href={entry.href}
        className="group grid overflow-hidden rounded-sm border border-border bg-cotton-100 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:grid-cols-[minmax(0,1fr)_minmax(0,16rem)] dark:bg-card"
      >
        <div className="flex flex-col justify-center p-5 sm:p-7">
          <p className="eyebrow text-primary">From the craft</p>
          <p className="mt-2 font-display text-xl leading-snug sm:text-2xl">{entry.title}</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {entry.intro}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
            Read more
            <ArrowUpRight
              className="h-4 w-4 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
        <div className="relative hidden min-h-[9rem] md:block">
          <Image
            src={entry.image}
            alt={entry.alt}
            fill
            sizes="16rem"
            className="object-cover"
          />
        </div>
      </Link>
    </aside>
  );
}
