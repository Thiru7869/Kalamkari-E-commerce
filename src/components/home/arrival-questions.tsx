'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/primitives';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { landingFaqs } from '@/content/faq';
import { assistantIdentity } from '@/content/assistant';
import { site } from '@/content/site';

/**
 * What people ask when they walk in.
 *
 * This stands where a shop page normally puts testimonials, and it is not one.
 * Nobody has left a review on this site yet, and five invented lines from five
 * invented people would be the least honest thing on a site whose whole
 * argument is that its claims can be checked.
 *
 * What it does instead is the same job by the other route. A testimonials block
 * is trying to say *this shop is real and other people have stood here*; real
 * questions in a stranger's own words, answered plainly, says that and also
 * happens to be useful. The doubt a visitor arrives with — is this printed, why
 * does it cost that, will it run in the wash — is the doubt a testimonial is
 * trying to talk them out of. Answering it is stronger.
 *
 * **The questions are a subset, not the set.** Six here, the rest on `/faq`,
 * both rendered from `src/content/faq.ts` — which in turn reads most of its
 * answers out of the assistant's knowledge base. The reply here, the reply on
 * the FAQ page and the reply Lakshmi gives in the chat panel are one set of
 * words and cannot drift.
 *
 * Deliberately not styled as a support centre. No numbering, no icon column, no
 * card per question. A rule, the question set in the store's own display italic
 * at reading size — the shape of a page from a notebook.
 */
export function ArrivalQuestions() {
  const questions = landingFaqs();

  return (
    <section
      className="border-y border-border bg-cotton-100 section-y dark:bg-card"
      aria-labelledby="arrival-questions-heading"
    >
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          {/* ---- The framing ------------------------------------------------ */}
          <RevealOnScroll>
            {/*
              "Across the people", not "Across the counter".

              A counter is where a transaction happens, and this section is now
              the one place on the site where the household answers questions
              about itself rather than about its stock — who taught them, why
              they keep doing work that pays badly, who else they teach, and
              where somebody goes when they leave. The craft in this town has
              never been held by one house, and the section is named for the
              thing it is actually about.
            */}
            <p className="eyebrow">Across the people</p>
            <h2 id="arrival-questions-heading" className="mt-4 text-display-md leading-tight">
              These are some questions we are frequently asked
            </h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Not about the cloth this time, but about the house it comes from. These come
              up in the front room in {site.location.town} — from customers, from students,
              and from people who have travelled a long way to watch. The answers are the
              family&rsquo;s own words.
            </p>

            <p className="mt-5 leading-relaxed text-muted-foreground">
              Anything about a piece, the dyes or an order is on the full list, or ask{' '}
              {assistantIdentity.name} in the corner of the screen.
            </p>

            {/*
              The way through to the full set, given a button rather than a
              text link.

              It is the one thing in this column somebody is likely to want
              after reading six answers, and a underlined phrase at the end of
              two paragraphs is not competitive with the accordion beside it.
              The secondary link to the store keeps its quieter treatment
              underneath, which is the correct order of the two.
            */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Link
                href="/faq"
                className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-chay-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                View all questions
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <Link
                href="/contact"
                className="inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Write to the store
              </Link>
            </div>
          </RevealOnScroll>

          {/* ---- The questions ---------------------------------------------- */}
          <RevealOnScroll delay={0.08}>
            {/*
              `collapsible`, and nothing open by default.

              Opening the first one would make the section two screens tall
              before anybody chose to read anything, and the point of the shape
              is that the whole set fits in one glance — a visitor should be
              able to see their own worry in the list and go straight to it.
            */}
            <Accordion type="single" collapsible className="border-t border-border">
              {questions.map(({ id, question, answer, link }) => (
                <AccordionItem key={id} value={id}>
                  <AccordionTrigger className="group items-start gap-5 py-5 hover:text-foreground">
                    {/*
                      No number in front of it.

                      A numbered question reads as item six of a document the
                      reader has not seen the rest of, which is exactly the
                      wrong impression on a landing page carrying a chosen few
                      out of a longer list. The question is the whole label.
                    */}
                    <span className="font-display text-lg italic leading-snug text-foreground transition-colors duration-300 group-hover:text-primary md:text-xl">
                      “{question}”
                    </span>
                  </AccordionTrigger>

                  <AccordionContent className="pb-6 pr-8">
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
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
