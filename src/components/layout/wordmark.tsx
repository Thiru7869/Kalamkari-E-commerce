import { site } from '@/content/site';

/**
 * The wordmark is set rather than drawn, so it stays crisp at every size and
 * costs nothing to load. The kalam nib mark to the left is the one piece of
 * pure ornament on the site, and it earns its place by being the tool the
 * whole business is named after.
 */
export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 shrink-0 text-primary md:h-7 md:w-7"
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
        {/* The line it leaves. */}
        <path
          d="M3.4 21c2.6-1.5 5.2-1.5 7.8 0s5.2 1.5 7.8 0"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>

      <span className="flex flex-col leading-none">
        <span className="font-inscription text-[1.0625rem] tracking-[0.02em] md:text-[1.1875rem]">
          Sri Vijaya Lakshmi
        </span>
        {!compact && (
          <span className="font-inscription mt-0.5 text-[0.5625rem] uppercase tracking-[0.2em] text-muted-foreground md:text-[0.625rem]">
            Fine Kalamkari Arts · {site.location.town}
          </span>
        )}
      </span>
    </span>
  );
}
