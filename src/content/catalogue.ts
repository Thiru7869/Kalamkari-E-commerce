/**
 * The editorial layer over the catalogue.
 *
 * `/shop` is the working grid — everything, filterable, paginated. These are
 * the pages a visitor arrives on from a search engine or a link, and they have
 * a different job: say what this kind of piece *is* before offering to sell
 * one. A dupatta page that opens with twelve product cards has answered no
 * question anybody actually had.
 *
 * Nothing here invents a product. Varieties are named against the fabrics that
 * exist in the catalogue, and every count is read from the database at request
 * time rather than written down here.
 */

/* -------------------------------------------------------------------------- */
/* Narrative motifs — the commission note                                     */
/* -------------------------------------------------------------------------- */

/**
 * The four narrative traditions this workshop is asked for by name.
 *
 * These are the hardest drawing the store does: a full Ramayana pallu or a
 * Kurukshetra panel is weeks of one person's undivided attention, and because
 * nothing here is repeated from a block, the same composition is never made
 * twice. Whatever is in the store is what exists — a piece of your own is a
 * commission, not a restock.
 *
 * Surfaced on the type pages, on the collections, and in search.
 */
export const narrativeMotifs = ['ramayana', 'mahabharata', 'krishna-leela', 'tree-of-life'] as const;

export const narrativeMotifNames: Record<(typeof narrativeMotifs)[number], string> = {
  ramayana: 'Ramayana',
  mahabharata: 'Mahabharata',
  'krishna-leela': 'Krishna Leela',
  'tree-of-life': 'Tree of Life',
};

export const NARRATIVE_NOTE = {
  heading: 'The narrative pieces are drawn to order',
  body: 'Ramayana, Mahabharata, Krishna Leela and Tree of Life subjects take weeks of one person’s work, drawn freehand with no block or tracing. The same composition is never painted twice, so a piece of your own is a commission, not a restock.',
  cta: 'Start a commission',
  href: '/custom',
} as const;

/** Does this motif slug belong to the commission-first group? */
export function isNarrativeMotif(slug: string): boolean {
  return (narrativeMotifs as readonly string[]).includes(slug);
}

/* -------------------------------------------------------------------------- */
/* Collections                                                                */
/* -------------------------------------------------------------------------- */

export type CollectionDef = {
  slug: string;
  label: string;
  title: string;
  eyebrow: string;
  /** The fold. Two or three sentences, in the store's voice. */
  blurb: string;
  /** What the collection actually selects on, said plainly. */
  criterion: string;
  /** Restrict to one category, when the collection is category-specific. */
  category?: string;
  /** Which database flag or ordering drives it. */
  kind: 'featured' | 'premium' | 'new';
};

export const collectionDefs: CollectionDef[] = [
  {
    slug: 'featured-sarees',
    label: 'Featured Sarees',
    eyebrow: 'Featured',
    title: 'Featured sarees',
    blurb:
      'The sarees the family would show you first, picked for the steadiness of the outline and the way the pallu resolves.',
    criterion:
      'Sarees the store has marked as featured.',
    category: 'sarees',
    kind: 'featured',
  },
  {
    slug: 'premium',
    label: 'Premium',
    eyebrow: 'Premium',
    title: 'Premium and signed work',
    blurb:
      'Signed and exhibition-grade work: narrative pallus, dense jaal and the finest line the workshop draws.',
    criterion:
      'Pieces the store has marked as exhibition grade, in every category.',
    kind: 'premium',
  },
  {
    slug: 'new-arrivals',
    label: 'New Arrivals',
    eyebrow: 'Newest',
    title: 'New arrivals',
    blurb:
      'The most recently finished work. A saree takes weeks to complete, so each new piece is a real addition.',
    criterion: 'Everything in the store, most recently completed first.',
    kind: 'new',
  },
];

export function findCollection(slug: string): CollectionDef | undefined {
  return collectionDefs.find((c) => c.slug === slug);
}

/* -------------------------------------------------------------------------- */
/* Product types                                                              */
/* -------------------------------------------------------------------------- */

export type TypeDef = {
  slug: string;
  /** The category slug this type reads from. */
  category: string;
  label: string;
  eyebrow: string;
  title: string;
  /** The fold. */
  blurb: string;
  /** Three or four paragraphs, the substance of the page. */
  body: string[];
  /**
   * Two further sections, shown inside the same "Know more" disclosure as the
   * rest of `body`.
   *
   * They answer the two questions that actually follow "what is this" for each
   * kind of piece — usually what it costs and why, and what living with it is
   * like — which are the questions the store gets asked by email and which
   * were previously answered nowhere on the site.
   *
   * They sit behind the disclosure on purpose. These pages are read standing
   * up in a shop as often as sitting down, and the default view has to stay
   * short enough to be skimmed; somebody who wants the depth asks for it.
   */
  deepDive: { title: string; body: string }[];
  /** Which fabric families to lead the varieties section with, in order. */
  familyOrder: string[];
  /** What to tell somebody choosing between the varieties. */
  varietyNote: string;
  /** Practical facts a buyer of this type actually asks about. */
  facts: { label: string; value: string }[];
};

/**
 * Note on dupattas and chunnis.
 *
 * They are the same garment under two names — chunni is what it is called
 * across the north, dupatta across most of the rest. The store keeps them in
 * one category because splitting the stock would be a fiction. Both pages
 * exist because both words are searched for, and each says plainly that the
 * other is the same thing.
 */
export const typeDefs: TypeDef[] = [
  {
    slug: 'sarees',
    category: 'sarees',
    label: 'Sarees',
    eyebrow: 'Nine yards, drawn end to end',
    title: 'Kalamkari sarees',
    blurb:
      'A painted saree is the longest thing this workshop makes: six weeks of one person’s hand, and every line of it drawn once with a bamboo pen.',
    body: [
      'A saree is not a canvas with a border added. The body, the border and the pallu are three different problems, and they are solved in that order — the jaal that runs the length of the body has to hold a rhythm over nine yards without repeating mechanically, and the pallu has to carry a whole narrative in the space a person actually sees when the cloth is worn.',
      'The cloth decides what is possible before a pen is picked up. A tight, even weave holds a fine line; a slubbed tussar will break one, and the drawing has to be planned coarser to suit it. That is why the same motif costs differently on different cloth, and why the fabric is named on every piece in the store.',
      'Every saree here is one of one. Not as a marketing position — there is simply no device in this craft that would let a drawing be repeated, which is the difference between pen Kalamkari and the block-printed cloth sold under the same name.',
    ],
    deepDive: [
      {
        title: 'Where the price actually comes from',
        body: 'Almost none of it is the cloth. A saree is priced on how many days one person spent drawing it, and the drawing time is set by density rather than by size — a sparse jaal over nine yards is faster than a crowded pallu over two. That is why two sarees on the same tussar can differ by a factor of three, and why a narrative pallu costs what it does. The cloth, the dyes and the twenty-three operations are close to fixed; the hand is the variable.',
      },
      {
        title: 'Wearing one, and keeping it',
        body: 'It will not stay exactly as it arrived, and it is not supposed to. Natural dye settles over the first few washes — the black loses its hardest edge, the madder warms — and cotton softens until it drapes differently than it did new. Wash alone in cold water for the first three washes, dry in shade rather than sun, and refold along a different line every few months so a permanent crease never forms where the pallu is folded.',
      },
    ],
    familyOrder: ['cotton', 'silk', 'blended', 'sheer'],
    varietyNote:
      'Cotton takes the dye deepest and softens most with washing. Silk holds the finest line and the strongest colour. Blends sit between the two. Sheer cloth — Kota, organza, Chanderi — is the hardest to paint on and the lightest to wear.',
    facts: [
      { label: 'Typical length', value: '5.5–6.3 m, most with a blouse piece' },
      { label: 'Hand-work', value: '15–45 days depending on the drawing' },
      { label: 'Colours', value: 'Natural only — iron, madder, indigo, myrobalan' },
      { label: 'Care', value: 'Cold water, mild soap, dry in shade' },
    ],
  },
  {
    slug: 'dupattas',
    category: 'dupattas',
    label: 'Dupattas',
    eyebrow: 'Dupattas',
    title: 'Kalamkari dupattas',
    blurb:
      'Shorter than a saree and read at arm’s length, so the drawing has to hold up close.',
    body: [
      'A dupatta is read close up. Nobody views one across a room, so the detail has to survive being looked at from a foot away — which means the border work matters more here than on almost anything else the workshop makes.',
      'Because it is worn often, it is also washed often, and that changes what cloth suits it. Mulmul and handloom cotton soften and improve; the sheer cloths — organza, Kota, Chanderi — hold their crispness but want gentler handling.',
      'Chunni is the same garment. If that is the word you use, the chunni page says the same thing with the same stock behind it.',
    ],
    deepDive: [
      {
        title: 'Where to look to see the hand',
        body: 'A dupatta is the easiest piece in the store to check, because you read it at arm’s length. Follow a single outline along the border: a drawn line swells where the hand slowed and thins where it lifted, and a printed one holds exactly one weight from end to end. Then look at the repeat. A freehand temple border is never mechanically identical twice, and the small differences between one motif and the next are the signature — not the flaw.',
      },
      {
        title: 'How it changes with wearing',
        body: 'A dupatta is handled and washed often, so it shows its age most. Mulmul and handloom cotton improve: they soften, the colours settle a shade warmer, and the cloth starts to fall rather than sit. The sheer cloths do the opposite — organza, Kota and Chanderi keep their body and their crispness, which is why they suit occasions rather than daily wear. Neither is better; they are two different purchases.',
      },
    ],
    familyOrder: ['cotton', 'sheer', 'silk', 'blended'],
    varietyNote:
      'Cotton and mulmul for everyday wear and repeated washing. Organza, Kota and Chanderi for weight and drape. Tussar and georgette where the colour needs to sit deepest.',
    facts: [
      { label: 'Typical length', value: '2.2–2.5 m' },
      { label: 'Hand-work', value: '6–18 days' },
      { label: 'Also called', value: 'Chunni, odhni, stole' },
      { label: 'Care', value: 'Wash alone the first few times' },
    ],
  },
  {
    slug: 'chunnis',
    category: 'dupattas',
    label: 'Chunnis',
    eyebrow: 'Chunnis',
    title: 'Kalamkari chunnis',
    blurb:
      'Chunni and dupatta are one garment under two names. The pieces listed here are the same stock as the dupattas.',
    body: [
      'Across the north it is a chunni; across most of the rest of the country it is a dupatta. The store keeps them in a single category because splitting the stock into two would be a fiction, and this site does not do that.',
      'What varies is not the name but the cloth. A light mulmul chunni worn daily behaves nothing like an organza one kept for occasions, and the difference is worth more attention than the vocabulary.',
      'Everything below is the same catalogue you would see under dupattas, ordered the same way.',
    ],
    deepDive: [
      {
        title: 'Chunni, dupatta, odhni',
        body: 'One garment, three words, drawn along regional lines rather than by any difference in the cloth. Chunni is the usual word across the north, dupatta across most of the rest of the country, odhni in Rajasthan and parts of Gujarat, and stole where the piece is narrower and worn over a shoulder. Nothing in the workshop changes depending on which word you use, and the store would rather say so than invent a distinction to justify a second page.',
      },
      {
        title: 'Choosing for how often it will be worn',
        body: 'This is the only question that matters here, and it is a question about cloth. For something worn weekly, take cotton or mulmul: it will soften, forgive repeated washing, and look better in two years than it does now. For something kept for occasions, take organza, Kota or Chanderi, which hold their shape and their crispness but want a gentler hand and shade drying. Tussar and georgette sit between the two, and carry the deepest colour of anything at this length.',
      },
    ],
    familyOrder: ['cotton', 'sheer', 'silk', 'blended'],
    varietyNote:
      'Choose by how often it will be worn. Cotton and mulmul soften with every wash; sheer cloth keeps its body but wants a gentler hand.',
    facts: [
      { label: 'Typical length', value: '2.2–2.5 m' },
      { label: 'Hand-work', value: '6–18 days' },
      { label: 'Also called', value: 'Dupatta, odhni, stole' },
      { label: 'Care', value: 'Wash alone the first few times' },
    ],
  },
  {
    slug: 'paintings',
    category: 'paintings',
    label: 'Paintings',
    eyebrow: 'Paintings',
    title: 'Narrative panels and paintings',
    blurb:
      'Before Kalamkari was worn it was hung. The panels are the tradition the craft grew out of — an episode, painted to be read across a room.',
    body: [
      'Srikalahasti Kalamkari grew up serving the temple rather than the export trade. Its subjects are narrative because its purpose was narrative: a panel told a story to people standing in front of it, in registers, left to right, the way a scroll is read.',
      'That inheritance is why a panel is drawn differently from a saree. Figures carry expression at viewing distance, registers are separated by rule and border rather than by empty cloth, and the composition assumes a viewer standing still.',
      'A specific episode can be asked for by name.',
    ],
    deepDive: [
      {
        title: 'Hanging one, and what light does to it',
        body: 'Panels are sent unframed unless something else is agreed, because framing is easier to do well locally than to survive a courier. If you frame behind glass, ask for UV-filtering glass and a mount that keeps the cloth off the glazing. Then place it out of direct sun. Natural dye is light-sensitive in a way synthetic dye is not: madder and myrobalan will lift over years of afternoon sunlight, and unlike a fade in a printed piece it cannot be corrected. A wall that never takes direct sun is worth more than any treatment.',
      },
      {
        title: 'Asking for a specific episode',
        body: 'Panels suit commissioning, and naming the scene helps — the exile, the golden deer, Hanuman crossing, Kaliya subdued, the discourse at the chariot. The composition is laid out in registers to be read left to right, so the number of scenes changes the size before it changes the price. Two honest warnings, both of which are on the commission page: the monsoon stops all drying and therefore all work, and a natural dye palette is not a colour picker.',
      },
    ],
    familyOrder: ['cotton', 'silk', 'blended', 'sheer'],
    varietyNote:
      'Panels are almost always on cotton — it takes the black deepest and holds a rule line without spreading. Size is the real variable, and it changes the price more than the cloth does.',
    facts: [
      { label: 'Typical size', value: 'From 24 × 36 in to full wall panels' },
      { label: 'Hand-work', value: '20–60 days for a narrative panel' },
      { label: 'Framing', value: 'Sent unframed unless agreed otherwise' },
      { label: 'Care', value: 'Out of direct sun; natural dye is light-sensitive' },
    ],
  },
  {
    slug: 'home-decor',
    category: 'home-decor',
    label: 'Home Decor',
    eyebrow: 'Home',
    title: 'Kalamkari for the home',
    blurb:
      'Cushion covers, runners, bedspreads and hangings: cloth meant to be washed and used.',
    body: [
      'Home pieces are the most honest test of natural dye, because they are used. A runner that goes through the wash forty times will show you exactly what iron black and madder red do over years — they soften, they settle, and they stay.',
      'The drawing is planned for it. Motifs are set at a scale that survives folding and repeated washing, and the borders are drawn heavier than they would be on a dupatta so they hold up at a distance and under wear.',
      'Nothing here is finished with starch, sizing or a synthetic coating. What softens is the cloth itself.',
    ],
    deepDive: [
      {
        title: 'What survives being used',
        body: 'These are the pieces that test the dye properly, because they are washed rather than admired. Iron black and madder red are the two that hold best over years of laundering — they were fixed into the fibre by a mordant rather than sitting on top of it. Indigo softens gradually, as indigo has always done on any cloth. Nothing here is finished with starch, sizing or a synthetic coating, so what you feel soften over the first year is the cotton itself and not a finish washing out of it.',
      },
      {
        title: 'Sizing a piece to a room',
        body: 'Runners, bedspreads and panels are easy to commission in a size the store does not have finished, because the drawing scales without being redesigned. Send the measurement and, if it matters, the direction the piece will be seen from — a runner read from both long sides is composed differently from a wall panel read from one. Sold as singles or pairs, and which one is stated on every piece rather than left to be discovered at checkout.',
      },
    ],
    familyOrder: ['cotton', 'blended', 'silk', 'sheer'],
    varietyNote:
      'Cotton and linen for anything that will be washed often. Silk and blends for hangings and pieces that stay on a wall.',
    facts: [
      { label: 'Pieces', value: 'Cushion covers, table runners, bedspreads, wall panels' },
      { label: 'Hand-work', value: '5–30 days depending on size' },
      { label: 'Sold as', value: 'Singles and pairs — stated on each piece' },
      { label: 'Care', value: 'Machine-free. Cold water, mild soap, shade dry' },
    ],
  },
  {
    slug: 'blouse-pieces',
    category: 'blouses',
    label: 'Blouse Pieces',
    eyebrow: 'Blouse pieces',
    title: 'Kalamkari blouse pieces',
    blurb:
      'A metre of painted cloth, stitched or unstitched, to wear with a saree.',
    body: [
      'A blouse piece is about a metre, which changes how it is drawn: there is no room for a narrative, so the work goes into density — a tight jaal, a heavy temple border, a single motif carried well.',
      'Most are bought to go with a saree the customer already owns. If that is what you are doing, say so when you write to us and send a photograph of the saree; matching a natural dye by eye is something the family does regularly and a colour picker cannot.',
      'They are also the least expensive way to own something that went through all twenty-three steps.',
    ],
    deepDive: [
      {
        title: 'Matching one to a saree you already own',
        body: 'This is what most blouse pieces are bought for, and it is worth doing by conversation rather than by screen. Send a photograph of the saree in daylight, on a neutral surface, without a flash — natural dye photographs warmer than it looks in the hand, and a flash removes exactly the depth you are trying to match. The family does this matching regularly by eye. What cannot be done is an exact match to a synthetic colour: madder and myrobalan reach the range they reach, and a piece that has to sit against an exact machine-dyed shade is better contrasted than chased.',
      },
      {
        title: 'What the tailor needs to know',
        body: 'Pieces are sold unstitched unless the listing says otherwise, at roughly a metre — enough for a standard blouse with a conventional sleeve, and not enough to be cut carelessly. Tell the tailor that the cloth is hand-painted and that the drawing has a front: the densest work is placed where it will sit on the body rather than centred on the cloth, so the piece should be cut to the design and not to the selvedge. Pre-washing is unnecessary and best avoided before stitching.',
      },
    ],
    familyOrder: ['cotton', 'silk', 'blended', 'sheer'],
    varietyNote:
      'Silk-cotton and raw silk take the finest line at this scale. Plain cotton is the everyday choice and the most forgiving to stitch.',
    facts: [
      { label: 'Typical length', value: '0.8–1 m' },
      { label: 'Hand-work', value: '3–10 days' },
      { label: 'Supplied', value: 'Unstitched unless stated' },
      { label: 'Care', value: 'Wash before stitching' },
    ],
  },
];

export function findType(slug: string): TypeDef | undefined {
  return typeDefs.find((t) => t.slug === slug);
}

/** Human labels for the fabric families used across the varieties sections. */
export const FAMILY_LABELS: Record<string, string> = {
  cotton: 'Cotton',
  silk: 'Silk',
  blended: 'Blends',
  sheer: 'Sheer and light',
};

export const FAMILY_NOTES: Record<string, string> = {
  cotton:
    'Takes the dye deepest and softens with every wash. What most of the tradition was made on.',
  silk: 'Holds the finest line and the strongest colour. The most demanding cloth to paint.',
  blended: 'Cotton’s handling with some of silk’s depth. A practical middle.',
  sheer: 'Kota, organza, Chanderi. Hardest to paint on, lightest to wear.',
};

/** The two named collections and the commission door shown on the landing page. */
export const homeCollectionCards = [
  {
    title: 'Featured Sarees',
    blurb:
      'The pieces the family would show you first.',
    href: '/collections/featured-sarees',
    image: '/images/products/hero-sarees.jpg',
  },
  {
    title: 'Premium',
    blurb:
      'Signed and exhibition-grade work: narrative pallus and dense jaal.',
    href: '/collections/premium',
    image: '/images/products/hero-paintings.jpg',
  },
  {
    title: 'Custom Items',
    blurb:
      'Tell us the subject, the cloth and the occasion, and have it painted.',
    href: '/custom',
    image: '/images/products/hero-dupattas.jpg',
    accent: true,
  },
];
