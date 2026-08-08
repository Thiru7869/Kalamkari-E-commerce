import { Facebook, Instagram, MessageCircle, Youtube } from 'lucide-react';
import { socialLinks, whatsappHref } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * The store's social channels.
 *
 * Nothing renders for a channel the store has not published — the same rule
 * every other contact detail follows. A row of icons where two of them go
 * nowhere is worse than a row of two, because a visitor who clicks a dead one
 * concludes the whole site is abandoned.
 *
 * WhatsApp is included here rather than kept separate: on an Indian craft
 * store it is the channel most people actually use, and separating it into its
 * own control everywhere would be a distinction the customer does not make.
 */

const ICONS = {
  Instagram,
  Facebook,
  YouTube: Youtube,
} as const;

export function SocialLinks({
  className,
  tone = 'default',
  size = 'md',
}: {
  className?: string;
  /** `inverse` for placement on a dark or photographic surface. */
  tone?: 'default' | 'inverse';
  size?: 'sm' | 'md';
}) {
  const links = socialLinks();
  const whatsapp = whatsappHref();

  if (links.length === 0 && !whatsapp) return null;

  const box = size === 'sm' ? 'h-10 w-10' : 'h-11 w-11';
  const glyph = size === 'sm' ? 'h-4 w-4' : 'h-[1.15rem] w-[1.15rem]';

  const surface =
    tone === 'inverse'
      ? 'border-cotton-100/25 text-cotton-100/85 hover:border-cotton-100/60 hover:text-cotton-50'
      : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary';

  return (
    <ul className={cn('flex flex-wrap items-center gap-2', className)}>
      {links.map((link) => {
        const Icon = ICONS[link.label as keyof typeof ICONS];
        if (!Icon) return null;
        return (
          <li key={link.label}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center justify-center rounded-sm border transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                box,
                surface,
              )}
            >
              <Icon className={glyph} aria-hidden="true" />
              <span className="sr-only">{link.label}</span>
            </a>
          </li>
        );
      })}

      {whatsapp && (
        <li>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center justify-center rounded-sm border transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              box,
              surface,
            )}
          >
            <MessageCircle className={glyph} aria-hidden="true" />
            <span className="sr-only">WhatsApp</span>
          </a>
        </li>
      )}
    </ul>
  );
}
