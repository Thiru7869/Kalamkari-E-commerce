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
    /** The street address as printed on the store's visiting card. */
    street: 'D.No. 15-890, B.P. Agraharam',
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
    /**
     * Published store email.
     *
     * Supplied by the store on 2026-08-10 and corroborated by the SMTP account
     * the site already authenticates with, so this is the address the family
     * actually reads rather than one built from the domain.
     */
    email: 'vijayalakshmifinekalamkariarts@gmail.com',
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

/* -------------------------------------------------------------------------- */
/* The announcement bar                                                       */
/* -------------------------------------------------------------------------- */

/**
 * What the moving bar above the header says.
 *
 * Mostly craft facts rather than offers, on purpose. A bar that only ever
 * shouts about discounts is a bar people learn to ignore; one that occasionally
 * tells you the black is fermented for twenty-one days is one they read. Every
 * line here is checkable against /process or the shipping page.
 */
export const announcements = [
  `Free shipping in India above ₹${(site.shipping.freeAbove / 100).toLocaleString('en-IN')}`,
  'Hand-painted in Srikalahasti · natural dyes only',
  'Twenty-three steps, and the colour arrives at step sixteen',
  'Almost every piece is one of one — the same drawing is never made twice',
  'The black is fermented from rusted iron for twenty-one days',
  `Dispatched in ${site.shipping.domesticDays}, folded in unbleached muslin`,
  'No blocks · no screens · no chemical colour',
  'Indigo is the one colour that is dipped, never painted',
] as const;

/* -------------------------------------------------------------------------- */
/* The Explore panel                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Ten sections, grouped, each with a line saying what it actually is.
 *
 * The hints matter more than the labels. "Care & washing" tells somebody
 * nothing they did not guess; "why naturally dyed cloth is washed differently"
 * tells them whether to open it.
 */
export const exploreSections = [
  {
    title: 'The work',
    items: [
      { label: 'Everything in the store', href: '/shop', hint: 'The full grid, filterable by cloth, story and price' },
      { label: 'Sarees', href: '/types/sarees', hint: 'Nine yards, drawn end to end — and which cloth to choose' },
      { label: 'Paintings', href: '/types/paintings', hint: 'Narrative panels, the tradition the craft grew out of' },
      { label: 'New arrivals', href: '/collections/new-arrivals', hint: 'The most recent work to finish its twentieth washing' },
    ],
  },
  {
    title: 'The craft',
    items: [
      { label: 'The twenty-three steps', href: '/process', hint: 'The whole sequence, with the cloth changing as you read' },
      { label: 'The vegetable palette', href: '/process#colours', hint: 'Eight colours, and where each one comes from' },
      { label: 'Heritage & craft', href: '/heritage', hint: 'History, artisans, motifs and colours, in eight short reads' },
      { label: 'Our story', href: '/our-story', hint: 'Five people in one house, and how the craft passes through it' },
      { label: 'The journal', href: '/journal', hint: 'Notes on dye, motif and season — including how to spot a print' },
    ],
  },
  {
    title: 'Practical',
    items: [
      { label: 'Have a piece painted', href: '/custom', hint: 'Your subject, your cloth. No payment to start a conversation' },
      { label: 'Care & washing', href: '/care', hint: 'Why naturally dyed cloth is washed differently, and how' },
    ],
  },
] as const;

/**
 * What the search placeholder types through.
 *
 * The order is the order somebody narrows: the kind of thing first, then the
 * cloth it is drawn on, then the story drawn on it. Every term below returns
 * results against the seeded catalogue — a placeholder that suggests a search
 * with nothing behind it is a small lie told eight times a minute.
 */
export const searchPlaceholders = [
  'Search for sarees',
  'Cotton saree',
  'Tussar silk saree',
  'Chanderi saree',
  'Mulmul cotton saree',
  'Search for dupattas',
  'Search for chunnis',
  'Search for paintings',
  'Search for home decor',
  'Blouse pieces',
  'Tree of Life',
  'Peacock',
  'Indigo',
  'Temple border',
] as const;

export type NavItem = {
  label: string;
  href: string;
  /** Shown in the mega-menu / mobile drawer under the label. */
  hint?: string;
  children?: NavItem[];
  /**
   * Render the children as a wide panel on desktop instead of a short list.
   * The mobile drawer ignores it and lists the children as before.
   */
  mega?: {
    /** The child to feature as an image tile; matched by `href`. */
    feature: { href: string; image: string };
  };
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
    // The tile uses the image the home page already shows for this collection.
    mega: { feature: { href: '/collections/premium', image: '/images/products/hero-paintings.jpg' } },
    children: [
      // The editorial type pages, not the filtered grid: somebody opening this
      // menu is choosing what kind of thing they want, which is exactly the
      // question those pages answer.
      { label: 'Sarees', href: '/types/sarees', hint: 'Painted end to end, pallu to border' },
      { label: 'Dupattas', href: '/types/dupattas', hint: 'And chunnis, by either name' },
      { label: 'Chunnis', href: '/types/chunnis', hint: 'The same cloth, the other name' },
      { label: 'Paintings', href: '/types/paintings', hint: 'Narrative panels and framed work' },
      { label: 'Home Decor', href: '/types/home-decor', hint: 'Cushions, runners, bedspreads' },
      { label: 'Blouse Pieces', href: '/types/blouse-pieces', hint: 'Stitched or unstitched' },
      { label: 'Featured Sarees', href: '/collections/featured-sarees', hint: 'Chosen this week' },
      { label: 'Premium', href: '/collections/premium', hint: 'Signed and exhibition grade' },
      { label: 'New Arrivals', href: '/collections/new-arrivals', hint: 'Newest off the line' },
    ],
  },
  {
    label: 'The Process',
    href: '/process',
    hint: 'All 23 steps, and the seven pots',
    children: [
      /*
        "What is Kalamkari?" is the most-searched question this site can
        answer, and until now the only route to the answer was a link inside a
        section halfway down the home page — invisible to anybody who opened
        the menu instead of scrolling, which on a phone is most people. It
        points at the definition block at the head of /process rather than at a
        page of its own: a separate route would restate what /process and
        /our-story already say, and this content layer does not do that.
      */
      { label: 'What is Kalamkari?', href: '/process#what-is-kalamkari', hint: 'The word, the pen, and the two crafts that share the name' },
      { label: 'All 23 steps', href: '/process', hint: 'The full sequence, with the cloth changing as you read' },
      { label: 'The vegetable palette', href: '/process#colours', hint: 'Eight colours, and where each one comes from' },
      { label: 'The dye table', href: '/process#dyes', hint: 'The same eight, as a reference' },
    ],
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

/**
 * The phone tab bar: the five things done most often while shopping.
 *
 * Search opens the search panel rather than navigating, so it has no `href`.
 * Story, Process, Custom, Journal, Visit and Account live in the menu drawer.
 * (`MobileTabBar` holds its own copy of this list with the icon components.)
 */
export const mobileTabs = [
  { label: 'Home', href: '/', icon: 'home' },
  { label: 'Shop', href: '/shop', icon: 'grid' },
  { label: 'Search', href: null, icon: 'search' },
  { label: 'Wishlist', href: '/wishlist', icon: 'heart' },
  { label: 'Bag', href: '/cart', icon: 'bag' },
] as const;

export const footerNav = [
  {
    title: 'Shop',
    links: [
      { label: 'Sarees', href: '/types/sarees' },
      { label: 'Dupattas & Chunnis', href: '/types/dupattas' },
      { label: 'Paintings', href: '/types/paintings' },
      { label: 'Home Decor', href: '/types/home-decor' },
      { label: 'Blouse Pieces', href: '/types/blouse-pieces' },
      { label: 'Everything', href: '/shop' },
    ],
  },
  {
    title: 'Collections',
    links: [
      { label: 'Featured Sarees', href: '/collections/featured-sarees' },
      { label: 'Premium', href: '/collections/premium' },
      { label: 'New Arrivals', href: '/collections/new-arrivals' },
      { label: 'Commission a Piece', href: '/custom' },
    ],
  },
  {
    title: 'The Craft',
    links: [
      { label: 'What is Kalamkari?', href: '/process#what-is-kalamkari' },
      { label: 'The 23 Steps', href: '/process' },
      /*
        The long view of the craft, and the only link to it on the site.

        `/heritage` is deliberately not in `mainNav`, not in `exploreSections`
        and not in the mobile drawer. It is an essay rather than a place to buy
        or do something, and the header is for the latter — a nav item pointing
        at eight screens of reading competes with "Shop" and loses, or wins and
        sends somebody to an essay when they wanted a saree.

        It *is* in the sitemap. "Reachable only from the footer" is a statement
        about how the site navigates, not an instruction to hide the page from
        search — and a piece on what Srikalahasti Kalamkari is and why it
        matters is exactly the page somebody should be able to find without
        already being here.
      */
      { label: 'Heritage of Kalamkari', href: '/heritage' },
      { label: 'Our Story', href: '/our-story' },
      { label: 'Natural Dyes', href: '/process#dyes' },
      { label: 'Journal', href: '/journal' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Questions', href: '/faq' },
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
