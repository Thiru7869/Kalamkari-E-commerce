'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { gsap } from 'gsap';
import { welcome } from '@/content/welcome';
import { site } from '@/content/site';
import { family } from '@/content/family';
import { Button } from '@/components/ui/button';

/**
 * The doorway.
 *
 * Shown once, on a first visit, and never again after it is dismissed. It
 * earns the interruption by carrying the one fact that changes how the rest of
 * the site reads — that this is pen Kalamkari and not the printed cloth sold
 * under the same name. A welcome that said "welcome" would not be worth a
 * click.
 *
 * Treated as a real modal because it *is* blocking: focus is trapped, the
 * background does not scroll, Escape closes it, and focus returns to the
 * document when it goes. The portrait is a person at work rather than a
 * product, framed in the temple-niche arch used elsewhere on the site.
 */
export function WelcomeOverlay({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const master = family.find((m) => m.id === 'viswanath-reddy')!;

  // Entrance. The panel rises; the plate and the copy follow it in.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .fromTo(panel, { opacity: 0, y: 26, scale: 0.985 }, { opacity: 1, y: 0, scale: 1, duration: 0.7 })
        .fromTo(
          panel.querySelectorAll('[data-reveal]'),
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.07 },
          '-=0.42',
        );
    }, panel);

    return () => ctx.revert();
  }, []);

  // Focus management and the scroll lock.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      // Trap. Without this, tabbing walks into the page behind the scrim.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-headline"
    >
      {/* Scrim. Clicking it is the same as continuing. */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close the welcome"
        tabIndex={-1}
        className="absolute inset-0 cursor-default bg-kasim-950/70 backdrop-blur-[3px]"
      />

      <div
        ref={panelRef}
        className="relative flex h-[78svh] max-h-[46rem] w-full max-w-4xl overflow-hidden rounded-sm border border-border bg-background shadow-[0_50px_120px_-40px_rgb(0_0_0/0.8)]"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          // The panel is split image | words, and this sits at the top right —
          // over the words column at every width, never over the photograph.
          // So it takes the surface's own foreground, not a light ink.
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Close</span>
        </button>

        <div className="grid w-full md:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)]">
          {/* ---- The portrait ------------------------------------------- */}
          <div className="relative hidden md:block">
            <Image
              src={master.image}
              alt={`${master.name} at work in the front room in ${site.location.town}`}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              priority
              className="object-cover"
            />
            {/* Editorial rather than stock: a deep scrim from the bottom, and
                the caption set on the image the way a plate is set under a
                photograph in a book. */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-kasim-950/92 via-kasim-950/25 to-kasim-950/35"
              aria-hidden="true"
            />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="font-inscription text-[0.625rem] uppercase tracking-[0.2em] text-cotton-200/75">
                {welcome.eyebrow}
              </p>
              <p className="mt-2 font-display text-lg leading-snug text-cotton-50">
                {master.name}
              </p>
              <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-cotton-100/70">
                {master.role}
              </p>
            </div>
            {/* Hairline rule, matching the framed panels elsewhere. */}
            <span
              className="pointer-events-none absolute inset-3 border border-cotton-100/15"
              aria-hidden="true"
            />
          </div>

          {/* ---- The words ---------------------------------------------- */}
          <div className="flex flex-col overflow-y-auto p-6 md:p-9">
            <p
              data-reveal
              className="eyebrow md:hidden"
            >
              {welcome.eyebrow}
            </p>

            <h2
              id="welcome-headline"
              data-reveal
              className="mt-3 font-display text-[1.75rem] italic leading-tight md:mt-0 md:text-[2.4rem]"
            >
              {welcome.headline}
            </h2>

            <p data-reveal className="mt-4 text-body-lg leading-relaxed text-muted-foreground">
              {welcome.standfirst}
            </p>

            <div data-reveal className="mt-5 flex flex-col gap-3">
              {welcome.body.map((para) => (
                <p key={para} className="text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {para}
                </p>
              ))}
            </div>

            <dl
              data-reveal
              className="mt-7 grid grid-cols-3 gap-4 border-y border-border py-5"
            >
              {welcome.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="sr-only">{fact.label}</dt>
                  <dd>
                    <span className="tabular block font-display text-2xl leading-none text-primary">
                      {fact.value}
                    </span>
                    <span className="mt-1.5 block text-[0.6875rem] leading-tight text-muted-foreground">
                      {fact.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            <div data-reveal className="mt-auto pt-7">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={onClose} className="sm:flex-1">
                  {welcome.primary.label}
                </Button>
                <Button asChild size="lg" variant="outline" className="sm:flex-1">
                  <Link href={welcome.secondary.href} onClick={onClose}>
                    {welcome.secondary.label}
                  </Link>
                </Button>
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground sm:text-left">
                {welcome.footnote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
