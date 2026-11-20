import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const LINKS = [
  { label: 'Shop the work', href: '/', hint: 'Sarees, dupattas, paintings and more' },
  { label: 'Heritage & craft', href: '/heritage', hint: 'How and why it is made this way' },
  { label: 'Visit or write to us', href: '/contact', hint: 'We reply to every message' },
] as const;

/**
 * The foot of a support page: three ways onward, so a customer who has found
 * their answer can carry on to the cloth instead of leaving.
 */
export function SupportLinks({ exclude }: { exclude?: string }) {
  const links = LINKS.filter((l) => l.href !== exclude);
  return (
    <section className="container pb-14 md:pb-20" aria-label="Where next">
      <ul className="grid gap-3 sm:grid-cols-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group flex h-full items-start justify-between gap-3 rounded-2xl border border-border bg-card p-5 transition-colors duration-swift ease-swift hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>
                <span className="block font-display text-base">{l.label}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{l.hint}</span>
              </span>
              <ArrowUpRight
                className="mt-1 h-4 w-4 shrink-0 text-primary transition-transform duration-swift ease-swift motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
