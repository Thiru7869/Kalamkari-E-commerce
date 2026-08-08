'use client';

import { cn } from '@/lib/utils';

/**
 * Ganesha, drawn the way the workshop draws — outline first, colour later.
 *
 * Every Kalamkari begins with a figure set out in line and finished weeks
 * afterwards in dye, so the loading sequence is that same order: the kalam
 * lays down the drawing on a bare cream ground, and the pots arrive behind it
 * one at a time. Ganesha because he is drawn first on almost everything that
 * leaves this store — the figure a Srikalahasti artist begins a new cloth with.
 *
 * Deliberately line art rather than a rendering. It is the same visual language
 * as the saree canvas on the home page: flat fields under a drawn outline, no
 * gradients, no shading, motifs built from arcs and petals.
 *
 * The whole thing is one inline SVG — no image request, no layout shift, sharp
 * at any size, and it can be animated by stroke rather than by opacity, which
 * is what makes it read as *drawing* rather than as fading in.
 */

export type GaneshaPhase = {
  /** 0 → nothing drawn. 1 → every stroke complete. */
  draw: number;
  /** 0 → bare cloth. 1 → every pot has arrived. */
  colour: number;
};

/** Which colour field is in by a given point in the sequence. */
function at(colour: number, threshold: number) {
  return colour >= threshold ? 1 : 0;
}

export function GaneshaMark({
  draw,
  colour,
  className,
}: GaneshaPhase & { className?: string }) {
  // Strokes are revealed in three groups so the drawing builds in the order a
  // hand would: the niche and the body, then the head, then the ornament.
  const g1 = Math.min(1, draw / 0.42);
  const g2 = Math.min(1, Math.max(0, (draw - 0.3) / 0.42));
  const g3 = Math.min(1, Math.max(0, (draw - 0.62) / 0.38));

  return (
    <svg
      viewBox="0 0 200 250"
      className={cn('h-full w-full', className)}
      role="img"
      aria-label="A Kalamkari drawing of Ganesha, being drawn"
    >
      <defs>
        {/* The same 4px weave used on the saree canvas, so the loading frame
            and the cloth on the home page read as the same material. */}
        <pattern id="gm-weave" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="transparent" />
          <path d="M0 0.5 H4 M0.5 0 V4" stroke="#000" strokeOpacity="0.045" strokeWidth="1" />
        </pattern>

        {/* Dye creeping along the thread, as on the cloth. */}
        <filter id="gm-bleed" x="-6%" y="-6%" width="112%" height="112%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>

      <style>{`
        .gm-ink {
          fill: none;
          stroke: #22201D;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          vector-effect: non-scaling-stroke;
        }
        .gm-fill { transition: opacity 900ms cubic-bezier(0.22,1,0.36,1); }
        @media (prefers-reduced-motion: reduce) {
          .gm-fill { transition: none; }
        }
      `}</style>

      {/* ---- The ground: myrobalan cream, always present -------------------- */}
      <rect x="0" y="0" width="200" height="250" fill="#F4EDE0" />

      {/* ---- Dye fields, arriving in the order the craft reaches them ------- */}
      <g filter="url(#gm-bleed)">
        {/* Madder: the garment and the niche band */}
        <g className="gm-fill" opacity={at(colour, 0.18)} fill="#8E2F22">
          <path d="M64 168 Q100 158 136 168 L142 214 Q100 224 58 214 Z" />
          <path d="M100 26 Q152 26 158 78 L152 78 Q146 34 100 34 Q54 34 48 78 L42 78 Q48 26 100 26 Z" />
        </g>

        {/* Myrobalan gold: crown, tusks, ornament */}
        <g className="gm-fill" opacity={at(colour, 0.42)} fill="#D4A337">
          <path d="M100 44 L112 66 L88 66 Z" />
          <ellipse cx="100" cy="40" rx="6" ry="6" />
          <path d="M74 150 Q100 144 126 150 L126 158 Q100 152 74 158 Z" />
        </g>

        {/* Indigo: the ears, dipped last as indigo always is */}
        <g className="gm-fill" opacity={at(colour, 0.66)} fill="#2C4268" fillOpacity="0.82">
          <path d="M62 84 Q34 78 32 106 Q30 134 60 132 Z" />
          <path d="M138 84 Q166 78 168 106 Q170 134 140 132 Z" />
        </g>

        {/* Katha brown: the lotus seat */}
        <g className="gm-fill" opacity={at(colour, 0.86)} fill="#8C603F" fillOpacity="0.85">
          <path d="M46 216 Q100 206 154 216 Q154 232 100 234 Q46 232 46 216 Z" />
        </g>
      </g>

      {/* ---- The drawing, in three groups ---------------------------------- */}

      {/* 1 — the temple niche and the seat */}
      <g
        className="gm-ink"
        style={{ strokeDasharray: 1, strokeDashoffset: 1 - g1, transition: 'stroke-dashoffset 120ms linear' }}
      >
        <path pathLength="1" d="M100 24 Q154 24 160 80 L160 96" />
        <path pathLength="1" d="M100 24 Q46 24 40 80 L40 96" />
        <path pathLength="1" d="M46 216 Q100 206 154 216 Q154 232 100 234 Q46 232 46 216 Z" />
        {/* Lotus petals on the seat */}
        <path pathLength="1" d="M62 218 Q70 208 78 218" />
        <path pathLength="1" d="M84 216 Q92 205 100 216" />
        <path pathLength="1" d="M106 216 Q114 205 122 216" />
        <path pathLength="1" d="M128 218 Q136 208 144 218" />
        {/* Body */}
        <path pathLength="1" d="M64 168 Q100 158 136 168 L142 214" />
        <path pathLength="1" d="M64 168 L58 214" />
      </g>

      {/* 2 — the head, the trunk, the ears */}
      <g
        className="gm-ink"
        style={{ strokeDasharray: 1, strokeDashoffset: 1 - g2, transition: 'stroke-dashoffset 120ms linear' }}
      >
        {/* Skull */}
        <path pathLength="1" d="M68 104 Q68 60 100 60 Q132 60 132 104 Q132 126 122 138" />
        {/* Ears */}
        <path pathLength="1" d="M68 84 Q34 78 32 106 Q30 134 62 132" />
        <path pathLength="1" d="M132 84 Q166 78 168 106 Q170 134 138 132" />
        {/* Trunk — the single longest stroke, and the one that reads as a hand */}
        <path
          pathLength="1"
          d="M104 118 Q108 140 98 152 Q86 164 76 156 Q68 150 74 142"
        />
        {/* Tusks */}
        <path pathLength="1" d="M88 128 Q82 138 84 146" />
        <path pathLength="1" d="M120 128 Q126 136 124 144" />
        {/* Eyes */}
        <path pathLength="1" d="M84 102 Q90 96 96 102" />
        <path pathLength="1" d="M112 102 Q118 96 124 102" />
        {/* Arms folded over the body */}
        <path pathLength="1" d="M74 154 Q64 166 66 178" />
        <path pathLength="1" d="M126 154 Q136 166 134 178" />
      </g>

      {/* 3 — crown, ornament, the last marks */}
      <g
        className="gm-ink"
        style={{ strokeDasharray: 1, strokeDashoffset: 1 - g3, transition: 'stroke-dashoffset 120ms linear' }}
      >
        <path pathLength="1" d="M100 44 L112 66 L88 66 Z" />
        <circle pathLength="1" cx="100" cy="40" r="6" />
        <path pathLength="1" d="M100 78 L100 92" />
        {/* Necklace */}
        <path pathLength="1" d="M74 150 Q100 144 126 150" />
        <path pathLength="1" d="M74 158 Q100 152 126 158" />
        {/* The niche's inner rule */}
        <path pathLength="1" d="M100 32 Q146 32 151 80" />
        <path pathLength="1" d="M100 32 Q54 32 49 80" />
      </g>

      {/* Weave over everything, as on real cloth. */}
      <rect x="0" y="0" width="200" height="250" fill="url(#gm-weave)" pointerEvents="none" />
    </svg>
  );
}
