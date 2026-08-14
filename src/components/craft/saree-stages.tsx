'use client';

import { NO_LAYERS, type ClothLayers } from '@/content/process';
import { cn } from '@/lib/utils';

/**
 * A Kalamkari saree, built the way it is actually built.
 *
 * Why this is drawn rather than photographed: eight photographs of eight
 * different cloths would show eight different sarees. The claim the section
 * makes is that ONE piece of cloth passes through eight states, and only a
 * layered drawing can show the same lotus first as an outline, then as an
 * invisible alum mark, then as madder red. It also stays sharp at any size,
 * costs no image bytes, and animates between states instead of cutting.
 *
 * Every layer below corresponds to a real stage in the twenty-three steps —
 * including step five, which paints in a liquid you cannot see.
 */

/**
 * The cloth state, and the empty one.
 *
 * Both live in `src/content/process.ts` now — three different lists declare a
 * cloth state and two of them are content files, so the type belongs with the
 * content rather than beside the SVG that draws it.
 *
 * Both stage lists in this file state their layers rather than deriving them
 * from an index. The journey always did, because several of its stages change
 * only one thing. The eight-stage rail was switched to it when those stages
 * were rewritten: index gating only worked while each stage happened to
 * advance the cloth by exactly one layer, and public stage 5 covers the alum
 * *and* the madder bath that follows it. Derived from its index, that stage
 * showed a cloth still painted in an invisible mordant under a heading
 * announcing the red had arrived.
 */
const NONE = NO_LAYERS;
export type { ClothLayers };

/* -------------------------------------------------------------------------- */
/* The eight public stages, for the home page                                 */
/* -------------------------------------------------------------------------- */

export type SareeStage = {
  n: number;
  /** Short label for the numbered rail. */
  short: string;
  title: string;
  /**
   * What the operation is called in the workshop, in Telugu.
   *
   * These are working words rather than translations of the English titles —
   * what somebody in the front room in Srikalahasti would actually say they
   * were doing this morning. `roman` is not decoration either: this site's
   * readers overwhelmingly cannot sound out the script, and an unglossed
   * label is an ornament rather than a piece of information. With the
   * transliteration beside it a reader can carry the word away and say it.
   */
  telugu: { script: string; roman: string };
  /**
   * The materials this stage handles, in the workshop's own words.
   *
   * `telugu` above names the *operation* — what somebody would say they were
   * doing. These name the *things*, and they are a different kind of fact: a
   * reader who learns that the black is `kasim` and the alum is `patika` can
   * follow the rest of this site, because those are the words the product
   * pages, the dye filter and the assistant already use.
   *
   * Two rules, both to keep this honest rather than decorative:
   *
   *   - Every term glosses something the English body of the same stage
   *     already names. Nothing here introduces a material the page has not
   *     mentioned, so each one can be checked against the paragraph beside it.
   *   - The romanisations match the `localName` fields already used in
   *     `src/content/process.ts` (karakkaya, kalam, kasim, patika, chay ver,
   *     neeli). One spelling per material across the whole site.
   */
  terms: { script: string; roman: string; gloss: string }[];
  /** The real step numbers, of twenty-three, that this stage covers. */
  steps: string;
  body: string;
  /**
   * Which layers of the drawing are showing at this stage.
   *
   * Stated per stage rather than derived from the index. It used to be
   * `stage >= 4` and so on inside `SareeCanvas`, which worked only for as long
   * as the eight public stages happened to advance the cloth by exactly one
   * layer each. They no longer do: the public step 5 covers the alum *and* the
   * bath that follows it, so index-gating showed a cloth painted with an
   * invisible mordant under a heading that says the red has arrived.
   */
  layers: ClothLayers;
};

/**
 * The eight-stage public summary of the twenty-three.
 *
 * These are the store's own short version, and the wording is theirs. Each maps
 * onto a real span of the full sequence in `src/content/process.ts` — the
 * `steps` field is not decoration, it is where to go and check.
 *
 * Note that this is a *summary*, not a replacement. The site's central claim is
 * twenty-three operations, stated in `site.craft.steps`, counted from
 * `processPhases` by `totalSteps`, and quoted in the announcement bar, the
 * heritage figures, the assistant's knowledge base and the HowTo structured
 * data. Eight is how you tell somebody at a counter; twenty-three is what is
 * actually done.
 */
export const sareeStages: SareeStage[] = [
  {
    n: 1,
    short: 'Fabric',
    title: 'Fabric preparation',
    telugu: { script: 'ఉతకడం', roman: 'utakadam' },
    terms: [
      { script: 'గడ', roman: 'gada', gloss: 'greige cotton, as it leaves the loom' },
      { script: 'ఎండ', roman: 'enda', gloss: 'the sun the cloth is dried in' },
    ],
    steps: 'Steps 1–3',
    body: 'Cotton arrives stiff with mill starch, sizing oils and whatever else the loom left in it, and in that state it repels dye and drinks ink in equal measure. It is beaten against stone in running water until the water runs clear, then dried on sand in full sun. Until the cloth will drink, nothing that follows will hold.',
    layers: { ...NONE },
  },
  {
    n: 2,
    short: 'Myrobalan',
    title: 'Myrobalan treatment',
    telugu: { script: 'కరక్కాయ ముంచడం', roman: 'karakkaya munchadam' },
    terms: [
      { script: 'కరక్కాయ', roman: 'karakkaya', gloss: 'chebulic myrobalan nut' },
      { script: 'గేదె పాలు', roman: 'gede paalu', gloss: 'buffalo milk' },
    ],
    steps: 'Steps 4–5',
    body: 'The cloth is steeped in a milky bath of ground karakkaya — chebulic myrobalan — and buffalo milk. Two things are happening at once: the tannin soaks into every fibre and waits there for the iron it will later turn black against, and the fat in the milk coats the surface so the pen lays a line instead of a blur. The cream you see behind every painting is that nut. It was never bleached white.',
    layers: { ...NONE, prepared: true },
  },
  {
    n: 3,
    short: 'Drawing',
    title: 'Hand drawing',
    telugu: { script: 'బొమ్మ గీయడం', roman: 'bomma geeyadam' },
    terms: [
      { script: 'కలం', roman: 'kalam', gloss: 'the sharpened bamboo pen' },
      { script: 'బొగ్గు', roman: 'boggu', gloss: 'tamarind-twig charcoal' },
    ],
    steps: 'Steps 6–8',
    body: 'The whole composition goes down freehand in charcoal burnt from tamarind twigs — the border, the register lines, where Rama stands, which way the peacock turns. On a nine-yard saree that is several days of decisions with nothing undoable in any of them. There is no stencil, no transfer, no projection and no block at any point.',
    layers: { ...NONE, prepared: true, drawn: true },
  },
  {
    n: 4,
    short: 'Outline',
    title: 'Black outlining',
    telugu: { script: 'నలుపు గీత', roman: 'nalupu geeta' },
    terms: [
      { script: 'కసిం', roman: 'kasim', gloss: 'fermented iron liquor — the black' },
      { script: 'బెల్లం', roman: 'bellam', gloss: 'jaggery, what the iron ferments in' },
    ],
    steps: 'Steps 9–12',
    body: 'The kalam — bamboo, sharpened, with a ball of wool bound above the tip — is charged with kasim, a liquor of rusted iron and jaggery left to ferment about three weeks. It goes on pale brown and darkens in front of you, because the iron is meeting the tannin already sitting in the cloth. The colour forms in the fibre rather than on it, which is why the outline is still there after fifty years.',
    layers: { ...NONE, prepared: true, drawn: true, blackened: true },
  },
  {
    n: 5,
    short: 'Red',
    title: 'Red dyeing',
    telugu: { script: 'ఎరుపు రంగు', roman: 'erupu rangu' },
    terms: [
      { script: 'పటిక', roman: 'patika', gloss: 'alum — the invisible mordant' },
      { script: 'చాయ వేరు', roman: 'chay ver', gloss: 'madder / chay root' },
    ],
    steps: 'Steps 13–17',
    body: 'Every area that will end up red is first painted with a clear solution of alum, which reads as a faint damp shadow and nothing more — days of work laid down invisibly. The cloth is then rinsed and boiled in a pot of madder root, and the colour binds only where the alum went. Where the alum was thicker the red comes deeper, which is how one bath yields pink through maroon in a single pass.',
    layers: { ...NONE, prepared: true, drawn: true, blackened: true, alum: true, madder: true },
  },
  {
    n: 6,
    short: 'Colour',
    title: 'Colouring and detailing',
    telugu: { script: 'రంగు వేయడం', roman: 'rangu veyadam' },
    terms: [
      { script: 'నీలి', roman: 'neeli', gloss: 'indigo — dipped, never painted' },
      { script: 'మైనం', roman: 'mainam', gloss: 'wax, to resist the vat' },
      { script: 'దానిమ్మ తొక్క', roman: 'danimma tokka', gloss: 'pomegranate rind' },
    ],
    steps: 'Steps 18–21',
    body: 'Yellow is drawn straight on with the pen from myrobalan flower and pomegranate rind. Indigo refuses to be painted at all: areas that must stay clear are waxed, the whole cloth is lowered into the vat, and it comes out yellow-green and turns blue as the air reaches it. Green is neither: it is always one colour arriving on top of another, and this workshop keeps four ways of reaching it — which is four greens, not one.',
    layers: {
      ...NONE,
      prepared: true,
      drawn: true,
      blackened: true,
      alum: true,
      madder: true,
      indigo: true,
    },
  },
  {
    n: 7,
    short: 'Washing',
    title: 'Repeated washing and sun drying',
    telugu: { script: 'ఎండబెట్టడం', roman: 'endabettadam' },
    terms: [
      { script: 'నీళ్ళు', roman: 'neellu', gloss: 'water — twenty washings of it' },
      { script: 'ఎండ', roman: 'enda', gloss: 'the sun that lifts the ground' },
    ],
    steps: 'Step 22',
    body: 'A finished piece may go through twenty full cycles of washing and drying in the sun, and most of them are there to take colour away rather than to add it. Each wash lifts a little more unbound dye and each spell on the ground bleaches the cream a shade cleaner while the bound colours stay exactly where they are. The contrast in a good piece is that difference, repeated twenty times.',
    layers: {
      ...NONE,
      prepared: true,
      drawn: true,
      blackened: true,
      alum: true,
      madder: true,
      indigo: true,
    },
  },
  {
    n: 8,
    short: 'Finishing',
    title: 'Final finishing',
    telugu: { script: 'చివరి మెరుగు', roman: 'chivari merugu' },
    terms: [
      { script: 'ఇస్త్రీ', roman: 'istri', gloss: 'the press' },
      { script: 'మడత', roman: 'madata', gloss: 'the fold it leaves in' },
    ],
    steps: 'Step 23',
    body: 'A last clean wash with nothing added, a final drying, then pressing, folding, and a piece-by-piece inspection before it is put out for sale. It leaves with no starch, no finish and no sizing — nothing has been added to the cloth since the buffalo milk at step four. Between fifteen and forty-five days have passed, and a wet week can stop any of it.',
    layers: {
      prepared: true,
      drawn: true,
      blackened: true,
      alum: true,
      madder: true,
      indigo: true,
      finished: true,
    },
  },
];

export const STAGE_COUNT = sareeStages.length;

/* -------------------------------------------------------------------------- */
/* Motifs                                                                     */
/* -------------------------------------------------------------------------- */

/** A lotus rosette — the commonest jaal unit in this workshop's repertoire. */
function LotusMotif({ id }: { id: string }) {
  return (
    <symbol id={id} viewBox="-30 -30 60 60">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <path
          key={angle}
          className="ink"
          d="M0 0 C -7 -10, -7 -20, 0 -26 C 7 -20, 7 -10, 0 0 Z"
          transform={`rotate(${angle})`}
        />
      ))}
      <circle className="ink" cx="0" cy="0" r="6" />
      <circle className="ink" cx="0" cy="0" r="2.4" />
    </symbol>
  );
}

/** The vine that runs the length of every border. */
function VineMotif({ id }: { id: string }) {
  return (
    <symbol id={id} viewBox="0 0 60 26">
      <path className="ink" d="M0 13 C 10 1, 20 25, 30 13 C 40 1, 50 25, 60 13" />
      <path className="ink" d="M15 8 C 12 3, 18 2, 19 7" />
      <path className="ink" d="M45 18 C 42 23, 48 24, 49 19" />
      <circle className="ink" cx="30" cy="13" r="2.6" />
    </symbol>
  );
}

/* -------------------------------------------------------------------------- */
/* The cloth                                                                  */
/* -------------------------------------------------------------------------- */

const W = 460;
const H = 600;

/** Positions of the body jaal, laid out on a staggered grid like real work. */
const JAAL = Array.from({ length: 5 }, (_, row) =>
  Array.from({ length: 3 }, (_, col) => ({
    x: 92 + col * 96 + (row % 2 ? 48 : 0),
    y: 148 + row * 62,
    key: `${row}-${col}`,
  })),
)
  .flat()
  .filter((p) => p.x < W - 70);

export function SareeCanvas({
  stage,
  layers,
  label,
  className,
}: {
  /** Zero-indexed stage, 0 through STAGE_COUNT − 1. Ignored when `layers` is given. */
  stage: number;
  /**
   * Explicit layer control, for callers walking the cloth at a different
   * resolution than the eight-stage rail — see `journeyStages`.
   */
  layers?: ClothLayers;
  /** Overrides the generated accessible name. */
  label?: string;
  className?: string;
}) {
  // Each layer is gated on the stage it belongs to. Written out rather than
  // computed so the mapping from stage to visible layer stays readable.
  const prepared = layers ? layers.prepared : stage >= 1;
  const drawn = layers ? layers.drawn : stage >= 2;
  const blackened = layers ? layers.blackened : stage >= 3;
  const alum = layers ? layers.alum : stage >= 4;
  const madder = layers ? layers.madder : stage >= 5;
  const indigo = layers ? layers.indigo : stage >= 6;
  const finished = layers ? layers.finished : stage >= 7;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn('h-full w-full', className)}
      role="img"
      aria-label={label ?? `Stage ${stage + 1} of ${STAGE_COUNT}: ${sareeStages[stage]?.title}`}
      style={
        {
          '--ink-opacity': drawn ? 1 : 0,
          '--draw': drawn ? 0 : 1,
        } as React.CSSProperties
      }
    >
      <defs>
        <LotusMotif id="stage-lotus" />
        <VineMotif id="stage-vine" />

        {/*
          Handloom weave, as a tiled pattern rather than an SVG filter.

          This started as feTurbulence and had to be replaced: an SVG filter
          re-rasterises the whole filtered region on every repaint, and this
          region is the entire cloth, on a page that also runs a WebGL canvas.
          It stalled the renderer outright. Two crossed hairlines on a 4px
          repeat read identically at this scale and cost nothing — the browser
          rasterises the tile once and blits it.
        */}
        <pattern id="stage-weave" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="transparent" />
          <path d="M0 0.5 H4 M0.5 0 V4" stroke="#000000" strokeOpacity="0.05" strokeWidth="1" />
        </pattern>

        {/*
          Dye creeping along the thread. A small blur rather than a
          displacement map — feDisplacementMap needs a turbulence input, which
          is the expensive thing we just removed. A soft edge sells "liquid in
          fibre" nearly as well and stays on the fast path.
        */}
        <filter id="stage-bleed" x="-4%" y="-4%" width="108%" height="108%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>

        <linearGradient id="stage-sun" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.34" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#2A1C0C" stopOpacity="0.13" />
        </linearGradient>
      </defs>

      <style>{`
        .stage-cloth * { transition: opacity 900ms cubic-bezier(0.22,1,0.36,1), fill 1100ms cubic-bezier(0.22,1,0.36,1); }
        .ink {
          fill: none;
          stroke: currentColor;
          stroke-width: 1.6;
          stroke-linecap: round;
          stroke-linejoin: round;
          vector-effect: non-scaling-stroke;
        }
        .drawable {
          stroke-dasharray: 1;
          stroke-dashoffset: var(--draw, 1);
          transition: stroke-dashoffset 1600ms cubic-bezier(0.32,0.72,0.28,1), stroke 900ms ease;
        }
        @media (prefers-reduced-motion: reduce) {
          .stage-cloth *, .drawable { transition-duration: 1ms !important; }
        }
      `}</style>

      <g className="stage-cloth">
        {/* ---- Ground: loom white, then myrobalan cream ------------------- */}
        <rect x="0" y="0" width={W} height={H} fill={prepared ? '#F0E3C6' : '#FBFAF5'} />

        {/* ---- Dyed fields. Painted under the ink, as they are on cloth. --- */}
        <g filter="url(#stage-bleed)">
          {/* Madder ground behind the borders and the pallu band. */}
          <g opacity={madder ? 1 : 0} fill="#9A3627">
            <rect x="0" y="0" width={W} height="46" />
            <rect x="0" y={H - 150} width={W} height="150" />
            <rect x="0" y="46" width="30" height={H - 196} />
            <rect x={W - 30} y="46" width="30" height={H - 196} />
          </g>

          {/* Madder in the petals of every jaal lotus. */}
          <g opacity={madder ? 0.92 : 0} fill="#B4543F">
            {JAAL.map((p) => (
              <circle key={p.key} cx={p.x} cy={p.y} r="22" />
            ))}
          </g>

          {/* Indigo: the body field between the borders. */}
          <rect
            x="30"
            y="46"
            width={W - 60}
            height={H - 196}
            fill="#2C4268"
            opacity={indigo ? 0.82 : 0}
          />

          {/* Myrobalan gold in the pallu's tree. */}
          <g opacity={indigo ? 0.85 : 0} fill="#D4A337">
            <path d={`M${W / 2 - 96} ${H - 34} Q ${W / 2} ${H - 128} ${W / 2 + 96} ${H - 34} Z`} />
          </g>
        </g>

        {/* ---- Alum: the invisible step, shown as the artist sees it ------- */}
        <g opacity={alum && !madder ? 1 : 0} fill="#8E9BAA" fillOpacity="0.2">
          <rect x="0" y="0" width={W} height="46" />
          <rect x="0" y={H - 150} width={W} height="150" />
          <rect x="0" y="46" width="30" height={H - 196} />
          <rect x={W - 30} y="46" width="30" height={H - 196} />
          {JAAL.map((p) => (
            <circle key={p.key} cx={p.x} cy={p.y} r="22" />
          ))}
        </g>

        {/* ---- Ink. Pale on first draw; iron-black once kasim is applied. -- */}
        <g
          color={blackened ? '#1C1A18' : '#8C7F6C'}
          opacity="var(--ink-opacity)"
          style={{ transition: 'opacity 700ms ease, color 900ms ease' }}
        >
          {/* Border frames */}
          <g className="ink drawable" strokeWidth={blackened ? 2 : 1.2}>
            <path pathLength="1" d={`M0 46 H ${W}`} />
            <path pathLength="1" d={`M0 ${H - 150} H ${W}`} />
            <path pathLength="1" d={`M30 46 V ${H - 150}`} />
            <path pathLength="1" d={`M${W - 30} 46 V ${H - 150}`} />
          </g>

          {/* Temple (kumbha) teeth along the inner edge of the top border */}
          <g className="ink drawable">
            {Array.from({ length: 18 }, (_, i) => (
              <path key={i} pathLength="1" d={`M${i * 26} 46 l 13 -15 l 13 15`} />
            ))}
          </g>

          {/* Vine, running both borders */}
          <g opacity={drawn ? 1 : 0}>
            {Array.from({ length: 8 }, (_, i) => (
              <use key={`t${i}`} href="#stage-vine" x={i * 58} y="10" width="58" height="26" />
            ))}
          </g>

          {/* Body jaal */}
          <g opacity={drawn ? 1 : 0}>
            {JAAL.map((p) => (
              <use
                key={p.key}
                href="#stage-lotus"
                x={p.x - 26}
                y={p.y - 26}
                width="52"
                height="52"
              />
            ))}
          </g>

          {/* Pallu: a tree of life with two birds — the narrative end */}
          <g className="ink drawable">
            <path pathLength="1" d={`M${W / 2} ${H - 20} V ${H - 96}`} />
            <path pathLength="1" d={`M${W / 2} ${H - 82} C ${W / 2 - 42} ${H - 92}, ${W / 2 - 58} ${H - 60}, ${W / 2 - 78} ${H - 36}`} />
            <path pathLength="1" d={`M${W / 2} ${H - 88} C ${W / 2 + 42} ${H - 98}, ${W / 2 + 58} ${H - 62}, ${W / 2 + 78} ${H - 38}`} />
            <path pathLength="1" d={`M${W / 2} ${H - 104} C ${W / 2 - 26} ${H - 124}, ${W / 2 - 20} ${H - 134}, ${W / 2} ${H - 138}`} />
            <path pathLength="1" d={`M${W / 2} ${H - 104} C ${W / 2 + 26} ${H - 124}, ${W / 2 + 20} ${H - 134}, ${W / 2} ${H - 138}`} />
            {/* Birds */}
            <path pathLength="1" d={`M${W / 2 - 92} ${H - 112} q 10 -12 22 -2 q -4 12 -14 12 z`} />
            <path pathLength="1" d={`M${W / 2 + 92} ${H - 118} q -10 -12 -22 -2 q 4 12 14 12 z`} />
          </g>

          {/* Leaves along the tree, filled once the black goes on */}
          <g opacity={blackened ? 1 : 0} fill="currentColor">
            {[-78, -52, -26, 26, 52, 78].map((dx) => (
              <ellipse
                key={dx}
                cx={W / 2 + dx}
                cy={H - 62 - Math.abs(dx) * 0.32}
                rx="7"
                ry="3.6"
                transform={`rotate(${dx > 0 ? -28 : 28} ${W / 2 + dx} ${H - 62 - Math.abs(dx) * 0.32})`}
              />
            ))}
          </g>
        </g>

        {/* Weave, over the dye rather than under it — on real cloth the thread
            crossings take up more colour, so the grid reads strongest where
            the dye is deepest. */}
        <rect x="0" y="0" width={W} height={H} fill="url(#stage-weave)" pointerEvents="none" />

        {/* ---- Sun and river: the finished cloth reads softer, not brighter.
             Plain alpha rather than a blend mode — `mix-blend-mode` promotes
             the element to its own compositing layer, and this rect covers the
             whole cloth on a page that already has a WebGL canvas. */}
        <rect
          x="0"
          y="0"
          width={W}
          height={H}
          fill="url(#stage-sun)"
          opacity={finished ? 0.9 : 0.3}
        />
        <rect x="0" y="0" width={W} height={H} fill="#F4EDE0" opacity={finished ? 0.09 : 0} />
      </g>
    </svg>
  );
}
