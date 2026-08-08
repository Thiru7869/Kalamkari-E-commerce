/**
 * Single source of truth for business identity. Nothing here is invented —
 * every field is either given by the store or verifiable publicly.
 * If a fact is not known, it is absent rather than guessed.
 */

export const site = {
  name: 'Sri Vijaya Lakshmi Fine Kalamkari Arts',
  shortName: 'Sri Vijaya Lakshmi',
  /** Used in the PWA manifest and app-shell header where space is tight. */
  initials: 'SVL',

  tagline: 'Hand-painted Kalamkari from Srikalahasti. Natural colours only.',

  /**
   * The one-paragraph description used for meta tags and the fold of the home
   * page. Deliberately concrete: what, where, by whom, and the single claim
   * that actually separates this store from most sellers using the word
   * "Kalamkari".
   */
  description:
    'A family store in Srikalahasti painting Kalamkari entirely by hand — bamboo kalam, fermented iron black, madder red, indigo blue. No blocks, no screens, no chemical colour.',

  location: {
    town: 'Srikalahasti',
    district: 'Tirupati district',
    state: 'Andhra Pradesh',
    country: 'India',
    postalCode: '517644',
    /** The river the cloth is washed in, a short walk from the store. */
    river: 'Swarnamukhi',
    mapsUrl: 'https://share.google/2iYXirpwHrVODzbdZ',
  },

  /**
   * Published contact channels.
   *
   * Each is empty until the store supplies the real value. Empty is the safe
   * state, not a broken one: every consumer reads these through the helpers at
   * the foot of this file, and a channel with no value simply does not render —
   * the same rule `social` already follows. A half-filled `tel:` link or an
   * address nobody reads is worse than an absent one, because a visitor who
   * writes to it believes they have reached the store.
   *
   * The contact form at /contact works regardless and is never hidden, so
   * there is always at least one way through to the family.
   */
  contact: {
    /** Published store email, e.g. 'hello@example.com'. */
    email: '',
    /** Telephone, in the form it should be displayed, e.g. '+91 98765 43210'. */
    phone: '',
    /** Digits only, country code first — used to build the wa.me deep link. */
    whatsapp: '',
  },

  hours: {
    /** Published opening time. Closing time is not publicly listed, so the
     *  copy says "most days until evening" rather than inventing one. */
    opens: '09:30',
    note: 'Open most days from 9:30 in the morning. The store is a working home — a message before you travel means someone will be free to sit with you.',
  },

  social: {
    instagram: '',
    facebook: '',
    youtube: '',
  },

  /** Craft facts used across the site. Each is defensible. */
  craft: {
    steps: 23,
    /** Days the fermented iron liquor (kasim) must sit before it will strike. */
    kasimFermentDays: 21,
    /** Typical wash cycles a finished piece passes through. */
    washCycles: 20,
    /** Realistic range for a full saree, start to finish. */
    sareeDaysMin: 15,
    sareeDaysMax: 45,
  },

  shipping: {
    /** Free shipping threshold in paise. */
    freeAbove: 300000,
    flatRate: 15000,
    domesticDays: '4–7 working days',
    note: 'Every piece is checked, folded in unbleached muslin and dispatched from Srikalahasti.',
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Contact channels                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Read a contact channel, or `null` when the store has not published one.
 *
 * Everything that renders a contact detail goes through these rather than
 * touching `site.contact` directly, so an unfilled field can never reach the
 * page as an empty `mailto:` or a dead `tel:`. Callers are expected to omit
 * the whole block when they get `null`.
 */
export function contactEmail(): string | null {
  return site.contact.email.trim() || null;
}

export function contactPhone(): string | null {
  return site.contact.phone.trim() || null;
}

/** Full `wa.me` deep link, or null. Strips anything that is not a digit. */
export function whatsappHref(): string | null {
  const digits = site.contact.whatsapp.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

/** True when at least one direct channel is published besides the form. */
export function hasDirectContactChannel(): boolean {
  return Boolean(contactEmail() || contactPhone() || whatsappHref());
}

/** Published social links only. An unset handle does not render. */
export function socialLinks(): { label: string; href: string }[] {
  const entries: [string, string][] = [
    ['Instagram', site.social.instagram],
    ['Facebook', site.social.facebook],
    ['YouTube', site.social.youtube],
  ];
  return entries
    .filter(([, href]) => href.trim())
    .map(([label, href]) => ({ label, href: href.trim() }));
}

export type NavItem = {
  label: string;
  href: string;
  /** Shown in the mega-menu / mobile drawer under the label. */
  hint?: string;
  children?: NavItem[];
};

export const shopCategories = [
  { slug: 'sarees', label: 'Sarees', hint: 'Painted end to end, pallu to border' },
  { slug: 'dupattas', label: 'Dupattas', hint: 'Chunnis and stoles' },
  { slug: 'blouses', label: 'Blouses', hint: 'Painted blouse pieces, stitched or unstitched' },
  { slug: 'paintings', label: 'Paintings', hint: 'Narrative panels and framed work' },
  { slug: 'home-decor', label: 'Home Decor', hint: 'Cushions, runners, bedspreads, panels' },
] as const;

export const mainNav: NavItem[] = [
  {
    label: 'Shop',
    href: '/shop',
    hint: 'Everything currently in the store',
    children: shopCategories.map((c) => ({
      label: c.label,
      href: `/shop/${c.slug}`,
      hint: c.hint,
    })),
  },
  {
    label: 'The Process',
    href: '/process',
    hint: 'All 23 steps, in 3D',
  },
  {
    label: 'Our Story',
    href: '/our-story',
    hint: 'The family behind the kalam',
  },
  {
    label: 'Custom',
    href: '/custom',
    hint: 'Have a piece painted for you, to your subject and cloth',
  },
  {
    label: 'Journal',
    href: '/journal',
    hint: 'Notes on dye, motif and season',
  },
  {
    label: 'Visit Us',
    href: '/contact',
    hint: 'Find the store in Srikalahasti',
  },
];

/** The four items in the phone tab bar. Chosen by what a phone user actually does. */
export const mobileTabs = [
  { label: 'Home', href: '/', icon: 'home' },
  { label: 'Shop', href: '/shop', icon: 'grid' },
  { label: 'Process', href: '/process', icon: 'brush' },
  { label: 'Account', href: '/account', icon: 'user' },
] as const;

export const footerNav = [
  {
    title: 'Shop',
    links: shopCategories.map((c) => ({ label: c.label, href: `/shop/${c.slug}` })),
  },
  {
    title: 'The Craft',
    links: [
      { label: 'The 23 Steps', href: '/process' },
      { label: 'Our Story', href: '/our-story' },
      { label: 'Natural Dyes', href: '/process#dyes' },
      { label: 'Journal', href: '/journal' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Track an Order', href: '/orders/track' },
      { label: 'Care & Washing', href: '/care' },
      { label: 'Shipping & Returns', href: '/shipping' },
      { label: 'Design a Custom Piece', href: '/custom' },
    ],
  },
  {
    title: 'Store',
    links: [
      { label: 'Visit Us', href: '/contact' },
      { label: 'Your Account', href: '/account' },
      { label: 'Wishlist', href: '/wishlist' },
    ],
  },
] as const;
