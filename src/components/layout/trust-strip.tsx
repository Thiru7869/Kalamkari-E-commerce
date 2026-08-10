import Link from 'next/link';
import { Leaf, PenTool, Package, RotateCcw } from 'lucide-react';
import { site } from '@/content/site';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

/**
 * Four things a buyer of hand-painted cloth actually needs to know.
 *
 * Not badges. Every line here is a specific, checkable claim that links to the
 * page where it is set out in full — which is the only kind of trust signal
 * worth having on a site whose entire argument is that it can be checked. A
 * row of "100% Authentic" seals would undermine the rest of the copy.
 */
export function TrustStrip({ className }: { className?: string }) {
  const items = [
    {
      Icon: PenTool,
      title: 'Drawn freehand, once',
      body: 'No blocks, no screens, no tracing. Almost every piece is the only one of itself.',
      href: '/process',
      cta: 'The 23 steps',
    },
    {
      Icon: Leaf,
      title: 'Natural dyes only',
      body: 'Iron, madder root, indigo, myrobalan. Nothing synthetic at any of the twenty-three stages.',
      href: '/process#colours',
      cta: 'The palette',
    },
    {
      Icon: Package,
      title: `Free over ${formatPrice(site.shipping.freeAbove)}`,
      body: `${site.shipping.domesticDays} across India. Checked, folded in unbleached muslin, sent from ${site.location.town}.`,
      href: '/shipping',
      cta: 'Shipping',
    },
    {
      Icon: RotateCcw,
      title: 'If something is wrong, we fix it',
      body: 'Variations in line and colour are how hand painting is identified. Damage or a piece unlike its description is not.',
      href: '/shipping',
      cta: 'Returns',
    },
  ];

  return (
    <section
      aria-label="What you are buying"
      className={cn('border-y border-border bg-cotton-100 section-y-sm dark:bg-card', className)}
    >
      <div className="container">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {items.map(({ Icon, title, body, href, cta }) => (
            <li key={title} className="flex gap-3.5">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0">
                <h3 className="font-display text-[1.0625rem] leading-snug">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                <Link
                  href={href}
                  className="mt-2 inline-flex min-h-[2.25rem] items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {cta}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
