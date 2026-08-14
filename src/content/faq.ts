/**
 * The questions people actually ask, and the answers the family gives.
 *
 * Two surfaces read this file: the section on the landing page (a chosen few)
 * and `/faq` (all of them). Neither restates an answer — both render from here,
 * so the two can never drift.
 *
 * ---------------------------------------------------------------------------
 * Where the answers come from
 * ---------------------------------------------------------------------------
 *
 * An entry answers in one of two ways, and never both:
 *
 * - `knowledge: '<id>'` reads the answer out of `assistant.ts` at render time.
 *   Used wherever Lakshmi already answers the question, so the chat panel, the
 *   landing page and `/faq` are one set of words rather than three.
 * - `answer: '…'` states it here, for questions the assistant has no entry for.
 *
 * ---------------------------------------------------------------------------
 * The editorial rule, and the four questions that were held back under it
 * ---------------------------------------------------------------------------
 *
 * This site states only what is publicly on the record or was given by the
 * store. That rule does not get an exception for a FAQ, which is exactly the
 * page where invented answers are least likely to be noticed and most likely to
 * be believed — somebody reading "do you charge to teach it" is deciding
 * whether to write and ask.
 *
 * Four questions about the household's own motives, history and arrangements
 * were carried here as `draft: true` with no answer, rendering **nowhere**,
 * because nothing in this repository or on the public record answered them.
 * Absent beats invented, for the same reason an unpublished contact channel
 * renders as nothing rather than as a dead `mailto:`.
 *
 * The store answered all four on 2026-08-14 and they are now published — see
 * the note above `why-continue`. That is the mechanism working as intended,
 * not a reason to relax it: the draft state is still here, `resolveFaq` still
 * throws on an entry that is neither answered nor drafted, and the next
 * question nobody has asked the family should be added the same way.
 *
 * To publish one: delete `draft: true` and write the `answer`.
 */

import { knowledge, type KnowledgeEntry } from './assistant';
import { site } from './site';
import { totalSteps } from './process';

export type FaqGroup =
  | 'the-craft'
  | 'telling-it-apart'
  | 'buying'
  | 'care'
  | 'the-family'
  | 'visiting';

export const faqGroups: { id: FaqGroup; label: string; blurb: string }[] = [
  {
    id: 'the-craft',
    label: 'The craft',
    blurb: 'What the word means, and what is actually done to the cloth.',
  },
  {
    id: 'telling-it-apart',
    label: 'Telling it apart',
    blurb: 'How to know hand-painted work from the printed cloth sold under the same name.',
  },
  {
    id: 'buying',
    label: 'Buying a piece',
    blurb: 'Price, availability, delivery and what happens after you order.',
  },
  {
    id: 'care',
    label: 'Living with it',
    blurb: 'Washing, wearing, storing, and how naturally dyed cloth ages.',
  },
  {
    id: 'the-family',
    label: 'The family and the work',
    blurb: 'Who does this, how it was learned, and what keeps it going.',
  },
  {
    id: 'visiting',
    label: 'Visiting and commissions',
    blurb: 'Coming to Srikalahasti, and having something painted for you.',
  },
];

export type FaqEntry = {
  id: string;
  group: FaqGroup;
  /** The question as a visitor puts it, not as a shop would file it. */
  question: string;
  /** An id in `knowledge`. Mutually exclusive with `answer`. */
  knowledge?: string;
  /** Stated here, for questions the assistant has no entry for. */
  answer?: string;
  /** Where to go for the long version. */
  link?: { label: string; href: string };
  /**
   * Awaiting the family's own words. Renders nowhere until answered.
   * See the note at the top of this file.
   */
  draft?: true;
};

export const faqs: FaqEntry[] = [
  /* ---- The craft ------------------------------------------------------- */
  {
    id: 'what-is-kalamkari',
    group: 'the-craft',
    question: 'What does “Kalamkari” actually mean?',
    knowledge: 'what-is-kalamkari',
  },
  {
    id: 'the-process',
    group: 'the-craft',
    question: 'How long does one saree actually take?',
    knowledge: 'the-process',
  },
  {
    id: 'natural-dyes',
    group: 'the-craft',
    question: 'Where do the colours come from?',
    knowledge: 'natural-dyes',
  },
  {
    id: 'why-23-steps',
    group: 'the-craft',
    question: `Why ${totalSteps} steps? Could it not be done in fewer?`,
    answer:
      `It could be done in fewer, and almost everything sold as Kalamkari is. The ${totalSteps} are not a ritual — each one is either preparing the cloth to accept a colour, applying one, or fixing it. The washing and sun-drying repeat because every colour has to be rinsed clear of what did not bind before the next one goes on, or the second colour lands on the residue of the first. Take out the repetitions and you get a piece that looks the same in the shop and loses its reds in the second wash.`,
    link: { label: 'Walk through every step', href: '/process' },
  },
  {
    id: 'green-routes',
    group: 'the-craft',
    question: 'Is there a green dye?',
    answer:
      'No, and there never has been. Green is always one colour arriving on top of another, and this workshop keeps four ways of reaching it — yellow with kasim, yellow under blue, blue under yellow, and a green from hibiscus. Those are four different greens, not four names for one, and which route is used is decided before either colour goes down. A printer covering the same range would need four separate inks.',
    link: { label: 'See the colours', href: '/process' },
  },
  {
    id: 'indigo-dipped',
    group: 'the-craft',
    question: 'Why is the blue dipped when everything else is painted?',
    answer:
      'Because indigo will not stay where a pen puts it. It only takes hold as the cloth comes out of the vat and meets the air, so the whole piece has to go in — and every area that must stay clear is covered in wax by hand first. That single fact shapes the drawing: a piece with blue in it has to be planned around the vat from the first charcoal line, and cannot be reconsidered later.',
    link: { label: 'See the colours', href: '/process' },
  },

  /* ---- Telling it apart ------------------------------------------------ */
  {
    id: 'block-vs-pen',
    group: 'telling-it-apart',
    question: 'How do I know this one isn’t printed?',
    knowledge: 'block-vs-pen',
  },
  {
    id: 'what-we-avoid',
    group: 'telling-it-apart',
    question: 'Is anything synthetic used at any stage?',
    knowledge: 'what-we-avoid',
  },
  {
    id: 'irregularities',
    group: 'telling-it-apart',
    question: 'The pattern is not perfectly even. Is that a fault?',
    answer:
      'It is the opposite of one. Nothing in this craft repeats a mark — a border that looks regular was drawn again and again by eye, and small differences in line, colour depth and repeat are how hand-painted work is identified. Srikalahasti Kalamkari holds a registered Geographical Indication on exactly that basis. A piece with a mechanically perfect repeat is a piece that met a block or a screen.',
  },
  {
    id: 'yellow-tell',
    group: 'telling-it-apart',
    question: 'Is there a quick way to spot a fake?',
    answer:
      'Look at the yellow and the back of the cloth. Natural yellow is a soft mustard-gold and never glows acid-lemon; if it does, something has helped it along. Then turn the piece over — because these dyes strike into the fibre rather than sitting on top of it, the drawing reads on the reverse too, softer but present. A screen print stops at the surface.',
    link: { label: 'Hand-painted or printed', href: '/journal' },
  },

  /* ---- Buying ---------------------------------------------------------- */
  {
    id: 'price',
    group: 'buying',
    question: 'Why does it cost what it costs?',
    knowledge: 'price',
  },
  {
    id: 'one-of-one',
    group: 'buying',
    question: 'Can I have the same one again?',
    knowledge: 'one-of-one',
  },
  {
    id: 'shipping',
    group: 'buying',
    question: 'Where do you ship, and how long does it take?',
    knowledge: 'shipping',
  },
  {
    id: 'colour-on-screen',
    group: 'buying',
    question: 'Will it look like the photograph?',
    answer:
      'Close, but not exact, and the reason is worth knowing. Natural dye shifts with the cloth, the water and the season — the same madder bath gives a warmer red on tussar than on cotton, and no two pieces come out of it identical. Photographs are taken in daylight without colour correction for that reason. Expect the piece in your hands to be within a shade of what you saw, and to be a shade warmer in a lit room than on a screen.',
  },
  {
    id: 'stock',
    group: 'buying',
    question: 'Why is there so little in stock?',
    answer:
      'Because each piece is weeks of one person’s hand, and there is one of everything. The store holds a small number at any time and always has — a large permanent catalogue would mean either repetition, which this craft has no device for, or somebody else’s cloth. If what you wanted has gone, a commission is usually the answer rather than a wait.',
    link: { label: 'Commission a piece', href: '/custom' },
  },
  {
    id: 'payment',
    group: 'buying',
    question: 'How do I pay, and is it safe?',
    answer:
      'Through Razorpay — cards, UPI, net banking and the usual wallets. The card details are entered on Razorpay’s own form and never reach this site or the store; what comes back here is a payment reference, and that is what the order is matched against. If you would rather not pay online at all, write to the store and arrange it directly. A commission takes no payment to begin with either way.',
    link: { label: 'Start a commission', href: '/custom' },
  },
  {
    id: 'returns',
    group: 'buying',
    question: 'What if it arrives and it is not right?',
    answer:
      'Write to the store. Because every piece is one of one, a return is a real loss to the catalogue rather than a restock, so the family would much rather answer questions properly before you order than take a piece back after — ask for more photographs, ask about the cloth, ask what the colour does in daylight. The full terms are on the shipping page.',
    link: { label: 'Shipping and returns', href: '/shipping' },
  },

  /* ---- Care ------------------------------------------------------------ */
  {
    id: 'care',
    group: 'care',
    question: 'Will the colour run when I wash it?',
    knowledge: 'care',
  },
  {
    id: 'first-wash',
    group: 'care',
    question: 'Is there anything special about the first few washes?',
    answer:
      'Wash it separately for the first three. A little unbound dye may still lift — that is the surplus rinsing out, not the colour leaving the cloth, and it stops. Cold water, mild soap, no bleach and no optical brightener at any point. Do not wring it; press the water out.',
    link: { label: 'Full care guide', href: '/care' },
  },
  {
    id: 'ageing',
    group: 'care',
    question: 'How will it look in ten years?',
    answer:
      'Better, if it is cotton and you wear it. Naturally dyed cotton softens with every wash, the colours settle a shade warmer, and the cloth starts to fall rather than sit. Iron black and madder red hold best, because both were fixed into the fibre by a mordant rather than laid on top of it; indigo softens gradually, as indigo has always done on any cloth. The one thing that genuinely damages a piece is direct sunlight over years — natural dye is light-sensitive in a way synthetic dye is not, and a lifted colour cannot be put back.',
    link: { label: 'Full care guide', href: '/care' },
  },
  {
    id: 'framing',
    group: 'care',
    question: 'How should a painting be framed?',
    answer:
      'Behind UV-filtering glass, with a mount that keeps the cloth off the glazing, on a wall that never takes direct sun. Panels are sent unframed unless something else is agreed, because framing is easier to do well locally than to survive a courier. The wall matters more than the frame: no glass will save a piece hung in an afternoon window.',
  },

  /* ---- The family ------------------------------------------------------ */
  {
    id: 'the-family',
    group: 'the-family',
    question: 'Who paints these?',
    knowledge: 'the-family',
  },
  {
    id: 'who-started',
    group: 'the-family',
    question: 'Who started this work in your home, and who taught you?',
    answer:
      'It came down from the father of the house. M Muni Reddy trained in the craft under a government programme and brought it home, and the store he and M Rajeshwari founded takes its name from their daughter. Their three children — M Muniratnamma, P Vijaya Lakshmi and M Viswanath Reddy — learned it from him the way the craft passes through Srikalahasti households: not as a course taken, but by sitting beside it from childhood. There was no point at which any of them started; there was a room with work going on in it.',
    link: { label: 'Meet the family', href: '/our-story' },
  },
  {
    id: 'the-cluster',
    group: 'the-family',
    question: 'Is this the only workshop doing it?',
    answer:
      `No, and that matters. The family works alongside roughly forty other artisans in ${site.location.town}. This has always been a town-scale tradition rather than a household one — the dyes, the water, the washing ground and the knowledge itself are shared — and the survival of any one workshop is bound up with the survival of the rest. A store here that claimed to be the last practitioner would be telling you something untrue about its own neighbours.`,
    link: { label: 'Our story', href: '/our-story' },
  },
  /*
    The four below were `draft: true` and rendered nowhere, because nothing in
    this repository or on the public record answered them and a FAQ is the
    worst possible place to invent something. They were answered by the store
    on 2026-08-14, and the answers below are those words — expanded into full
    sentences, but not added to. Where the family gave a reason, it is their
    reason; where they did not, none has been supplied on their behalf.
  */
  {
    id: 'why-continue',
    group: 'the-family',
    question: 'Why do you continue this work even when it is not highly profitable?',
    answer:
      'Because somebody has to keep it going. The work is slow and the return on it is thin — that is simply true, and it is why many households here that once did this now do something else. The family’s own answer is that the tradition is worth holding on to and worth encouraging in other people. That is the reason the work continues. There is not a better one about money.',
    link: { label: 'Our story', href: '/our-story' },
  },
  {
    id: 'teaching',
    group: 'the-family',
    question: 'How does this work help others? Do you charge to teach it?',
    answer:
      'No. Students, people who are simply interested, and visitors from outside India are shown the work free of charge, and whatever they ask about the materials and the sequence is explained. Nothing is charged for a demonstration and nothing is held back. A craft kept secret is a craft with one generation left in it.',
    link: { label: 'Come and see it', href: '/contact' },
  },
  {
    id: 'how-many-at-first',
    group: 'the-family',
    question: 'How many people were involved at the beginning?',
    answer:
      'At the beginning it was a family and nothing more — the household, working in its own front room. Neighbours joined over time, then others from the town, and what began as one house’s work grew into a community of people doing it. That is also why the family will not describe itself as the last of anything.',
    link: { label: 'Our story', href: '/our-story' },
  },
  {
    id: 'when-someone-leaves',
    group: 'the-family',
    question: 'What happens when someone leaves — for marriage, or another reason?',
    answer:
      'They keep working. Somebody who leaves the house, most often after marriage, carries the craft with them and continues it from their own home — and several have gone on to teach their own neighbours, with this family’s guidance when it is wanted. The knowledge is not held in this house. It travels with whoever learned it.',
  },

  /* ---- Visiting and commissions ---------------------------------------- */
  {
    id: 'visit',
    group: 'visiting',
    question: 'Can I come and watch it being made?',
    knowledge: 'visit',
  },
  {
    id: 'custom',
    group: 'visiting',
    question: 'Could you paint something for me?',
    knowledge: 'custom',
  },
  {
    id: 'monsoon',
    group: 'visiting',
    question: 'Is there a bad time of year to order or visit?',
    answer:
      'The monsoon. Every stage of this process ends with the cloth going into the sun, so in a wet week there is drawing but very little colour — nothing can be dried, and the dyeing simply stops. If you are travelling specifically to watch the dyeing, send a message first and the family will tell you what is actually going on that week rather than what usually is.',
    link: { label: 'Plan a visit', href: '/contact' },
  },
  {
    id: 'commission-time',
    group: 'visiting',
    question: 'How long does a commission take?',
    answer:
      'Longer than you would like, and the honest answer depends on the piece and the season. The drawing time is set by density rather than size, so a crowded pallu can take longer than a whole sparse saree — and the sun sets the rest of the schedule. The store agrees a timeline in conversation before anything starts, and would rather quote a real date than a short one.',
    link: { label: 'Start a commission', href: '/custom' },
  },
];

/* -------------------------------------------------------------------------- */

/**
 * The published set. Drafts are filtered out here, once, so no surface has to
 * remember to do it.
 */
export const publishedFaqs = faqs.filter((f) => !f.draft);

/**
 * The six shown on the landing page.
 *
 * This set changed, and the change is editorial rather than cosmetic.
 *
 * It used to be the questions that stop somebody *buying* — is this printed,
 * why does it cost that, will it run in the wash. Every one of those is
 * answered at length elsewhere on the same page: "is this printed" is the
 * entire argument of `TwoCrafts` two sections above, and the price and the
 * timings are on every product card. The section was restating the page.
 *
 * What the page did not have anywhere was the household answering questions
 * about *itself* — who taught them, why they keep doing work that pays badly,
 * whether they charge to teach it, what happens to somebody who leaves. Four
 * of those sat in this file as `draft: true` for exactly as long as nobody had
 * asked the family, rendering nowhere. They are the six now, because they are
 * the only thing on this page that no other section can say, and because a
 * stranger who has just read that the craft is dying deserves to hear from the
 * people not letting it.
 *
 * Ordered as a conversation rather than by importance: where it came from, why
 * it continues, who else gets taught, how many there were, where they go, and
 * who else is still doing it.
 */
export const landingFaqIds = [
  'who-started',
  'why-continue',
  'teaching',
  'how-many-at-first',
  'when-someone-leaves',
  'the-cluster',
] as const;

export type ResolvedFaq = Omit<FaqEntry, 'knowledge'> & {
  /** Always present after resolution, wherever it came from. */
  answer: string;
  /** The knowledge entry behind it, when there was one. */
  entry?: KnowledgeEntry;
};

/**
 * Resolve an entry's answer, from the knowledge base or from this file.
 *
 * Throws on an unknown knowledge id, and on an entry that is neither answered
 * nor marked draft — the same reasoning as `resolvedArrivalQuestions`. A FAQ
 * page that quietly renders twenty-four questions instead of twenty-five when
 * somebody renames a knowledge entry is a page nobody notices is broken.
 */
export function resolveFaq(faq: FaqEntry): ResolvedFaq {
  if (faq.knowledge) {
    const entry = knowledge.find((k) => k.id === faq.knowledge);
    if (!entry) {
      throw new Error(
        `faq.ts: no knowledge entry with id "${faq.knowledge}" (question "${faq.id}"). ` +
          `Available: ${knowledge.map((k) => k.id).join(', ')}`,
      );
    }
    return { ...faq, answer: entry.answer, link: faq.link ?? entry.link, entry };
  }

  if (!faq.answer) {
    throw new Error(
      `faq.ts: question "${faq.id}" has neither an answer nor a knowledge id. ` +
        `If it is waiting on the family's own words, mark it \`draft: true\`.`,
    );
  }

  return { ...faq, answer: faq.answer };
}

/** Every published question, answered. */
export function resolvedFaqs(): ResolvedFaq[] {
  return publishedFaqs.map(resolveFaq);
}

/** The landing-page subset, in the order given above. */
export function landingFaqs(): ResolvedFaq[] {
  return landingFaqIds.map((id) => {
    const faq = publishedFaqs.find((f) => f.id === id);
    if (!faq) {
      throw new Error(
        `faq.ts: landingFaqIds names "${id}", which is not a published question. ` +
          `A drafted question cannot be featured on the landing page.`,
      );
    }
    return resolveFaq(faq);
  });
}

/** Published questions for one group, in file order. */
export function faqsByGroup(group: FaqGroup): ResolvedFaq[] {
  return publishedFaqs.filter((f) => f.group === group).map(resolveFaq);
}
