'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Expand } from 'lucide-react';
import { awards, principalAward } from '@/content/family';
import { useLightbox } from '@/components/ui/lightbox';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';

/**
 * Recognition.
 *
 * This was a grid of ten numbered containers under a two-line apology, and the
 * problem with it was one of hierarchy rather than of design: the one award
 * that is actually on the record — the 2008 National Award for pen Kalamkari —
 * was given exactly the same 90px tile as nine certificates nobody has yet
 * identified, so the page's single strongest credential was indistinguishable
 * from its weakest.
 *
 * It is now two things, in the right order. The award that is known gets a
 * panel of its own, with the three reasons it means something set out properly.
 * The certificates that are not yet identified get a wall underneath, still
 * shown — they exist, and hiding them would be its own kind of dishonesty — but
 * plainly framed as awaiting their citations.
 *
 * **No citation is invented anywhere in this file.** The reasoning for the
 * award panel's copy is at `principalAward` in `src/content/family.ts`: it
 * explains what pen Kalamkari is and why it is hard, which this site can
 * defend, and says nothing about conferring bodies or prize detail, which it
 * cannot.
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
    <section className="border-t border-border section-y" aria-labelledby="awards-heading">
      <div className="container">
        <RevealOnScroll>
          <p className="eyebrow">Recognition</p>
          <h2 id="awards-heading" className="mt-3 max-w-2xl text-display-md leading-tight">
            What the work has been recognised for
          </h2>
        </RevealOnScroll>

        {/* ---------------------------------------------------------------- */}
        {/* The award that is on the record                                   */}
        {/* ---------------------------------------------------------------- */}
        <RevealOnScroll delay={0.06}>
          <div className="mt-9 overflow-hidden rounded-sm border border-border md:mt-12">
            {/*
              The citation line, given the weight of a plaque.

              Gold on kasim, and it is the only place on this page that uses
              the site's pointing colour — which is what makes it read as the
              one thing here that is certified rather than described.
            */}
            <div className="bg-kasim-900 px-6 py-7 text-cotton-100 md:px-9 md:py-9">
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                <p className="tabular font-inscription text-3xl text-myrobalan-300 md:text-4xl">
                  {principalAward.year}
                </p>
                <div className="min-w-0">
                  <h3 className="font-display text-2xl leading-tight text-cotton-50 md:text-3xl">
                    {principalAward.name}
                  </h3>
                  <p className="mt-1 font-inscription text-[0.6875rem] uppercase tracking-[0.18em] text-myrobalan-300/85">
                    {principalAward.discipline}
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-2xl leading-relaxed text-cotton-100/85">
                {principalAward.what}
              </p>

              <p className="mt-4 text-sm text-cotton-200/70">
                Received by {principalAward.recipient}.
              </p>
            </div>

            {/*
              Why it matters, as three reasons rather than an adjective.

              The brief asked for the awards to be explained rather than
              listed, and this is that explanation: each point is a claim this
              site defends on another page, and each carries the link to where
              it is defended. That is the same discipline the heritage figures
              on the home page run under — a credential that cannot be checked
              is decoration.
            */}
            <ol className="grid divide-y divide-border bg-background md:grid-cols-3 md:divide-x md:divide-y-0">
              {principalAward.why.map((reason, i) => (
                <li key={reason.title} className="flex flex-col p-6 md:p-7">
                  <span
                    aria-hidden="true"
                    className="tabular font-inscription text-[0.625rem] uppercase tracking-[0.2em] text-primary"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h4 className="mt-3 font-display text-lg leading-snug">{reason.title}</h4>
                  <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                    {reason.body}
                  </p>
                  <Link
                    href={reason.href}
                    className="mt-auto inline-flex min-h-[2.75rem] items-center gap-1.5 pt-4 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {reason.hrefLabel}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </RevealOnScroll>

        {/* ---------------------------------------------------------------- */}
        {/* The rest of the wall                                              */}
        {/* ---------------------------------------------------------------- */}
        <RevealOnScroll delay={0.1}>
          <div className="mt-14 border-t border-border pt-9 md:mt-20 md:pt-12">
            <h3 className="font-display text-display-sm">The rest of the wall</h3>
            <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
              The family has been given other certificates and citations over the years.
              They are shown here as they were given, and deliberately without captions:
              this site does not print a citation it has not read, so the store is going
              through them and the titles will appear as each is confirmed.
            </p>
          </div>
        </RevealOnScroll>

        {/*
          Three across on a phone, four from `lg` — the ratio the store asked
          for, and the right one: at four-up on a 390px viewport each container
          is under 90px and a certificate is unreadable at that size in either
          state.

          Deliberately quieter than the panel above. These are 3:4 frames with a
          plain number, no scrim and no hover label, so the wall reads as an
          archive rather than as ten competing claims — which is what it was
          doing when it was the only awards treatment on the page.
        */}
        <ul className="mt-8 grid grid-cols-3 gap-2.5 md:gap-4 lg:grid-cols-4">
          {awards.map((award, i) => (
            <li key={award.n}>
              <RevealOnScroll delay={Math.min(i, 7) * 0.03}>
                <figure className="group relative m-0">
                  <button
                    type="button"
                    onClick={() => lightbox.open(i)}
                    className="relative block aspect-[3/4] w-full overflow-hidden rounded-sm border border-border bg-cotton-200 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-muted"
                  >
                    <Image
                      src={award.image}
                      alt={award.title ?? award.label}
                      fill
                      sizes="(min-width: 1024px) 22vw, 30vw"
                      className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.04]"
                    />

                    <span
                      aria-hidden="true"
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-sm border border-cotton-100/30 bg-kasim-950/50 text-cotton-50 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      <Expand className="h-3 w-3" />
                    </span>

                    <span className="sr-only">{award.label} — open full screen</span>
                  </button>

                  {/* The number sits under the frame rather than on it. A
                      label burned into the bottom of a photograph of a
                      certificate looks like part of the certificate. */}
                  <figcaption
                    aria-hidden="true"
                    className="tabular mt-1.5 font-inscription text-[0.5625rem] uppercase tracking-[0.14em] text-muted-foreground/70 md:text-[0.625rem]"
                  >
                    {award.label}
                  </figcaption>
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
