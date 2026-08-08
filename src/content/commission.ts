/**
 * The guided route into a commission.
 *
 * Most people who want something painted cannot write a brief, because they do
 * not yet know which decisions there are to make. These questions are those
 * decisions, in the order the workshop actually asks them — and the answers
 * compose into ordinary prose in the brief box, which the visitor can then
 * edit or ignore entirely.
 *
 * Nothing here is required, nothing here replaces the free-text field, and
 * every option is something this store genuinely does.
 */

export type GuideOption = {
  value: string;
  label: string;
  /** One line under the label. Says what choosing this actually means. */
  hint?: string;
};

export type GuideQuestion = {
  id: string;
  /** Asked in the second person, plainly. */
  question: string;
  /** Why the workshop needs to know. Shown small, under the question. */
  why: string;
  options: GuideOption[];
  /** Which form field this answer prefills, if any. */
  fills?: 'pieceType' | 'fabric' | 'timeline';
  /** How the answer reads inside the composed brief. */
  sentence: (label: string) => string;
};

export const guideQuestions: GuideQuestion[] = [
  {
    id: 'piece',
    question: 'What should it be?',
    why: 'The kind of piece decides almost everything else — how long it takes, what it costs, and how the drawing is planned.',
    fills: 'pieceType',
    options: [
      { value: 'saree', label: 'A saree', hint: 'Six weeks of one person’s hand' },
      { value: 'dupatta', label: 'A dupatta or chunni', hint: 'Read close up, so the border matters most' },
      { value: 'painting', label: 'A painting or panel', hint: 'A narrative, read across a room' },
      { value: 'home-decor', label: 'Something for the home', hint: 'Cushions, runners, hangings' },
      { value: 'blouse', label: 'A blouse piece', hint: 'Often matched to a saree you own' },
      { value: 'other', label: 'I am not sure yet', hint: 'Tell us the idea and we will suggest' },
    ],
    sentence: (label) => `I would like ${label.toLowerCase()}.`,
  },
  {
    id: 'occasion',
    question: 'Who is it for?',
    why: 'A piece for a wedding and a piece for a wall are drawn differently, at different scales.',
    options: [
      { value: 'self', label: 'Myself' },
      { value: 'gift', label: 'A gift' },
      { value: 'wedding', label: 'A wedding' },
      { value: 'festival', label: 'A festival' },
      { value: 'home', label: 'A particular room' },
      { value: 'collection', label: 'A collection' },
    ],
    sentence: (label) => `It is for ${label.toLowerCase()}.`,
  },
  {
    id: 'subject',
    question: 'What should be drawn on it?',
    why: 'Kalamkari is narrative art. The subject is the largest single decision, and it is also the one most people arrive without.',
    options: [
      { value: 'ramayana', label: 'An episode from the Ramayana', hint: 'Weeks of work — always a commission' },
      { value: 'mahabharata', label: 'An episode from the Mahabharata', hint: 'Weeks of work — always a commission' },
      { value: 'krishna', label: 'Krishna Leela', hint: 'The most asked-for narrative' },
      { value: 'tree', label: 'The Tree of Life', hint: 'Fills a pallu or a panel beautifully' },
      { value: 'temple', label: 'Temple borders and geometry', hint: 'No figures — pure border work' },
      { value: 'floral', label: 'Florals, peacocks, a jaal', hint: 'The everyday repertoire' },
      { value: 'own', label: 'Something of my own', hint: 'Describe it below, and attach a picture' },
    ],
    sentence: (label) => `The subject: ${label.toLowerCase()}.`,
  },
  {
    id: 'cloth',
    question: 'On what cloth?',
    why: 'The cloth decides how fine the line can be, how the dye strikes, how it drapes and what it costs.',
    fills: 'fabric',
    options: [
      { value: 'Cotton', label: 'Cotton', hint: 'Takes the dye deepest, softens with washing' },
      { value: 'Tussar silk', label: 'Tussar silk', hint: 'Warm, textured, holds strong colour' },
      { value: 'Chanderi', label: 'Chanderi', hint: 'Light and slightly sheer' },
      { value: 'Mulmul cotton', label: 'Mulmul cotton', hint: 'The softest, for everyday wear' },
      { value: 'Silk', label: 'Silk', hint: 'The finest line this workshop draws' },
      { value: '', label: 'Advise me', hint: 'We will suggest one for the drawing you want' },
    ],
    sentence: (label) =>
      label === 'Advise me'
        ? 'I would like advice on which cloth suits it.'
        : `On ${label.toLowerCase()}, if it suits the drawing.`,
  },
  {
    id: 'when',
    question: 'When do you need it?',
    why: 'Every stage of this craft ends with the cloth going into the sun, so the monsoon genuinely stops work. A timeline agreed in January is far more reliable than one agreed in July.',
    fills: 'timeline',
    options: [
      { value: 'No deadline', label: 'No deadline', hint: 'The best answer, and the one that gets the best piece' },
      { value: 'Within 2 months', label: 'Within two months' },
      { value: 'Within 4 months', label: 'Within four months' },
      { value: 'For a specific date', label: 'For a specific date', hint: 'Tell us which, below' },
    ],
    sentence: (label) => `Timing: ${label.toLowerCase()}.`,
  },
];

/* -------------------------------------------------------------------------- */
/* Attachments                                                                */
/* -------------------------------------------------------------------------- */

export const REFERENCE_LIMITS = {
  maxFiles: 4,
  /** 5 MB each. Enough for a phone photograph, small enough to keep in the row. */
  maxBytes: 5 * 1024 * 1024,
  accept: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  acceptAttribute: 'image/jpeg,image/png,image/webp,image/heic,image/heif',
} as const;

/** What the store promises to do with an attached picture. */
export const REFERENCE_NOTE =
  'Pictures are seen only by the family, are never published, and are deleted with the enquiry. A photograph of a saree you already own is genuinely useful — matching a natural dye by eye is something we do often and a colour picker cannot.';

/* -------------------------------------------------------------------------- */
/* What happens after you send                                                */
/* -------------------------------------------------------------------------- */

/**
 * The commission timeline, stated before anybody commits.
 *
 * Every step here is what actually happens, including the one where the store
 * says no. Trust on a page like this comes from naming the parts that are not
 * flattering.
 */
export const commissionTimeline = [
  {
    n: '01',
    title: 'You send this form',
    body: 'No payment, no obligation. It reaches the family directly rather than a support desk.',
    when: 'Now',
  },
  {
    n: '02',
    title: 'Somebody replies with honest questions',
    body: 'Usually within a few days, longer if the workshop is mid-dyeing. If what you have asked for does not suit pen Kalamkari — portrait likeness, for instance — we will say so rather than take the order.',
    when: '1–4 days',
  },
  {
    n: '03',
    title: 'Cloth, scale, price and timing are agreed',
    body: 'In writing, before anything begins. Half is paid to start; the rest before dispatch.',
    when: 'After the conversation',
  },
  {
    n: '04',
    title: 'It is drawn, dyed and washed',
    body: 'All twenty-three steps, the same as everything else in the store. You will be sent progress pictures at the outline stage and after the madder bath.',
    when: '15–45 days for a saree',
  },
  {
    n: '05',
    title: 'It is sent from Srikalahasti',
    body: 'Checked, folded in unbleached muslin, and dispatched with tracking. One of one, and yours.',
    when: 'On completion',
  },
] as const;
