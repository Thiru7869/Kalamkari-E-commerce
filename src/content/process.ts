/**
 * The 23 steps of Srikalahasti pen Kalamkari, as practised in this store.
 *
 * Accuracy notes, because this is the page that will be quoted:
 *  - Counts of "23 to 25 steps" are the standard description of the full
 *    Srikalahasti sequence. The grouping below is the store's own working
 *    order: cloth, drawing, black, red, yellow/blue, sun and water.
 *  - Nothing here describes block printing. Srikalahasti is pen work; the
 *    Machilipatnam tradition is the block tradition. They are different crafts
 *    that share a name, and the site never blurs them.
 *  - Where a material has a Telugu or trade name the artisans actually use,
 *    that name is given, because it is the true name of the thing.
 */

export type ProcessPhase = {
  id: string;
  /** Roman numeral shown in the scroll rail. */
  numeral: string;
  title: string;
  /** The question this phase answers for a reader who knows nothing. */
  question: string;
  /** Two or three sentences of orientation before the steps begin. */
  intro: string;
  /** Dominant colour of the 3D scene and section styling for this phase. */
  tone: 'cloth' | 'charcoal' | 'kasim' | 'chay' | 'indigo' | 'sun';
  steps: ProcessStep[];
};

export type ProcessStep = {
  n: number;
  title: string;
  /** Local name of the step or its key material, where one exists. */
  localName?: string;
  body: string;
  /** The single fact a visitor should remember from this step. */
  note?: string;
  /** Materials consumed at this step, for the ingredients index. */
  materials?: string[];
  /** Rough duration, honest rather than dramatic. */
  duration?: string;
};

export const processPhases: ProcessPhase[] = [
  {
    id: 'cloth',
    numeral: 'I',
    title: 'The Cloth',
    question: 'Why can’t you simply paint on fabric?',
    intro:
      'Cotton straight from the loom repels dye and drinks ink. Before a single line is drawn, the cloth is stripped of everything the mill put into it and given back something the dye can hold on to. Six of the twenty-three steps happen before anyone picks up a pen.',
    tone: 'cloth',
    steps: [
      {
        n: 1,
        title: 'Choosing the cloth',
        body: 'Cotton, silk, Chanderi, tussar, linen, organza — each takes the dye differently and each has to be judged by hand before it is bought. A tight, even weave holds a fine line; a slubbed weave will break one. The choice made here decides what can be painted six weeks later.',
        materials: ['Handloom and mill cotton', 'Silk', 'Chanderi', 'Tussar'],
        note: 'The weave decides the drawing. Fine detail is only possible on a cloth that will not fight the pen.',
      },
      {
        n: 2,
        title: 'Washing out the mill',
        body: 'New cloth arrives full of starch and sizing oils that would block every dye that follows. It is soaked and beaten against stone in running water until the water runs clear. This is done at the Swarnamukhi, a few minutes from the store.',
        duration: 'Half a day',
        note: 'Nothing in the twenty-three steps works on a cloth that still has starch in it.',
      },
      {
        n: 3,
        title: 'The first sun',
        body: 'The cloth is spread on sand or stone and left in full sun until bone dry. Sun is not a convenience here — it is a working ingredient, and it appears again and again through the process.',
        duration: 'A few hours',
      },
      {
        n: 4,
        title: 'Myrobalan and buffalo milk',
        localName: 'karakkaya pindi',
        body: 'The cloth is steeped in a milky bath of powdered myrobalan nut and buffalo milk. Two things happen at once. The tannin in the myrobalan soaks into every fibre and waits there — it is the partner that will later turn the iron liquor black. The fat in the buffalo milk coats the surface so that when the pen touches down, the line stays a line instead of feathering into a blur.',
        materials: ['Chebulic myrobalan (karakkaya)', 'Buffalo milk'],
        duration: '1–2 hours of steeping',
        note: 'This is the step that makes freehand drawing on cloth possible at all.',
      },
      {
        n: 5,
        title: 'Wrung out and dried again',
        body: 'Excess liquid is squeezed out by hand and the cloth goes back into the sun. It comes off the ground a warm cream colour. That colour is not a dye and not a stain — it is the myrobalan itself, and it is the ground every Kalamkari begins from.',
        note: 'The cream you see behind the painting was never bleached white. It is the nut.',
      },
      {
        n: 6,
        title: 'Smoothing the ground',
        body: 'The dried cloth is burnished — worked over a smooth stone or rolled — to flatten the raised fibres the washing lifted. A pen dragged across an unsmoothed cloth catches and skips. This is the last thing done to the cloth before it becomes a drawing.',
      },
    ],
  },
  {
    id: 'drawing',
    numeral: 'II',
    title: 'The Drawing',
    question: 'Is any of it traced?',
    intro:
      'No. There is no stencil, no transfer, no projected outline, no block. The composition is set out freehand in charcoal by someone who has the whole story in their head, and the pen that will follow it is made in the store the same week it is used.',
    tone: 'charcoal',
    steps: [
      {
        n: 7,
        title: 'Burning the tamarind twigs',
        body: 'Twigs of tamarind are packed into a closed pot and burned without air until they char through. What comes out is soft, dark charcoal that marks cloth willingly and washes out completely later. Nothing else is used for the sketch, because nothing else disappears so cleanly.',
        materials: ['Tamarind twigs'],
      },
      {
        n: 8,
        title: 'Setting out the story',
        body: 'The whole composition goes down in charcoal — the border, the register lines, the figures, where Rama stands, which way the peacock turns, how the Tree of Life will branch to fill a pallu. On a saree this is several days of decisions made without a single undoable mark, because charcoal on a nine-yard cloth cannot be nudged after the black goes on.',
        duration: '1–3 days on a saree',
        note: 'The proportions you see were judged by eye, at arm’s length, on the floor.',
      },
      {
        n: 9,
        title: 'Making the kalam',
        localName: 'kalam',
        body: 'A length of bamboo is cut and sharpened to a point, then a ball of cloth or wool is bound tightly just above the tip. The bundle is the reservoir; squeezing it feeds liquid down to the nib. Pressure of the fingers controls the flow, which is why a Kalamkari line can swell and taper the way a brush stroke cannot. Different weights of pen are made for outlining, for filling, and for the alum work.',
        materials: ['Bamboo', 'Cotton or wool binding'],
        note: 'Kalam is Persian for pen. The craft is named after this object.',
      },
    ],
  },
  {
    id: 'kasim',
    numeral: 'III',
    title: 'The Black',
    question: 'Where does the black come from, if not from ink?',
    intro:
      'It is not painted on. The black is grown on the cloth by a chemical reaction between iron and the myrobalan already sitting in the fibre — which is why it can never rub off, and why a Kalamkari outline is still black after fifty years.',
    tone: 'kasim',
    steps: [
      {
        n: 10,
        title: 'Fermenting the iron liquor',
        localName: 'kasim / kasimi',
        body: 'Rusted iron scrap, palm and cane jaggery, and water go into an earthen pot and are left sealed for about three weeks. The sugars ferment and pull the iron into solution. What you pour off at the end is a thin, foul-smelling, colourless-to-brown liquid that looks like nothing at all.',
        materials: ['Rusted iron', 'Palm jaggery', 'Cane jaggery', 'Water'],
        duration: 'About 21 days',
        note: 'The liquid that makes the black is not black. It has no colour worth speaking of until it touches the cloth.',
      },
      {
        n: 11,
        title: 'Drawing the outline',
        body: 'The kalam is charged with the iron liquor and the artist goes over the charcoal — every outline, every face, every fold of cloth, the fine hatching inside a border. Where the iron meets the myrobalan tannin held in the fibre, iron tannate forms, and the line darkens as you watch. Get the pressure wrong and the line floods; there is no correcting it.',
        duration: 'Days to weeks, depending on the piece',
        note: 'The colour appears in the cloth, not on it. That is the whole difference between this and printing.',
      },
      {
        n: 12,
        title: 'Washing off what did not bind',
        body: 'The cloth is washed again to carry away every trace of liquor that did not react. The charcoal sketch goes with it. What is left is a finished black drawing on a cream ground — and at this stage, no other colour at all.',
      },
    ],
  },
  {
    id: 'chay',
    numeral: 'IV',
    title: 'The Red',
    question: 'How do you paint red without painting red?',
    intro:
      'The reds are the strangest part of the craft to watch, because the artist never handles a red pigment. They paint with a clear solution onto a cream cloth, and the colour arrives later, in a boiling pot, everywhere the clear solution went and nowhere else.',
    tone: 'chay',
    steps: [
      {
        n: 13,
        title: 'Painting with alum',
        localName: 'patika',
        body: 'Every area that is to end up red, maroon, pink or purple is painted in with a solution of alum. On the cloth it reads as a faint damp shadow and almost nothing else. The artist is working from memory of the finished piece, laying down colour they cannot see.',
        materials: ['Potash alum'],
        note: 'Alum is a mordant — a bite. It grips the fibre at one end and will grip the dye at the other.',
      },
      {
        n: 14,
        title: 'Letting the alum set',
        body: 'The cloth rests and dries so the alum can lock into the fibre rather than sit on top of it. Rushing this is how reds come out patchy.',
        duration: 'Overnight',
      },
      {
        n: 15,
        title: 'Rinsing the surplus',
        body: 'A wash carries off alum that never bound. Anything left loose would drift in the dye bath and stain the cream ground where no colour belongs.',
      },
      {
        n: 16,
        title: 'The madder bath',
        localName: 'chay ver / alizarin',
        body: 'The cloth goes into a large pot of water brought to the boil with madder or chay root and dried flowers, and is worked in it for around three quarters of an hour. The alizarin in the root finds the alum and binds — and only there. The alum-painted areas come up red, the ground stays cream, and the black outline is untouched. Where the alum was laid thicker, the red comes deeper: this is how one dye bath yields pink through maroon in a single pass.',
        materials: ['Madder / chay root', 'Dried flowers'],
        duration: '45 minutes at the boil',
        note: 'One bath, many reds. The variation was decided days earlier, by hand, with a clear liquid.',
      },
      {
        n: 17,
        title: 'Washing the ground back',
        body: 'Straight out of the pot the whole cloth is stained pink. It goes back to the river and is washed repeatedly until every particle of dye that did not bind to alum has let go, and the cream ground returns. This is the step that most often shocks visitors — hours of washing to remove colour that was never wanted.',
        duration: 'Several washing cycles',
      },
    ],
  },
  {
    id: 'indigo',
    numeral: 'V',
    title: 'The Yellow, the Blue, the Green',
    question: 'And the rest of the palette?',
    intro:
      'Yellow is painted. Blue is dipped. Green is not a colour at all — it is one laid over the other. The order cannot be changed, which is why a piece with all three takes so much longer than a piece with only red and black.',
    tone: 'indigo',
    steps: [
      {
        n: 18,
        title: 'Painting the yellow',
        body: 'Yellow is drawn on with the kalam from myrobalan flower or pomegranate rind boiled with alum. It is a soft mustard-gold, never a bright lemon — natural yellow does not go there, and any Kalamkari that glows acid yellow has been helped along with something that did not come out of a pot.',
        materials: ['Myrobalan flowers', 'Pomegranate rind', 'Alum'],
        note: 'If the yellow is loud, the piece is not honest.',
      },
      {
        n: 19,
        title: 'Fixing in the sun',
        body: 'Sunlight and open air drive the yellow into the fibre. Colours that look flat when wet come up clear after a day on the ground.',
        duration: 'A day',
      },
      {
        n: 20,
        title: 'The indigo vat',
        body: 'Indigo is the exception in this craft: it will not be painted on, it has to be dipped. Areas that must stay clear are covered with wax, and the cloth is lowered into the vat. It comes out yellow-green and turns blue in front of you as the air reaches it. Repeat dips make deeper blues.',
        materials: ['Indigo', 'Wax'],
        note: 'The blue is made by the air, not by the vat.',
      },
      {
        n: 21,
        title: 'Green, and clearing the wax',
        body: 'Where indigo is laid over an area already painted yellow, the result is green — the only way green exists in this palette. The wax is then boiled out and the cloth washed clean.',
      },
    ],
  },
  {
    id: 'sun',
    numeral: 'VI',
    title: 'Sun and Water',
    question: 'Why does one saree take a month and a half?',
    intro:
      'Because the last two steps are repeated, and repeated, and repeated. Almost everything that makes a finished Kalamkari beautiful — the clarity of the ground, the depth of the reds, the softness of the cloth in the hand — is produced here, by nothing but river water and sunlight.',
    tone: 'sun',
    steps: [
      {
        n: 22,
        title: 'Washing and sunning, again and again',
        body: 'A finished piece may go through twenty full cycles of washing and sun-drying. Each cycle lifts a little more unbound dye, and each spell in the sun bleaches the ground a shade cleaner while the bound colours stay exactly where they are. The contrast you see in a good piece is the accumulated result of that difference, repeated twenty times.',
        duration: 'Up to 20 cycles',
        note: 'The sun removes the colour you do not want and leaves the colour you do. It is the most patient tool in the store.',
      },
      {
        n: 23,
        title: 'The last wash, and pressing',
        body: 'A final clean wash with no additions, a last drying, and the cloth is pressed and folded. It goes out with no starch, no finish and no sizing — nothing has been added to it since the buffalo milk in step four. Between 15 and 45 days have passed, and the monsoon can stop all of it, because none of it works without sun.',
        duration: '15–45 days from step 1',
      },
    ],
  },
];

export const allSteps = processPhases.flatMap((p) => p.steps);

/** Sanity check used by the process page rail — the count is a claim we make. */
export const totalSteps = allSteps.length;

/**
 * The dye index, shown as a reference table on /process#dyes.
 * `hex` values are approximations of the finished colour on cotton, used for
 * the swatches — the real colour varies with cloth, water and season, and the
 * copy says so.
 */
export const naturalDyes = [
  {
    colour: 'Black',
    hex: '#22201D',
    source: 'Rusted iron + jaggery, fermented 21 days',
    localName: 'kasim',
    how: 'Reacts with myrobalan tannin already in the cloth. Applied by pen.',
  },
  {
    colour: 'Red to maroon',
    hex: '#8E2F22',
    source: 'Madder / chay root',
    localName: 'chay ver',
    how: 'Struck in a boiling bath, only where alum was painted. Applied by mordant.',
  },
  {
    colour: 'Pink',
    hex: '#C66857',
    source: 'Madder root, thin alum',
    how: 'Same bath as the reds; a lighter alum layer takes less dye.',
  },
  {
    colour: 'Yellow',
    hex: '#D4A337',
    source: 'Myrobalan flower, pomegranate rind + alum',
    how: 'Painted directly with the kalam.',
  },
  {
    colour: 'Blue',
    hex: '#2C4268',
    source: 'Indigo',
    localName: 'neeli',
    how: 'Dipped in a vat, with wax resist. Oxidises to blue in open air.',
  },
  {
    colour: 'Green',
    hex: '#4A5D3A',
    source: 'Indigo over yellow',
    how: 'Not a dye of its own — two layers, in that order.',
  },
  {
    colour: 'Brown',
    hex: '#6F4B31',
    source: 'Catechu bark',
    localName: 'katha',
    how: 'Painted directly.',
  },
  {
    colour: 'Cream ground',
    hex: '#F4EDE0',
    source: 'Chebulic myrobalan',
    localName: 'karakkaya',
    how: 'Not bleached and not dyed. The colour the nut leaves behind.',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* The dye wash behind /process                                               */
/* -------------------------------------------------------------------------- */

/**
 * The seven tones the background moves through as the page is read.
 *
 * These are not decorative gradients. They are the pot colours, in the order
 * the craft actually reaches them: the fermented iron first because the black
 * is drawn before anything else, then madder, then the yellow that is painted
 * on, then the vat, then the green that only exists as one over the other,
 * then catechu, and finally back to the myrobalan cream the cloth started from
 * — because the last thing that happens to a finished piece is twenty washings
 * that take it back towards its own ground.
 *
 * `ink` is the text colour that clears AA against that tone. It is stated
 * rather than computed so it can be checked by eye against the real swatch.
 */
export type DyeTone = {
  id: string;
  label: string;
  /** Source of the colour, one short line. */
  source: string;
  hex: string;
  /** 'light' = pale text on this tone. 'dark' = ink text on this tone. */
  ink: 'light' | 'dark';
};

export const dyeWash: DyeTone[] = [
  { id: 'kasim', label: 'Kasim black', source: 'Rusted iron fermented with jaggery', hex: '#22201D', ink: 'light' },
  { id: 'chay', label: 'Madder red', source: 'Chay root, struck over alum', hex: '#8E2F22', ink: 'light' },
  { id: 'myrobalan', label: 'Myrobalan gold', source: 'Flower and pomegranate rind', hex: '#B9862A', ink: 'dark' },
  { id: 'indigo', label: 'Indigo blue', source: 'Vat indigo, oxidised in air', hex: '#2C4268', ink: 'light' },
  { id: 'green', label: 'Green', source: 'Indigo laid over yellow', hex: '#4A5D3A', ink: 'light' },
  { id: 'katha', label: 'Catechu brown', source: 'Catechu bark', hex: '#6F4B31', ink: 'light' },
  { id: 'cotton', label: 'Myrobalan cream', source: 'The ground the cloth began from', hex: '#E3D4B4', ink: 'dark' },
];

/* -------------------------------------------------------------------------- */

/**
 * The colour walk-through on /process, using the same progressive pattern as
 * the home page's eight stages.
 *
 * One entry per colour actually used in this workshop. Each says where it
 * comes from, how it is applied, and the one thing about it that surprises
 * people — all of it drawn from the dye index above rather than invented.
 */
export type ColourStory = {
  id: string;
  name: string;
  /** Telugu or trade name, where the artisans use one. */
  localName?: string;
  hex: string;
  /** Contrast pairing for text laid directly on the swatch. */
  ink: 'light' | 'dark';
  source: string;
  /** Painted, dipped, struck in a bath, or not a dye at all. */
  method: string;
  /** Two or three sentences. The voice of somebody who has stood over the pot. */
  body: string;
  /** The single fact worth remembering. */
  note: string;
};

export const colourStories: ColourStory[] = [
  {
    id: 'cream',
    name: 'Myrobalan cream',
    localName: 'karakkaya',
    hex: '#EFE2C6',
    ink: 'dark',
    source: 'Chebulic myrobalan nut, ground and steeped with buffalo milk',
    method: 'Steeped, not dyed',
    body: 'Every Kalamkari begins on this colour, and it is the only one that is not a decision. The cloth is soaked in ground myrobalan and buffalo milk and comes out of the sun a warm, uneven cream. Nothing has been added to make it that shade — it is simply what the nut leaves behind.',
    note: 'The ground was never bleached white. Any Kalamkari on a brilliant white cloth has had help from something that did not come out of a pot.',
  },
  {
    id: 'black',
    name: 'Kasim black',
    localName: 'kasim / kasimi',
    hex: '#22201D',
    ink: 'light',
    source: 'Rusted iron and jaggery, fermented about twenty-one days',
    method: 'Drawn with the kalam',
    body: 'Scrap iron and palm jaggery sit sealed in an earthen pot for three weeks until the sugars pull the iron into solution. What you pour off is thin, foul-smelling and very nearly colourless. Drawn onto myrobalan-treated cloth it darkens as you watch, because the iron is meeting the tannin already waiting in the fibre.',
    note: 'The liquid that makes the black is not black. The colour forms in the cloth, not on it — which is why the outline is still there after fifty years.',
  },
  {
    id: 'red',
    name: 'Madder red',
    localName: 'chay ver',
    hex: '#8E2F22',
    ink: 'light',
    source: 'Madder or chay root, boiled with dried flowers',
    method: 'Struck in a bath, over an alum mordant',
    body: 'The artist never touches a red pigment. Every area that will be red is painted first with a clear solution of alum, which reads as a faint damp shadow and nothing more. Days later the whole cloth goes into a boiling pot of madder root, and the alizarin binds only where the alum went.',
    note: 'One bath gives pink through deep maroon in a single pass. The variation was decided days earlier, by hand, in a liquid nobody could see.',
  },
  {
    id: 'pink',
    name: 'Pink',
    hex: '#C66857',
    ink: 'dark',
    source: 'The same madder bath, over a thinner alum layer',
    method: 'Struck in a bath',
    body: 'Pink is not a separate dye and never was. It is the same root, in the same pot, on the same day — the only difference is how much alum the artist laid down underneath it. A thin mordant takes less colour.',
    note: 'On a printed cloth pink and red are two inks. Here they are one bath and two thicknesses of an invisible liquid.',
  },
  {
    id: 'yellow',
    name: 'Myrobalan gold',
    hex: '#D4A337',
    ink: 'dark',
    source: 'Myrobalan flower and pomegranate rind, boiled with alum',
    method: 'Painted directly',
    body: 'Yellow is one of only three colours drawn straight onto the cloth with the pen. It arrives as a soft mustard-gold and settles further in a day of open sun. Natural yellow does not go bright, and it never has.',
    note: 'If the yellow glows acid-lemon, the piece has been helped along. That is the quickest tell there is.',
  },
  {
    id: 'blue',
    name: 'Indigo blue',
    localName: 'neeli',
    hex: '#2C4268',
    ink: 'light',
    source: 'Vat indigo',
    method: 'Dipped, with wax resist',
    body: 'Indigo is the exception in this craft: it refuses to be painted. Areas that must stay clear are covered in wax and the whole cloth is lowered into the vat. It comes out yellow-green and turns blue in front of you as the air reaches it. Repeat dips make deeper blues.',
    note: 'The blue is made by the air, not by the vat. Nothing in the pot is the colour you end up with.',
  },
  {
    id: 'green',
    name: 'Green',
    hex: '#4A5D3A',
    ink: 'light',
    source: 'Indigo laid over yellow',
    method: 'Two layers, in that order',
    body: 'There is no green dye in this palette and there never has been. Green exists only where the indigo vat passes over cloth that was already painted with myrobalan yellow. Reverse the order and it does not work.',
    note: 'This is why a piece with green in it takes noticeably longer than one without: it needs both the painting and the dipping, and they cannot be swapped.',
  },
  {
    id: 'brown',
    name: 'Catechu brown',
    localName: 'katha',
    hex: '#6F4B31',
    ink: 'light',
    source: 'Catechu bark',
    method: 'Painted directly',
    body: 'A quiet, warm brown boiled out of catechu bark and drawn on with the pen like the yellow. It is used for earth, for tree trunks, for the ground a figure stands on — the parts of a narrative panel nobody looks at directly and everybody would miss.',
    note: 'The third and last of the colours that are painted rather than struck or dipped.',
  },
];

/** Used on the home page and the process page to answer the obvious objection. */
export const whatWeDoNotUse = [
  'Chemical or azo dyes',
  'Screen printing',
  'Wooden blocks',
  'Digital or machine printing',
  'Tracing, transfers or stencils',
  'Optical brighteners or synthetic finishes',
];
