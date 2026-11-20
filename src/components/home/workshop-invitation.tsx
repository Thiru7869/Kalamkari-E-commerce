import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { Parallax } from '@/components/motion/parallax';
import { WorkshopVideo } from '@/components/story/workshop-video';
import { site, whatsappHref } from '@/content/site';

/**
 * "Come and see it being made" — the last thing before the footer.
 *
 * This is the only place on the site that makes the offer which most separates
 * this store from a marketplace listing: you can walk in, and somebody will be
 * painting. It answers the three questions somebody actually has before
 * travelling — what will I see, when is it open, and where exactly is it.
 *
 * ---------------------------------------------------------------------------
 * Why this band is light, when it used to be the darkest thing on the page
 * ---------------------------------------------------------------------------
 *
 * It was a full-bleed photograph of the front room under two kasim scrims —
 * handsome, and the wrong note to end an invitation on. A dark band reads as a
 * closing statement; this section is asking somebody to get on a train. The
 * page now ends the way the store does, on cream and daylight.
 *
 * The photograph did not go away, it was demoted to **one** banner strip at the
 * head of the section — the whole decorative budget for the band, spent in one
 * place, so the copy and the film underneath sit on a clean ground and are
 * legible without a scrim doing the work.
 *
 * The clip lives on the banner rather than the section. A section with
 * `overflow-hidden` can hide a layout bug behind its own edge, which is exactly
 * how the hero once clipped 86px off every line of its paragraph. The banner is
 * a fixed-height box with a drifting layer inside it, and that is all it clips.
 */

/**
 * What is actually there to see, on an ordinary day.
 *
 * Written as things rather than as an itinerary. This is a house, not a
 * visitor centre, and the copy must not turn it into one.
 */
const whatYouSee = [
  {
    id: 'drawing',
    title: 'Somebody drawing',
    body: 'The kalam is cut from bamboo and bound in the store, usually the same week it is used. Most days of the year somebody is working with one, on the floor of whichever room has the best light.',
  },
  {
    id: 'pots',
    title: 'The pots in the yard',
    body: `Rusted iron and jaggery under a lid, going quietly sour for ${site.craft.kasimFermentDays} days. It is the least impressive thing to look at in the entire process, and it is the reason the outline is still black in fifty years.`,
  },
  {
    id: 'roof',
    title: 'Cloth in the sun',
    body: 'Nothing here dries indoors. Between stages every piece goes onto the roof or the ground, up to twenty times — which is also why a wet week stops the colour work completely.',
  },
];

export function WorkshopInvitation() {
  const whatsapp = whatsappHref();
  return (
    <section className="bg-cotton-50 dark:bg-background" aria-labelledby="visit-heading">
      {/* ------------------------------------------------------------------ */}
      {/* The banner — the heading, and the door it is inviting you through   */}
      {/* ------------------------------------------------------------------ */}
      {/*
        The film is *in* the banner now, and that is the change.

        It used to sit two-thirds of the way down the body column, under the
        address, capped at 30rem — placed there so it would not outshout the
        invitation. That reasoning was right about the size and wrong about the
        position: a section headed "come and see it being made" was showing a
        photograph at the top and hiding the moving picture below the fold, so
        the one asset that actually answers "what will I see" was the last thing
        anybody reached, if they reached it.

        Beside the heading, at the same modest width, it does the arguing and
        the heading does the asking. Nothing got bigger; it moved.

        The band stays light. A dark banner reads as a closing statement and
        this section is asking somebody to get on a train — so the photograph is
        held at low opacity behind a cream wash and used as *texture* rather
        than as a picture, which is also what lets the film sit on it without
        two images competing.

        No fixed height any more. It is sized by its own content, which is what
        keeps the film's aspect ratio honest at every width instead of being
        cropped into a strip chosen for a heading.
      */}
      <div className="relative isolate overflow-hidden border-b border-border">
        {/*
          The front room, drifting, at texture strength.

          `-inset-y-14` is the overscan the drift needs: at speed 0.05 the layer
          travels about ±25px, and a layer the exact height of the frame would
          show the ground at one edge for most of the scroll. `Parallax` owns
          `transform` here, so nothing inside it may animate `transform` too.
        */}
        <Parallax speed={0.05} className="absolute -inset-y-14 inset-x-0 -z-10">
          <Image
            src="/images/store/store-wide.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-[0.22] dark:opacity-[0.16]"
          />
        </Parallax>

        {/*
          The wash, which has to flip with the theme.

          Two layers rather than one scrim in a CSS variable. The heading over
          this band is `text-foreground` — ink on cream in the light theme,
          cotton on kasim in the dark one — so a single cream wash would put
          pale text on a pale ground for every dark-theme reader. The gradient
          has to follow the text it exists to support, and `dark:` is the only
          thing that actually knows which theme is on.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-cotton-50/85 dark:hidden"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 hidden bg-background/85 dark:block"
        />

        <div className="container section-y">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-14">
            <RevealOnScroll>
              <p className="eyebrow text-primary">
                {site.location.town} · {site.location.state}
              </p>
              <h2
                id="visit-heading"
                className="mt-3 max-w-2xl text-display-lg leading-tight text-foreground"
              >
                Come and see it being made
              </h2>
              <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
                Thirty seconds through the door, before you decide whether to make the
                journey. There is no sound until you press it.
              </p>
            </RevealOnScroll>

            {/*
              Capped at 32rem and pushed to the end of its column.

              Uncapped it fills a 0.9fr column, which on a wide laptop is ~560px
              — and a 16:10 player at that width is the largest thing on the
              band, which puts the film above the invitation in the reading
              order of the eye if not of the document. The cap is the same
              judgement the old placement made, kept.
            */}
            <RevealOnScroll delay={0.08}>
              <WorkshopVideo
                src="/video/opening.mp4"
                poster="/images/store/store-wide.jpg"
                tone="light"
                aspect="wide"
                eyebrow="A look through the door"
                caption="The store’s own film, shot in Srikalahasti."
                className="w-full max-w-[32rem] lg:ml-auto"
              />
            </RevealOnScroll>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* The invitation, the film, and what is actually there                */}
      {/* ------------------------------------------------------------------ */}
      <div className="container section-y">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
          {/* ---- The invitation -------------------------------------------- */}
          <RevealOnScroll>
            <p className="max-w-xl text-body-lg leading-relaxed text-muted-foreground">
              The store is a working home, a short walk from the {site.location.river} where
              the cloth is washed. There is no showroom and no appointment desk — there is a
              room with work laid out on the floor, and you are welcome in it.
            </p>

            <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
              {site.hours.note}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/contact">
                  Plan a visit
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a
                  href={site.location.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Get directions
                </a>
              </Button>
              {whatsapp && (
                <Button asChild size="lg" variant="outline">
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                    Message on WhatsApp
                  </a>
                </Button>
              )}
            </div>

            {/* The address, plainly. Somebody planning a journey wants to read
                it without opening a map. */}
            <address className="mt-8 border-t border-border pt-6 text-sm not-italic leading-relaxed text-muted-foreground">
              {site.location.street}
              <br />
              {site.location.town} · {site.location.district}
              <br />
              {site.location.state} {site.location.postalCode} · {site.location.country}
            </address>

            {/* The film used to stand here. It is in the banner above now —
                see the note there. One player per section; a second copy of
                the same thirty seconds is not a second piece of evidence. */}
          </RevealOnScroll>

          {/* ---- What is actually there ------------------------------------ */}
          <RevealOnScroll delay={0.1}>
            <div className="rounded-sm border border-border bg-cotton-100 p-6 md:p-8 dark:bg-card">
              <h3 className="font-display text-display-sm">What you will actually see</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                Depending on the day and the weather. This is a household rather than a
                demonstration, and it does whatever it is in the middle of.
              </p>

              <ol className="mt-7 flex flex-col">
                {whatYouSee.map((item, i) => (
                  <li
                    key={item.id}
                    className="group border-t border-border py-5 first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-baseline gap-3.5">
                      <span aria-hidden="true" className="tabular font-inscription text-sm text-primary/80">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h4 className="font-display text-lg leading-snug">{item.title}</h4>
                      <span
                        aria-hidden="true"
                        className="ml-auto block h-px w-0 bg-primary/50 transition-[width] duration-700 ease-out motion-safe:group-hover:w-10"
                      />
                    </div>
                    <p className="mt-2.5 pl-[2.1rem] text-[0.9375rem] leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ol>

              <p className="mt-6 border-t border-border pt-5 text-[0.8125rem] leading-relaxed text-muted-foreground">
                One honest warning, the same one on the commission page: in the monsoon
                there is drawing but very little colour, because nothing can be dried. If
                you are travelling to watch the dyeing, send a message first and the family
                will tell you what is actually going on that week.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
