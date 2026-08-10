import { site } from '@/content/site';

/**
 * The wordmark is set rather than drawn, so it stays crisp at every size and
 * costs nothing to load. The kalam nib mark to the left is the one piece of
 * pure ornament on the site, and it earns its place by being the tool the
 * whole business is named after.
 *
 * Sizing note, because it caused a real bug:
 *
 * The second line — "Fine Kalamkari Arts · Srikalahasti" — is set at 9px but
 * tracked out to 0.2em, which makes it **222px wide**. That, not the name
 * above it, was what fixed this block at 256px and pushed the header controls
 * 103px off the right-hand edge of every phone. `body { overflow-x: hidden }`
 * then hid the evidence, so the header simply looked wrong rather than broken.
 *
 * So the second line is mobile-hidden and appears from `sm` up, where there is
 * room for it, and the name itself scales fluidly rather than at breakpoints.
 */
export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2 sm:gap-2.5">
      <svg
        viewBox="0 0 24 24"
        className="h-[1.375rem] w-[1.375rem] shrink-0 text-primary sm:h-6 sm:w-6 md:h-7 md:w-7"
        aria-hidden="true"
        fill="none"
      >
        {/* Bamboo pen: shaft, bound reservoir, nib. */}
        <path
          d="M17.8 3.4 20.6 6.2 9.9 16.9l-4.2 1.4 1.4-4.2z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M14.9 6.3l2.8 2.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        {/*
          The line it leaves — the one moving thing in the header.

          It re-draws roughly every two seconds and then lifts, so the mark
          reads as a pen still working rather than as a logo. The animation is
          confined to this path: the name beside it never changes weight,
          colour or position, so nothing a visitor is reading moves.

          `motion-safe:` is doing real work here rather than decorating the
          class list — under reduced motion the path simply renders at its
          resting opacity, complete, exactly as it did before.
        */}
        <path
          d="M3.4 21c2.6-1.5 5.2-1.5 7.8 0s5.2 1.5 7.8 0"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.55"
          pathLength="48"
          strokeDasharray="48"
          className="motion-safe:animate-kalam-trail"
        />
      </svg>

      <span className="flex min-w-0 flex-col leading-none">
        {/* Fluid between a 320px phone and a 420px one, then fixed.
            No `truncate`: on the narrowest screens the name would rather take
            a second line — the header has the height for it — than resolve to
            "Sri Vijaya L…", which is a worse thing to do to a shop's name than
            setting it slightly smaller. Wrapping also drops the block's
            min-content to its longest word, so it can never push the row
            wider than the screen again. */}
        <span className="font-inscription text-[clamp(0.875rem,2.73vw+0.33rem,1.0625rem)] leading-[1.08] tracking-[0.02em] md:whitespace-nowrap md:text-[1.1875rem]">
          Sri Vijaya Lakshmi
        </span>
        {!compact && (
          <span className="font-inscription mt-0.5 hidden text-[0.5625rem] uppercase tracking-[0.2em] text-muted-foreground sm:block md:text-[0.625rem]">
            Fine Kalamkari Arts · {site.location.town}
          </span>
        )}
      </span>
    </span>
  );
}
