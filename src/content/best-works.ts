/**
 * The grounds the Best Works panel is mounted on.
 *
 * One per position in the rail, cycled if the store ever marks more than six
 * pieces as masterpieces. They are not decorative colours picked to look good
 * behind a photograph — every one is lifted straight off the dye ramps in
 * `tailwind.config.ts`, so the panel is always sitting on a colour this
 * workshop can actually make.
 *
 * ---------------------------------------------------------------------------
 * Why `ink` is written down rather than computed
 * ---------------------------------------------------------------------------
 *
 * The same reason `colourStories` states it: a luminance test gets myrobalan
 * gold wrong. It scores as a bright colour and still needs dark text over it,
 * and the two greens sit close enough to the middle that a threshold picks
 * differently depending on which formula you use. So the choice is made once,
 * beside the colour, and `scripts/ink-check.mjs` proves it — the same script
 * that guards the eight flooded dye colours checks these six as well.
 *
 * The ladder is the one solved for `TwoCrafts`: 100 / 92 / 84 for light ink and
 * 100 / 90 / 82 for dark. Do not weaken it here without re-running the check.
 *
 * ---------------------------------------------------------------------------
 * The order
 * ---------------------------------------------------------------------------
 *
 * Deliberately alternating light and dark rather than running the ramps in
 * sequence. Pressing "next" is supposed to feel like turning to a different
 * plate; two pale grounds in a row read as the same page not having changed.
 */

export type WorkGround = {
  /** Sampled from the dye ramps. See tailwind.config.ts. */
  hex: string;
  /** Which ink reads on it. Verified, not guessed — see above. */
  ink: 'light' | 'dark';
  /** The pot it comes from, for the small label under the plate. */
  note: string;
};

export const workGrounds: WorkGround[] = [
  { hex: '#1B2942', ink: 'light', note: 'Indigo vat' },
  { hex: '#F7EBCA', ink: 'dark', note: 'Myrobalan ground' },
  { hex: '#74251B', ink: 'light', note: 'Madder bath' },
  { hex: '#E1E8D4', ink: 'dark', note: 'Pachcha, thinned' },
  { hex: '#583C28', ink: 'light', note: 'Catechu bark' },
  { hex: '#EBE0CD', ink: 'dark', note: 'Loom cotton' },
];

/** The ground for a position in the rail. Cycles rather than running out. */
export function groundFor(index: number): WorkGround {
  return workGrounds[index % workGrounds.length];
}

export const bestWorks = {
  eyebrow: 'Best works',
  heading: 'The pieces this house is judged by',
  /*
    What this section is, said plainly.

    It replaces "By the numbers", six counted figures on a dark ground. Those
    were honest and they were abstract — "forty artisans in the cluster" is a
    fact about an industry, and a visitor deciding whether this workshop can
    draw wants to see a thing it drew. Sold pieces stay in the rail for that
    reason: this is evidence, not stock.
  */
  standfirst:
    'Signed and exhibition-grade work, the hardest drawing this workshop does. Some of it has sold — it stays here because the question this answers is what the family can draw, not what is currently for sale.',
  empty:
    'Nothing is marked as exhibition work in the store right now. The full catalogue is a better place to look.',
} as const;
