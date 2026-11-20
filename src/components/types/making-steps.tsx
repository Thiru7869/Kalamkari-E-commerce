import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '@/components/layout/section-header';
import type { TypeMaking } from '@/content/type-making';

/**
 * How this kind of piece is made, as a numbered list a buyer can read in half a
 * minute. Content comes from `type-making.ts`, written for the garment; the
 * general craft account is one link away on /process and is not repeated here.
 */
export function MakingSteps({ making }: { making: TypeMaking }) {
  return (
    <section
      className="border-y border-border bg-cotton-100 section-y dark:bg-card"
      aria-labelledby="making-heading"
    >
      <div className="container">
        <SectionHeader
          eyebrow="Before it reached the shelf"
          title={making.heading}
          lead={making.lead}
          id="making-heading"
        />

        <ol className="mt-9 grid gap-x-8 gap-y-8 md:grid-cols-2 md:mt-12 lg:grid-cols-3">
          {making.steps.map((step, i) => (
            <li key={step.title} className="border-t-2 border-border pt-5">
              <span className="tabular font-display text-2xl leading-none text-primary/80">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 font-display text-lg leading-snug">{step.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              {step.detail && (
                <p className="mt-3 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {step.detail}
                </p>
              )}
            </li>
          ))}
        </ol>

        <p className="mt-10 border-t border-border pt-6 text-sm">
          <Link
            href="/process"
            className="inline-flex min-h-[2.75rem] items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
          >
            The full process, step by step
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </p>
      </div>
    </section>
  );
}
