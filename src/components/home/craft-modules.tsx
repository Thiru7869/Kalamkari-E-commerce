import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { heritageModules } from '@/content/heritage-modules';

/**
 * The landing page's doorway into heritage and craft: the same eight modules
 * the hub shows, as slim tiles — a thumbnail beside the title — each one a link
 * to its own page. Two short rows, so the whole section sits inside one screen.
 * The reading happens on the pages, not here.
 */
export function CraftModules() {
  return (
    <section className="section-y-sm" aria-labelledby="craft-modules-heading">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <p className="eyebrow">Heritage & craft</p>
            <h2 id="craft-modules-heading" className="mt-2 text-display-sm">
              Explore the craft
            </h2>
          </div>
          <Link
            href="/heritage"
            className="inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            All heritage & craft
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {heritageModules.map((module, i) => (
            <li key={module.id}>
              <RevealOnScroll delay={(i % 4) * 0.05} className="h-full">
                <Link
                  href={module.href}
                  className="group flex h-full items-center gap-3 overflow-hidden rounded-xl border border-border bg-card p-2 pr-3 transition-[border-color,box-shadow] duration-swift ease-swift hover:border-primary/40 hover:shadow-[0_14px_30px_-24px_rgb(0_0_0/0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg sm:h-16 sm:w-16">
                    <Image
                      src={module.image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover transition-transform duration-[600ms] ease-swift motion-safe:group-hover:scale-[1.08]"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[0.9375rem] leading-snug">
                      {module.title}
                    </span>
                    <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-primary">
                      Read
                      <ArrowUpRight
                        className="h-3.5 w-3.5 transition-transform duration-swift ease-swift motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                </Link>
              </RevealOnScroll>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
