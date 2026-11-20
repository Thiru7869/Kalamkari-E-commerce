import { site } from './site';

/**
 * The doorway.
 *
 * It is written to the same rule as the rest of the site: say something
 * true and specific, or say nothing. A welcome overlay that says "Welcome to
 * our store!" has cost the visitor a click and told them nothing they could
 * not see. This one tells them the single fact that makes the rest of the site
 * worth reading.
 */

export const welcome = {
  eyebrow: `${site.location.town} · ${site.location.district}`,
  headline: 'Hand-drawn Kalamkari, from Srikalahasti.',
  /** One claim, and it is the one the whole site defends. */
  standfirst:
    'Every piece is drawn freehand with a bamboo pen and coloured with natural dyes. No blocks, no screens.',
  primary: { label: 'Explore the shop', href: '/shop' },
  secondary: { label: 'See how it is made', href: '/process' },
} as const;

/** Bumped when the copy changes enough that returning visitors should see it. */
export const WELCOME_VERSION = '1';
