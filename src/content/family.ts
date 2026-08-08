/**
 * The family.
 *
 * Editorial rule for this file: say only what is known, and say it plainly.
 * Where public record establishes something (M Viswanath Reddy's 2008 National
 * Award for pen Kalamkari, his training from childhood, the store's work with
 * a wider cluster of artisans in Srikalahasti), it is stated. Where it does
 * not, the copy stays with the craft rather than inventing biography. No
 * birth years, no anecdotes that were not told to us, no invented quotes.
 *
 * The one quoted line below is his own, on the record.
 */

export type FamilyMember = {
  id: string;
  name: string;
  /** How they are addressed in the store, where that is public. */
  role: string;
  /** One line for cards and the home page strip. */
  short: string;
  /** Full paragraphs for /our-story. */
  body: string[];
  image: string;
  /** Verified public recognition only. */
  honours?: string[];
  quote?: { text: string; attribution: string };
};

export const family: FamilyMember[] = [
  {
    id: 'muni-reddy',
    name: 'M Muni Reddy',
    role: 'Founder',
    short: 'The store begins with him — and with the decision never to use a chemical colour.',
    body: [
      'Sri Vijaya Lakshmi Fine Kalamkari Arts exists because M Muni Reddy built it, in a working home in Srikalahasti, around a way of painting that most of the market had already found too slow to be worth doing.',
      'By the time he set up, synthetic dye was everywhere and the arithmetic was not subtle: chemical colour is faster, cheaper, more predictable and infinitely easier to sell. The store was founded on the opposite choice. Iron liquor that has to ferment for three weeks before it will do anything. Reds that arrive in a boiling pot days after they were painted, as a clear liquid, by hand. A month and a half of sun and river water for one saree. He kept the difficult version.',
      'Everything the store makes today still follows that rule, and the family did not have to be persuaded of it — they grew up inside it.',
    ],
    image: '/images/family/muni-reddy.jpg',
  },
  {
    id: 'rajeshwari',
    name: 'M Rajeshwari',
    role: 'Founder',
    short: 'The other half of the store, and of the household it runs out of.',
    body: [
      'A Kalamkari store of this kind is not a workshop that people commute to. It is a house with cloth drying on the roof, pots of dye in the yard, and work laid out on the floor of whichever room has the best light. Holding both of those things together — the household and the store — is its own craft, and M Rajeshwari has done it alongside the painting.',
      'In Srikalahasti families the knowledge moves through the home rather than through a school. Children learn to hold a kalam the way they learn anything else at home: by being around it constantly, being handed small jobs, and being corrected. All three of the children in this family learned that way.',
    ],
    image: '/images/family/rajeshwari.jpg',
  },
  {
    id: 'muniratnamma',
    name: 'M Muniratnamma',
    role: 'Artist',
    short: 'Trained at home, from childhood, like everyone else in the family.',
    body: [
      'M Muniratnamma works in the store and lives within the joint family that runs it. Like her brother and sister she came to the craft in the ordinary way it passes through Srikalahasti households — not as a course taken, but as something learned by sitting beside it.',
      'Pen Kalamkari rewards exactly this kind of upbringing. The steadiness needed to lay a fine, unhesitating line across nine yards of cloth, and the judgement needed to place alum for a colour that will not appear for another four days, are not things that can be picked up quickly by anyone.',
    ],
    image: '/images/family/muniratnamma.jpg',
  },
  {
    id: 'vijaya-lakshmi',
    name: 'P Vijaya Lakshmi',
    role: 'Artist',
    short: 'The store carries her name.',
    body: [
      'The name over the door is hers. Sri Vijaya Lakshmi Fine Kalamkari Arts was named for her, which is a fairly common way for a family store in this part of Andhra to be named, and a fairly direct statement of what the business is: not a brand assembled by outsiders, but a household that paints.',
      'She works in the same tradition as the rest of the family — freehand, natural colour, the full sequence of steps, with no shortcuts introduced at any stage.',
    ],
    image: '/images/family/vijaya-lakshmi.jpg',
  },
  {
    id: 'viswanath-reddy',
    name: 'M Viswanath Reddy',
    role: 'Master artisan · National Award, 2008',
    short:
      'National Award-winning pen Kalamkari artist. Trained from childhood; works with a wider cluster of artisans in Srikalahasti.',
    body: [
      'M Viswanath Reddy received a National Award in 2008 for pen Kalamkari — the freehand bamboo-pen tradition specific to Srikalahasti, as distinct from the block-printed work of Machilipatnam. He is a master artisan of the craft, trained in it since childhood and formally educated besides, and he draws his subjects from the Hindu epics and from his own research into the older painted temple cloths.',
      'The store began by making only wall hangings — the narrative panels that were the original purpose of Kalamkari, painted to be hung in temples and unrolled while the story they illustrated was told aloud. Over the last decade the work has widened to sarees, dupattas, stoles and running fabric, which is what most people now come to Srikalahasti to buy. Cotton sarees and stoles sell hardest in the summer. The scale of the work has widened too: he has painted an entire Ramayana across two metres of cloth.',
      'He works eight or nine hours a day, and does not romanticise it. The detail costs him his back and his eyes over time. The monsoon stops production outright, because nothing in this process works without sun to dry between steps. May and June are slow months for selling. None of this appears in the way the finished cloth looks, which is precisely his complaint about how the craft is understood.',
      'He works alongside roughly forty other artisans in the Srikalahasti cluster — the craft here has always been a town-scale tradition rather than a set of isolated stores, and the survival of any one workshop is bound up with the survival of the rest.',
    ],
    image: '/images/family/viswanath-reddy.jpg',
    honours: [
      'National Award for pen Kalamkari, 2008',
      'Master artisan, Srikalahasti pen Kalamkari',
    ],
    quote: {
      text: 'People don’t realise how much work goes into Kalamkari work.',
      attribution: 'M Viswanath Reddy',
    },
  },
];

/**
 * Chapters for the /our-story narrative, above the family cards.
 * These describe Srikalahasti and the craft, not the family, and are drawn
 * from the documented history of the tradition.
 */
export const storyChapters = [
  {
    id: 'town',
    eyebrow: 'Srikalahasti',
    title: 'A town that painted its scriptures onto cloth',
    body: [
      'Srikalahasti sits on the Swarnamukhi river in Tirupati district, built around one of the oldest Shaiva temples in the south. Kalamkari grew here for a reason that had nothing to do with fashion: temples needed images, and cloth could go where a wall could not.',
      'The painted panels made in this town were narrative instruments. A cloth showing episodes from the Ramayana or the Mahabharata would be hung and unrolled section by section while a performer told the story to people who could not read it. The compositions still carry that logic — figures in registers, borders that frame a scene, faces drawn to be legible from a distance in poor light.',
      'The craft took its name from the tool. Kalam is Persian for pen, and the pen is still made of bamboo in the store that uses it. The tradition is documented from the Vijayanagara period, and Srikalahasti Kalamkari now holds a registered Geographical Indication.',
    ],
  },
  {
    id: 'difference',
    eyebrow: 'Two crafts, one name',
    title: 'Srikalahasti is drawn. Machilipatnam is printed.',
    body: [
      'Almost everything sold as "Kalamkari" today is block work from Machilipatnam, or a screen print imitating it. That is a real and old craft in its own right, and this is not a complaint about it. But it is not the same thing as what happens here.',
      'Machilipatnam carves a design into a wooden block and repeats it. Srikalahasti draws every line by hand with a pen, once, without tracing. A repeat that looks identical across a border on a Srikalahasti piece was drawn identically, by eye, again and again — which is why on close inspection it never quite is.',
      'This matters when you are buying. If a border repeat is mechanically perfect, the piece was blocked or printed. The small inconsistencies are the evidence of the hand.',
    ],
  },
  {
    id: 'today',
    eyebrow: 'Why it is worth the trouble',
    title: 'What is actually at stake',
    body: [
      'The pressures on this craft are not mysterious. Natural dyeing is slow, weather-dependent and physically hard. Chemical colour and screen printing produce something superficially similar in a fraction of the time, and most buyers cannot tell the difference at a market stall. Younger people in craft families have easier options.',
      'What is lost if pen Kalamkari goes is not a look — a printer can copy the look. It is a body of knowledge held by a few hundred people: how long the iron must ferment, how thick to lay alum for a maroon rather than a pink, what the monsoon does to a half-finished cloth, how to draw Hanuman so he reads correctly at ten paces.',
      'This store is one household holding one part of that. Every piece on this site was made the long way.',
    ],
  },
];
