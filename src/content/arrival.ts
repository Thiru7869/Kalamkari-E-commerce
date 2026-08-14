/**
 * What people ask when they arrive.
 *
 * This section stands where a testimonials block would normally go, and it is
 * here instead of one for a reason worth writing down.
 *
 * The `Review` table is empty. No customer has left a word on this site yet, and
 * the editorial rule this whole content layer runs on — say only what is known,
 * invent no quotes — does not have an exception for the section of a shop page
 * that is traditionally made up. Five invented lines from five invented people
 * would be the single least honest thing on a site whose entire argument is
 * that its claims can be checked.
 *
 * So the section carries real voices of a different kind: the questions the
 * store is actually asked, in the words visitors actually use, each answered
 * from the same notes the family wrote for the assistant. It does the job a
 * testimonials block does — it makes the shop feel inhabited, and it answers
 * the doubt a stranger arrives with — without a fabricated sentence in it.
 *
 * **The answers are not written here.** Each entry names a `knowledge` id and
 * the answer is read from `assistant.ts` at render time, so the reply a visitor
 * reads on the landing page and the reply Lakshmi gives in the chat panel are
 * the same words, and can never drift apart. Only the question phrasing lives
 * in this file.
 *
 * If and when the store has real customer words — from an email, a WhatsApp
 * thread, a card that came back with a return — they belong in a `voices.ts`
 * beside this file, attributed, and this section can move down the page.
 */

import { knowledge, type KnowledgeEntry } from './assistant';

export type ArrivalQuestion = {
  /** An id in `knowledge`. The answer is read from there, never copied. */
  id: string;
  /**
   * The question as a visitor puts it, not as a shop would file it.
   *
   * "How do I know it isn't printed" rather than "Authenticity". The whole
   * point of this section is that these are somebody's actual words at the
   * counter, and a taxonomy label is nobody's actual words.
   */
  question: string;
  /** Where in a real day this gets asked. One short clause, set quietly. */
  aside: string;
};

export const arrivalQuestions: ArrivalQuestion[] = [
  {
    id: 'block-vs-pen',
    question: 'How do I know this one isn’t printed?',
    aside: 'Asked first, almost every time',
  },
  {
    id: 'price',
    question: 'Why does it cost what it costs?',
    aside: 'Usually asked second',
  },
  {
    id: 'the-process',
    question: 'How long does one saree actually take?',
    aside: 'Asked while holding one',
  },
  {
    id: 'care',
    question: 'Will the colour run when I wash it?',
    aside: 'Asked at the counter, on the way out',
  },
  {
    id: 'one-of-one',
    question: 'Can I have the same one again?',
    aside: 'Asked after something has sold',
  },
  {
    id: 'custom',
    question: 'Could you paint something for me?',
    aside: 'Asked once somebody has understood the rest',
  },
];

/**
 * The questions, resolved against the knowledge base.
 *
 * Throws on an unknown id rather than dropping the entry silently. A section
 * that quietly renders five items instead of six when somebody renames a
 * knowledge entry is a section nobody notices is broken — the same reasoning
 * behind the seed throwing on an unrecognised dye phrase.
 */
export function resolvedArrivalQuestions(): (ArrivalQuestion & {
  entry: KnowledgeEntry;
})[] {
  return arrivalQuestions.map((q) => {
    const entry = knowledge.find((k) => k.id === q.id);
    if (!entry) {
      throw new Error(
        `arrival.ts: no knowledge entry with id "${q.id}". ` +
          `Available: ${knowledge.map((k) => k.id).join(', ')}`,
      );
    }
    return { ...q, entry };
  });
}
