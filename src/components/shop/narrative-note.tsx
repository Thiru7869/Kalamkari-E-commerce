import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { NARRATIVE_NOTE, narrativeMotifs, narrativeMotifNames } from '@/content/catalogue';
import { cn } from '@/lib/utils';

/**
 * The commission-first note for the narrative traditions.
 *
 * Ramayana, Mahabharata, Krishna Leela and the Tree of Life are the pieces
 * people arrive asking for by name, and the ones most likely to be out of the
 * store — because each is weeks of one person's hand and no composition is
 * ever repeated. Saying so where the disappointment would otherwise happen is
 * worth more than a "notify me" that this catalogue can never honour.
 *
 * Appears on the type pages, on the collections, and above search results when
 * the query names one of them.
 */
export function NarrativeNote({
  variant = 'panel',
  matched,
  className,
}: {
  /** `panel` for a page section, `inline` for a slim bar above results. */
  variant?: 'panel' | 'inline';
  /** Which of the four the visitor actually asked for, if known. */
  matched?: string;
  className?: string;
}) {
  const names = narrativeMotifs.map((slug) => narrativeMotifNames[slug]);

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'rounded-sm border border-primary/25 bg-primary/[0.04] px-4 py-3.5',
          className,
        )}
      >
        <p className="text-sm leading-relaxed">
          <span className="font-medium">
            {matched ?? 'Narrative'} pieces are drawn to order.
          </span>{' '}
          <span className="text-muted-foreground">
            Whatever is in the store is what exists — the same composition is never painted
            twice.
          </span>{' '}
          <Link
            href={NARRATIVE_NOTE.href}
            className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
          >
            {NARRATIVE_NOTE.cta}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </p>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        'rounded-sm border border-border bg-muted/40 p-6 md:p-8',
        className,
      )}
      aria-labelledby="narrative-note-heading"
    >
      <p className="eyebrow">Commission first</p>
      <h2 id="narrative-note-heading" className="mt-3 font-display text-display-sm">
        {NARRATIVE_NOTE.heading}
      </h2>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        {NARRATIVE_NOTE.body}
      </p>

      <ul className="mt-5 flex flex-wrap gap-2">
        {names.map((name) => (
          <li
            key={name}
            className="rounded-sm border border-border bg-background px-3 py-1.5 text-sm"
          >
            {name}
          </li>
        ))}
      </ul>

      <Link
        href={NARRATIVE_NOTE.href}
        className="mt-6 inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        {NARRATIVE_NOTE.cta}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </aside>
  );
}
