/**
 * The fourteen main stages of a Srikalahasti Kalamkari saree.
 *
 * ─── How this relates to the twenty-three steps ───────────────────────────
 *
 * It does not replace them. `processPhases` in `./process.ts` holds the
 * twenty-three individual operations, and twenty-three is a claim this site
 * makes in eight other places — `site.craft.steps`, `totalSteps`, the
 * announcement bar, the heritage figures, the assistant's knowledge base, the
 * HowTo structured data, /journal and the home page teaser. Changing that
 * number here would make the site disagree with itself.
 *
 * These fourteen are the *shape* of the work: the stages an artisan would name
 * if you asked them what they were doing this week. Each one declares the
 * operations it contains in `coversSteps`, and `assertStagesCoverEverySteps()`
 * below fails at module load if the fourteen do not account for all
 * twenty-three exactly once. So the two views cannot drift: renumber a step in
 * `process.ts` and this file stops the build rather than quietly dropping it.
 *
 * ─── Sourcing ─────────────────────────────────────────────────────────────
 *
 * Every material, quantity and duration below is either already stated
 * elsewhere on this site or is corroborated by published descriptions of the
 * Srikalahasti process — Sahapedia's account of the craft, the Development
 * Commissioner (Handicrafts) entry, and the GI documentation filed by KARUNA.
 * Where published sources disagree — the alizarin bath is variously given as
 * 30 and 45 minutes, the piece as 15–20 or 15–45 days — the range is given as
 * a range rather than a figure picked for being impressive.
 *
 * Where a number is specific it is because a source is specific: the kasim
 * recipe (1kg rusted iron, 500g cane jaggery, 100g palm jaggery, 10 litres of
 * water, 21 days) and the red bath (roughly 1kg chavalakodi root, 300g surudu
 * chakka bark and half a kilo of alum) are quoted proportions, not invented
 * precision.
 *
 * No claim is made here about this store's own yields, hours or output beyond
 * what `site.craft` already states.
 */

import { NO_LAYERS, allSteps, type ClothLayers } from './process';
import { site } from './site';

export type MainStage = {
  n: number;
  /** The stage name, as a working artisan would say it. */
  title: string;
  /** Telugu or trade name, where the artisans use one. */
  localName?: string;
  /** The question this stage answers for somebody who knows nothing. */
  question: string;
  /** Two or three paragraphs. The substance of the page. */
  body: string[];
  materials?: string[];
  duration?: string;
  /** The single fact worth carrying away from this stage. */
  note?: string;
  /**
   * Which of the twenty-three operations happen inside this stage.
   *
   * Checked at module load. This is also what lets the page render the full
   * twenty-three underneath the fourteen without either list being written out
   * twice.
   */
  coversSteps: number[];
  /** Ground tone for this stage — an id in `dyeWash`. */
  tone: string;
  /** What the cloth looks like by the end of this stage. */
  layers: ClothLayers;
};

const PREPARED: ClothLayers = { ...NO_LAYERS, prepared: true };
const DRAWN: ClothLayers = { ...PREPARED, drawn: true };
const BLACKENED: ClothLayers = { ...DRAWN, blackened: true };
const ALUM: ClothLayers = { ...BLACKENED, alum: true };
const MADDER: ClothLayers = { ...ALUM, madder: true };
const COLOURED: ClothLayers = { ...MADDER, indigo: true };
const FINISHED: ClothLayers = { ...COLOURED, finished: true };

export const mainStages: MainStage[] = [
  {
    n: 1,
    title: 'Raw cotton fabric selection and preparation',
    question: 'Does it matter which cloth you start with?',
    body: [
      'More than anything else decided later. Cotton, silk, Chanderi, tussar, linen and organza each take the dye differently and each has to be judged in the hand before it is bought — held to the light, rubbed between finger and thumb, pulled on the bias. A tight, even weave will hold a hairline; a slubbed tussar will break one, and the drawing has to be planned coarser to suit it.',
      'What is being judged is not quality in the abstract but what the cloth will do to a wet line. A loose weave wicks: dye laid on it creeps along the thread and a fine outline becomes a smudge three threads wide. A dense one resists, which is its own problem, because the mordant then sits on the surface instead of striking into the fibre.',
      'This is why the fabric is named on every piece in the store, and why the same motif is priced differently on different cloth. The decision made in this hour sets the ceiling on what can be drawn six weeks from now.',
    ],
    materials: ['Handloom and mill cotton', 'Silk', 'Chanderi', 'Tussar', 'Linen', 'Organza'],
    note: 'The weave decides the drawing. Nothing later in the sequence can recover a line the cloth would not hold.',
    coversSteps: [1],
    tone: 'cotton',
    layers: { ...NO_LAYERS },
  },
  {
    n: 2,
    title: 'Fabric washing and scouring',
    question: 'What has to come out of it first?',
    body: [
      `Everything the mill put in. New cloth arrives stiff with starch and sizing oils, and in that state it repels dye and drinks ink in equal measure — the two worst properties a Kalamkari ground can have. It is soaked, then beaten against stone in running water until the water runs clear, which is the only test used and the only one needed.`,
      `This is done at the ${site.location.river}, a few minutes' walk from the store. River washing is not romantic here; it is practical. Running water carries the dissolved starch away instead of returning it to the cloth, which is what a still tub does, and a length of nine yards is easier to work in a current than in a bucket.`,
      'The cloth then goes onto sand or stone in full sun until it is bone dry. Sun is a working ingredient in this craft rather than a convenience, and this is the first of roughly twenty times it will be used.',
    ],
    duration: 'Half a day, plus a few hours of sun',
    note: 'Nothing in the twenty-three steps works on a cloth that still has starch in it. This is the step that is skipped when a piece later fails.',
    coversSteps: [2, 3],
    tone: 'cotton',
    layers: { ...NO_LAYERS },
  },
  {
    n: 3,
    title: 'Myrobalan treatment',
    localName: 'karakkaya',
    question: 'Why does the cloth turn cream before anything is painted on it?',
    body: [
      'The cloth is steeped in a bath of ground chebulic myrobalan — karakkaya, the nut of Terminalia chebula. Published accounts of the craft give roughly four litres of the solution to ten metres of cloth, an immersion of five to ten minutes, and about two hours in the sun afterwards.',
      'What the nut leaves behind is tannin, sitting in every fibre and doing nothing visible at all. It is waiting. Ten days from now, when iron liquor is drawn across it, the iron and the tannin will react and form iron tannate in the cloth — and that reaction is the whole reason a Kalamkari outline is black, and the reason it is still black in fifty years.',
      'The warm off-white the cloth comes out of the sun is not a dye and not a stain. It is the myrobalan. Every Kalamkari begins on that colour, and it is the one colour on the finished piece that nobody chose.',
    ],
    materials: ['Chebulic myrobalan (karakkaya)', 'Water'],
    duration: '5–10 minutes steeping, then 2 hours of sun',
    note: 'The ground was never bleached white. Any Kalamkari on a brilliant white cloth has had help from something that did not come out of a pot.',
    coversSteps: [4],
    tone: 'myrobalan-ground',
    layers: PREPARED,
  },
  {
    n: 4,
    title: 'Milk treatment and sun drying',
    question: 'What stops the pen from bleeding?',
    body: [
      'Buffalo milk, in the same bath. The fat in it coats the surface of the fibre and behaves as a size — when the kalam touches down, the line stays a line instead of feathering out along the thread. Without it, freehand drawing on cloth is not possible at this scale; with it, an artisan can lay a hairline across nine yards and have it hold its weight.',
      'Excess is squeezed out by hand rather than wrung, because wringing sets creases that will show under the dye. The cloth then goes back into the sun, and is washed in running water and dried again — accounts of the process give three cycles — until the ground is an even off-white with a smooth handle.',
      'Then it is burnished: worked over a smooth stone, or rolled, to flatten the fibres the washing lifted. A pen dragged across an unsmoothed cloth catches and skips, and a skip in an outline cannot be corrected. This is the last thing done to the cloth before it becomes a drawing.',
    ],
    materials: ['Buffalo milk', 'Water', 'Sun'],
    duration: 'Three wash-and-dry cycles',
    note: 'This is the step that makes freehand drawing on cloth possible at all. Everything the site claims about the line rests on it.',
    coversSteps: [5, 6],
    tone: 'myrobalan-ground',
    layers: PREPARED,
  },
  {
    n: 5,
    title: 'Design planning and traditional motif selection',
    question: 'Where does the composition come from?',
    body: [
      'From the epics, and from the older painted temple cloths. Srikalahasti Kalamkari grew up serving the temple rather than the export trade, and its compositions still carry that logic: figures in registers, borders that frame a scene rather than decorate it, faces drawn to be legible from a distance in poor light. A panel was made to be unrolled while somebody narrated the story it showed.',
      'On a saree the same inheritance meets a different problem. The body, the border and the pallu are three separate compositions that have to agree — a jaal has to hold a rhythm over nine yards without repeating mechanically, and the pallu has to carry a whole episode inside the area a person actually sees when the cloth is worn.',
      'None of this is laid out on paper first. The artisan has the whole composition in their head before the charcoal touches the cloth, which is why this stage looks from the outside like nothing happening.',
    ],
    note: 'There is no device anywhere in this craft that repeats a mark. A border repeat that looks identical was drawn identically, by eye, again and again.',
    coversSteps: [7],
    tone: 'kasim',
    layers: PREPARED,
  },
  {
    n: 6,
    title: 'Preparing the kalam',
    localName: 'kalam',
    question: 'What is the pen, and why does it matter?',
    body: [
      'A length of bamboo, cut and sharpened to a point at one end. Just above the tip a piece of cotton cloth is wound on, and over that a considerable length of wool is bound tightly with thread. The wool is the reservoir: dipped in dye it absorbs and holds, and the artisan feeds the nib by squeezing it between the fingers as they work.',
      'That is the entire mechanism, and it is what separates this craft from every other way of putting a line on cloth. Flow is controlled by finger pressure, continuously, so a stroke can swell where the hand slows and taper where it lifts. A block prints one weight. A screen prints one weight. A brush cannot hold enough dye to cross a saree without reloading.',
      'Different pens are made for different work — a fine sharp one for outlining, a blunter, fatter one for laying alum and filling colour. They are made in the store, usually in the same week they are used, by the people who will draw with them.',
    ],
    materials: ['Bamboo', 'Cotton cloth', 'Wool', 'Thread'],
    note: 'Kalam is Persian for pen. The craft is named after this object, and the object is the whole of the difference.',
    coversSteps: [9],
    tone: 'kasim',
    layers: PREPARED,
  },
  {
    n: 7,
    title: 'Hand sketching and outlining',
    question: 'Is any of it traced?',
    body: [
      'No. Not a stencil, not a transfer, not a projection, not a block. The composition goes down freehand in charcoal made by packing twigs of tamarind into a closed pot and burning them without air until they char through. Nothing else is used, because nothing else marks cloth willingly and then washes out completely.',
      'On a saree this is several days of decisions taken at arm’s length, on the floor, with nothing undoable in any of them. Where Rama stands, which way the peacock turns, how the Tree of Life branches to fill a pallu — all of it is settled here, in a medium that will be gone by the end of the month, before a drop of dye is committed.',
      'The charcoal is a plan and not a drawing. What is being made at this stage is the decision, and the decision is the part that cannot be bought in.',
    ],
    materials: ['Tamarind twigs, charred'],
    duration: '1–3 days on a saree',
    note: 'The proportions you see on a finished piece were judged by eye, at arm’s length, on a floor.',
    coversSteps: [8],
    tone: 'kasim',
    layers: DRAWN,
  },
  {
    n: 8,
    title: 'Preparing the natural dyes and mordants',
    question: 'What is actually in the pots?',
    body: [
      `Things that grew or rusted, and nothing else. The black is kasim kaaram, fermented from rusted iron and jaggery — published recipes give about a kilo of rusted iron, half a kilo of cane jaggery and a hundred grams of palm jaggery to ten litres of water, sealed and left for ${site.craft.kasimFermentDays} days while the sugars pull the iron into solution.`,
      'The reds come from root and bark boiled together with alum: chavalakodi root, surudu chakka bark, and alizarin, which is the colouring compound madder and chay root carry. The yellow is myrobalan flower or pomegranate rind boiled with alum. The blue is a vat of indigo. The brown is catechu bark. That is the whole palette, and there is no green in it.',
      'Every one of these is prepared in the yard, on the store’s own timetable rather than a supplier’s. The iron has to have been started three weeks before it is needed, which means the black on a piece finishing this month was set fermenting before the cloth was bought.',
    ],
    materials: [
      'Rusted iron',
      'Cane and palm jaggery',
      'Chavalakodi root',
      'Surudu chakka bark',
      'Alizarin / madder',
      'Potash alum',
      'Myrobalan flower',
      'Pomegranate rind',
      'Indigo',
      'Catechu bark',
    ],
    duration: `${site.craft.kasimFermentDays} days for the black alone`,
    note: 'The liquid that makes the black is not black. Poured off after three weeks it is thin, foul-smelling and very nearly colourless.',
    coversSteps: [10],
    tone: 'kasim',
    layers: DRAWN,
  },
  {
    n: 9,
    title: 'Black outlining with kasim kaaram',
    localName: 'kasim / kasimi',
    question: 'Where does the black come from, if not from ink?',
    body: [
      'It is not painted on. It is grown on the cloth. The kalam is charged with the iron liquor and the artisan goes over the charcoal — every outline, every face, every fold, the fine hatching inside a border — and where the iron meets the myrobalan tannin waiting in the fibre, iron tannate forms and the line darkens as you watch.',
      'Because the colour forms inside the fibre rather than sitting on top of it, it cannot rub off, cannot crack and cannot be lifted by washing. It is also why the black on a genuine piece reads almost as strongly on the reverse of the cloth as on the face, which is the single quickest test there is against a print.',
      'It is unforgiving in the way that matters. Get the finger pressure wrong and the line floods; there is no correcting it, no lifting it, and no drawing it again somewhere better. A saree can be lost at this stage after two weeks of work.',
    ],
    materials: ['Kasim kaaram (fermented iron liquor)'],
    duration: 'Days to weeks, depending on the piece',
    note: 'The colour appears in the cloth, not on it. That is the whole difference between this and printing, and it is visible from the back.',
    coversSteps: [11, 12],
    tone: 'kasim',
    layers: BLACKENED,
  },
  {
    n: 10,
    title: 'Red colour development with mordant and dye',
    localName: 'patika · chay ver',
    question: 'How do you paint red without ever touching a red pigment?',
    body: [
      'You paint with alum. Every area that is to end up red, maroon, pink or purple is drawn in with a solution of potash alum using a blunt pen, and on the cloth it reads as a faint damp shadow and almost nothing else. The artisan is laying down colour they cannot see, from memory of a finished piece that does not exist yet. The alum is then left to set — accounts give around two days — and the surplus rinsed away, because anything still loose will drift in the bath and stain the ground where no colour belongs.',
      'Then the whole cloth goes into a boiling pot: chavalakodi root, surudu chakka bark and alum, roughly a kilo, three hundred grams and half a kilo of each, and it is worked in it for somewhere between half and three quarters of an hour. The alizarin finds the alum and binds, and only there. The alum-painted areas come up red. The cream ground stays cream. The iron outline is untouched.',
      'Where the alum was laid thicker the red comes deeper. That is how a single bath yields pink through deep maroon in one pass — a decision taken days earlier, by hand, in a liquid nobody in the room could see.',
    ],
    materials: ['Potash alum', 'Chavalakodi root', 'Surudu chakka bark', 'Alizarin'],
    duration: 'About 2 days for the alum to set; 30–45 minutes at the boil',
    note: 'One bath, many reds. Nothing about the finished colour was decided at the pot.',
    coversSteps: [13, 14, 15, 16],
    tone: 'chay',
    layers: MADDER,
  },
  {
    n: 11,
    title: 'Hand painting and layer-by-layer colouring',
    question: 'And the rest of the palette?',
    body: [
      'Yellow is painted. Blue is dipped. Green is neither. The order cannot be changed, and that is why a piece carrying all three takes so much longer than one in red and black.',
      'Yellow goes on with the kalam, boiled from myrobalan flower or pomegranate rind with alum. It arrives a soft mustard-gold and is fixed by a day in open sun. Natural yellow does not go bright and never has — a Kalamkari that glows acid lemon has been helped along by something that did not come out of a pot, and it is the fastest tell on the whole cloth.',
      'Indigo refuses to be painted at all. It is a vat colour and it strikes on contact with air, so areas that must stay clear are covered in wax, the whole cloth is lowered into the vat, and it comes out yellow-green and turns blue in front of you as the air reaches it. Repeat dips give deeper blues. Green exists only where that vat passes over cloth already painted yellow — two operations, days apart, in that order only. Catechu brown is painted, like the yellow, for earth and tree trunks and the ground a figure stands on.',
    ],
    materials: ['Myrobalan flower', 'Pomegranate rind', 'Alum', 'Indigo', 'Wax', 'Catechu bark'],
    note: 'There is no green dye in this palette and there never was. Reverse the order and it does not work.',
    coversSteps: [18, 19, 20, 21],
    tone: 'green',
    layers: COLOURED,
  },
  {
    n: 12,
    title: 'Repeated washing, boiling and sun drying',
    question: 'Why does one saree take a month and a half?',
    body: [
      'Because this stage happens again, and again, and again. Straight out of the madder pot the whole cloth is stained pink, and it goes back to the river to be washed until every particle of dye that did not bind to alum has let go and the cream ground returns. Published accounts give three days of washing at the riverbank for that alone.',
      `A finished piece may pass through as many as ${site.craft.washCycles} full cycles of washing and drying in the sun. Most of them are there to take colour away rather than to add it. Each wash lifts a little more unbound dye; each spell on the ground bleaches the cream a shade cleaner while the bound colours stay exactly where they are.`,
      'The contrast in a good piece — the clarity of the ground against the depth of the reds — is that difference, accumulated twenty times. It is also why visitors are most often surprised here: hours of labour spent removing colour that was never wanted.',
    ],
    duration: `Up to ${site.craft.washCycles} cycles`,
    note: 'The sun removes the colour you do not want and leaves the colour you do. It is the most patient tool in the store, and the monsoon takes it away completely.',
    coversSteps: [17, 22],
    tone: 'sun',
    layers: COLOURED,
  },
  {
    n: 13,
    title: 'Final detailing, corrections and colour fixing',
    question: 'What is left to do once every colour is on?',
    body: [
      'The piece is read the way a stranger will read it, and the places where it does not hold up are found. Twenty washings soften every colour slightly and not always evenly; an outline may have thinned where the cloth was worked hardest, a filled area may have come up lighter than its neighbour, a border repeat may have drifted somewhere in nine yards.',
      'What can be corrected is corrected with the pen — outlines strengthened, hatching added, a detail sharpened. What cannot is left. There is no over-painting in this craft that would not show: every colour here is in the fibre rather than on it, so anything laid on top sits differently and reads as a repair from across a room.',
      'The last colour work is then fixed by the same means as the first — open air and sun — and the wax from the indigo resist is boiled out and washed clear.',
    ],
    note: 'A correction that would show is not made. The small inconsistencies left in a hand-drawn piece are the evidence of the hand, not a fault in it.',
    coversSteps: [],
    tone: 'katha',
    layers: COLOURED,
  },
  {
    n: 14,
    title: 'Final washing, finishing, quality inspection and saree preparation',
    question: 'What leaves the store?',
    body: [
      'A final clean wash with nothing added to it, a last drying, and then pressing and folding. The piece goes out with no starch, no finish and no sizing of any kind — nothing has been added to the cloth since the buffalo milk at the fourth step, which is why what softens over the first year of owning it is the cotton itself and not a coating washing out of it.',
      'Then it is inspected: held to the light, read end to end, checked for the flaws that a month of handling can leave and that no amount of good drawing excuses. A piece that does not pass is not sold as a second — it is kept back.',
      `Between ${site.craft.sareeDaysMin} and ${site.craft.sareeDaysMax} days have passed since the first wash. The monsoon can stop any of it, because every stage ends with the cloth going into the sun, and there is no substitute for that anywhere in the sequence.`,
    ],
    duration: `${site.craft.sareeDaysMin}–${site.craft.sareeDaysMax} days from the first wash`,
    note: 'Nothing has been added to the cloth since step four. What you feel soften over the first year is the cotton.',
    coversSteps: [23],
    tone: 'sun',
    layers: FINISHED,
  },
];

export const TOTAL_MAIN_STAGES = mainStages.length;

/* -------------------------------------------------------------------------- */
/* The check that keeps the two views honest                                  */
/* -------------------------------------------------------------------------- */

/**
 * Fail at module load if the fourteen stages do not account for the
 * twenty-three operations exactly once each.
 *
 * This is the same discipline the seed applies to dye phrases, and for the same
 * reason: the alternative is a page that silently stops showing step 17 because
 * somebody renumbered a phase, on the one page of the site whose entire value
 * is that it is complete. A thrown error at import is loud, immediate and
 * happens in development; a missing step is invisible and ships.
 *
 * Stage 13 legitimately claims no operations — final detailing is work the
 * twenty-three do not enumerate separately — so an empty `coversSteps` is
 * allowed. What is not allowed is a step claimed twice, or not at all.
 */
function assertStagesCoverEveryStep() {
  const claimed = new Map<number, number>();

  for (const stage of mainStages) {
    for (const n of stage.coversSteps) {
      const already = claimed.get(n);
      if (already !== undefined) {
        throw new Error(
          `stages.ts: step ${n} is claimed by both main stage ${already} and main stage ${stage.n}.`,
        );
      }
      claimed.set(n, stage.n);
    }
  }

  const missing = allSteps.map((s) => s.n).filter((n) => !claimed.has(n));
  if (missing.length) {
    throw new Error(
      `stages.ts: the fourteen main stages do not account for step(s) ${missing.join(', ')} ` +
        `of the ${allSteps.length}. Every operation in process.ts must appear in exactly one stage.`,
    );
  }

  const unknown = [...claimed.keys()].filter((n) => !allSteps.some((s) => s.n === n));
  if (unknown.length) {
    throw new Error(
      `stages.ts: step(s) ${unknown.join(', ')} are claimed by a main stage but do not exist in process.ts.`,
    );
  }
}

assertStagesCoverEveryStep();

/** The operations belonging to a stage, resolved out of `process.ts`. */
export function stepsForStage(stage: MainStage) {
  return stage.coversSteps
    .map((n) => allSteps.find((s) => s.n === n))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
}
