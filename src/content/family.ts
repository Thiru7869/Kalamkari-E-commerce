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
  /**
   * The colour this person is represented by.
   *
   * Drawn from the workshop's own pots rather than assigned arbitrarily, and
   * never black — kasim is the outline the whole cloth is drawn in, so using
   * it for one person would say something about the others. Each value is a
   * Tailwind token from the dye palette plus the ink that clears AA on it.
   */
  accent: { bg: string; ring: string; text: string };
  /** Further detail, kept behind a disclosure so the page stays short. */
  more?: string[];
};

/** The five accents, kept together so no two can drift into each other. */
const ACCENTS = {
  madder: { bg: 'bg-chay-600', ring: 'ring-chay-600/30', text: 'text-chay-700 dark:text-chay-400' },
  indigo: { bg: 'bg-indigo-600', ring: 'ring-indigo-600/30', text: 'text-indigo-700 dark:text-indigo-300' },
  myrobalan: { bg: 'bg-myrobalan-500', ring: 'ring-myrobalan-500/30', text: 'text-myrobalan-700 dark:text-myrobalan-400' },
  katha: { bg: 'bg-katha-500', ring: 'ring-katha-500/30', text: 'text-katha-700 dark:text-katha-300' },
  cotton: { bg: 'bg-cotton-600', ring: 'ring-cotton-600/30', text: 'text-cotton-800 dark:text-cotton-400' },
} as const;

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
    accent: ACCENTS.madder,
    more: [
      'The decision that founded the store was a commercial one as much as an aesthetic one, and it went the unprofitable way. Natural dyeing needs space, sun, running water and time; a screen-printing operation needs none of those and can be run from a room.',
      'What it bought was a piece that behaves differently over years. Iron black does not lift, madder settles rather than fades, and cloth with nothing synthetic in it softens instead of pilling.',
    ],
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
    accent: ACCENTS.myrobalan,
    more: [
      'The practical work of a house like this is invisible in the finished cloth and decides most of it: when the pots are set, which room the drawing is laid out in, whether there is space on the roof on a day the sun is good.',
      'It is also where the teaching happens. Nobody in this family was sat down and given a course.',
    ],
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
    accent: ACCENTS.indigo,
    more: [
      'Border work is the part of a saree that is judged first and forgiven least. A temple border has to hold its rhythm over nine yards without a single mechanical aid, and a wandering repeat is visible from across a room.',
      'It is also the work that teaches the hand: most artists in this tradition spend years on borders before they are given a pallu.',
    ],
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
    accent: ACCENTS.katha,
    more: [
      'The store carries her name. It was given to it by her parents when they founded it, which is the ordinary way a family business is named here and not a marketing decision made later.',
      'Filling — the dense interior work inside an outline — is slower than drawing it and is what separates a piece that reads well up close from one that only works at a distance.',
    ],
  },
  {
    id: 'viswanath-reddy',
    name: 'M Viswanath Reddy',
    role: 'Master artisan · National Award, 2008',
    short:
      'National Award-winning pen Kalamkari artist. Trained from childhood; works with a wider cluster of artisans in Srikalahasti.',
    body: [
      'M Viswanath Reddy received a National Award in 2008 for pen Kalamkari — the freehand bamboo-pen tradition specific to Srikalahasti, as distinct from block-printed work. He is a master artisan of the craft, trained in it since childhood and formally educated besides, and he draws his subjects from the Hindu epics and from his own research into the older painted temple cloths.',
      'The store began by making only wall hangings — the narrative panels that were the original purpose of Kalamkari, painted to be hung in temples and unrolled while the story they illustrated was told aloud. Over the last decade the work has widened to sarees, dupattas, stoles and running fabric, which is what most people now come to Srikalahasti to buy. Cotton sarees and stoles sell hardest in the summer. The scale of the work has widened too: he has painted an entire Ramayana across two metres of cloth.',
      'He works eight or nine hours a day, and does not romanticise it. The detail costs him his back and his eyes over time. The monsoon stops production outright, because nothing in this process works without sun to dry between steps. May and June are slow months for selling. None of this appears in the way the finished cloth looks, which is precisely his complaint about how the craft is understood.',
      'He works alongside roughly forty other artisans in the Srikalahasti cluster — the craft here has always been a town-scale tradition rather than a set of isolated stores, and the survival of any one workshop is bound up with the survival of the rest.',
    ],
    image: '/images/family/viswanath-reddy.jpg',
    accent: ACCENTS.cotton,
    more: [
      'Narrative panels are the oldest and hardest work this tradition does. An episode has to be composed so that a viewer standing still can read it in order, which is a problem of layout as much as of drawing.',
      'His subjects come from the epics and from his own research into older painted temple cloths — the pieces that were made to be unrolled and narrated rather than worn.',
    ],
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
    /** The two lines everybody reads. The rest is behind "Know more". */
    lead: 'Srikalahasti sits on the Swarnamukhi river, built around one of the oldest Shaiva temples in the south. Kalamkari grew here for a reason that had nothing to do with fashion: temples needed images, and cloth could go where a wall could not.',
    body: [
      'The painted panels made in this town were narrative instruments. A cloth showing episodes from the Ramayana or the Mahabharata would be hung and unrolled section by section while a performer told the story to people who could not read it. The compositions still carry that logic — figures in registers, borders that frame a scene, faces drawn to be legible from a distance in poor light.',
      'The craft took its name from the tool. Kalam is Persian for pen, and the pen is still made of bamboo in the store that uses it. The tradition is documented from the Vijayanagara period, and Srikalahasti Kalamkari now holds a registered Geographical Indication.',
      'What makes the town\u2019s work distinct is not a motif or a palette. It is that every line is drawn once, freehand, by a person who has the whole composition in their head before the pen touches the cloth. There is no device anywhere in the process that repeats a mark.',
    ],
  },
  {
    id: 'difference',
    eyebrow: 'Two crafts, one name',
    title: 'Drawn by hand, or printed by machine',
    lead: 'Almost everything sold as \u201cKalamkari\u201d today is block-printed or screen-printed, often in chemical colour. Those are real trades and this is not a complaint about them \u2014 but they are not what happens here.',
    body: [
      'A print carves or exposes a design once and then repeats it. Pen Kalamkari draws every line by hand, once, without tracing and without a block. A border repeat that looks identical along a hand-drawn piece was drawn identically by eye, again and again — which is why, up close, it never quite is.',
      'That is the test, and it costs nothing to apply. If a repeat is mechanically perfect, the piece was printed. The small inconsistencies are the evidence of the hand, not a fault in it.',
      'The second test is the cloth itself. Dye drawn with a pen onto myrobalan-treated cotton strikes into the fibre and shows through on the reverse. Print sits on the surface, so the back of a printed piece is noticeably paler than its face.',
    ],
  },
  {
    id: 'today',
    eyebrow: 'Why it is worth the trouble',
    title: 'What is actually at stake',
    lead: 'Natural dyeing is slow, weather-dependent and physically hard. Chemical colour and screen printing produce something superficially similar in a fraction of the time, and most buyers cannot tell the difference at a market stall.',
    body: [
      'What is lost if pen Kalamkari goes is not a look — a printer can copy the look. It is a body of knowledge held by a few hundred people: how long the iron must ferment, how thick to lay alum for a maroon rather than a pink, what the monsoon does to a half-finished cloth, how to draw Hanuman so he reads correctly at ten paces.',
      'Younger people in craft families have easier options, and most of them take those options. The households still doing this are fewer each decade.',
      'This store is one household holding one part of that. Every piece on this site was made the long way.',
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* How we tell the story                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The narrative tradition, and how a composition is actually built.
 *
 * Same editorial rule as the rest of this file. Everything below is either
 * documented history of the craft (the panels as narrative instruments, the
 * register layout, the Vijayanagara-period record) or already stated elsewhere
 * on this site — `storyChapters` above, the paintings entry in `catalogue.ts`,
 * and the four commission-first motifs in `narrativeMotifs`. No episode, no
 * commission and no customer is invented.
 *
 * This exists because /our-story explained who the family are and what the
 * craft is, and never explained the thing they actually do all day, which is
 * *tell stories on cloth*. That is the subject of every piece in the store and
 * it had no section of its own.
 */
export type StoryMethod = {
  id: string;
  /** The heading. Two to six words. */
  title: string;
  body: string;
};

export const storyMethod: StoryMethod[] = [
  {
    id: 'why-narrative',
    title: 'The cloth was the storyteller',
    body: 'A painted panel from this town was not decoration; it was equipment. It would be hung and unrolled section by section while a performer narrated the episode it showed to an audience who could not read it. Everything about how these compositions are built follows from that job — and it is why the subjects here are epics and deities rather than patterns.',
  },
  {
    id: 'registers',
    title: 'Read it the way it was drawn',
    body: 'Scenes are set out in registers — horizontal bands, separated by rule and border rather than by empty cloth — and are read left to right, in order, like lines of writing. The borders are not framing in the decorative sense: they are punctuation, telling you where one moment ends and the next begins.',
  },
  {
    id: 'scale',
    title: 'Faces drawn for the back of the room',
    body: 'A figure has to carry its expression at the distance the panel was meant to be seen from, in the light a temple actually has. That is why the eyes are large and the gestures are held: not stylisation for its own sake, but a solution to a problem of legibility that the composition was built around.',
  },
  {
    id: 'saree',
    title: 'The same logic, on nine yards',
    body: 'A saree inherits all of it and adds a constraint: the body, the border and the pallu are three compositions that have to agree, and only the pallu is really seen when the cloth is worn. So the pallu carries the episode and the body carries the rhythm — a jaal that has to hold over nine yards without a single mechanical repeat.',
  },
  {
    id: 'commission',
    title: 'Which is why the big ones are drawn to order',
    body: 'Ramayana, Mahabharata, Krishna Leela and the Tree of Life are the hardest drawing this workshop does, and the composition is settled before the pen is picked up. Because nothing is repeated from a block, the same composition is never painted twice — so whatever is in the store is what exists, and a piece of your own is a commission rather than a restock.',
  },
];

/* -------------------------------------------------------------------------- */
/* Handmade against printed                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The comparison, as a table anybody can apply in a shop.
 *
 * Deliberately phrased as things a buyer can *check* rather than as claims
 * about quality. "Takes six weeks" is verifiable; "superior craftsmanship" is
 * not, and this site does not say things it cannot support.
 */
export type Comparison = {
  point: string;
  /** What is true of hand-drawn pen Kalamkari. */
  hand: string;
  /** What is true of a block- or screen-printed piece. */
  printed: string;
};

export const handVsPrinted: Comparison[] = [
  {
    point: 'The repeat',
    hand: 'Never identical. Two peacocks on one saree are two drawings.',
    printed: 'Mechanically identical along the whole border.',
  },
  {
    point: 'The reverse',
    hand: 'Dye strikes through the weave; the back reads almost as strong as the face.',
    printed: 'Ink sits on the surface; the back is noticeably paler.',
  },
  {
    point: 'The colour',
    hand: 'Iron, madder root, indigo, myrobalan. Softens and settles with washing.',
    printed: 'Usually chemical. Bright at first, then flat.',
  },
  {
    point: 'The outline',
    hand: 'Swells and tapers with the pressure of the hand.',
    printed: 'A constant weight from end to end.',
  },
  {
    point: 'Time',
    hand: 'Fifteen to forty-five days for one saree, and the monsoon stops it.',
    printed: 'Metres an hour, in any weather.',
  },
  {
    point: 'How many exist',
    hand: 'One. There is no device in the craft that would make a second.',
    printed: 'As many as the run.',
  },
];

/* -------------------------------------------------------------------------- */
/* How the work is actually divided                                           */
/* -------------------------------------------------------------------------- */

/**
 * The workshop as an organisation rather than as a craft.
 *
 * Everything below comes from the store's own printed brochure, supplied on
 * 2026-08-14, and nothing has been added to it. It is the first material on
 * this site that describes how the work is *shared out* — who draws, who fills,
 * where the cloth and the dye are bought — and that is worth having because it
 * is the part a visitor cannot infer from photographs of finished pieces.
 *
 * Two figures from the same source are deliberately **not** here. The brochure
 * gives a headcount for the group and a count of local artists working with it;
 * both are undated, and this site already states the household in
 * `family` above and the cluster figure on the FAQ. Publishing a third,
 * differently-scoped number without knowing when it was true would make all
 * three less trustworthy rather than the page more informative. If the store
 * confirms current numbers they belong here, with a date.
 */
export type WorkshopNote = {
  id: string;
  title: string;
  body: string;
};

export const workshopNotes: WorkshopNote[] = [
  {
    id: 'drawing',
    title: 'The drawing is done by the senior hands',
    body: 'The freehand drawing and sketching of the figures is the most difficult part of the process, and it is done by the senior artists — the mother of the house, the elder sister, who is a State Award winner in her own right, the younger sister, and Viswanath Reddy himself. Nothing about that stage can be corrected later, which is why it is not delegated.',
  },
  {
    id: 'filling',
    title: 'The painting is then passed on',
    body: 'Once the figures are down, the piece goes to other artists for the dyeing and for filling in the detail. That division is what makes the work possible at all: the drawing sets what the piece will be, and the filling is weeks of patient work that a second pair of hands can carry without changing the composition.',
  },
  {
    id: 'materials',
    title: 'Where the cloth and the colour come from',
    body: 'The vegetable dyes are procured from Chennai; the gada — the greige cotton the whole process starts on — comes from Chittoor. Neither is made in the house, and neither is bought as a finished colour: what arrives is raw material that still has to be fermented, boiled or steeped before anything can be drawn with it.',
  },
  {
    id: 'time',
    title: 'How long a painting takes, as opposed to a saree',
    body: 'A big, intricate painting takes between nine months and a year to complete. A smaller and less intricate picture takes about fifteen days. That range is much wider than the fifteen to forty-five days a saree takes, and it is the honest reason a narrative panel is priced the way it is — the cost is somebody’s year.',
  },
];

/* -------------------------------------------------------------------------- */
/* Awards                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The award wall.
 *
 * Ten containers, plainly numbered, because the store has not yet supplied
 * captions and this site does not invent citations. Replace `image` with the
 * photograph of each certificate and add a `title` when the details are
 * confirmed; the grid, the quick view and the full-screen viewer all work as
 * they stand.
 *
 * The one award named anywhere on this site is the 2008 National Award for pen
 * Kalamkari, which is on the record and appears in the family entry.
 */
/**
 * The one award this site names, and what it actually means.
 *
 * Everything below is either already on the record elsewhere on this site (the
 * year, the discipline, the recipient — see the family entry above) or is a
 * statement about the *craft* rather than about the award's administration.
 * That line is drawn deliberately. It is easy to write a confident paragraph
 * about which ministry confers what and how many are given each year, and this
 * file has no source for any of it; what it does have a source for is what pen
 * Kalamkari is and why doing it well is difficult, which is the part a reader
 * actually needs in order to understand what was recognised.
 *
 * So: no citation text, no conferring body beyond "national", no prize detail.
 * If the store supplies the certificate, those belong here and the component
 * will render them.
 */
export const principalAward = {
  year: 2008,
  name: 'National Award',
  discipline: 'Pen Kalamkari',
  recipient: 'M Viswanath Reddy',
  /** What the award is for, in craft terms. */
  what: 'A national recognition for mastery of pen Kalamkari — the freehand bamboo-pen tradition specific to Srikalahasti, judged as a distinct discipline from the block-printed cloth sold under the same name.',
  /**
   * Why it is worth more than a line in a list. Three points, each of which is
   * defended somewhere else on this site rather than asserted here.
   */
  why: [
    {
      title: 'It is an award for a hand, not a design',
      body: 'There is no device anywhere in this craft that repeats a mark. A border that looks regular was drawn again and again by eye, and a face is legible or it is not. What is being judged is the consistency of a line held over nine yards by one person across several weeks — which is why the discipline is assessed separately from printed work at all.',
      href: '/process',
      hrefLabel: 'See what the drawing involves',
    },
    {
      title: 'It recognises the whole sequence, not the picture',
      body: 'A finished piece is the last of twenty-three operations, and most of them are invisible in it: the myrobalan that decides whether the black will hold, the alum painted in a liquid nobody can see, the twenty passes through the sun. A piece can look right and be wrong, and it shows two washes later.',
      href: '/process',
      hrefLabel: 'All twenty-three steps',
    },
    {
      title: 'It belongs to a town as much as a household',
      body: 'Srikalahasti Kalamkari holds a registered Geographical Indication, and the family works alongside roughly forty other artisans here. The knowledge, the water, the washing ground and the dye recipes are shared. An award to one workshop in a cluster this size is a statement about the cluster.',
      href: '/faq',
      hrefLabel: 'Questions about the craft',
    },
  ],
} as const;

export type Award = {
  n: number;
  label: string;
  image: string;
  /** Filled in when the store confirms what each certificate is. */
  title?: string;
};

export const awards: Award[] = Array.from({ length: 10 }, (_, i) => ({
  n: i + 1,
  label: `Award ${i + 1}`,
  image: '/images/placeholder-cloth.jpg',
}));


/**
 * The family paragraphs on the landing page.
 *
 * Kept here, with the rest of the family's account, so the home page and
 * /our-story state the same people and the same figure from one place. The
 * figure ("roughly forty") is the one /our-story already defends.
 */
export const homeFamilyNote = [
  'The store was founded by M Muni Reddy and M Rajeshwari, and takes its name from their daughter. Their three children — M Muniratnamma, P Vijaya Lakshmi and M Viswanath Reddy — all learned the craft the way it passes through Srikalahasti households: not as a course taken, but by sitting beside it from childhood.',
  'They work alongside roughly forty other artisans in the Srikalahasti cluster. This has always been a town-scale tradition, and the survival of any one workshop is bound up with the survival of the rest.',
] as const;
