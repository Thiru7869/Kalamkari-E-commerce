import { site } from './site';

/**
 * The eight doors out of /heritage, and the tiles on the home page.
 *
 * One list, so the hub, the landing page and the "keep reading" strip at the
 * foot of each page cannot disagree about what exists. Every `intro` restates
 * something the destination page already says; none adds a claim.
 *
 * The images are the ones the store already has. They are placeholders until
 * real photographs of the work are supplied: swap the `image` path here and
 * every surface that shows the module follows.
 */
export type HeritageModule = {
  id: string;
  title: string;
  /** One or two sentences. */
  intro: string;
  href: string;
  image: string;
  alt: string;
};

export const heritageModules: HeritageModule[] = [
  {
    id: 'our-heritage',
    title: 'Our Heritage',
    intro: `A working home in ${site.location.town}, and the family that keeps the pen moving.`,
    href: '/our-story',
    image: '/images/family/muni-reddy.jpg',
    alt: 'M Muni Reddy, founder of the store',
  },
  {
    id: 'history',
    title: 'History of Kalamkari',
    intro: 'What the name means, why two crafts share it, and what the cloth was made for.',
    href: '/heritage/history',
    image: '/images/journal/two-traditions.jpg',
    alt: 'Drawn and printed Kalamkari side by side',
  },
  {
    id: 'craftsmanship',
    title: 'Art & Craftsmanship',
    intro: 'The bamboo pen, the freehand line, and the senior hands that draw.',
    href: '/heritage/craftsmanship',
    image: '/images/journal/telling-the-difference.jpg',
    alt: 'A freehand line, close up',
  },
  {
    id: 'saree-making',
    title: 'Traditional Saree Making',
    intro: 'From plain cloth to a finished saree, step by step and in order.',
    href: '/process',
    image: '/images/og/process.jpg',
    alt: 'The stages of making a Kalamkari saree',
  },
  {
    id: 'culture',
    title: 'Culture & Traditions',
    intro: 'Cloth made to be read: temple hangings, the epics, and how a story is laid out.',
    href: '/heritage/culture',
    image: '/images/products/dashavatara-pure-silk-saree-1.jpg',
    alt: 'A Dashavatara saree',
  },
  {
    id: 'artisans',
    title: 'Artisans & Their Work',
    intro: 'The five people who draw, and the town of artisans around them.',
    href: '/heritage/artisans',
    image: '/images/family/viswanath-reddy.jpg',
    alt: 'M Viswanath Reddy, master artisan',
  },
  {
    id: 'motifs',
    title: 'Designs & Motifs',
    intro: 'Ramayana, Krishna Leela, Tree of Life and more, and what each one shows.',
    href: '/heritage/motifs',
    image: '/images/products/krishna-leela-soft-silk-saree-1.jpg',
    alt: 'A Krishna Leela saree',
  },
  {
    id: 'colours',
    title: 'Natural Colours & Materials',
    intro: 'Iron, madder, indigo, myrobalan and nothing synthetic. Where each colour comes from.',
    href: '/heritage/colours',
    image: '/images/journal/natural-dye.jpg',
    alt: 'Cloth being dyed with natural colours',
  },
];

/** The other modules, for the "keep reading" strip at the foot of a page. */
export function otherModules(currentId: string, take = 3): HeritageModule[] {
  const i = heritageModules.findIndex((m) => m.id === currentId);
  const rest = heritageModules.filter((m) => m.id !== currentId);
  // Start after the current one, so the strip reads as "what comes next".
  const start = i < 0 ? 0 : i;
  return [...rest.slice(start), ...rest.slice(0, start)].slice(0, take);
}
