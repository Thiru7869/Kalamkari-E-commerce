import { site, socialLinks, whatsappHref } from '@/content/site';
import { family } from '@/content/family';
import { WelcomeFilm } from './welcome-film';
import { SocialLinks } from '@/components/layout/social-links';

/**
 * The first thing on the site: a doorway, not a banner.
 *
 * A visitor arriving here has usually just left a marketplace listing selling
 * a printed polyester saree as "Kalamkari". The job of these two lines is to
 * establish, before anything is sold, that this is a house where somebody is
 * currently painting — and that they would be welcome in it.
 *
 * The still portrait that used to sit here has become a short film, because a
 * photograph of a person at a table and a *moving* hand drawing a line are not
 * the same argument. The line is the whole claim of this site, and it is the
 * one thing a still image cannot show.
 *
 * The constraint that shapes the layout: the film and the message must be
 * readable together, without scrolling. So the film is a fixed-ratio panel in
 * a two-column row from `sm` up, and on a phone it is a short 16:9 band above
 * the words rather than a portrait crop that would push the greeting off the
 * screen. Nothing here is allowed to grow with the viewport.
 */
export function WelcomeNote() {
  const master = family.find((m) => m.id === 'viswanath-reddy')!;
  const hasSocial = socialLinks().length > 0 || Boolean(whatsappHref());

  return (
    <aside
      aria-label="A welcome from the store"
      className="cloth-texture border-b border-border bg-cotton-50 dark:bg-kasim-900"
    >
      {/*
        The film's column is capped in rem, never in fractions.

        This band is a doorway above the hero, not a section of its own, so its
        height must not track the viewport — given a `1fr` column the film grew
        to 260px on a laptop and the greeting beside it became its caption,
        which inverts what the block is for. 10rem and 11.5rem keep the film
        the size of a photograph on a table.
      */}
      <div className="container grid gap-4 py-5 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] sm:items-center sm:gap-6 sm:py-6 lg:grid-cols-[minmax(0,11.5rem)_minmax(0,1fr)] lg:gap-8">
        {/* ---- The film ------------------------------------------------- */}
        {/*
          The arch is the shape of a temple niche, which is where this craft's
          subjects come from — kept from the portrait it replaces, because it
          is the one piece of framing on the page that says what the work is
          about before a word is read.
        */}
        <div className="relative mx-auto w-full max-w-[22rem] sm:mx-0 sm:max-w-none">
          <WelcomeFilm
            poster={master.image}
            label={`${master.name}, painting in the front room in ${site.location.town}`}
          />
          <span
            className="pointer-events-none absolute -inset-[3px] -z-10 opacity-70"
            style={{
              borderRadius: '10px 10px 5px 5px',
              border: '1px solid hsl(var(--primary) / 0.35)',
            }}
            aria-hidden="true"
          />
        </div>

        {/* ---- The greeting --------------------------------------------- */}
        <div className="min-w-0">
          {/* "The front room" is dropped on the narrowest phones, where three
              tracked clauses wrap to two lines. */}
          <p className="eyebrow">
            {site.location.town}
            <span className="hidden sm:inline"> · The front room</span> · Open most days
          </p>

          <p className="mt-2 font-display text-[1.0625rem] italic leading-snug md:text-xl">
            Come in — the cloth on the roof is still wet.
          </p>

          <p className="mt-2 max-w-2xl text-[0.8125rem] leading-relaxed text-muted-foreground md:text-sm">
            Somebody is always painting here. If you have travelled far you will be given
            tea before you are shown anything, and nothing you are shown was made by a
            machine.
          </p>

          {/*
            The channels, directly under the invitation.

            This renders nothing at all until the store fills in `site.social`
            and `site.contact.whatsapp` in src/content/site.ts — the same rule
            every other contact detail on this site follows. A row of icons
            where two of them go nowhere is worse than no row, because the
            visitor who taps a dead one concludes the shop is abandoned. The
            heading is inside the conditional for the same reason: an empty
            "Find us" with nothing under it is its own kind of broken.
          */}
          {hasSocial && (
            <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-inscription text-[0.625rem] uppercase tracking-[0.16em] text-muted-foreground/80">
                Find us
              </span>
              <SocialLinks size="sm" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
