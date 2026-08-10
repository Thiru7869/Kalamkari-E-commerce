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
        which inverts what the block is for.

        Halved again from 10/11.5rem. Even capped, the band was taking ~250px
        off the top of the landing page before the hero began — a doorway wider
        than the room. At 6.5/7.5rem the film is still legibly a moving hand on
        cloth, and the whole band now costs about 130px.
      */}
      {/*
        Two columns at every width, including the narrowest phone.

        It used to stack below `sm`: the film went full-width as a 21:9 band
        above the words. The film is a 720x1280 portrait clip, so a 21:9 crop of
        it showed about a sixth of the frame — a horizontal strip across the
        middle of a vertical composition, which is the one shape guaranteed to
        lose whatever the camera was actually pointed at. It also made the band
        two blocks tall on the smallest screens, which is where its height
        mattered most.

        Side by side at 5rem, the phone now gets the same arrangement as the
        desktop at a smaller size, and the film keeps a portrait crop that
        matches the source.
      */}
      <div className="container grid grid-cols-[minmax(0,5rem)_minmax(0,1fr)] items-center gap-4 py-4 sm:grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)] sm:gap-5 lg:grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] lg:gap-6">
        {/* ---- The film ------------------------------------------------- */}
        {/*
          The arch is the shape of a temple niche, which is where this craft's
          subjects come from — kept from the portrait it replaces, because it
          is the one piece of framing on the page that says what the work is
          about before a word is read.
        */}
        <div className="relative w-full">
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

          {/*
            Not the same sentence as the overlay.

            This read "Come in — the cloth on the roof is still wet", directly
            underneath a first-visit modal whose headline is "The cloth on our
            roof is still wet." The visitor was welcomed twice, in the same
            words, within one screen. The overlay keeps that line, because it is
            the better one and it is shown once; this band is the permanent
            version and now says the thing the overlay does not — that the door
            is a real door and can be walked through.
          */}
          <p className="mt-1.5 font-display text-[1.0625rem] italic leading-snug md:text-lg">
            The store is a working house, and you are welcome in it.
          </p>

          <p className="mt-1.5 max-w-2xl text-[0.8125rem] leading-relaxed text-muted-foreground">
            Somebody is painting here most days. If you have travelled far you will be
            given tea before you are shown anything.
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
