import { site } from './site';
import { naturalDyes, totalSteps, whatWeDoNotUse } from './process';

/**
 * The assistant's knowledge base.
 *
 * Two jobs, one source of truth:
 *
 *  1. It is injected into the model's system prompt as reference material, so
 *     the assistant answers from what this store actually does rather than
 *     from a general impression of "Kalamkari".
 *  2. It backs the offline answer engine in `src/lib/assistant/local.ts`, which
 *     serves visitors when no model key is configured. A shop assistant that
 *     goes silent when a third-party API is unreachable is worse than no
 *     assistant, so the same facts have to work without one.
 *
 * Editorial rule, inherited from the rest of the content layer: only what is
 * known. Where a fact is not established (a closing time, a delivery date for a
 * custom piece), the entry says so and hands off to a human.
 */

export type KnowledgeEntry = {
  id: string;
  /** What a visitor would call this, in their words — used for local matching. */
  keywords: string[];
  /** One-paragraph answer, written to be read aloud as well as read. */
  answer: string;
  /** Where to send someone who wants the long version. */
  link?: { label: string; href: string };
};

export const knowledge: KnowledgeEntry[] = [
  {
    id: 'what-is-kalamkari',
    keywords: [
      'what is kalamkari', 'kalamkari meaning', 'kalam', 'explain kalamkari',
      'about the craft', 'srikalahasti', 'history', 'tradition', 'origin',
    ],
    answer:
      'Kalamkari means "pen work" — kalam, a pen; kari, craftsmanship. The pen is a sharpened bamboo stick wrapped with wool that holds the dye like a reservoir. Srikalahasti Kalamkari, which is what we make, grew up around the temple rather than the export trade, so its subjects are narrative: episodes from the epics, deities, stories meant to be read across a room. Every line is drawn freehand, once, with no tracing and no block.',
    link: { label: 'Read our story', href: '/our-story' },
  },
  {
    id: 'block-vs-pen',
    keywords: [
      'block print', 'printed', 'machilipatnam', 'difference', 'real or fake',
      'how do i know', 'authentic', 'genuine', 'handmade', 'screen print',
    ],
    answer:
      'Most cloth sold as "Kalamkari" is block-printed or screen-printed, and much of it uses chemical colour. There are two genuine traditions: Machilipatnam, which is carved into wooden blocks and repeated, and Srikalahasti, which is drawn freehand with a bamboo pen. Ours is the second. The tell is repetition — on a printed piece the same motif recurs identically; on ours, two peacocks on the same saree are never the same peacock. Look also at the back of the cloth: hand-drawn dye penetrates the weave, print sits on the surface.',
    link: { label: 'Telling the difference', href: '/journal' },
  },
  {
    id: 'natural-dyes',
    keywords: [
      'dye', 'dyes', 'colour', 'color', 'natural', 'chemical', 'vegetable dye',
      'madder', 'indigo', 'iron', 'myrobalan', 'what colours', 'palette',
    ],
    answer: `Every colour on our cloth comes out of a plant, a bark, a root or rusted iron. ${naturalDyes
      .slice(0, 5)
      .map((d) => `${d.colour} from ${d.source.toLowerCase()}`)
      .join('; ')}. Nothing synthetic is used at any stage — not in the cloth preparation, not in the outline, not in the fixing. That single rule is why a piece takes weeks instead of a day.`,
    link: { label: 'See the full dye list', href: '/process#dyes' },
  },
  {
    id: 'the-process',
    keywords: [
      'how is it made', 'process', 'steps', 'how long', 'making', 'stages',
      'alum', 'mordant', 'wash', 'sun', 'how do you make',
    ],
    answer: `There are ${totalSteps} steps, and the strangest thing about them is that the artist never touches a red pigment. The reds are painted on as a clear solution of alum, invisible on the cloth; days later the whole piece goes into a boiling bath of madder root, and the colour binds only where the alum went. Between stages the cloth is washed in the river and dried in the sun — up to ${site.craft.washCycles} times, most of them to remove colour rather than add it. A full saree takes ${site.craft.sareeDaysMin} to ${site.craft.sareeDaysMax} days.`,
    link: { label: 'Walk through every step', href: '/process' },
  },
  {
    id: 'the-family',
    keywords: [
      'who', 'family', 'artist', 'artisan', 'who makes', 'viswanath', 'award',
      'muni reddy', 'rajeshwari', 'vijaya lakshmi', 'muniratnamma', 'about you',
    ],
    answer:
      'The store was founded by M Muni Reddy and M Rajeshwari, and takes its name from their daughter. Their three children — M Muniratnamma, P Vijaya Lakshmi and M Viswanath Reddy — all learned the craft the way it passes through Srikalahasti households: not as a course taken, but by sitting beside it from childhood. M Viswanath Reddy received the National Award for pen Kalamkari in 2008. They work alongside roughly forty other artisans in the town.',
    link: { label: 'Meet the family', href: '/our-story' },
  },
  {
    id: 'care',
    keywords: [
      'wash', 'care', 'clean', 'maintain', 'dry clean', 'fade', 'iron',
      'store it', 'looking after', 'detergent',
    ],
    answer:
      'Natural dye is fixed, not fragile — but it is fixed by tannin and metal salts rather than by a chemical bond, so treat it gently. Cold water, mild soap, no detergent with bleach or optical brightener, and never wring it. Dry in shade rather than direct sun after the first year. Iron on the reverse. Naturally dyed cloth softens and settles over time; a little mellowing is the cloth behaving correctly, not a defect.',
    link: { label: 'Full care guide', href: '/care' },
  },
  {
    id: 'shipping',
    keywords: [
      'shipping', 'delivery', 'deliver', 'post', 'courier', 'how long to arrive',
      'international', 'abroad', 'free shipping', 'track',
    ],
    answer: `Within India, ${site.shipping.domesticDays}, flat rate, and free above ₹${(
      site.shipping.freeAbove / 100
    ).toLocaleString('en-IN')}. ${site.shipping.note} For an international address, send us a message with the destination before ordering — we quote it individually rather than averaging it into every price.`,
    link: { label: 'Shipping and returns', href: '/shipping' },
  },
  {
    id: 'custom',
    keywords: [
      'custom', 'commission', 'made to order', 'my own design', 'bespoke',
      'personalise', 'personalize', 'design my own', 'special order',
    ],
    answer:
      'Because nothing here is printed, nothing has to be chosen from a catalogue. Tell us what you want painted — a subject, an occasion, a cloth, a rough budget and a timeline — and the store replies to talk it through before anything is agreed. It does not have to be precise; most commissions start vague and get specific in conversation. Two honest warnings: the monsoon stops everything, because every stage ends with the cloth going into the sun; and natural dye is not a colour picker, so we can promise madder red or indigo blue but not an exact paint-chip match.',
    link: { label: 'Design a custom piece', href: '/custom' },
  },
  {
    id: 'visit',
    keywords: [
      'visit', 'address', 'where are you', 'shop location', 'come see',
      'directions', 'timings', 'open', 'hours', 'map',
    ],
    answer: `The store is a working home in ${site.location.town}, ${site.location.district}, ${site.location.state} — a short walk from the ${site.location.river}, where the cloth is washed. ${site.hours.note}`,
    link: { label: 'Plan a visit', href: '/contact' },
  },
  {
    id: 'price',
    keywords: [
      'price', 'cost', 'how much', 'expensive', 'cheap', 'budget', 'discount',
      'why so costly', 'worth',
    ],
    answer:
      'Price follows hand-hours and cloth, not brand. A stole or a small panel starts low; a fully painted silk saree with a narrative pallu is weeks of one person\'s work and is priced as such. Nothing here is discounted seasonally — the cost is what the making cost. Tell me a budget and the kind of piece you want, and I can point you to what fits.',
    link: { label: 'Browse everything', href: '/shop' },
  },
  {
    id: 'one-of-one',
    keywords: [
      'same piece', 'another one', 'reorder', 'identical', 'out of stock',
      'sold out', 'restock', 'unique',
    ],
    answer:
      'Each piece is the only one of itself — the same drawing is never made twice, because there is no device in this craft that would let it be. If something has sold and you want its near relative, tell me which piece it was and we can have a new one drawn in the same subject and cloth. It will be a sibling, not a copy.',
    link: { label: 'Design a custom piece', href: '/custom' },
  },
  {
    id: 'what-we-avoid',
    keywords: [
      'never use', 'avoid', 'no chemicals', 'synthetic', 'azo', 'eco', 'organic',
      'sustainable', 'safe', 'toxic',
    ],
    answer: `What we never use is the shorter list, and the more useful one: ${whatWeDoNotUse
      .slice(0, 4)
      .map((s) => s.toLowerCase())
      .join(', ')}, among others. The wash water goes back into the ground, so the rule is not only about the cloth.`,
    link: { label: 'The full process', href: '/process' },
  },
];

/** Openers offered before the visitor has typed anything. */
export const starterPrompts = [
  'How is a Kalamkari saree actually made?',
  'How do I tell hand-painted from printed?',
  'Help me choose a piece under ₹15,000',
  'Can you paint something to my own design?',
] as const;

export const assistantIdentity = {
  name: 'Kalam',
  /** Shown under the name in the chat header. */
  role: `Store assistant · ${site.location.town}`,
  greeting:
    'I can talk you through the craft, the twenty-three steps, what is in the store right now, or a piece made to your own design. What brings you here?',
  /** Displayed once, so nobody mistakes this for a person in the workshop. */
  disclosure:
    'I am an AI assistant for this store — helpful on the craft and the catalogue, but not a member of the family. For prices agreed in conversation, delivery dates or anything binding, I will hand you to them.',
} as const;
