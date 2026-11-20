import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { otherModules } from '@/content/heritage-modules';
import { ModuleCard } from './module-card';

/**
 * The foot of every heritage page: where to read next, and the way back to the
 * cloth itself. Learning about the craft should lead somewhere you can buy it.
 */
export function HeritagePageFooter({
  currentId,
  shop,
}: {
  currentId: string;
  /** Collections related to the page, as labelled links. */
  shop: { label: string; href: string }[];
}) {
  return (
    <>
      <section className="container section-y" aria-labelledby="keep-reading">
        <div className="flex items-end justify-between gap-4">
          <h2 id="keep-reading" className="text-display-sm">
            Keep reading
          </h2>
          <Link
            href="/heritage"
            className="inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            All of it
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {otherModules(currentId).map((m) => (
            <ModuleCard key={m.id} module={m} compact />
          ))}
        </div>
      </section>

      <section className="container pb-16 md:pb-20" aria-labelledby="see-the-cloth">
        <div className="flex flex-col gap-5 rounded-sm bg-kasim-900 p-6 text-cotton-100 sm:p-9 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="see-the-cloth" className="font-display text-xl text-cotton-50 md:text-2xl">
              See it on the cloth
            </h2>
            <p className="mt-1.5 text-sm text-cotton-200/80">
              Every piece in the store is made this way.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {shop.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex min-h-[2.75rem] items-center rounded-full border border-cotton-200/30 px-5 text-sm font-medium text-cotton-50 transition-colors duration-swift ease-swift hover:bg-cotton-50 hover:text-kasim-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cotton-50"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
