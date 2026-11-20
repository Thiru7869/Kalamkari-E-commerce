import Image from 'next/image';
import { Breadcrumbs, type Crumb } from '@/components/layout/breadcrumbs';
import { cn } from '@/lib/utils';

/**
 * The opening of a heritage page: one compact rounded panel, copy on one side
 * and a photograph on the other. It is only as tall as what is in it, which is
 * the point: no banner with a headline floating in empty cloth.
 */
export function PageHero({
  trail,
  eyebrow,
  title,
  lede,
  image,
  imageAlt,
  children,
  className,
}: {
  trail: Crumb[];
  eyebrow: string;
  title: string;
  lede: string;
  image?: string;
  imageAlt?: string;
  /** Buttons or links under the lede. */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('container pt-6 md:pt-8', className)}>
      <Breadcrumbs trail={trail} />
      <div
        className={cn(
          'grid overflow-hidden rounded-sm border border-border bg-cotton-100 dark:bg-card',
          image && 'md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]',
        )}
      >
        <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
          <p className="eyebrow text-primary">{eyebrow}</p>
          <h1 className="mt-3 text-display-lg">{title}</h1>
          <p className="mt-4 max-w-xl text-body-lg text-muted-foreground">{lede}</p>
          {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
        </div>
        {image && (
          <div className="relative min-h-[14rem] md:min-h-[22rem]">
            <Image
              src={image}
              alt={imageAlt ?? ''}
              fill
              priority
              sizes="(min-width: 768px) 42vw, 100vw"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </header>
  );
}
