'use client';

import Image from 'next/image';
import { Expand } from 'lucide-react';
import { awards } from '@/content/family';
import { useLightbox } from '@/components/ui/lightbox';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';

/**
 * The award wall.
 *
 * Four across on a desktop, three on a phone — the ratio the store asked for,
 * and the right one: at four-up on a 390px viewport each container is under
 * 90px and a certificate is unreadable at that size in either state.
 *
 * Each container offers two things. Quick view enlarges it in place, for
 * somebody scanning the wall; full screen opens the viewer with arrow-key
 * navigation, for somebody who wants to read one. Both are on the container
 * rather than beside it, and stay low-contrast until the container has
 * attention, so ten of them do not read as twenty buttons.
 *
 * Labels are plain numbers because the store has not yet supplied citations
 * and this site does not invent them. The one award named anywhere here is the
 * 2008 National Award, which is on the record.
 */
export function AwardsWall() {
  const lightbox = useLightbox(
    awards.map((a) => ({
      src: a.image,
      alt: a.title ?? a.label,
      caption: a.title ?? `${a.label} — details to be confirmed by the store.`,
    })),
  );

  return (
    <section
      className="border-t border-border py-14 md:py-20"
      aria-labelledby="awards-heading"
    >
      <div className="container">
        <RevealOnScroll>
          <p className="eyebrow">Recognition</p>
          <h2 id="awards-heading" className="mt-3 text-display-md">
            Awards
          </h2>
          <p className="mt-4 max-w-2xl text-body-lg text-muted-foreground">
            The one on the record is the National Award for pen Kalamkari, 2008. The rest
            are shown as they were given; the store is confirming the citations before we
            print them here.
          </p>
        </RevealOnScroll>

        <ul className="mt-9 grid grid-cols-3 gap-2.5 md:mt-12 md:gap-4 lg:grid-cols-4">
          {awards.map((award, i) => (
            <li key={award.n}>
              <RevealOnScroll delay={Math.min(i, 7) * 0.03}>
                <figure className="group relative">
                  <button
                    type="button"
                    onClick={() => lightbox.open(i)}
                    className="relative block aspect-[3/4] w-full overflow-hidden rounded-sm border border-border bg-cotton-200 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-kasim-800"
                  >
                    <Image
                      src={award.image}
                      alt={award.title ?? award.label}
                      fill
                      sizes="(min-width: 1024px) 22vw, 30vw"
                      className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.04]"
                    />

                    {/* Quick view: the label lifts on a scrim rather than
                        opening anything, so scanning the wall costs nothing. */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-kasim-950/85 to-transparent p-2 pt-6 text-left"
                    >
                      <span className="block font-inscription text-[0.5625rem] uppercase tracking-[0.14em] text-cotton-100/80 md:text-[0.625rem]">
                        {award.label}
                      </span>
                    </span>

                    <span
                      aria-hidden="true"
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-sm border border-cotton-100/30 bg-kasim-950/50 text-cotton-50 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      <Expand className="h-3 w-3" />
                    </span>

                    <span className="sr-only">
                      {award.label} — open full screen
                    </span>
                  </button>
                </figure>
              </RevealOnScroll>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm text-muted-foreground">
          Tap any to open it full screen. Arrow keys move between them.
        </p>
      </div>

      {lightbox.view}
    </section>
  );
}
