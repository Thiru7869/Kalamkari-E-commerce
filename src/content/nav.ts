import type { NavItem } from './site';
import { heritageModules } from './heritage-modules';

/**
 * The header and the mobile drawer: five doors, in the order a buyer needs them.
 *
 * It lives beside `site.ts` rather than in it because the Heritage panel is
 * built from `heritageModules`, which itself reads `site` — putting both in one
 * file would be an import cycle. Journal and Visit Us are in the footer.
 *
 * `/heritage` used to be reachable only from the footer, on the argument that
 * an essay should not compete with "Shop". The storefront now leads with the
 * shop itself, so the story has its own door beside it rather than hiding.
 */
export const mainNav: NavItem[] = [
  {
    label: 'Shop',
    href: '/shop',
    hint: 'Everything currently in the store',
    mega: { feature: { href: '/collections/premium', image: '/images/products/hero-paintings.jpg' } },
    children: [
      { label: 'Sarees', href: '/types/sarees', hint: 'Painted end to end, pallu to border' },
      { label: 'Dupattas & Chunnis', href: '/types/dupattas', hint: 'The same cloth, by either name' },
      { label: 'Paintings', href: '/types/paintings', hint: 'Narrative panels and framed work' },
      { label: 'Home Decor', href: '/types/home-decor', hint: 'Cushions, runners, bedspreads' },
      { label: 'Blouse Pieces', href: '/types/blouse-pieces', hint: 'Stitched or unstitched' },
      { label: 'Premium', href: '/collections/premium', hint: 'Signed and exhibition grade' },
      { label: 'New Arrivals', href: '/collections/new-arrivals', hint: 'Newest off the line' },
    ],
  },
  {
    label: 'Collections',
    href: '/collections',
    hint: 'Featured, premium and new work',
  },
  {
    label: 'Heritage',
    href: '/heritage',
    hint: 'The craft, its history and its colours',
    children: heritageModules.map((m) => ({ label: m.title, href: m.href, hint: m.intro })),
  },
  {
    label: 'Our Story',
    href: '/our-story',
    hint: 'The family behind the kalam',
  },
  {
    label: 'Commission',
    href: '/custom',
    hint: 'Have a piece painted for you, to your subject and cloth',
  },
];
