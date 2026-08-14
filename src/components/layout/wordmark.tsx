import { cn } from '@/lib/utils';
import { site } from '@/content/site';

/**
 * The wordmark: a nib, and the name set as a nameplate.
 *
 * ---------------------------------------------------------------------------
 * What this replaced, and why
 * ---------------------------------------------------------------------------
 *
 * The previous version was a filled green roundel holding an eight-petal
 * rosette, beside the name set in Kalam — a handwriting face — opened by a
 * drawn spiral flourish and closed by a leaf. It was faithful to the visiting
 * card and it was too much: four ornaments (roundel, rosette, flourish, leaf)
 * competing inside a 200px header block, and a script face doing the one job a
 * script face is worst at, which is being legible at 15px on a phone.
 *
 * The replacement keeps the two things that were actually carrying the brand
 * and drops everything else:
 *
 *   - **The circle**, because the store's own seal is round. It is now a
 *     hairline ring rather than a filled disc, so it reads as a stamp
 *     impression rather than as a badge.
 *   - **The pen**, because the business is named after it. A single nib
 *     silhouette with its vent hole, filled, centred in the ring.
 *
 * Everything is `currentColor`. That is the whole light/dark story for the
 * mark: it inherits the colour of the text beside it, so it is ink on cream in
 * one theme and cotton on indigo in the other, and it cannot fall out of
 * contrast with its surroundings because it *is* its surroundings' colour.
 * There is no fill that has to be re-picked per theme, and no green that has to
 * clear two different grounds.
 *
 * ---------------------------------------------------------------------------
 * The type
 * ---------------------------------------------------------------------------
 *
 * Fraunces, not a script. Fraunces is an old-style with genuine nib modulation
 * — thin-to-thick where a pen would put it — which is "hand-drawn" in the only
 * way that survives being set at 15px and printed on an invoice. Kalam has been
 * removed from the site entirely, which also takes a whole font request off
 * every page load.
 *
 * The full name is set as a *nameplate*: the given name on one line, a hairline
 * rule, then "Fine Kalamkari Arts" in tracked capitals. That is the exact name
 * from the visiting card, arranged the way a plate on a door is arranged, and
 * it solves the problem the script version had at large sizes — six words of
 * handwriting across a hero is a signature, and a signature is not a heading.
 *
 * ---------------------------------------------------------------------------
 * The sizing rule this file exists under, because breaking it cost a real bug
 * ---------------------------------------------------------------------------
 *
 * The second line is small but tracked, and tracking is applied per character:
 * at 9px and 0.2em it once measured **222px**, which fixed this block at 256px
 * and pushed the header's search and cart buttons 103px off the right edge of
 * every phone. Three things keep it from returning, and all three are still
 * here:
 *
 *   - The tracking comes down below `sm` (0.2em → 0.08em).
 *   - The town drops below `sm`, and again in the `lg`–`xl` band where the nav
 *     takes 500px of the row.
 *   - **Nothing in this block carries `whitespace-nowrap` below `md`.** That is
 *     what caps its min-content at one word rather than one line.
 */

/**
 * The mark: a kalam nib, centred in the impression of a seal.
 *
 * Two paths and no fills other than `currentColor`. At 20px in a mobile header
 * the ring reads as a dot of structure around a dark shape; at 96px the vent
 * hole and the taper of the nib are both legible. Nothing here is sized in
 * pixels, so it is the same drawing at both.
 */
export function KalamMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('shrink-0', className)}
      aria-hidden="true"
      role="presentation"
      fill="none"
    >
      {/* The seal, as an impression. Held well under the nib's weight so the
          mark reads as a pen with a ring around it rather than as a target. */}
      <circle
        cx="12"
        cy="12"
        r="10.6"
        stroke="currentColor"
        strokeWidth="0.9"
        opacity="0.34"
      />

      {/*
        The nib, drawn as one path with the vent hole as a second subpath and
        `evenodd` punching it out.

        A hole rather than a second circle in the background colour: the mark
        sits on cream, on indigo, on a photograph in the footer and inside a
        button, and a "background-coloured" dot is wrong on three of those.
        Punching the hole means whatever is behind actually shows through.
      */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M12 4.4c2.05 3.6 3.1 6.3 3.1 8.35 0 2.75-1.2 4.95-3.1 7.25-1.9-2.3-3.1-4.5-3.1-7.25 0-2.05 1.05-4.75 3.1-8.35Zm0 6.15a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Z"
      />

      {/* The slit, which is what makes a nib a nib. One hairline, stopping
          short of the vent so the two never merge into a blot at small sizes. */}
      <path
        d="M12 15.1v3.1"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

/**
 * The company name, in full, as a nameplate.
 *
 * Used large in the doorway and in the footer. The two lines together are the
 * exact registered name — "Sri Vijaya Lakshmi" and "Fine Kalamkari Arts" — and
 * a screen reader reads them as one string, which is why the rule between them
 * is a `<span>` and not an `<hr>`.
 *
 * `as` exists because this is a heading in neither place it is used: the
 * doorway's `h1` is the site's claim and the footer's name is a `<p>`. A page
 * with two `h1`s is a worse bug than a name in a neutral element.
 */
export function BrandName({
  className,
  rule = true,
  align = 'center',
  as: Tag = 'span',
  style,
}: {
  className?: string;
  /** The hairline between the two lines. Dropped where vertical room is tight. */
  rule?: boolean;
  /**
   * Which edge the plate hangs from.
   *
   * A prop rather than a Tailwind class on the caller, because the rule has to
   * follow: `text-center` alone would leave a centred hairline under a
   * left-aligned name, which reads as a mistake rather than as a decision.
   */
  align?: 'center' | 'left';
  as?: 'span' | 'h1' | 'h2' | 'p' | 'div';
  /** Callers stagger this into an entrance; never used for layout. */
  style?: React.CSSProperties;
}) {
  const centred = align === 'center';

  return (
    <Tag
      style={style}
      className={cn(
        'inline-block leading-none',
        centred ? 'text-center' : 'text-left',
        className,
      )}
    >
      {/*
        The given name. `1em` is the caller's size, so a single `text-*` class
        on the parent scales the whole plate — the second line and the rule are
        both expressed as fractions of it, which is what keeps the proportions
        identical at 16px in a footer and 40px in a hero.
      */}
      <span className="block font-display font-semibold leading-[1.1] tracking-[-0.015em]">
        {site.shortName}
      </span>

      {rule && (
        <span
          aria-hidden="true"
          /* Centred by auto margins, never by a transform — `transform` on this
             element belongs to whatever entrance the caller applies. */
          className={cn(
            'my-[0.34em] block h-px bg-current opacity-30',
            centred ? 'mx-auto w-[62%]' : 'w-[46%]',
          )}
        />
      )}

      <span
        className={cn(
          'block font-inscription font-semibold uppercase leading-[1.3]',
          // Two thirds the size of the name above, tracked out. Both values are
          // in `em` so they follow the caller's size.
          'text-[0.36em] tracking-[0.24em]',
          !rule && 'mt-[0.5em]',
        )}
      >
        Fine Kalamkari Arts
      </span>
    </Tag>
  );
}

/**
 * The header lockup: the mark, then the name, on one row.
 *
 * Deliberately not `BrandName`. The nameplate is a centred, stacked, ruled
 * composition and the header needs a left-aligned horizontal one — forcing one
 * component to do both would mean a `variant` prop that changes every rule in
 * it, which is two components wearing one name.
 */
export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5 sm:gap-3">
      <KalamMark className="h-[1.5rem] w-[1.5rem] text-foreground sm:h-7 sm:w-7 md:h-[1.875rem] md:w-[1.875rem]" />

      <span className="flex min-w-0 flex-col leading-none">
        {/*
          Fluid between a 320px phone and a 420px one, then fixed. No
          `truncate`: on the narrowest screens the name would rather take a
          second line — the header has the height for it — than resolve to
          "Sri Vijaya L…", which is a worse thing to do to a shop's name than
          setting it slightly smaller. Wrapping is also what caps the block's
          min-content at its longest word.
        */}
        <span className="font-display text-[clamp(0.9375rem,2.6vw+0.42rem,1.125rem)] font-semibold leading-[1.12] tracking-[-0.015em] md:whitespace-nowrap md:text-[1.25rem]">
          {site.shortName}
        </span>

        {!compact && (
          /*
            Tracking is the dial, at three settings, each one measured:
            0.08em below `sm` (the block has ~100px), 0.2em from `sm` (~356px),
            and 0.14em through `lg` and `xl`, where the nav has taken 500px of
            the row and the block is down to ~133px against a 138px line.
          */
          <span className="font-inscription mt-[0.3em] block text-[0.5rem] font-semibold uppercase leading-[1.35] tracking-[0.08em] text-muted-foreground sm:text-[0.5625rem] sm:tracking-[0.2em] md:text-[0.625rem] lg:tracking-[0.14em] 2xl:tracking-[0.2em]">
            Fine Kalamkari Arts
            {/*
              On, off, on again — and each switch is a measurement. The town
              costs about 108px on this line. It fits from `sm`, stops fitting
              at `lg` where the nav arrives, and fits again from `2xl`.
            */}
            <span className="hidden sm:inline lg:hidden 2xl:inline">
              {' '}
              · {site.location.town}
            </span>
          </span>
        )}
      </span>
    </span>
  );
}
