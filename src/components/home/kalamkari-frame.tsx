import { cn } from '@/lib/utils';

/**
 * The border a Kalamkari cloth actually carries, drawn around the film.
 *
 * Every finished piece from this workshop is edged: a keyline first, then a
 * running vine, then a rosette dropped into each corner. It is the last thing
 * painted and it is what turns a drawing into a cloth. Putting the same three
 * marks around the film at the top of the site says what the store makes
 * before a single word is read — which is more than the caption it replaces
 * was doing.
 *
 * It is drawn in the order a painter would draw it, and that is the reason the
 * component exists as one piece rather than as four decorated edges:
 *
 *   1. the keyline travels around the perimeter (`frame-draw`),
 *   2. the vine fades in behind it once the line has passed,
 *   3. the four rosettes open, corner by corner (`petal-open`).
 *
 * ---------------------------------------------------------------------------
 * Two things that are load-bearing rather than stylistic
 * ---------------------------------------------------------------------------
 *
 * **`pathLength="100"`.** The keyline is a rounded rectangle whose real
 * perimeter depends on the box it is drawn around, so a fixed `strokeDasharray`
 * would draw a different fraction of the border at every breakpoint.
 * Normalising the path to 100 units makes `strokeDasharray="100"` mean "the
 * whole way round" at any size, and lets one keyframe serve every use.
 *
 * **`vectorEffect="non-scaling-stroke"`.** The SVG is stretched to the film's
 * box by `preserveAspectRatio="none"`, which would otherwise stretch the stroke
 * with it — a hairline on the long edges and a fat line on the short ones. This
 * keeps it one weight the whole way round.
 *
 * The whole thing is `aria-hidden`: it is ornament, and the film beside it
 * already carries the alt text.
 */
export function KalamkariFrame({
  className,
  /** Seconds before the keyline starts. The film settles first. */
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  /* The rosettes follow the line round, a corner at a time. The keyline runs
     1.5s, so the first petal opens as the pen reaches the second corner. */
  const petalDelay = delay + 0.95;

  return (
    <div
      className={cn('pointer-events-none absolute -inset-[7px] -z-10', className)}
      aria-hidden="true"
    >
      <svg
        className="h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
      >
        {/* The running vine, behind the keyline. Dashed rather than drawn:
            a second travelling stroke competing with the first reads as a
            loading bar. */}
        <rect
          x="1.2"
          y="1.2"
          width="97.6"
          height="97.6"
          rx="2"
          stroke="hsl(var(--primary) / 0.28)"
          strokeWidth="3"
          strokeDasharray="1 6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="motion-safe:animate-dye-bloom"
          style={{ animationDelay: `${delay + 0.5}s` }}
        />

        {/* The keyline. */}
        <rect
          x="1.2"
          y="1.2"
          width="97.6"
          height="97.6"
          rx="2"
          stroke="hsl(var(--primary) / 0.75)"
          strokeWidth="1.25"
          pathLength="100"
          strokeDasharray="100"
          vectorEffect="non-scaling-stroke"
          className="motion-safe:animate-frame-draw"
          style={{ animationDelay: `${delay}s` }}
        />
      </svg>

      {/*
        The corner rosettes.

        Positioned with `inset` and their own `translate(-50%, -50%)` would
        collide with `petal-open`, which owns `transform` — the trap documented
        in CLAUDE.md, and the one that put the quick-tour card off the right of
        every phone. So each is a fixed-size box pinned by its own edge offsets
        instead, leaving `transform` entirely to the animation.
      */}
      {[
        { key: 'tl', pos: '-left-[9px] -top-[9px]' },
        { key: 'tr', pos: '-right-[9px] -top-[9px]' },
        { key: 'br', pos: '-bottom-[9px] -right-[9px]' },
        { key: 'bl', pos: '-bottom-[9px] -left-[9px]' },
      ].map((corner, i) => (
        <svg
          key={corner.key}
          viewBox="0 0 24 24"
          className={cn(
            'absolute h-[18px] w-[18px] text-primary motion-safe:animate-petal-open',
            corner.pos,
          )}
          style={{ animationDelay: `${petalDelay + i * 0.11}s` }}
          fill="none"
        >
          {/* Six petals and a seed — the corner mark on this workshop's
              borders. Six rather than the seal's eight: at 18px an eight-petal
              rosette closes up into a dot. */}
          <g fill="currentColor" opacity="0.9">
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <ellipse
                key={deg}
                cx="12"
                cy="7.4"
                rx="1.85"
                ry="4.2"
                transform={`rotate(${deg} 12 12)`}
              />
            ))}
          </g>
          <circle cx="12" cy="12" r="2.1" className="fill-myrobalan-400" />
        </svg>
      ))}
    </div>
  );
}
