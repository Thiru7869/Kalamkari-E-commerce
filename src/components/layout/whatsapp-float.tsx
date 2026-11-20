'use client';

import { MessageCircle } from 'lucide-react';
import { whatsappHref, site } from '@/content/site';

/**
 * The floating WhatsApp button.
 *
 * Deliberately not on every page. It appears exactly where the visitor's next
 * step is a conversation rather than a purchase — the journal, the visit page,
 * contact, and a commission — and on those four pages the chat launcher is
 * removed, because offering two ways to start the same conversation in the same
 * corner is how a page ends up with two floating buttons on top of each other.
 *
 * Renders nothing at all when the store has not published a number, like every
 * other contact channel on this site.
 */
export function WhatsAppFloat() {
  const href = whatsappHref();
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group pointer-events-auto relative flex h-12 items-center gap-2.5 rounded-full border border-primary/25 bg-primary pl-3.5 pr-4 text-primary-foreground shadow-[0_8px_24px_-10px_hsl(var(--primary)/0.7)] transition-transform duration-300 ease-out hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <MessageCircle className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
      <span className="font-inscription text-sm tracking-[0.06em]">WhatsApp</span>
      <span className="sr-only">
        — message the store in {site.location.town} on WhatsApp
      </span>
    </a>
  );
}
