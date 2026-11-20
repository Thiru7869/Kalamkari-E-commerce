'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Plus, RotateCcw, X } from 'lucide-react';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { colourStories } from '@/content/process';
import { cn } from '@/lib/utils';

/**
 * Where the colour comes from.
 *
 * One tall niche per pot, drawn from `colourStories` so the swatch, the name
 * and the source line are the ones the process page already defends. Choosing
 * a niche opens it: it widens to two columns and tells how that colour is
 * made, from the same story the process page tells in full. Nothing here is
 * written twice.
 *
 * `colourStories` ids are the process page's; the `Dye` slugs are the
 * database's. They name the same eight pots, and this map is the one place the
 * two vocabularies meet. A story with no entry simply offers no shop link
 * rather than a filter that does not exist.
 */
const DYE_SLUG: Record<string, string> = {
  cream: 'myrobalan-cream',
  black: 'kasim-black',
  red: 'madder-red',
  pink: 'pink',
  yellow: 'myrobalan-yellow',
  blue: 'indigo',
  green: 'green',
  brown: 'katha-brown',
};

export function DyePots() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section
      className="section-y bg-kasim-950 text-cotton-50"
      aria-labelledby="dye-pots-heading"
    >
      <div className="container">
        <RevealOnScroll>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="eyebrow text-myrobalan-300">The pots</p>
              <h2 id="dye-pots-heading" className="mt-3 text-display-md">
                Where does the colour come from?
              </h2>
              <p className="mt-3 text-cotton-100/80">
                Every colour on the cloth comes out of one of these pots, and nothing else.
                Choose one to see how it is made.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
              {/* Shown only while a pot is open, and it puts every pot back to
                  its closed size. */}
              {openId && (
                <button
                  type="button"
                  onClick={() => setOpenId(null)}
                  className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-full border border-cotton-100/30 px-4 text-sm font-medium text-cotton-50 transition-colors hover:border-cotton-100/60 hover:bg-cotton-50/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-myrobalan-300 motion-safe:animate-story-in"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              )}
              <Link
                href="/process"
                className="inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-myrobalan-300 underline-offset-4 hover:underline"
              >
                The full process
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </RevealOnScroll>

        <ul className="mt-6 grid grid-flow-dense grid-cols-2 gap-3 sm:grid-cols-4 md:mt-7">
          {colourStories.map((dye, i) => {
            const slug = DYE_SLUG[dye.id];
            const light = dye.ink === 'light';
            const open = openId === dye.id;

            const text = {
              strong: light ? 'text-white' : 'text-black',
              body: light ? 'text-white/90' : 'text-black/85',
              quiet: light ? 'text-white/80' : 'text-black/75',
              rule: light ? 'border-white/25' : 'border-black/20',
            };

            return (
              <li key={dye.id} className={cn(open && 'col-span-2')}>
                <div
                  className={cn(
                    'relative flex h-full flex-col overflow-hidden rounded-t-[2.5rem] rounded-b-sm ring-1 ring-inset ring-white/15 transition-transform duration-300 ease-out',
                    !open && 'motion-safe:hover:-translate-y-1',
                    text.strong,
                  )}
                  style={{ backgroundColor: dye.hex }}
                >
                  {/* Faint woven texture, so a flat colour still reads as cloth. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-[0.07]"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 6px)',
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : dye.id)}
                    aria-expanded={open}
                    aria-controls={`pot-${dye.id}`}
                    className={cn(
                      'relative flex min-h-[11rem] w-full flex-col p-4 text-left sm:min-h-[13rem] sm:p-5',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-myrobalan-300',
                      open ? 'flex-none' : 'flex-1',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'tabular font-inscription text-[0.6875rem] tracking-[0.2em]',
                        text.quiet,
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute right-4 top-3.5 flex h-8 w-8 items-center justify-center rounded-full border',
                        text.rule,
                      )}
                    >
                      {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>

                    <span className="mt-auto block pt-6">
                      {dye.localName && (
                        <span
                          className={cn(
                            'block font-inscription text-[0.625rem] uppercase tracking-[0.2em]',
                            text.quiet,
                          )}
                        >
                          {dye.localName}
                        </span>
                      )}
                      <span
                        className={cn(
                          'mt-1 block font-display leading-tight',
                          open ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl',
                        )}
                      >
                        {dye.name}
                      </span>
                      <span className={cn('mt-1.5 block text-xs leading-snug', text.body)}>
                        {dye.source}
                      </span>
                    </span>
                  </button>

                  {/* How it is made. Rendered only while open, so a closed pot
                      adds nothing to the page. */}
                  {open && (
                    <div
                      id={`pot-${dye.id}`}
                      className={cn(
                        'relative border-t px-4 pb-5 pt-4 sm:px-5 motion-safe:animate-story-in',
                        text.rule,
                      )}
                    >
                      <p
                        className={cn(
                          'font-inscription text-[0.625rem] uppercase tracking-[0.2em]',
                          text.quiet,
                        )}
                      >
                        How it is made · {dye.method}
                      </p>
                      <p className={cn('mt-2 text-sm leading-relaxed', text.body)}>{dye.body}</p>
                      <p
                        className={cn(
                          'mt-3 border-l-2 pl-3 text-sm italic leading-relaxed',
                          text.rule,
                          text.body,
                        )}
                      >
                        {dye.note}
                      </p>

                      {slug && (
                        <Link
                          href={`/shop?dye=${slug}`}
                          className={cn(
                            'mt-4 inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium underline underline-offset-4',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-myrobalan-300',
                            text.strong,
                          )}
                        >
                          See pieces dyed with {dye.name.toLowerCase()}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
