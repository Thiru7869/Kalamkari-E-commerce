'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { gsap } from 'gsap';
import { welcome } from '@/content/welcome';
import { site } from '@/content/site';
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
        className="absolute inset-0 cursor-default bg-kasim-950/85 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        className="relative flex max-h-[90svh] w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-background shadow-[0_50px_120px_-40px_rgb(0_0_0/0.8)]"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          // The panel is split image | words, and this sits at the top right —
          // over the words column at every width, never over the photograph.
          // So it takes the surface's own foreground, not a light ink.
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors duration-swift ease-swift hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Close</span>
        </button>

        <div className="grid w-full md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
          {/* ---- The portrait ------------------------------------------- */}
          <div className="relative hidden md:block">
            <Image
              src="/images/store/welcome-artisan.jpg"
              alt={`M Viswanath Reddy drawing a Kalamkari panel freehand with a bamboo pen in ${site.location.town}`}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              priority
              className="object-cover object-[55%_50%]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-kasim-950/90 via-kasim-950/20 to-transparent"
              aria-hidden="true"
            />
            <div className="absolute inset-x-0 bottom-0 p-6 text-cotton-50">
              <span aria-hidden="true" className="mb-3 block h-px w-8 bg-myrobalan-300" />
              <p className="font-inscription text-[0.625rem] uppercase tracking-[0.26em] text-myrobalan-300">
                Master artisan
              </p>
              <p className="mt-1 font-display text-lg leading-snug">M Viswanath Reddy</p>
              <p className="mt-0.5 font-sans text-xs text-cotton-100/75">National Awardee · 2008</p>
            </div>
          </div>

          {/* ---- The words ---------------------------------------------- */}
          <div className="flex flex-col justify-center gap-5 overflow-y-auto overflow-x-hidden p-7 md:p-10">
            <p data-reveal className="eyebrow">
              {welcome.eyebrow}
            </p>

            <h2
              id="welcome-headline"
              data-reveal
              className="font-display text-[1.75rem] leading-tight md:text-[2.1rem]"
            >
              {welcome.headline}
            </h2>

            <span data-reveal aria-hidden="true" className="h-px w-12 bg-myrobalan-500" />

            <p data-reveal className="text-body-lg leading-relaxed text-muted-foreground">
              {welcome.standfirst}
            </p>

            <div data-reveal className="mt-2 flex flex-col items-stretch gap-1">
              <Button asChild size="lg" className="group w-full justify-between rounded-full px-7 tracking-wide">
                <Link href={welcome.primary.href} onClick={onClose}>
                  {welcome.primary.label}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-swift ease-swift group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
              <Link
                href={welcome.secondary.href}
                onClick={onClose}
                className="inline-flex min-h-[2.75rem] items-center justify-center self-center whitespace-nowrap text-sm font-medium tracking-wide text-foreground underline decoration-foreground/30 underline-offset-[6px] transition-colors duration-swift ease-swift hover:text-primary hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {welcome.secondary.label}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
