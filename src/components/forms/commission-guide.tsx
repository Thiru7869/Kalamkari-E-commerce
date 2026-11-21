'use client';

import { useState } from 'react';
import { Check, Sparkles, X } from 'lucide-react';
import { guideQuestions } from '@/content/commission';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Five questions, from "I want something painted" to a brief.
 *
 * Most people who want a commission cannot write one, because they do not yet
 * know which decisions there are to make. These are those decisions, in the
 * order the workshop actually asks them.
 *
 * It composes prose into the existing brief field and prefills the existing
 * selects rather than replacing either. Nothing about the form changes for
 * somebody who ignores this entirely — which is deliberate: a guided flow that
 * takes over a page has removed the option of just typing.
 */
export function CommissionGuide({
  onApply,
  className,
}: {
  /** Receives the composed brief plus any fields the answers can prefill. */
  onApply: (result: { brief: string; pieceType?: string; fabric?: string; timeline?: string }) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, GuideAnswer>>({});

  const total = guideQuestions.length;
  const question = guideQuestions[step];
  const answered = answers[question?.id];

  function choose(value: string, label: string) {
    const next = { ...answers, [question.id]: { value, label } };
    setAnswers(next);

    if (step < total - 1) {
      setStep(step + 1);
      return;
    }
    apply(next);
  }

  function apply(source: Record<string, GuideAnswer>) {
    const lines = guideQuestions
      .map((q) => {
        const answer = source[q.id];
        return answer ? q.sentence(answer.label) : null;
      })
      .filter(Boolean) as string[];

    const fills: { pieceType?: string; fabric?: string; timeline?: string } = {};
    for (const q of guideQuestions) {
      const answer = source[q.id];
      if (!q.fills || !answer) continue;
      if (q.fills === 'pieceType') fills.pieceType = answer.value;
      if (q.fills === 'fabric') fills.fabric = answer.value;
      if (q.fills === 'timeline') fills.timeline = answer.value;
    }

    onApply({
      brief: `${lines.join(' ')}\n\n`,
      ...fills,
    });

    setOpen(false);
    setStep(0);
  }

  if (!open) {
    return (
      <div className={cn('rounded-sm border border-primary/25 bg-primary/[0.04] p-4', className)}>
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg leading-snug">
              Not sure how to describe it?
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Answer five short questions and we will write the first draft of your brief.
              You can edit every word of it afterwards.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setOpen(true)}
            >
              Walk me through it
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-sm border border-primary/30 bg-card p-4 md:p-5', className)}>
      <div className="flex items-center gap-3">
        <p className="tabular font-inscription text-label uppercase tracking-[0.18em] text-muted-foreground">
          Question {step + 1} of {total}
        </p>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setStep(0);
          }}
          className="ml-auto -mr-1.5 flex h-9 w-9 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Close the guide and type it myself</span>
        </button>
      </div>

      {/* Position along the five. */}
      <ol className="mt-2 flex items-center gap-1" aria-hidden="true">
        {guideQuestions.map((q, i) => (
          <li
            key={q.id}
            className={cn(
              'h-0.5 flex-1 rounded-full transition-colors duration-300',
              i <= step ? 'bg-primary' : 'bg-border',
            )}
          />
        ))}
      </ol>

      <fieldset className="mt-4">
        <legend className="font-display text-lg leading-snug">{question.question}</legend>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{question.why}</p>

        <div className="mt-4 flex flex-col gap-2">
          {question.options.map((option) => {
            const selected = answered?.value === option.value;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => choose(option.value, option.label)}
                aria-pressed={selected}
                className={cn(
                  'flex min-h-[2.75rem] items-start gap-3 rounded-sm border px-3.5 py-2.5 text-left transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selected
                    ? 'border-primary bg-primary/[0.07]'
                    : 'border-border hover:border-primary/40 hover:bg-foreground/[0.03]',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                    selected ? 'border-primary bg-primary text-primary-foreground' : 'border-input',
                  )}
                  aria-hidden="true"
                >
                  {selected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm leading-snug">{option.label}</span>
                  {option.hint && (
                    <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                      {option.hint}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-4 flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => (step < total - 1 ? setStep(step + 1) : apply(answers))}
        >
          {step < total - 1 ? 'Skip this' : 'Finish'}
        </Button>
      </div>
    </div>
  );
}

type GuideAnswer = { value: string; label: string };
