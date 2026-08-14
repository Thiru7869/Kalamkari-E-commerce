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

/* -------------------------------------------------------------------------- */
/* The cloth, as a set of layers                                              */
/* -------------------------------------------------------------------------- */

/**
 * Which layers of the drawing are showing.
 *
 * This lives in the content layer rather than beside the SVG that renders it,
 * because three different things now declare a cloth state — the eight public
 * stages, the fourteen main stages, and the twelve-stage journey — and two of
 * them are content files. A content module importing a type out of a
 * `'use client'` component to describe its own data has the dependency the
 * wrong way round; components depend on content here, not the reverse.
 */
export type ClothLayers = {
  /** Myrobalan and buffalo milk: the ground turns cream. */
  prepared: boolean;
  /** Charcoal composition is down. */
  drawn: boolean;
  /** Iron liquor has struck: the outline is black rather than pale. */
  blackened: boolean;
  /** Alum painted, before the bath — visible only as a damp shadow. */
  alum: boolean;
  /** The madder bath has been run. */
  madder: boolean;
  /** Indigo dipped and the yellows painted. */
  indigo: boolean;
  /** Twenty washings and the sun. */
  finished: boolean;
};

/** Loom cotton: nothing has been done to it yet. */
export const NO_LAYERS: ClothLayers = {
  prepared: false,
  drawn: false,
  blackened: false,
  alum: false,
  madder: false,
  indigo: false,
  finished: false,
};

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
    source: 'Seval podi, worked with roots kept for it',
    how: 'Prepared as its own colour, not thinned out of the red.',
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
    source: 'Indigo leaves, pressed down into crystals',
    localName: 'neeli',
    how: 'Dipped in a vat, with wax resist. Oxidises to blue in open air.',
  },
  {
    colour: 'Green',
    hex: '#4A5D3A',
    source: 'Yellow with kasim, yellow and blue either way, or hibiscus',
    how: 'Not a dye of its own — four traditional routes, and the order is the recipe.',
  },
  {
    colour: 'Brown',
    hex: '#6F4B31',
    source: 'Processed crystals, kept until needed',
    localName: 'katha',
    how: 'Dissolved from crystal and painted directly.',
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
 * The tones the ground moves through as the page is read.
 *
 * These are the pot colours **as they sit on cloth**, not as they sit in the
 * pot — which is a real distinction in this craft and the reason the sequence
 * is warm rather than saturated. Kasim in the jar is black; on myrobalan-
 * treated cotton, before it strikes, it is a grey shadow. Madder off the boil
 * stains the whole ground a pale blush long before it washes back. What a
 * visitor standing in the workshop actually sees, at every stage, is a warm
 * off-white shifting by a few degrees.
 *
 * Rendering the jar colours instead gave a page that lurched from black to
 * blood red to navy behind the reading, which is both untrue to the craft and
 * exhausting to read against. These stay inside beige, buff and blush, in the
 * order the cloth passes through them, and end on the sunned cream a finished
 * piece comes back to.
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
  { id: 'cotton', label: 'Loom cream', source: 'Cotton as it comes off the loom', hex: '#F6F0E4', ink: 'dark' },
  { id: 'myrobalan-ground', label: 'Myrobalan ground', source: 'The buff the nut leaves behind', hex: '#EFE2C6', ink: 'dark' },
  { id: 'kasim', label: 'Kasim shadow', source: 'Iron liquor, before it darkens', hex: '#DED3C0', ink: 'dark' },
  { id: 'chay', label: 'Madder blush', source: 'Chay root, first strike', hex: '#EBCFBF', ink: 'dark' },
  { id: 'myrobalan', label: 'Myrobalan gold', source: 'Flower and pomegranate rind', hex: '#F0DBA8', ink: 'dark' },
  { id: 'green', label: 'Vat green', source: 'Indigo drawn over yellow', hex: '#DDE0C4', ink: 'dark' },
  { id: 'katha', label: 'Catechu warmth', source: 'Catechu bark, thinned', hex: '#E7D6C0', ink: 'dark' },
  { id: 'sun', label: 'Sunned cream', source: 'Twenty washings and the sun', hex: '#F8F3E7', ink: 'dark' },
];

/* -------------------------------------------------------------------------- */

/**
 * The colour walk-through on /process, and the storytelling panel behind the
 * swatches on the home page.
 *
 * One entry per colour actually used in this workshop. Each says where it comes
 * from, how it is worked, what it carries culturally, and where on a piece it
 * actually lands — all of it as the store gives it, not as a dye manual would.
 *
 * **The account here is the family's own.** Where a published description of
 * Srikalahasti Kalamkari differs from what this workshop does — pink is the
 * clearest case, and brown the other — this file follows the workshop. The
 * craft is a living practice with real regional and household variation, and a
 * store describing its own pots outranks a general account of the craft.
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
  /**
   * What the colour carries beyond its chemistry — why it is reached for.
   *
   * Kept to what the craft itself supports: a colour's association in temple
   * and festival use, or its structural role in the palette. No horoscopes and
   * no invented symbolism.
   */
  meaning?: string;
  /** Where on an actual piece it lands. Concrete places, not adjectives. */
  usedFor?: string;
  /**
   * More than one traditional way to the same colour.
   *
   * Only green has these, and it is the most interesting thing in the palette:
   * four separate routes, giving shades a printer would need four inks for.
   */
  routes?: { label: string; body: string }[];
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
    meaning:
      'The colour of the cloth before anybody has spoken on it. Every other colour in this palette is judged against it, and a piece is only ever as warm as the ground underneath it.',
    usedFor:
      'The whole field — the unpainted cloth between motifs, the space inside a border, the sky behind a figure.',
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
    meaning:
      'The grounding colour, and the one the whole palette depends on. Kasim is drawn first and everything else is filled inside it, so the black is not an outline added to a picture — it is the structure the picture is built on. Nothing else in the pot yard is asked to hold that much.',
    usedFor:
      'Every outline on the piece: the contour of a figure, the rule between registers, the fine hatching inside a border, and the features of a face — which are the last marks made and the ones that decide whether it is any good.',
  },
  {
    id: 'red',
    name: 'Madder red',
    localName: 'chay ver',
    hex: '#8E2F22',
    ink: 'light',
    source: 'Madder or chay root, boiled with dried flowers',
    method: 'Struck in a bath, over an alum mordant',
    body: 'The artist never touches a red pigment. Every area that will be red is painted first with alum water — a clear solution that reads as a faint damp shadow on the cloth and nothing more. Days later the whole piece goes into a boiling pot of madder root, and the colour strikes only where the alum was laid.',
    note: 'The red is painted in water you cannot see. An artisan works a whole pallu in a liquid that shows nothing, and finds out days later whether the drawing was right.',
    meaning:
      'The auspicious colour, and the one a piece is usually built around. Red is what the eye goes to first on a finished saree, so it is given the borders and the motifs meant to carry energy rather than the quiet passages.',
    usedFor:
      'Borders, the ground of a pallu, the garments of principal figures, and the repeating motif of a jaal — wherever the piece needs to assert itself across a room.',
  },
  {
    id: 'pink',
    name: 'Pink',
    hex: '#C66857',
    ink: 'dark',
    source: 'Seval podi, worked with roots kept for the purpose',
    method: 'Prepared as its own colour',
    body: 'Pink is made rather than diluted. Seval podi is worked together with roots the family keeps for this colour alone, and the strength is judged in the pot rather than corrected on the cloth — once it is down, it is down. It comes up soft, and then refuses to behave like a soft colour: against kasim black it is one of the sharpest things in the palette.',
    note: 'Not a weak red. It has its own powder, its own roots and its own preparation, and a piece is planned for it in advance.',
    meaning:
      'The colour of tenderness in a composition that is otherwise built on assertion. It is where a piece softens — and because it is prepared separately rather than thinned out of the red, choosing it is a decision made days before it appears.',
    usedFor:
      'Flowers and petal-work in a jaal, the inner fields of a border, and the passages of a narrative panel meant to be gentle — a figure at rest, a garment that is not the principal one.',
  },
  {
    id: 'yellow',
    name: 'Myrobalan gold',
    hex: '#D4A337',
    ink: 'dark',
    source: 'Myrobalan flower and pomegranate rind, boiled with alum',
    method: 'Painted directly',
    body: 'Yellow comes out of flowers, and it is one of the few colours drawn straight onto the cloth with the pen rather than struck in a bath or dipped in a vat. It arrives as a soft mustard-gold and settles a shade further in a day of open sun. Natural yellow does not go bright, and it never has.',
    note: 'If the yellow glows acid-lemon, the piece has been helped along. That is the quickest tell there is.',
    meaning:
      'Light and prosperity, and the colour a piece is lit from. Yellow is also the workshop’s hinge: it is the layer that indigo and kasim are laid over to reach green, so more of a finished piece passes through it than ever stays it.',
    usedFor:
      'Lamps, ornament and jewellery, the gold passages of a border, the ground behind a deity — and, invisibly, underneath every green on the cloth.',
  },
  {
    id: 'blue',
    name: 'Indigo blue',
    localName: 'neeli',
    hex: '#2C4268',
    ink: 'light',
    source: 'Indigo leaves, fermented and pressed down into crystals',
    method: 'Dipped, with wax resist',
    body: 'The blue begins as a tree’s leaves. They are fermented, beaten and settled until what is left can be dried into hard, dark crystals — a colour reduced to something you can hold in a hand and keep for years. The crystals go back into a vat, and the cloth is lowered in. It comes out yellow-green and turns blue in front of you as the air reaches it.',
    note: 'The blue is made by the air, not by the vat. Nothing in the pot is the colour you end up with — indigo is the one dye here that changes after it has left the liquid.',
    meaning:
      'The oldest and most travelled colour in the palette, and the one that gives Kalamkari its depth. Indigo is also the discipline of the craft: it cannot be painted, so a piece with blue in it has to be planned around the vat from the first drawing.',
    usedFor:
      'Skies and water, the deep field of a border, the blue-skinned deities of the epics — and every green on the cloth, which is indigo passing over a yellow that is already there.',
  },
  {
    id: 'green',
    name: 'Green',
    hex: '#4A5D3A',
    ink: 'light',
    source: 'Four routes: yellow with kasim, yellow and blue in either order, or hibiscus',
    method: 'Layered — the order is the recipe',
    body: 'There is no green pot in this yard. Green is always something else arriving on top of something else, and this workshop keeps four ways of getting there — which means four greens, not one. A printer reaching the same range would need four separate inks; here it is the same few pots in a different order.',
    note: 'Order is not a detail in this colour, it is the whole recipe. Yellow under blue and blue under yellow are two different greens, and an artisan chooses between them before either goes down.',
    meaning:
      'The proof that this palette is knowledge rather than a shelf of colours. Nothing about green can be bought ready-made — it exists only as a sequence somebody has to remember, and the fact that four sequences survive in one household is the tradition still being practised rather than recalled.',
    usedFor:
      'Foliage and the tree of life, the leaves of a jaal, the ground a figure stands on, and the borders where a piece needs a colour that is neither warm nor cold.',
    routes: [
      {
        label: 'Yellow with kasim',
        body: 'The original, and still the workshop’s own. Iron liquor drawn over a yellow that is already on the cloth pulls it down into a deep, shadowed green with the weight of the black still in it. It is the least bright of the four and the one that ages best.',
      },
      {
        label: 'Yellow, then blue',
        body: 'Yellow painted first with the pen, then the whole cloth into the indigo vat. The blue settles over the yellow and the green comes up cool and even — the most predictable of the four, and the one used where a large area has to hold one tone.',
      },
      {
        label: 'Blue, then yellow',
        body: 'The same two colours in the other order, and a different green entirely. Yellow drawn on top of a dipped blue sits over it rather than sinking into it, and reads warmer and more alive. Two shades from two pots, decided only by which went down first.',
      },
      {
        label: 'From hibiscus',
        body: 'A green out of the flower itself, without either of the other pots. It is the softest of the four and the least expected, and it is the kind of thing that stays in a craft only because somebody kept doing it.',
      },
    ],
  },
  {
    id: 'brown',
    name: 'Brown',
    localName: 'katha',
    hex: '#6F4B31',
    ink: 'light',
    source: 'Crystals, processed and kept until they are needed',
    method: 'Dissolved from crystal, painted directly',
    body: 'Brown arrives in the workshop already reduced — processed down to crystals that keep, and brought back into a colour with water when a piece calls for it. Like indigo it is a colour stored rather than brewed on the day, and like the yellow it goes on with the pen. It is the most patient thing in the palette: nobody notices it, and every narrative panel would fall apart without it.',
    note: 'A colour kept as a solid. Most of this palette has to be made the week it is used — brown and indigo are the two that wait on a shelf.',
    meaning:
      'The earth of the picture. Brown is what everything else stands on, and its job is to be unremarkable — a panel where the ground draws attention is a panel that has gone wrong.',
    usedFor:
      'Soil and the ground line, tree trunks and branches, animal hide, and the secondary motifs that hold a composition together between its principal figures.',
  },
];

/* -------------------------------------------------------------------------- */

/**
 * The ninth tile: the palette that has no fixed number.
 *
 * The eight above are the pots this workshop keeps standing. They are not the
 * limit of the craft, and saying so matters — the knowledge being practised
 * here is a method for getting colour out of living material, not a set of
 * eight recipes. A flower nobody has boiled this year is still a colour.
 *
 * Deliberately **not** a member of `colourStories`. That array mirrors the
 * closed `Dye` set in the database, which is what the shop filters on, and an
 * open-ended ninth entry with no single hex would corrupt both. It renders
 * beside them and is clearly a different kind of thing.
 */
export const openPalette = {
  id: 'traditional',
  name: 'Traditional colours',
  /** Drawn as a sweep rather than a swatch — it is not one colour. */
  sweep: ['#8E2F22', '#D4A337', '#2C4268', '#4A5D3A', '#C66857', '#6F4B31'],
  source: 'Flowers, roots, leaves, bark and mineral earth',
  method: 'Whatever the material asks for',
  body: 'Eight pots stand in this yard because eight is what a working week needs, not because eight is what the craft has. Countless shades are reachable from flowers, roots, leaves and mineral processes, and the family has made colours that appear on one piece and are not mixed again for years.',
  note: 'This is living knowledge rather than a recipe card. It is held in a household, tested against cloth, and changed when the material changes.',
  meaning:
    'The reason this is a tradition and not a product line. A palette that can still be extended is a palette somebody still understands — the moment it becomes a fixed list of eight, the knowledge behind it has already gone.',
} as const;

/** Used on the home page and the process page to answer the obvious objection. */
export const whatWeDoNotUse = [
  'Chemical or azo dyes',
  'Screen printing',
  'Wooden blocks',
  'Digital or machine printing',
  'Tracing, transfers or stencils',
  'Optical brighteners or synthetic finishes',
];
