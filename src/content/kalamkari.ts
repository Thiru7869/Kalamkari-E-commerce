/**
 * "What is Kalamkari?" — the answer, in one place.
 *
 * This is the single most-searched question the site can answer, and until now
 * the answer was scattered: a sentence in the assistant's knowledge base, a
 * paragraph in `storyChapters`, a claim in the hero. Somebody who genuinely did
 * not know what the word meant had to read three pages to find out.
 *
 * So it is stated once, here, and rendered twice — as a short section near the
 * top of the landing page, and in full at the head of /process, which is where
 * the "Know more" button goes. Neither copy is written out a second time.
 *
 * Editorial rule, as everywhere in `src/content`: every clause below is either
 * already stated elsewhere on this site or is a matter of public record.
 *
 *   - kalam / kari, and the bamboo pen with its bound reservoir — `process.ts`
 *     step 9, and the assistant's `what-is-kalamkari` entry.
 *   - Srikalahasti draws, Machilipatnam prints — `family.ts`, `storyChapters`.
 *   - Temple rather than export trade, narrative subjects — same.
 *   - Vijayanagara-period documentation and the registered GI — same.
 *   - The pots, and nothing synthetic at any of the steps — `process.ts`.
 *
 * Nothing here is new information. It is the existing argument, said first.
 */

import { site } from './site';

export type KalamkariFacet = {
  id: string;
  /** Two or three words. The noun this paragraph is about. */
  label: string;
  /** The line that carries it. Written to be read aloud. */
  heading: string;
  body: string;
};

export const whatIsKalamkari = {
  eyebrow: 'The word itself',

  /** The heading on the landing page. Short enough to set large. */
  heading: 'Kalam is a pen. Kari is what the hand does with it.',

  /**
   * The lead. One sentence, and it has to do the whole job for a visitor who
   * arrived from a marketplace listing selling printed polyester under this
   * name — which is most of them.
   */
  lead:
    'Every line on every piece in this store was drawn once, freehand, with a sharpened length of bamboo. Every colour in it was fermented, boiled or dipped out of something that grew or rusted. Nothing is printed, and nothing is repeated.',

  /** The three things worth knowing, in the order they answer the question. */
  facets: [
    {
      id: 'pen',
      label: 'The pen',
      heading: 'A stick of bamboo with a ball of wool bound above the tip',
      body: 'The wool is the reservoir; squeezing it feeds liquid down to the nib, so the flow is controlled by the pressure of two fingers. That is why a Kalamkari line swells where the hand slowed and thins where it lifted. A printed line holds exactly one weight from end to end, and always will.',
    },
    {
      id: 'town',
      label: 'The town',
      heading: 'Srikalahasti draws. Machilipatnam prints. Two crafts, one name.',
      body: `Both are real traditions and neither is a counterfeit of the other — but they are not the same thing, and almost everything sold as "Kalamkari" is the printed one. This is the drawn one. It grew up serving the temple rather than the export trade, which is why its subjects are stories: episodes set out in registers, painted to be read across a room. The tradition is documented from the Vijayanagara period, and ${site.location.town} Kalamkari holds a registered Geographical Indication.`,
    },
    {
      id: 'colour',
      label: 'The colour',
      heading: 'Rusted iron, madder root, indigo, myrobalan — and nothing else',
      body: `Iron and jaggery ferment in a sealed pot for ${site.craft.kasimFermentDays} days to make the black. Red arrives in a boiling bath of madder root, days after it was painted on as a clear liquid nobody could see. Indigo is dipped, never painted. Myrobalan gives the gold, and the cream ground the whole cloth begins from. Not one synthetic ingredient at any of the ${site.craft.steps} steps.`,
    },
  ] satisfies KalamkariFacet[],

  /**
   * The line that closes the landing-page version.
   *
   * It is the site's central claim reduced to something a visitor can carry
   * away and check on somebody else's cloth, which is the only kind of claim
   * worth making here.
   */
  test:
    'If a motif repeats identically along a border, it was printed. If the same motif is nearly identical and never quite, a person drew it, one at a time.',

  cta: { label: 'Know more', href: '/process#what-is-kalamkari' },
} as const;

/**
 * The extra paragraphs shown only in the full version at the head of /process.
 *
 * Kept separate rather than folded into `facets` so the landing page cannot
 * quietly grow into an essay: the section there is a doorway, and a doorway
 * that takes four screens to walk through is a corridor.
 */
export const kalamkariInFull = [
  'The name is not decorative. Kalam is Persian for pen, and the pen is still made of bamboo in the store that uses it — cut, sharpened and bound by the same people who then draw with it, usually in the same week. The craft is named after the object because the object is the whole of the difference.',
  `What follows on this page is the full sequence, in order, as it is performed in ${site.location.town}. It is long because the craft is long. Between ${site.craft.sareeDaysMin} and ${site.craft.sareeDaysMax} days pass between the first wash and the last pressing, and the monsoon can stop all of it — nothing in the process works without sun to dry between stages.`,
] as const;
