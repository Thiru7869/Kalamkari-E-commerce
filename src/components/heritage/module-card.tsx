import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import type { HeritageModule } from '@/content/heritage-modules';
import { cn } from '@/lib/utils';

/**
 * One module: photograph, title, a sentence, and the whole card is the link.
 *
 * Motion is a slow zoom on the photograph and an arrow that lifts. Both use the
 * shared easing and both are off under reduced motion.
 */
export function ModuleCard({
  module,
  index,
  compact = false,
  className,
}: {
  module: HeritageModule;
  index?: number;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={module.href}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-sm border border-border bg-card transition-[border-color,box-shadow] duration-swift ease-swift hover:border-primary/40 hover:shadow-[0_18px_40px_-28px_rgb(0_0_0/0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
    >
      <div className={cn('relative overflow-hidden', compact ? 'aspect-[3/2]' : 'aspect-[4/3]')}>
        <Image
          src={module.image}
          alt={module.alt}
          fill
          sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 92vw"
          className="object-cover transition-transform duration-[600ms] ease-swift motion-safe:group-hover:scale-[1.04]"
        />
      </div>
      <div className={cn('flex flex-1 flex-col', compact ? 'p-4' : 'p-5')}>
        {index !== undefined && (
          <p className="tabular font-inscription text-label tracking-[0.14em] text-primary/70">
            {String(index + 1).padStart(2, '0')}
          </p>
        )}
        <h3 className={cn('font-display leading-snug', compact ? 'text-base' : 'mt-1 text-lg')}>
          {module.title}
        </h3>
        {!compact && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{module.intro}</p>
        )}
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-primary">
          Read
          <ArrowUpRight
            className="h-4 w-4 transition-transform duration-swift ease-swift motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}
