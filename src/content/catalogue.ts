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
  body: 'Ramayana, Mahabharata, Krishna Leela and the Tree of Life are the hardest drawing this workshop does — weeks of one person’s undivided attention, set out freehand with no block and no tracing. Whatever is in the store is what exists. The same composition is never painted twice, so a piece of your own is a commission rather than a restock.',
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
    eyebrow: 'Chosen this week',
    title: 'Featured sarees',
    blurb:
      'The sarees the family would put in your hands first. Chosen for the drawing — the steadiness of the outline, the way a pallu resolves — and not for the margin.',
    criterion:
      'Sarees currently marked featured by the store. The selection changes as work comes off the line.',
    category: 'sarees',
    kind: 'featured',
  },
  {
    slug: 'premium',
    label: 'Premium',
    eyebrow: 'Signed and exhibition grade',
    title: 'Premium and signed work',
    blurb:
      'Signed pieces, award-lineage work, and the ones that simply took a month of somebody’s undivided attention. Narrative pallus, dense jaal, the finest line this workshop draws.',
    criterion:
      'Pieces the store has marked as exhibition grade, across every category — a panel qualifies on the same terms as a saree.',
    kind: 'premium',
  },
  {
    slug: 'new-arrivals',
    label: 'New Arrivals',
    eyebrow: 'Off the line',
    title: 'New arrivals',
    blurb:
      'The most recent work to finish its twentieth washing. On a catalogue where a saree takes six weeks, "new" means something — these are pieces that did not exist in the spring.',
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
    eyebrow: 'The piece people wear most',
    title: 'Kalamkari dupattas',
    blurb:
      'Shorter than a saree and far more worn. A dupatta is where most people meet this craft for the first time, and where the drawing has to work at arm’s length.',
    body: [
      'A dupatta is read close up. Nobody views one across a room, so the detail has to survive being looked at from a foot away — which means the border work matters more here than on almost anything else the workshop makes.',
      'Because it is worn often, it is also washed often, and that changes what cloth suits it. Mulmul and handloom cotton soften and improve; the sheer cloths — organza, Kota, Chanderi — hold their crispness but want gentler handling.',
      'Chunni is the same garment. If that is the word you use, the chunni page says the same thing with the same stock behind it.',
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
    eyebrow: 'The same cloth, the other name',
    title: 'Kalamkari chunnis',
    blurb:
      'Chunni and dupatta are one garment under two names. This page exists because both words are searched for — the stock behind it is the same, and the store has never pretended otherwise.',
    body: [
      'Across the north it is a chunni; across most of the rest of the country it is a dupatta. The store keeps them in a single category because splitting the stock into two would be a fiction, and this site does not do that.',
      'What varies is not the name but the cloth. A light mulmul chunni worn daily behaves nothing like an organza one kept for occasions, and the difference is worth more attention than the vocabulary.',
      'Everything below is the same catalogue you would see under dupattas, ordered the same way.',
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
    eyebrow: 'The old work',
    title: 'Narrative panels and paintings',
    blurb:
      'Before Kalamkari was worn it was hung. The panels are the tradition the craft grew out of — an episode, painted to be read across a room.',
    body: [
      'Srikalahasti Kalamkari grew up serving the temple rather than the export trade. Its subjects are narrative because its purpose was narrative: a panel told a story to people standing in front of it, in registers, left to right, the way a scroll is read.',
      'That inheritance is why a panel is drawn differently from a saree. Figures carry expression at viewing distance, registers are separated by rule and border rather than by empty cloth, and the composition assumes a viewer standing still.',
      'These are the pieces most often commissioned, and the ones where a specific episode can be asked for by name.',
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
    eyebrow: 'Cloth that gets used',
    title: 'Kalamkari for the home',
    blurb:
      'Cushion covers, runners, bedspreads and hangings. The pieces that get washed, sat on, and softened into a house rather than kept for occasions.',
    body: [
      'Home pieces are the most honest test of natural dye, because they are used. A runner that goes through the wash forty times will show you exactly what iron black and madder red do over years — they soften, they settle, and they stay.',
      'The drawing is planned for it. Motifs are set at a scale that survives folding and repeated washing, and the borders are drawn heavier than they would be on a dupatta so they hold up at a distance and under wear.',
      'Nothing here is finished with starch, sizing or a synthetic coating. What softens is the cloth itself.',
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
    eyebrow: 'Painted to match, or to contrast',
    title: 'Kalamkari blouse pieces',
    blurb:
      'A metre of painted cloth, stitched or unstitched. The smallest way into the craft, and the piece most often bought to sit against a saree that already exists.',
    body: [
      'A blouse piece is about a metre, which changes how it is drawn: there is no room for a narrative, so the work goes into density — a tight jaal, a heavy temple border, a single motif carried well.',
      'Most are bought to go with a saree the customer already owns. If that is what you are doing, say so when you write to us and send a photograph of the saree; matching a natural dye by eye is something the family does regularly and a colour picker cannot.',
      'They are also the least expensive way to own something that went through all twenty-three steps.',
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
