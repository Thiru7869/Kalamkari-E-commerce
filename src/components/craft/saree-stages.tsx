'use client';

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

export type SareeStage = {
  n: number;
  /** Short label for the numbered rail. */
  short: string;
  title: string;
  /** The real step numbers, of twenty-three, that this stage covers. */
  steps: string;
  body: string;
};

export const sareeStages: SareeStage[] = [
  {
    n: 1,
    short: 'Cloth',
    title: 'Loom-white cotton, and nothing else',
    steps: 'Steps 1–3',
    body: 'A length of handloom cotton arrives stiff with starch and mill dressing. It is beaten on stone at the river and washed until it holds water instead of repelling it. Until it will drink, no dye will stay.',
  },
  {
    n: 2,
    short: 'Myrobalan',
    title: 'Myrobalan and buffalo milk',
    steps: 'Steps 4–5',
    body: 'The cloth is steeped in ground karakkaya — chebulic myrobalan — and buffalo milk. The tannin will later turn black wherever iron touches it; the milk fat stops the pen from bleeding. This is why the ground is cream, never white.',
  },
  {
    n: 3,
    short: 'The kalam',
    title: 'Every line drawn freehand',
    steps: 'Steps 6–9',
    body: 'A sharpened bamboo stick wrapped in wool holds the liquor like a reservoir; squeezing the wool feeds the nib. The whole composition is drawn once, without tracing, without a block, and without a second chance.',
  },
  {
    n: 4,
    short: 'Kasim black',
    title: 'Rusted iron, jaggery, twenty-one days',
    steps: 'Steps 10–12',
    body: 'Scrap iron and jaggery ferment in a sealed earthen pot for three weeks. Drawn onto myrobalan-treated cloth the liquor is pale brown — it turns black on the cloth, not in the pot. Not a true black: a warm blue-grey.',
  },
  {
    n: 5,
    short: 'Alum',
    title: 'Painting in a colour you cannot see',
    steps: 'Steps 13–15',
    body: 'Every area that will become red is painted with a clear solution of alum, tinted faintly so the artist can track their own hand. Nothing looks like it has happened. Days of work go down invisibly.',
  },
  {
    n: 6,
    short: 'Madder',
    title: 'The bath where the red arrives',
    steps: 'Steps 16–18',
    body: 'The whole cloth boils in madder root. Colour binds only where the alum went and washes out everywhere else. Pink through deep maroon was decided days earlier, by hand, in a liquid nobody could see.',
  },
  {
    n: 7,
    short: 'Indigo & gold',
    title: 'The one colour that is dipped',
    steps: 'Steps 19–21',
    body: 'Indigo will not paint — it is a vat colour, and it strikes on contact with air. Areas that must stay pale are waxed, the cloth is dipped, and it comes out green before turning blue in front of you. Myrobalan over alum gives the yellows.',
  },
  {
    n: 8,
    short: 'Sun',
    title: 'Twenty washings, and the river',
    steps: 'Steps 22–23',
    body: 'Up to twenty cycles of washing and drying in the sun — most of them to take colour away, not add it. What survives is what was bound. The cloth softens, the whites clear, and the piece is finished.',
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
  className,
}: {
  /** Zero-indexed stage, 0 through STAGE_COUNT − 1. */
  stage: number;
  className?: string;
}) {
  // Each layer is gated on the stage it belongs to. Written out rather than
  // computed so the mapping from stage to visible layer stays readable.
  const prepared = stage >= 1;
  const drawn = stage >= 2;
  const blackened = stage >= 3;
  const alum = stage >= 4;
  const madder = stage >= 5;
  const indigo = stage >= 6;
  const finished = stage >= 7;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn('h-full w-full', className)}
      role="img"
      aria-label={`Stage ${stage + 1} of ${STAGE_COUNT}: ${sareeStages[stage]?.title}`}
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
