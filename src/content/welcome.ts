import { site } from './site';

/**
 * The doorway and the walk-through.
 *
 * Both are written to the same rule as the rest of the site: say something
 * true and specific, or say nothing. A welcome overlay that says "Welcome to
 * our store!" has cost the visitor a click and told them nothing they could
 * not see. This one tells them the single fact that makes the rest of the site
 * worth reading.
 */

export const welcome = {
  eyebrow: `${site.location.town} · ${site.location.district}`,
  /** The one line. Unique to this house, and true on the day it is read. */
  headline: 'The cloth on our roof is still wet.',
  standfirst:
    'You have most likely arrived here from something sold as “Kalamkari” that was printed by a machine. This is the other thing — the same name, a different craft.',
  body: [
    'Every piece in this store was drawn freehand with a sharpened bamboo pen, once, by one of five people in one house in Srikalahasti. No blocks. No screens. No tracing.',
    'The colours are boiled out of iron, madder root, indigo and myrobalan nut. A saree takes between fifteen and forty-five days, and the monsoon stops all of it.',
  ],
  /** Three facts, shown as a plate. Each is checkable against /process. */
  facts: [
    { value: '23', label: 'steps, all by hand' },
    { value: '21 days', label: 'to ferment the black' },
    { value: '0', label: 'synthetic ingredients' },
  ],
  primary: { label: 'Come in', href: null },
  secondary: { label: 'Watch it being made', href: '/process' },
  /** Shown under the buttons, small. */
  footnote: 'You will not see this again.',
} as const;

/* -------------------------------------------------------------------------- */
/* The quick tour                                                             */
/* -------------------------------------------------------------------------- */

export type TourStep = {
  id: string;
  /** Matches a `data-tour` attribute in the DOM. Missing targets are skipped. */
  target: string;
  /**
   * The page section this stop is *about*, matched against `data-tour-section`.
   *
   * `target` is the thing the ring is drawn on, and on a desktop three of the
   * six targets are links in the header. A header link is `sticky`, so it is
   * already on screen and there is nothing to scroll to — which made Next feel
   * broken on a laptop while working correctly on a phone, where the same
   * stops resolve to in-page controls.
   *
   * So the ring and the travel are separated: the ring stays on the control,
   * and the page moves to the section that control leads to. Optional, because
   * three stops (search, the assistant, the theme toggle) are chrome and have
   * no section — for those the page correctly stays where it is.
   */
  section?: string;
  /**
   * Two or three words, for the row of section links in the tour card.
   *
   * Deliberately not the `title`. The titles are sentences — "Almost
   * everything here is one of one" — which is right for the panel a reader is
   * currently on and useless as a label in a row of six. These are the names
   * of the stops, short enough that six of them wrap to two lines inside a
   * 384px card.
   */
  label: string;
  title: string;
  /** One or two lines. What this is, in the visitor's terms. */
  summary: string;
  /** Two or three further lines, revealed by "more". Never repeats the summary. */
  more: string[];
};

/**
 * Six stops. Deliberately short.
 *
 * A tour that explains everything is a tour nobody finishes, so each step gets
 * one or two lines and hides the rest behind "more" — the visitor who wants
 * depth asks for it, and the visitor who wants to shop is three clicks from
 * being left alone.
 *
 * Every step names something that is genuinely unusual about this site rather
 * than narrating a standard shop. Nobody needs to be told what a cart is.
 */
export const tourSteps: TourStep[] = [
  {
    id: 'shop',
    target: 'shop',
    label: 'One of one',
    section: 'shop',
    title: 'Almost everything here is one of one',
    summary:
      'There is no device in this craft that would let a drawing be repeated. When a piece sells, it is gone.',
    more: [
      'That is why you will not find a “notify me when back in stock” anywhere on this site — it would be a promise the workshop cannot keep.',
      'Sold pieces stay visible on purpose. They are the clearest record of what this house can actually draw.',
      'If something has gone and you wanted it, the answer is a commission: a sibling of that piece, not a copy of it.',
    ],
  },
  {
    id: 'process',
    target: 'process',
    label: 'The 23 steps',
    section: 'process',
    title: 'The twenty-three steps, in order',
    summary:
      'The whole sequence, with the cloth changing beside you as you read and the colour moving through the seven pots.',
    more: [
      'The strangest fact in the craft is on that page: the artist never touches a red pigment. Reds are painted on as a clear alum solution and arrive days later in a boiling bath.',
      'Every step names its real materials and a realistic duration. Nothing on it is a metaphor.',
      'If you only read one page here before buying, read that one.',
    ],
  },
  {
    id: 'custom',
    target: 'custom',
    label: 'Commissions',
    section: 'custom',
    title: 'Anything can be painted for you',
    summary:
      'Because nothing is printed, nothing has to be chosen from a catalogue. Tell us the subject, the cloth and the occasion.',
    more: [
      'The narrative traditions — Ramayana, Mahabharata, Krishna Leela, Tree of Life — are almost always commissions, because each is weeks of one person’s undivided attention.',
      'Two honest warnings live on that page: the monsoon stops everything, and natural dye is not a colour picker.',
      'No payment is taken to start a conversation.',
    ],
  },
  {
    id: 'search',
    target: 'search',
    label: 'Search',
    title: 'Search reads the story, not just the title',
    summary:
      'It looks inside the motif, the cloth and the description — so “indigo”, “tussar” or “Ramayana” finds more than a product name will.',
    more: [
      'Filters live in the address bar, so a filtered view can be shared, bookmarked, and survives the back button.',
      'You can also browse by cloth or by story from any of the type pages.',
      'Ask the assistant if you would rather describe what you want in a sentence.',
    ],
  },
  {
    id: 'assistant',
    target: 'assistant',
    label: 'Ask Lakshmi',
    title: 'Someone to ask',
    summary:
      'An assistant that knows this workshop specifically — the dyes, the timings, and what is in the store right now.',
    more: [
      'It answers from what the family has actually written down, and says so when it does not know rather than guessing.',
      'It will not quote you a delivery date or agree a price. Those come from a person.',
      'It keeps working even when it cannot reach the model, from a local copy of the same notes.',
    ],
  },
  {
    id: 'theme',
    target: 'theme',
    label: 'Light & dark',
    title: 'Light and dark, both sampled from the dyes',
    summary:
      'The dark theme is not an inverted copy — it is the store at night, with the madder lifted so it still reads.',
    more: [
      'It follows your system setting unless you override it here.',
      'Reduced-motion is respected everywhere: the animation stops, but nothing that carries information disappears with it.',
      'Pinch-zoom is never disabled on this site.',
    ],
  },
];

/** Bumped when the copy changes enough that returning visitors should see it. */
export const WELCOME_VERSION = '1';
export const TOUR_VERSION = '1';
