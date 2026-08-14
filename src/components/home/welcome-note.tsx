import { site } from '@/content/site';
import { family } from '@/content/family';
import { WelcomeFilm } from './welcome-film';
import { KalamkariFrame } from './kalamkari-frame';
import { LivingBorder } from './living-border';
import { BrandName } from '@/components/layout/wordmark';

/**
 * The doorway: a film, a sentence, and the store's name — in that order.
 *
 * A visitor arriving here has usually just left a marketplace listing selling
 * printed polyester under the word "Kalamkari". Before anything is sold, this
 * block has to establish two things: that somebody is painting in this house
 * right now, and that the house has a name.
 *
 * ---------------------------------------------------------------------------
 * The sequence, and why the name comes last
 * ---------------------------------------------------------------------------
 *
 * The obvious arrangement is name first, then evidence. It is the wrong way
 * round for this store. "Sri Vijaya Lakshmi Fine Kalamkari Arts" means nothing
 * to somebody who has never heard of it, and a name shown to a stranger before
 * they have been given a reason to care is just a logo. Shown *after* eleven
 * seconds of a hand drawing a line, the same name is the answer to a question
 * they have started asking.
 *
 * So the block plays as one choreography, and the timings below are the whole
 * design:
 *
 *   0.00s  the film settles into its frame
 *   0.30s  the keyline draws itself around it, corner by corner
 *   1.25s  the four rosettes open
 *   1.55s  the greeting arrives beside it
 *   2.05s  "Welcome to" — small, and it waits for the frame to finish
 *   2.30s  the store's name is inked in, in the store's own lettering
 *   2.60s  the vine reaches the edges of the screen
 *
 * Every step is `motion-safe:`. Under `prefers-reduced-motion` no animation
 * class is attached at all, so the entire block renders complete and static —
 * the delays never get the chance to hold anything invisible. That is the
 * pattern `Entrance` established and the reason it is used rather than a
 * `!important` duration override, which would leave a 2.3s delay in place and
 * hide the store's name from exactly the readers least able to wait for it.
 */
export function WelcomeNote() {
  const master = family.find((m) => m.id === 'viswanath-reddy')!;

  return (
    <aside
      aria-label={`A welcome from ${site.name}`}
      className="cloth-texture relative border-b border-border bg-cotton-50 dark:bg-card"
    >
      <LivingBorder delay={2.6} />

      <div className="container py-6 sm:py-7">
        {/*
          The film and the sentence share a row; the name sits under both.

          The film's column is capped in `rem` and never in fractions. Given a
          `1fr` column it grew to 260px on a laptop and the greeting beside it
          became its caption, which inverts what the block is for.
        */}
        <div className="grid grid-cols-[minmax(0,5.5rem)_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[minmax(0,7rem)_minmax(0,1fr)] sm:gap-6 lg:grid-cols-[minmax(0,8rem)_minmax(0,1fr)]">
          {/* ---- The film, inside a border it would actually be given ---- */}
          <div className="relative w-full motion-safe:animate-dye-bloom">
            <KalamkariFrame delay={0.3} />
            <WelcomeFilm
              poster={master.image}
              label={`${master.name}, drawing in the front room in ${site.location.town}`}
            />
          </div>

          {/* ---- What the film is of ------------------------------------- */}
          <div className="min-w-0">
            <p
              className="eyebrow motion-safe:animate-story-in"
              style={{ animationDelay: '1.55s' }}
            >
              {site.location.town}
              <span className="hidden sm:inline"> · A working house</span> · Open most days
            </p>

            {/*
              The one sentence this band exists to say.

              It replaces "The store is a working house, and you are welcome in
              it" — true, but a statement about the store rather than an
              invitation to the reader, and it spent its verb on "is". This one
              is addressed to somebody standing at the door, and the second
              clause is the fact that makes the first one worth accepting.
            */}
            <p
              className="mt-2 font-display text-[1.125rem] font-semibold leading-snug md:text-xl motion-safe:animate-story-in"
              style={{ animationDelay: '1.68s' }}
            >
              Come in. The pen is still moving.
            </p>

            <p
              className="mt-2 max-w-2xl text-[0.875rem] leading-relaxed text-muted-foreground motion-safe:animate-story-in"
              style={{ animationDelay: '1.8s' }}
            >
              This is a home before it is a shop. Someone is drawing at the table most
              days of the year, and if you have travelled to find us you will be given
              tea before you are shown a single piece of cloth.
            </p>
          </div>
        </div>

        {/*
          ---- The name -------------------------------------------------------

          Full width under the row, because this is the one line on the page
          that is allowed to be the whole width of the page.

          It is a `<p>`, not a heading. The landing page's `h1` is the claim in
          the hero — "Every line drawn by hand" — and that is the correct `h1`:
          it says what the site is about, where this says only who is saying
          it. Promoting the name would give the page two competing top-level
          headings and would tell a screen reader that the most important thing
          here is a proper noun.
        */}
        <div className="mt-6 sm:mt-7">
          <span className="kalam-rule mb-5 block opacity-60" aria-hidden="true" />

          <p className="flex flex-col items-center gap-1.5 text-center sm:gap-2">
            <span
              className="font-inscription text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground motion-safe:animate-story-in sm:text-xs"
              style={{ animationDelay: '2.05s' }}
            >
              Welcome to
            </span>

            {/*
              The store's own lettering, at the one size it is worth setting.

              `BrandName` sets the full registered name as a two-line plate —
              the given name, a hairline, then "Fine Kalamkari Arts" in tracked
              capitals. See `src/components/layout/wordmark.tsx`.

              It stays a `span` rather than taking its own element, because the
              `<p>` above is already one and nesting a second would be invalid
              markup.

              No `text-balance` any more, and no `max-w-full`: the plate sets
              its own line breaks now, so there is no long single line left for
              the browser to balance badly.
            */}
            <BrandName
              className="px-2 text-[clamp(1.375rem,4vw+0.5rem,2.375rem)] text-foreground motion-safe:animate-ink-in"
              style={{ animationDelay: '2.3s' }}
            />
          </p>
        </div>
      </div>
    </aside>
  );
}
