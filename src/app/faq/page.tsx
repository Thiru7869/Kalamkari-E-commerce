import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/primitives';
import { SupportLinks } from '@/components/heritage/support-links';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { faqGroups, faqsByGroup, resolvedFaqs } from '@/content/faq';
import { assistantIdentity } from '@/content/assistant';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Questions people ask',
  description:
    'How to tell hand-painted Kalamkari from a print, what a piece costs and why, how to wash it, who paints it, and how to commission one. Answered by the family in Srikalahasti.',
  alternates: { canonical: '/faq' },
};

/**
 * Every question, in one place.
 *
 * The landing page carries six of these; this is the rest. Both render from
 * `src/content/faq.ts`, which reads most of its answers out of the assistant's
 * knowledge base — so a visitor gets the same words here, on the home page and
 * from Lakshmi in the corner of the screen.
 *
 * Deliberately plain. This is the page somebody lands on from a search with one
 * specific worry, and the job is to let them find their question and leave.
 * There is no hero image, no 3D, and nothing that moves except the accordions:
 * the banner is a rule, a heading and a sentence.
 *
 * **Back to top and the assistant are not mounted here.** Both are already
 * global, in `FloatingDock`. A second back-to-top button on this page would be
 * two controls doing one job, stacked on top of each other on a phone.
 */
export default function FaqPage() {
  const all = resolvedFaqs();

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* The banner — one rule, one heading, one sentence                    */}
      {/* ------------------------------------------------------------------ */}
      <header className="border-b border-border bg-cotton-100 pb-10 pt-10 md:pb-14 md:pt-12 dark:bg-card">
        <div className="container">
          <Breadcrumbs trail={[{ label: 'FAQ' }]} />

          <div className="mt-5 max-w-3xl">
            {/* Kept in step with the landing section deliberately: a reader
                arrives here by pressing "View all questions" under a heading
                that says "we are frequently asked", and landing on a different
                sentence reads as having gone somewhere else. */}
            <p className="eyebrow">Across the people</p>
            <h1 className="mt-3 text-display-lg leading-tight">
              Frequently asked questions
            </h1>
            <p className="mt-5 text-body-lg leading-relaxed text-muted-foreground">
              Collected from the front room in {site.location.town}, from letters, and from
              the messages that arrive through this site. The answers are the ones the
              family gives standing up. Where something is not known or not yet decided,
              this page says so rather than filling the space.
            </p>
          </div>

          {/*
            Jump links.

            Thirty questions in six groups is long enough that a reader who
            arrived wanting one of them should not have to scroll past the other
            twenty-nine. Real anchors to real section ids, so they work with
            JavaScript off and can be linked to from outside.
          */}
          <nav className="mt-8" aria-label="Question groups">
            <ul className="flex flex-wrap gap-2">
              {faqGroups.map((group) => {
                const count = faqsByGroup(group.id).length;
                if (count === 0) return null;
                return (
                  <li key={group.id}>
                    <a
                      href={`#${group.id}`}
                      className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-sm border border-border bg-background px-3.5 text-sm transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {group.label}
                      <span className="tabular text-xs text-muted-foreground">{count}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* The questions                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="container section-y">
        <div className="max-w-3xl">
          {faqGroups.map((group) => {
            const questions = faqsByGroup(group.id);
            if (questions.length === 0) return null;

            return (
              <section
                key={group.id}
                id={group.id}
                // `scroll-mt` clears the sticky header. Without it a jump link
                // lands with the group heading hidden underneath it, which
                // reads as having jumped to the wrong place.
                className="scroll-mt-28 pt-12 first:pt-0 md:scroll-mt-32 md:pt-16"
                aria-labelledby={`${group.id}-heading`}
              >
                <RevealOnScroll>
                  <h2 id={`${group.id}-heading`} className="text-display-sm">
                    {group.label}
                  </h2>
                  <p className="mt-2 text-muted-foreground">{group.blurb}</p>
                </RevealOnScroll>

                <Accordion
                  type="single"
                  collapsible
                  className="mt-6 border-t border-border"
                >
                  {questions.map(({ id, question, answer, link }) => (
                    <AccordionItem key={id} value={id}>
                      <AccordionTrigger className="group items-start gap-5 py-5 text-left hover:text-foreground">
                        {/* No numbering, here or on the landing page. */}
                        <span className="font-display text-lg leading-snug text-foreground transition-colors duration-300 group-hover:text-primary md:text-xl">
                          {question}
                        </span>
                      </AccordionTrigger>

                      <AccordionContent className="pb-6 pr-4 md:pr-8">
                        <p className="border-l-2 border-primary/40 pl-5 text-[0.9375rem] leading-relaxed">
                          {answer}
                        </p>

                        {link && (
                          <Link
                            href={link.href}
                            className="ml-5 mt-4 inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                          >
                            {link.label}
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            );
          })}

          {/* ---- Nothing here answered it -------------------------------- */}
          <RevealOnScroll>
            <div className="mt-16 rounded-sm border border-border bg-cotton-100 p-6 md:p-8 dark:bg-card">
              <h2 className="font-display text-display-sm">Not answered here?</h2>
              <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
                Ask {assistantIdentity.name} in the corner of the screen — she answers from
                these same notes — or write to the store and one of the family will reply.
                Questions asked often enough end up on this page.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-chay-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Write to the store
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/process"
                  className="inline-flex min-h-[2.75rem] items-center justify-center rounded-sm border border-foreground/25 px-5 text-sm font-medium transition-colors hover:bg-foreground/5"
                >
                  Walk through the {site.craft.steps} steps
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>

      {/*
        Structured data.

        A FAQ page is one of the few page types search engines render directly
        in results, and this one is answering the questions people actually
        search — "is kalamkari printed", "how to wash kalamkari". Only published
        questions are listed, because only they have answers.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: all.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          }),
        }}
      />

      <SupportLinks />
    </>
  );
}
