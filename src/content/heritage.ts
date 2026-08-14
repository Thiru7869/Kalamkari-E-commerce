import { site } from './site';

/**
 * The long view of the craft — the essay behind /heritage.
 *
 * ---------------------------------------------------------------------------
 * What this page is allowed to say
 * ---------------------------------------------------------------------------
 *
 * This is the most dangerous page in the content layer, and it is worth being
 * explicit about why. Every other page here describes something the store does:
 * a piece it painted, a step it performs, a person who works in the house. This
 * one describes a *tradition*, which means it is the one page where it would be
 * easy and pleasant to write sentences nobody can check — a founding century, a
 * royal patron, a figure for how many families are left.
 *
 * So it holds to three sources and nothing else:
 *
 *   1. **Facts about the craft that are general and verifiable** — what the word
 *      means, that two different crafts in Andhra Pradesh carry it, that
 *      Srikalahasti's is the freehand pen tradition and Machilipatnam's the
 *      block-printed one, that the dyes are mordant dyes, that Srikalahasti
 *      Kalamkari holds a registered Geographical Indication.
 *   2. **What this site already states elsewhere** — the twenty-three steps, the
 *      eight pots, the timings, the cluster. Where this page repeats one, it
 *      links to the page that sets it out in full.
 *   3. **What the family gave**, in their words — why they continue, that they
 *      teach for nothing, that the work began as one household and spread.
 *
 * There are no dates in this file. Not because the craft has no history, but
 * because the store has not supplied one and a century printed on a shop's
 * website becomes a fact somebody else repeats. If the family later gives a
 * date, it belongs here with the same treatment every other supplied fact gets.
 *
 * Note in particular what is *not* claimed: that this is an ancient art, that it
 * is dying, that it is the last of its kind, or that buying a saree saves it.
 * The first two are unmeasurable, the third is untrue of a town with a working
 * cluster in it, and the fourth is the sentence every craft site writes.
 */

export type HeritageSection = {
  id: string;
  /** Small label above the heading. */
  eyebrow: string;
  heading: string;
  /** Paragraphs, in order. */
  body: string[];
  /**
   * A single pulled-out line, set larger. Optional — used where the section has
   * one sentence that is the whole point of it.
   */
  pull?: string;
  /** Where the claims in this section are set out in full. */
  link?: { label: string; href: string };
};

export const heritageIntro = {
  eyebrow: 'The heritage of Kalamkari',
  heading: 'A pen, a pot of iron, and a story worth telling slowly',
  standfirst:
    'Kalamkari is a way of putting colour into cloth that predates every industrial method of doing the same thing, and survives because it does something those methods cannot. This is what it is, how it works, what it has been used for, and why it still matters — written by a household in Srikalahasti that has done it for three generations.',
} as const;

export const heritageSections: HeritageSection[] = [
  /* ---------------------------------------------------------------- */
  {
    id: 'what-it-is',
    eyebrow: 'What it is',
    heading: 'The name is a description of the tool',
    body: [
      '“Kalamkari” is two words. *Kalam* is the pen; *kari* is the work. Put together they mean, quite literally, pen-work — and that is the whole definition. It is not a motif, a colour scheme or a region. It is the fact that the drawing was made with a pen held in a hand.',
      'The pen is bamboo, cut and sharpened in the workshop, usually within a week of being used. A ball of wool or felt is bound above the tip to act as a reservoir: the artist squeezes it with the fingers to release dye down to the point, which is why a Kalamkari line can be thick and then hair-thin without lifting.',
      'Two quite different crafts in Andhra Pradesh carry the name, and confusing them is the single most common mistake made about this work. In Machilipatnam and Pedana the tradition is block-printed — carved wooden blocks, repeated across the cloth, which is how a large quantity is produced. In Srikalahasti the tradition is freehand: every line is drawn once, by eye, with no block, screen, stencil or tracing at any point.',
      'Both are real crafts with real histories. Only one of them is this one. Almost everything sold online under the word today is the printed kind, or a machine print imitating it, and a buyer who does not know there are two has no way to tell what they are looking at.',
    ],
    pull: 'Kalam is the pen. Kari is the work. The name is not a style — it is a statement about how the line got there.',
    link: { label: 'The two crafts, side by side', href: '/process#what-is-kalamkari' },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'how-it-works',
    eyebrow: 'How it works',
    heading: 'The colour is not painted on. It is grown in the cloth.',
    body: [
      'This is the part that surprises people, and it is the reason the work lasts. Almost none of the colours in a Kalamkari piece arrive as pigment. They are *mordant dyes*: the artist paints on a substance that is not the colour, and the colour appears later, in the fibre, as the result of a reaction.',
      'The cloth is first steeped in a bath of ground myrobalan nut and buffalo milk. The nut loads the cotton with tannin and waits; the fat in the milk stops the pen bleeding. That is why the ground of every piece is a warm cream rather than white — nothing here is bleached.',
      'The black is a liquor of rusted iron and jaggery, left to ferment for about three weeks. Drawn on, it looks pale brown. It darkens in front of you as the iron meets the tannin already sitting in the cloth, and the black that forms is *inside* the fibre rather than on top of it. That is why an outline is still black after fifty years.',
      'The reds are stranger still. Every area that will end up red is painted with a clear solution of alum — days of work laid down in a liquid you cannot see. The cloth is then boiled in a bath of madder root, and the red binds only where the alum went. Where the alum was laid thicker, the red comes deeper, so one bath yields pink through maroon in a single pass.',
      'Indigo will not take a pen at all. It only fixes as the cloth leaves the vat and meets the air, so the whole piece must be dipped — and every area that must stay clear is covered in wax by hand first. There is no green dye anywhere in the process; green is always one colour arriving on top of another, and this workshop keeps four separate routes to it.',
      'Between every stage the cloth is washed and dried in the sun, up to twenty times. Most of that washing exists to take colour away rather than to add it: each rinse lifts what did not bind, so the next colour lands on cloth rather than on residue. It is also why a wet week stops the work completely.',
    ],
    pull: 'The artist never touches a red pigment. They paint with a clear liquid and the colour arrives days later, out of a boiling pot.',
    link: { label: 'All twenty-three steps, in order', href: '/process' },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'what-it-was-for',
    eyebrow: 'What it has been for',
    heading: 'Cloth that was meant to be read',
    body: [
      'The Srikalahasti tradition grew up serving the temple rather than the export trade, and that single fact explains almost everything about how it looks. Its work was hangings, canopies, chariot cloths and long narrative panels — cloth made to be looked at closely and, more importantly, to be *read*.',
      'This is why the subjects are stories. The Ramayana, the Mahabharata, the Krishna Leela, the Dashavatara: episodes laid out in registers, figure by figure, so that somebody could follow the sequence across a wall or a chariot. Panels of this kind travelled with storytellers, who unrolled them and pointed as they spoke.',
      'A story cannot be carved into a block. A block repeats, and a scene happens once — so the narrative work and the freehand method are not two facts about this craft but one fact stated twice. The moment a workshop moves to blocks it loses the ability to draw an episode, and gains the ability to make a hundred metres of border.',
      'The same hand now goes onto sarees, dupattas and chunnis, blouse pieces, wall panels and cloth for the house. The subjects and the sequence have not changed; what changed is that a person wears the story instead of a temple hanging it.',
    ],
    link: { label: 'What the store makes', href: '/shop' },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'who-it-helps',
    eyebrow: 'Who it supports',
    heading: 'A craft held by a town, not by a household',
    body: [
      `This family works alongside roughly forty other artisans in ${site.location.town}. That is worth stating plainly, because a shop has every commercial reason to imply it is the last practitioner of something and no honest way to do so. The dyes, the water, the washing ground and the knowledge itself are shared here. The survival of any one workshop is bound up with the survival of the rest.`,
      'It did not begin that way. It began as one household working in its own front room. Neighbours joined over time, then others from the town, and what started as a family became a community of people doing the same work — which is the ordinary way a craft spreads when nobody is guarding it.',
      'Nothing is charged to learn it. Students, people who are simply interested, and visitors from outside India are shown the work free of charge, and whatever they ask about the materials and the sequence is explained. A craft kept secret is a craft with one generation left in it.',
      'And it does not stay in this house. Somebody who leaves — most often after marriage — carries the work with them and continues it from their own home, and several have gone on to teach their own neighbours. The knowledge travels with whoever learned it.',
    ],
    pull: 'A craft kept secret is a craft with one generation left in it.',
    link: { label: 'The family, and the questions people ask', href: '/our-story' },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'why-it-matters',
    eyebrow: 'What it contributes',
    heading: 'A working record of how things were made before industry',
    body: [
      'Srikalahasti Kalamkari holds a registered Geographical Indication. That is a legal instrument rather than a compliment: it ties the name to a place and a method, so that cloth made this way here can be distinguished from cloth made another way elsewhere and sold under the same word. For a craft whose central problem is exactly that confusion, it matters.',
      'Its wider contribution is harder to put on a label and is probably the more important of the two. Every stage of this process is a piece of pre-industrial chemistry still in daily working use — tannin and iron, alum and madder, a fermenting indigo vat, sunlight as the fixing agent. These are not being preserved in a museum or reconstructed from a manual. They are being used to fill an order, which is the only way a technique actually stays alive.',
      'It also keeps a form of narrative art in circulation. The epics drawn on these cloths are drawn from memory and from a repertoire passed down by watching, not copied from a reference sheet; the way a particular workshop draws a peacock or lays out a Ramayana register is itself inherited information. When a workshop stops, that goes with it, and no photograph of the finished cloth records it.',
      'None of which is an argument that buying a saree saves a tradition. It does not, and any site that tells you otherwise is selling you the feeling rather than the cloth. What it does is more modest and more real: it keeps a house in this town doing this work for another season, and pays for the sun-drying, the fermenting and the twenty washings that the work actually costs.',
    ],
    pull: 'These techniques are not preserved in a museum. They are being used to fill an order — which is the only way a method stays alive.',
    link: { label: 'How to tell hand-painted from printed', href: '/journal' },
  },
];

/** The closing note, set apart from the sections above. */
export const heritageClose = {
  heading: 'If you want to see it rather than read about it',
  body: `The store is a working home in ${site.location.town}, a short walk from the ${site.location.river} where the cloth is washed. Somebody is drawing there most days of the year, and anybody who wants to watch is welcome to. Nothing is charged for that, and nothing has to be bought.`,
} as const;
