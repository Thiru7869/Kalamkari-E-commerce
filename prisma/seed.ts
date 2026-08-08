/**
 * Seed data for Sri Vijaya Lakshmi Fine Kalamkari Arts.
 *
 * Prices are in paise and are set in ranges that reflect real hand-painted
 * Srikalahasti work — a fully painted pure-silk saree is a five-figure object
 * because it is six weeks of one person's labour. Placeholder image paths only.
 *
 * Product copy describes what is depicted and how it was made, in the store's
 * voice. Replace with per-piece copy as real inventory is photographed.
 */

import { PrismaClient } from '@prisma/client';
import { fromList } from '../src/lib/serialize';

const prisma = new PrismaClient();

const IMG = '/images/products';

// ---------------------------------------------------------------------------

const categories = [
  {
    slug: 'sarees',
    name: 'Sarees',
    teluguName: 'చీరలు',
    tagline: 'Nine yards, drawn by hand from pallu to border.',
    description:
      'A painted saree is the largest thing this store makes and the slowest. The pallu carries the narrative, the border carries the repeat, and the body carries whatever the two have to agree on. Between fifteen and forty-five days of work, depending on how much of the field is filled.',
    heroImage: `${IMG}/hero-sarees.jpg`,
    position: 1,
    featured: true,
  },
  {
    slug: 'dupattas',
    name: 'Dupattas & Chunnis',
    teluguName: 'దుపట్టాలు',
    tagline: 'The whole vocabulary, at a scale you can wear every day.',
    description:
      'Dupattas and stoles carry the same dyes and the same pen as the sarees, over a shorter length. They are where the store experiments — a motif is often tried at this scale before it is committed to nine yards.',
    heroImage: `${IMG}/hero-dupattas.jpg`,
    position: 2,
    featured: true,
  },
  {
    slug: 'blouses',
    name: 'Blouse Pieces',
    teluguName: 'రవికెలు',
    tagline: 'Painted to sit with a saree, not to compete with it.',
    description:
      'A blouse piece has to hold its own against a painted saree without arguing with it. These are drawn with that restraint in mind — border motifs, single figures, dense small-scale work that reads well at close range.',
    heroImage: `${IMG}/hero-blouses.jpg`,
    position: 3,
  },
  {
    slug: 'paintings',
    name: 'Paintings',
    teluguName: 'చిత్రాలు',
    tagline: 'The original purpose of the craft: a story you unroll.',
    description:
      'Before Kalamkari was worn it was hung. These panels are the tradition in its oldest form — epics laid out in registers, painted to be read across a room. This is the work the store began with.',
    heroImage: `${IMG}/hero-paintings.jpg`,
    position: 4,
    featured: true,
  },
  {
    slug: 'home-decor',
    name: 'Home Decor',
    teluguName: 'గృహాలంకరణ',
    tagline: 'Cushions, runners, bedspreads and wall panels.',
    description:
      'Everyday cloth made the difficult way. Because the colour is bound into the fibre rather than sitting on it, these pieces are washable and get softer rather than duller with use.',
    heroImage: `${IMG}/hero-home-decor.jpg`,
    position: 5,
  },
];

const fabrics = [
  { slug: 'cotton', name: 'Cotton', family: 'cotton', position: 1,
    description: 'The cloth the craft was built on. Takes myrobalan and iron most reliably of anything, which is why the blacks on cotton are the deepest the store can produce.',
    careNote: 'Cold hand wash, mild soap, dry in shade. It will soften with every wash.' },
  { slug: 'handloom-cotton', name: 'Handloom Cotton', family: 'cotton', position: 2,
    description: 'Woven by hand, so the surface has a texture the pen has to be steered around. Slightly irregular, and the drawing acknowledges it.',
    careNote: 'Cold hand wash separately for the first three washes. Dry in shade.' },
  { slug: 'mulmul-cotton', name: 'Mulmul Cotton', family: 'cotton', position: 3,
    description: 'Fine, light and almost sheer. Fragile under the pen and unforgiving of a heavy hand, which limits how dense the drawing can be.',
    careNote: 'Gentle cold hand wash only. Do not wring — press the water out.' },
  { slug: 'kota', name: 'Kota', family: 'sheer', position: 4,
    description: 'An open square-grid weave. The dye moves along the grid, so motifs are drawn to sit inside it rather than across it.',
    careNote: 'Cold hand wash, no wringing, dry flat in shade.' },
  { slug: 'linen', name: 'Linen', family: 'cotton', position: 5,
    description: 'Crisp and structured, holds a drawn line cleanly and drapes with weight. Colours read slightly cooler on linen than on cotton.',
    careNote: 'Cold hand wash. Press while very slightly damp.' },
  { slug: 'linen-cotton', name: 'Linen Cotton', family: 'blended', position: 6,
    description: 'The structure of linen with the dye behaviour of cotton. A forgiving ground for large narrative work.',
    careNote: 'Cold hand wash, dry in shade.' },
  { slug: 'cotton-linen', name: 'Cotton Linen', family: 'blended', position: 7,
    description: 'Cotton-dominant blend — softer in the hand than linen, with a little more body than pure cotton.',
    careNote: 'Cold hand wash, dry in shade.' },
  { slug: 'silk-cotton', name: 'Silk Cotton', family: 'blended', position: 8,
    description: 'Cotton warp, silk weft. Cotton takes the black, silk carries the sheen — the most balanced ground in the store.',
    careNote: 'Dry clean, or careful cold hand wash with mild soap.' },
  { slug: 'cotton-silk', name: 'Cotton Silk', family: 'blended', position: 9,
    description: 'Silk-dominant blend with a soft lustre and enough cotton in it to hold a fine outline.',
    careNote: 'Dry clean recommended. Dry in shade if washed.' },
  { slug: 'silk', name: 'Silk', family: 'silk', position: 10,
    description: 'Dye sits differently on protein fibre than on cellulose: reds go warmer and deeper, and the ground takes on a faint gold.',
    careNote: 'Dry clean only. Store folded in muslin, away from light.' },
  { slug: 'pure-silk', name: 'Pure Silk', family: 'silk', position: 11,
    description: 'Heavier and denser than soft silk, with a formality the drawing can be scaled up to meet.',
    careNote: 'Dry clean only. Refold along a different line every few months.' },
  { slug: 'soft-silk', name: 'Soft Silk', family: 'silk', position: 12,
    description: 'Fluid, light, drapes closely. Suits flowing motifs — vines, water, the Tree of Life — more than rigid geometry.',
    careNote: 'Dry clean only. Store rolled rather than sharply folded.' },
  { slug: 'tussar-silk', name: 'Tussar Silk', family: 'silk', position: 13,
    description: 'Wild silk with a natural honey tone and visible slubs. The warm ground shifts every colour painted on it a shade earthier.',
    careNote: 'Dry clean only. Slubs are characteristic of the fibre, not flaws.' },
  { slug: 'raw-silk', name: 'Raw Silk', family: 'silk', position: 14,
    description: 'Textured and matte with real body. Holds bold, large-scale drawing better than fine detail.',
    careNote: 'Dry clean only.' },
  { slug: 'modal-silk', name: 'Modal Silk', family: 'blended', position: 15,
    description: 'Exceptionally soft with a quiet sheen and excellent drape. Colours read slightly muted, which suits restrained palettes.',
    careNote: 'Dry clean, or cold gentle hand wash. Dry flat in shade.' },
  { slug: 'organza', name: 'Organza', family: 'sheer', position: 16,
    description: 'Sheer and crisp. Because the ground is transparent, the drawing has to work as a line alone — there is no field to fill.',
    careNote: 'Dry clean only. Store rolled; hard creases are difficult to remove.' },
  { slug: 'organza-silk', name: 'Organza Silk', family: 'sheer', position: 17,
    description: 'Silk organza — sheer with a faint lustre. Floats away from the body and catches light through the painted areas.',
    careNote: 'Dry clean only. Store rolled.' },
  { slug: 'chanderi', name: 'Chanderi', family: 'sheer', position: 18,
    description: 'Sheer, glossy and light, with a traditional association with Kalamkari that goes back generations.',
    careNote: 'Dry clean only. Iron on low heat with a cloth between.' },
  { slug: 'georgette', name: 'Georgette', family: 'silk', position: 19,
    description: 'Crinkled surface, matte finish, fluid fall. The texture softens hard outlines slightly, which suits figurative work.',
    careNote: 'Dry clean only.' },
  { slug: 'crepe', name: 'Crepe', family: 'silk', position: 20,
    description: 'Fine grainy texture with a heavy, close drape. Colours look denser on crepe than on a flat weave.',
    careNote: 'Dry clean only.' },
  { slug: 'satin', name: 'Satin', family: 'silk', position: 21,
    description: 'High-sheen face, matte back. Light moves across the painted areas as the cloth moves.',
    careNote: 'Dry clean only. Handle with clean dry hands — satin marks easily.' },
  { slug: 'velvet', name: 'Velvet', family: 'silk', position: 22,
    description: 'Deep pile, used sparingly and mostly for panels. The pile swallows fine line, so drawing on velvet is bold by necessity.',
    careNote: 'Dry clean only. Never press — steam from a distance.' },
  { slug: 'net', name: 'Net', family: 'sheer', position: 23,
    description: 'Open mesh used for dupattas and overlays, where painted motifs are placed as isolated islands.',
    careNote: 'Dry clean only. Store flat.' },
  { slug: 'jacquard', name: 'Jacquard', family: 'blended', position: 24,
    description: 'Pattern woven into the cloth itself. The painted design has to be composed against the woven one, not on top of it.',
    careNote: 'Dry clean only.' },
  { slug: 'brocade', name: 'Brocade', family: 'silk', position: 25,
    description: 'Raised woven figuring, often with zari. Painting is confined to the plain fields between the brocade work.',
    careNote: 'Dry clean only. Store folded in muslin.' },
  { slug: 'kora-silk', name: 'Kora Silk', family: 'silk', position: 26,
    description: 'Crisp unfinished silk with a papery hand and a natural ground close to the myrobalan cream.',
    careNote: 'Dry clean only.' },
  { slug: 'mysore-silk', name: 'Mysore Silk', family: 'silk', position: 27,
    description: 'Smooth, lightweight, evenly lustrous — a plain field that gives the drawing nothing to fight.',
    careNote: 'Dry clean only. Store in muslin.' },
  { slug: 'kanjivaram-silk', name: 'Kanjivaram Silk', family: 'silk', position: 28,
    description: 'Heavy, formal, structured. Painting a Kanjivaram is a deliberate meeting of two traditions and is done only on commission.',
    careNote: 'Dry clean only. Store folded in muslin, refold periodically.' },
  { slug: 'banarasi-silk', name: 'Banarasi Silk', family: 'silk', position: 29,
    description: 'Rich silk with brocade figuring. Painted work is placed in the open ground so the two do not crowd each other.',
    careNote: 'Dry clean only. Store folded in muslin.' },
  { slug: 'pattu', name: 'Pattu', family: 'silk', position: 30,
    description: 'Traditional South Indian silk woven for occasion wear, with the weight and formality that implies.',
    careNote: 'Dry clean only. Store in muslin.' },
];

const motifs = [
  { slug: 'ramayana', name: 'Ramayana', position: 1,
    story: 'The episodes most often painted here are the ones that were performed: the exile, the golden deer, Hanuman crossing to Lanka, the return to Ayodhya. Laid out in horizontal registers to be read left to right, exactly as they were when a panel was unrolled section by section for an audience.' },
  { slug: 'mahabharata', name: 'Mahabharata', position: 2,
    story: 'Usually the Kurukshetra scenes and the discourse at the chariot. Dense with figures, and among the hardest work the store takes on, because a crowded battlefield has to stay legible at a distance.' },
  { slug: 'krishna-leela', name: 'Krishna Leela', position: 3,
    story: 'Krishna with the cows, the butter theft, Kaliya subdued, the raas. The most-requested subject in the store, and the one where the drawing is allowed to be playful rather than formal.' },
  { slug: 'tree-of-life', name: 'Tree of Life', position: 4,
    story: 'A single trunk branching to fill the whole field, hung with flowers, birds and creatures. It arrived through the export trade to Persia and Europe and stayed. It is the most flexible composition in the tradition — it can fill any shape.' },
  { slug: 'temple-border', name: 'Temple Border', position: 5,
    story: 'The stepped gopuram silhouette, repeated along an edge. Drawn freehand every time, which is why the repeat is never mechanically identical — the surest sign that a border was not blocked.' },
  { slug: 'peacock-vine', name: 'Peacock & Vine', position: 6,
    story: 'Peacocks worked into a running creeper. A traditional filler motif that carries most of the pallu work in the store, and the pattern apprentices are usually given first.' },
  { slug: 'lotus-pond', name: 'Lotus Pond', position: 7,
    story: 'Lotus in bud, half-open and full, with fish and waterfowl between. One of the few motifs where indigo does most of the work.' },
  { slug: 'dashavatara', name: 'Dashavatara', position: 8,
    story: 'The ten avatars of Vishnu, in ten panels. A formal, symmetrical subject and a traditional test of a painter — each figure must be identifiable by attribute alone.' },
  { slug: 'floral-jaal', name: 'Floral Jaal', position: 9,
    story: 'An all-over flowering lattice, no narrative. Used where the cloth has to work as cloth rather than as a picture — everyday sarees, dupattas, running fabric.' },
  { slug: 'shiva-parvati', name: 'Shiva & Parvati', position: 10,
    story: 'Painted in a town built around a Shaiva temple, so it is close to home. Usually a seated central pair framed by an arch, with attendant figures in the border.' },
];

type SeedProduct = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  category: string;
  fabric?: string;
  price: number;
  compareAtPrice?: number;
  dyes: string[];
  dimensions?: string;
  care?: string[];
  craftDays?: number;
  artisan?: string;
  motifs: string[];
  featured?: boolean;
  masterpiece?: boolean;
  stock?: number;
};

const SAREE_CARE = [
  'Dry clean recommended for silk; cold hand wash for cotton.',
  'Wash separately for the first three washes — a little unbound dye may still lift.',
  'Always dry in shade. Direct sun on a finished piece will lighten the ground.',
  'Store folded in unbleached muslin, and refold along a different line every few months.',
];

const COTTON_CARE = [
  'Cold hand wash with mild soap.',
  'Wash separately for the first three washes.',
  'Dry in shade. Do not bleach — there is nothing synthetic in this cloth for bleach to act on except the fibre itself.',
];

const products: SeedProduct[] = [
  {
    slug: 'hanuman-panel-cotton-saree',
    name: 'Hanuman Pallu Saree in Handloom Cotton',
    summary: 'A single standing figure across the pallu, drawn to read at ten paces.',
    description:
      'The pallu carries one figure rather than a sequence: Hanuman standing, the mountain in one hand, drawn at the scale the older temple cloths used so the figure resolves from across a room rather than only in the hand.\n\nThe body is a quiet myrobalan cream with a narrow kasim rule, because a pallu doing this much work needs the rest of the cloth to stay out of its way.',
    category: 'sarees',
    fabric: 'handloom-cotton',
    price: 2150000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow', 'Myrobalan cream ground'],
    dimensions: '6.3 m including blouse piece · 1.15 m width',
    care: COTTON_CARE,
    craftDays: 29,
    artisan: 'M Viswanath Reddy',
    motifs: ['temple-border'],
    featured: true,
  },
  {
    slug: 'peacock-vine-mulmul-cotton-saree',
    name: 'Peacock and Vine Saree in Mulmul Cotton',
    summary: 'A vine running the full length of the body, with a peacock at every turn.',
    description:
      'Mulmul is the softest cotton the workshop paints on and the least forgiving: the weave is open enough that a heavy hand floods the line. The drawing is kept deliberately light — a single vine travelling the length of the body, turning at intervals around a peacock.\n\nNo two of the birds are the same bird. They were drawn one after another down nine yards of cloth, by eye.',
    category: 'sarees',
    fabric: 'mulmul-cotton',
    price: 1450000,
    dyes: ['Kasim black', 'Madder red', 'Indigo', 'Myrobalan yellow'],
    dimensions: '6.3 m including blouse piece · 1.10 m width',
    care: COTTON_CARE,
    craftDays: 22,
    artisan: 'M Muniratnamma',
    motifs: ['peacock-vine', 'floral-jaal'],
  },
  {
    slug: 'lotus-jaal-chanderi-saree',
    name: 'Lotus Jaal Saree in Chanderi',
    summary: 'A dense lotus jaal on sheer Chanderi, with a doubled temple border.',
    description:
      'Chanderi is half-sheer, which changes what a jaal can be: laid too dense the cloth loses its transparency and the reason for choosing it goes with it. This one is spaced so the ground still reads through, with the weight moved into a doubled temple border along both edges.\n\nThe pinks and the deeper rose came out of one madder bath, separated only by how thickly the alum was laid underneath.',
    category: 'sarees',
    fabric: 'chanderi',
    price: 2650000,
    dyes: ['Kasim black', 'Madder red', 'Pink', 'Myrobalan cream ground'],
    dimensions: '6.3 m including blouse piece · 1.10 m width',
    care: SAREE_CARE,
    craftDays: 26,
    artisan: 'P Vijaya Lakshmi',
    motifs: ['lotus-pond', 'temple-border', 'floral-jaal'],
  },
  {
    slug: 'temple-border-tussar-dupatta',
    name: 'Temple Border Dupatta in Tussar Silk',
    summary: 'Border work only. No body motif, and nothing to distract from the line.',
    description:
      'A dupatta is read close up, so this one puts everything into the border: a stepped temple repeat in kasim black over madder, doubled at both ends and carried in a single rule along the length.\n\nThe body is left entirely open. On tussar that is not an absence — the fibre carries its own honey-gold and does the work.',
    category: 'dupattas',
    fabric: 'tussar-silk',
    price: 890000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan cream ground'],
    dimensions: '2.4 m × 1.05 m',
    care: SAREE_CARE,
    craftDays: 11,
    artisan: 'M Muniratnamma',
    motifs: ['temple-border'],
  },
  {
    slug: 'floral-jaal-cotton-chunni',
    name: 'Floral Jaal Chunni in Handloom Cotton',
    summary: 'An everyday piece, drawn to be washed often and to soften with it.',
    description:
      'Made for wear rather than for occasions: handloom cotton, a light floral jaal across the body, and a plain madder border that will hold its colour through years of washing.\n\nNaturally dyed cotton improves with use. This is the piece in the store most likely to look better in five years than it does today.',
    category: 'dupattas',
    fabric: 'handloom-cotton',
    price: 520000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow'],
    dimensions: '2.3 m × 1.0 m',
    care: COTTON_CARE,
    craftDays: 8,
    artisan: 'M Muniratnamma',
    motifs: ['floral-jaal'],
  },
  {
    slug: 'peacock-blouse-piece-raw-silk',
    name: 'Peacock Blouse Piece in Raw Silk',
    summary: 'One metre, one bird, and the densest filling this workshop does.',
    description:
      'At a metre there is no room for a narrative, so the work goes into density: a single peacock filled with hatching fine enough that the pattern only resolves when the cloth is held.\n\nRaw silk takes the finest line the workshop can draw. It is also the least forgiving — a flooded line cannot be lifted.',
    category: 'blouses',
    fabric: 'raw-silk',
    price: 480000,
    dyes: ['Kasim black', 'Madder red', 'Indigo', 'Myrobalan yellow'],
    dimensions: '1.0 m × 1.05 m',
    care: SAREE_CARE,
    craftDays: 7,
    artisan: 'P Vijaya Lakshmi',
    motifs: ['peacock-vine'],
  },
  {
    slug: 'tree-of-life-narrative-panel',
    name: 'Tree of Life Panel',
    summary: 'A wall panel drawn at the scale the old temple cloths used.',
    description:
      'A single tree rooted in a stepped border, branching to fill the whole panel, carrying birds and small creatures out towards the edges. The composition assumes a viewer standing still in front of it, which is what separates a panel from a saree.\n\nDrawn on cotton because cotton takes the black deepest and holds a rule line without spreading.',
    category: 'paintings',
    fabric: 'cotton',
    price: 3400000,
    dyes: ['Kasim black', 'Madder red', 'Indigo', 'Myrobalan yellow', 'Katha brown'],
    dimensions: '36 × 54 in',
    care: ['Hang away from direct sunlight.', 'Dust with a dry soft brush only.'],
    craftDays: 38,
    artisan: 'M Viswanath Reddy',
    motifs: ['tree-of-life'],
    masterpiece: true,
  },
  {
    slug: 'lotus-pond-table-runner',
    name: 'Lotus Pond Table Runner',
    summary: 'Drawn heavier than a dupatta, because it will be used and washed.',
    description:
      'A lotus pond running the length of the runner, with the motifs set at a scale that survives folding and repeated washing, and borders drawn heavier than they would be on a worn piece so they still read at a distance.\n\nNo starch, no sizing and no synthetic finish. What softens is the cloth itself.',
    category: 'home-decor',
    fabric: 'cotton',
    price: 420000,
    dyes: ['Kasim black', 'Madder red', 'Indigo', 'Myrobalan yellow'],
    dimensions: '180 × 40 cm',
    care: COTTON_CARE,
    craftDays: 9,
    artisan: 'M Muniratnamma',
    motifs: ['lotus-pond'],
  },
  // ---------------- Sarees ----------------
  {
    slug: 'ramayana-pallu-cotton-saree-madder',
    name: 'Ramayana Pallu Saree in Handloom Cotton',
    summary: 'Six episodes across the pallu, drawn freehand in kasim black over madder red.',
    description:
      'The pallu is given over entirely to narrative — six registers running the width of the cloth, beginning with the exile and ending with the return. The body is left mostly open in myrobalan cream so the pallu is not competing with anything, with a stepped temple border repeating along both edges.\n\nThe reds were painted as clear alum and struck in a single madder bath; the deeper maroon in the border and the lighter rose inside the figures came out of that same pot, decided days earlier by how thickly the alum was laid.',
    category: 'sarees',
    fabric: 'handloom-cotton',
    price: 1850000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow', 'Myrobalan cream ground'],
    dimensions: '6.3 m including blouse piece · 1.15 m width',
    care: COTTON_CARE,
    craftDays: 34,
    artisan: 'M Viswanath Reddy',
    motifs: ['ramayana', 'temple-border'],
    featured: true,
    masterpiece: true,
  },
  {
    slug: 'tree-of-life-tussar-silk-saree',
    name: 'Tree of Life Saree in Tussar Silk',
    summary: 'One tree, rooted in the border, branching across the full body of the cloth.',
    description:
      'A single Tree of Life takes the whole saree: the trunk rises out of the lower border and the branches spread across the body, carrying flowers, parrots and small creatures out towards the pallu. Nothing repeats.\n\nTussar carries its own honey-gold ground, which pulls every colour a shade warmer. The yellows here read almost bronze — that is the fibre, not a different dye.',
    category: 'sarees',
    fabric: 'tussar-silk',
    price: 3200000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow', 'Indigo', 'Katha brown'],
    dimensions: '6.3 m including blouse piece · 1.10 m width',
    care: SAREE_CARE,
    craftDays: 42,
    artisan: 'M Viswanath Reddy',
    motifs: ['tree-of-life'],
    featured: true,
    masterpiece: true,
  },
  {
    slug: 'krishna-leela-soft-silk-saree',
    name: 'Krishna Leela Saree in Soft Silk',
    summary: 'Krishna among the cows on the pallu, with a peacock-and-vine border.',
    description:
      'The pallu holds three scenes — the butter theft, the flute among the cows, and Kaliya subdued — with a running peacock-and-vine border that continues down both edges of the body. The body itself carries a light scattering of small motifs, spaced to sit well in the fall of the pleats.\n\nSoft silk drapes closely, so the drawing is kept fluid; there is very little hard geometry anywhere on this piece.',
    category: 'sarees',
    fabric: 'soft-silk',
    price: 2650000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow', 'Indigo'],
    dimensions: '6.3 m including blouse piece',
    care: SAREE_CARE,
    craftDays: 38,
    motifs: ['krishna-leela', 'peacock-vine'],
    featured: true,
  },
  {
    slug: 'lotus-pond-indigo-chanderi-saree',
    name: 'Lotus Pond Saree in Chanderi',
    summary: 'An indigo-led piece — lotus, fish and waterfowl, on sheer Chanderi.',
    description:
      'Most Kalamkari leans on red. This one leans on indigo, which means the cloth had to be waxed and dipped rather than painted, and every area of cream ground you can see was protected by hand before it went into the vat.\n\nLotus in three states — bud, half-open, full — with fish between them and waterfowl along the border. The greens in the leaves are indigo laid over yellow; there is no green dye in the store.',
    category: 'sarees',
    fabric: 'chanderi',
    price: 2280000,
    dyes: ['Kasim black', 'Indigo', 'Myrobalan yellow', 'Indigo over yellow (green)'],
    dimensions: '6.3 m including blouse piece',
    care: SAREE_CARE,
    craftDays: 31,
    motifs: ['lotus-pond'],
    featured: true,
  },
  {
    slug: 'floral-jaal-mulmul-cotton-saree',
    name: 'Floral Jaal Saree in Mulmul Cotton',
    summary: 'An all-over flowering lattice on fine mulmul — the everyday piece.',
    description:
      'No narrative, no pallu scene. A flowering lattice covers the whole cloth evenly, which makes this the piece to wear when you want the saree to be cloth rather than a picture.\n\nMulmul is fine enough to be difficult — a heavy hand floods the line — so the drawing is deliberately open, and it is worth knowing that a jaal at this scale still takes the same twenty-three steps as anything else here.',
    category: 'sarees',
    fabric: 'mulmul-cotton',
    price: 1150000,
    compareAtPrice: 1350000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow'],
    dimensions: '6.3 m including blouse piece',
    care: COTTON_CARE,
    craftDays: 19,
    motifs: ['floral-jaal'],
  },
  {
    slug: 'dashavatara-pure-silk-saree',
    name: 'Dashavatara Saree in Pure Silk',
    summary: 'Ten avatars in ten panels across the pallu. A formal piece.',
    description:
      'The ten avatars of Vishnu, each in its own panel across the pallu, drawn so that every figure is identifiable by attribute alone — the traditional test of whether a painter knows the subject or is copying it.\n\nOn pure silk the madder goes warmer and deeper than it does on cotton, and the ground takes on a faint gold. The border is a stepped gopuram repeat, drawn freehand forty-one times.',
    category: 'sarees',
    fabric: 'pure-silk',
    price: 4200000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow', 'Indigo', 'Katha brown'],
    dimensions: '6.3 m including blouse piece',
    care: SAREE_CARE,
    craftDays: 45,
    artisan: 'M Viswanath Reddy',
    motifs: ['dashavatara', 'temple-border'],
    masterpiece: true,
  },
  {
    slug: 'temple-border-linen-saree',
    name: 'Temple Border Saree in Linen',
    summary: 'Restrained: a wide gopuram border, an open body, nothing else.',
    description:
      'For anyone who finds full narrative work too loud to wear often. A wide stepped temple border runs the length of both edges and returns across the pallu; the body is left entirely open in myrobalan cream.\n\nLinen holds a drawn line more cleanly than almost anything, and reads slightly cooler — the reds here sit closer to brick than to rose.',
    category: 'sarees',
    fabric: 'linen',
    price: 1680000,
    dyes: ['Kasim black', 'Madder red'],
    dimensions: '6.3 m including blouse piece',
    care: COTTON_CARE,
    craftDays: 22,
    motifs: ['temple-border'],
  },
  {
    slug: 'peacock-vine-organza-silk-saree',
    name: 'Peacock & Vine Saree in Organza Silk',
    summary: 'Drawn as line alone — on a sheer ground there is no field to fill.',
    description:
      'Organza is transparent, so everything painted on it has to work as line. There is no filling in, no solid field, nowhere for a weak drawing to hide. Peacocks are worked into a running creeper along the border and up through the pallu, and the body is left almost bare.\n\nThe piece changes completely depending on what is behind it, which is the point.',
    category: 'sarees',
    fabric: 'organza-silk',
    price: 2450000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow'],
    dimensions: '6.3 m including blouse piece',
    care: ['Dry clean only.', 'Store rolled rather than folded — organza holds hard creases.'],
    craftDays: 27,
    motifs: ['peacock-vine'],
  },
  {
    slug: 'shiva-parvati-kota-saree',
    name: 'Shiva & Parvati Saree in Kota',
    summary: 'A seated pair under an arch on the pallu, on open Kota grid.',
    description:
      'Painted a short walk from the temple the subject belongs to. A seated Shiva and Parvati under an arch fill the pallu, with attendant figures worked into the border.\n\nKota is an open square-grid weave and the dye travels along that grid, so the drawing is composed to sit inside the squares rather than cut across them. This constraint shows in the slightly stepped quality of the curves — it is the weave, working as it does.',
    category: 'sarees',
    fabric: 'kota',
    price: 1420000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow'],
    dimensions: '6.3 m including blouse piece',
    care: COTTON_CARE,
    craftDays: 21,
    motifs: ['shiva-parvati'],
  },
  {
    slug: 'floral-jaal-modal-silk-saree',
    name: 'Floral Jaal Saree in Modal Silk',
    summary: 'A muted palette on exceptionally soft modal silk.',
    description:
      'Modal takes natural dye a little more quietly than cotton does — the same madder bath comes out softer here. Rather than fight that, the piece was designed for it: a fine flowering lattice in a restrained three-colour palette, with the black doing most of the structural work.\n\nThe drape is the softest of any cloth in the store.',
    category: 'sarees',
    fabric: 'modal-silk',
    price: 1780000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow'],
    dimensions: '6.3 m including blouse piece',
    care: SAREE_CARE,
    craftDays: 24,
    motifs: ['floral-jaal'],
  },
  {
    slug: 'tree-of-life-cotton-silk-saree',
    name: 'Tree of Life Saree in Cotton Silk',
    summary: 'The most balanced ground in the store — cotton takes the black, silk carries the light.',
    description:
      'Cotton warp and silk weft, which in practice means the outline strikes as deep as it does on pure cotton while the finished cloth still catches light. For a motif that depends on fine branching line, this is the ideal ground.\n\nThe tree rises from the pallu rather than the border on this piece, so it reads best when the pallu is worn over the shoulder.',
    category: 'sarees',
    fabric: 'cotton-silk',
    price: 2150000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow', 'Indigo'],
    dimensions: '6.3 m including blouse piece',
    care: SAREE_CARE,
    craftDays: 29,
    motifs: ['tree-of-life'],
  },
  {
    slug: 'mahabharata-kora-silk-saree',
    name: 'Mahabharata Saree in Kora Silk',
    summary: 'Kurukshetra across the pallu — the densest figure work in the store.',
    description:
      'A battlefield is the hardest thing to paint in this tradition, because a crowd has to stay legible. Chariots, horses and standards are arranged in three deep registers across the pallu, with the discourse at the chariot given the centre.\n\nKora silk has a papery hand and a natural ground close to the myrobalan cream, so the cloth barely shifts colour under the drawing. Six weeks of work, most of it in black.',
    category: 'sarees',
    fabric: 'kora-silk',
    price: 3850000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow', 'Katha brown'],
    dimensions: '6.3 m including blouse piece',
    care: SAREE_CARE,
    craftDays: 44,
    artisan: 'M Viswanath Reddy',
    motifs: ['mahabharata'],
    masterpiece: true,
  },

  // ---------------- Dupattas ----------------
  {
    slug: 'tree-of-life-cotton-dupatta',
    name: 'Tree of Life Dupatta in Cotton',
    summary: 'The full motif at a scale you can wear on an ordinary day.',
    description:
      'A complete Tree of Life across the length of the dupatta, with the branching reaching both ends. Cotton, so the blacks are as deep as this store can get them.\n\nThis is often where a composition is tried before it is committed to a saree.',
    category: 'dupattas',
    fabric: 'cotton',
    price: 480000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow'],
    dimensions: '2.3 m × 0.9 m',
    care: COTTON_CARE,
    craftDays: 11,
    motifs: ['tree-of-life'],
    featured: true,
  },
  {
    slug: 'peacock-vine-chanderi-dupatta',
    name: 'Peacock & Vine Dupatta in Chanderi',
    summary: 'Sheer, light, with the vine running the full length.',
    description:
      'Chanderi has a long association with Kalamkari and it is easy to see why — sheer enough to float, glossy enough to lift the yellows, stable enough to draw on. The peacock-and-vine runs the full length with a plain cream field between the borders.',
    category: 'dupattas',
    fabric: 'chanderi',
    price: 720000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow'],
    dimensions: '2.3 m × 0.9 m',
    care: ['Dry clean only.', 'Iron on low heat with a cloth between.'],
    craftDays: 13,
    motifs: ['peacock-vine'],
  },
  {
    slug: 'lotus-pond-tussar-dupatta',
    name: 'Lotus Pond Dupatta in Tussar Silk',
    summary: 'Indigo and green over a natural honey ground.',
    description:
      'Lotus and fish worked across a tussar ground, with the greens made the only way they can be — indigo laid over yellow. The wild-silk slubs interrupt the line here and there; that is the fibre, and the drawing works around it rather than pretending it is not there.',
    category: 'dupattas',
    fabric: 'tussar-silk',
    price: 940000,
    dyes: ['Kasim black', 'Indigo', 'Myrobalan yellow', 'Indigo over yellow (green)'],
    dimensions: '2.3 m × 0.9 m',
    care: ['Dry clean only.'],
    craftDays: 15,
    motifs: ['lotus-pond'],
  },
  {
    slug: 'temple-border-linen-cotton-dupatta',
    name: 'Temple Border Dupatta in Linen Cotton',
    summary: 'Borders only. The plainest thing the store makes.',
    description:
      'A stepped gopuram border along both long edges and nothing at all in between. It was made for people who want to wear the craft without wearing a scene.\n\nLook closely along the repeat: no two arches are identical, because each was drawn rather than stamped.',
    category: 'dupattas',
    fabric: 'linen-cotton',
    price: 390000,
    dyes: ['Kasim black', 'Madder red'],
    dimensions: '2.3 m × 0.9 m',
    care: COTTON_CARE,
    craftDays: 8,
    motifs: ['temple-border'],
  },
  {
    slug: 'krishna-leela-organza-dupatta',
    name: 'Krishna Leela Dupatta in Organza',
    summary: 'Isolated scenes floating on a transparent ground.',
    description:
      'Four small scenes placed along a sheer organza ground with a great deal of empty space between them. On transparent cloth, space is the composition — the scenes are positioned so they fall correctly when the dupatta is draped rather than when it is laid flat.',
    category: 'dupattas',
    fabric: 'organza',
    price: 860000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow'],
    dimensions: '2.3 m × 0.9 m',
    care: ['Dry clean only.', 'Store rolled.'],
    craftDays: 12,
    motifs: ['krishna-leela'],
  },
  {
    slug: 'floral-jaal-mulmul-stole',
    name: 'Floral Jaal Stole in Mulmul Cotton',
    summary: 'The summer piece. Light, plain-grounded, everyday.',
    description:
      'A narrow mulmul stole with an open flowering lattice. Cotton stoles like this are what sell hardest through the Andhra summer, and they are made continuously for that reason.',
    category: 'dupattas',
    fabric: 'mulmul-cotton',
    price: 265000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow'],
    dimensions: '2.0 m × 0.7 m',
    care: COTTON_CARE,
    craftDays: 6,
    motifs: ['floral-jaal'],
    stock: 3,
  },
  {
    slug: 'shiva-parvati-georgette-dupatta',
    name: 'Shiva & Parvati Dupatta in Georgette',
    summary: 'A single arched panel at each end, on fluid georgette.',
    description:
      'One arched panel at each end of the dupatta and an open field between. Georgette has a crinkled surface that softens the outline very slightly — on figurative work this reads as warmth rather than as a loss of precision.',
    category: 'dupattas',
    fabric: 'georgette',
    price: 810000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow', 'Indigo'],
    dimensions: '2.3 m × 0.9 m',
    care: ['Dry clean only.'],
    craftDays: 14,
    motifs: ['shiva-parvati'],
  },

  // ---------------- Blouses ----------------
  {
    slug: 'temple-border-cotton-blouse-piece',
    name: 'Temple Border Blouse Piece in Cotton',
    summary: 'Border-led, made to sit under a painted saree without arguing with it.',
    description:
      'An unstitched blouse piece with the gopuram border placed to fall at the sleeve and neckline once cut. Deliberately restrained — a blouse worn with a narrative saree should not be a second narrative.',
    category: 'blouses',
    fabric: 'cotton',
    price: 145000,
    dyes: ['Kasim black', 'Madder red'],
    dimensions: '0.8 m × 1.1 m, unstitched',
    care: COTTON_CARE,
    craftDays: 4,
    motifs: ['temple-border'],
    stock: 4,
  },
  {
    slug: 'peacock-blouse-piece-silk-cotton',
    name: 'Peacock Blouse Piece in Silk Cotton',
    summary: 'Dense small-scale work, drawn to be read at close range.',
    description:
      'A blouse is seen closer than a saree, so the drawing can afford to be finer. Peacocks are worked at small scale across the whole piece, with the density increased towards where the sleeve will fall.\n\nSilk cotton takes the black cleanly and keeps a quiet sheen.',
    category: 'blouses',
    fabric: 'silk-cotton',
    price: 220000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow'],
    dimensions: '0.8 m × 1.1 m, unstitched',
    care: SAREE_CARE,
    craftDays: 6,
    motifs: ['peacock-vine'],
    stock: 3,
  },
  {
    slug: 'floral-jaal-blouse-piece-raw-silk',
    name: 'Floral Jaal Blouse Piece in Raw Silk',
    summary: 'Bold lattice on textured raw silk, for plain sarees.',
    description:
      'Raw silk has real body and a matte texture that suits bold drawing more than fine detail, so the lattice here is drawn large. Made to be worn with a plain saree, where the blouse is allowed to be the painted thing.',
    category: 'blouses',
    fabric: 'raw-silk',
    price: 285000,
    dyes: ['Kasim black', 'Madder red', 'Katha brown'],
    dimensions: '0.8 m × 1.1 m, unstitched',
    care: ['Dry clean only.'],
    craftDays: 5,
    motifs: ['floral-jaal'],
    stock: 2,
  },
  {
    slug: 'krishna-blouse-piece-mysore-silk',
    name: 'Krishna Blouse Piece in Mysore Silk',
    summary: 'A single figure at the back, on an even lustrous ground.',
    description:
      'One figure of Krishna with the flute, placed so it falls at the centre back when stitched, with a fine vine at the neckline and sleeve. Mysore silk is smooth and evenly lustrous — a plain field that gives the drawing nothing to fight.',
    category: 'blouses',
    fabric: 'mysore-silk',
    price: 340000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow', 'Indigo'],
    dimensions: '0.8 m × 1.1 m, unstitched',
    care: ['Dry clean only.', 'Store in muslin.'],
    craftDays: 7,
    motifs: ['krishna-leela'],
    stock: 2,
  },

  // ---------------- Paintings ----------------
  {
    slug: 'ramayana-scroll-panel-large',
    name: 'Ramayana Scroll Panel',
    summary: 'The craft in its oldest form — an epic in registers, painted to be unrolled.',
    description:
      'Before Kalamkari was worn it was hung, and this is that work. Episodes from the Ramayana run in horizontal registers across two metres of cotton, composed to be read left to right at a distance, in the way these panels were used: unrolled section by section while the story was told aloud to people who could not read it.\n\nThis is the format the store began with, and it remains the truest expression of what the craft was for.',
    category: 'paintings',
    fabric: 'cotton',
    price: 6800000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow', 'Indigo', 'Katha brown'],
    dimensions: '200 × 110 cm, unframed',
    care: [
      'Hang away from direct sunlight. The ground was lightened by sun deliberately during making, and it will keep going if you let it.',
      'Dust with a dry soft brush only. Do not wash a finished panel.',
    ],
    craftDays: 62,
    artisan: 'M Viswanath Reddy',
    motifs: ['ramayana'],
    featured: true,
    masterpiece: true,
  },
  {
    slug: 'dashavatara-panel-framed',
    name: 'Dashavatara Panel',
    summary: 'Ten avatars in ten compartments. The traditional test of a painter.',
    description:
      'Ten compartments in two rows of five, each holding one avatar of Vishnu. The convention is strict: every figure must be identifiable by its attributes alone, without a label. Painting it well is how a Srikalahasti artist demonstrates that they know the iconography rather than the picture.',
    category: 'paintings',
    fabric: 'cotton',
    price: 3400000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow', 'Indigo'],
    dimensions: '90 × 120 cm, unframed',
    care: ['Hang away from direct sunlight.', 'Dust with a dry soft brush only.'],
    craftDays: 33,
    artisan: 'M Viswanath Reddy',
    motifs: ['dashavatara'],
    masterpiece: true,
  },
  {
    slug: 'tree-of-life-wall-panel',
    name: 'Tree of Life Wall Panel',
    summary: 'The export motif that came back and stayed.',
    description:
      'The Tree of Life reached this tradition through the old export trade to Persia and Europe, and was absorbed so completely that it now reads as entirely local. A single trunk fills the panel, hung with flowers, birds and small animals.\n\nBecause it has no narrative sequence, it is the one composition that can be scaled to any shape without breaking.',
    category: 'paintings',
    fabric: 'cotton',
    price: 2200000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow', 'Indigo'],
    dimensions: '90 × 60 cm, unframed',
    care: ['Hang away from direct sunlight.', 'Dust with a dry soft brush only.'],
    craftDays: 24,
    motifs: ['tree-of-life'],
    featured: true,
  },
  {
    slug: 'krishna-kaliya-panel-small',
    name: 'Krishna and Kaliya Panel',
    summary: 'A single scene, small format — a first piece for many buyers.',
    description:
      'Krishna dancing on the serpent Kaliya, in a compact single-scene format. Small panels like this are usually where people start, and the whole twenty-three-step sequence stands behind this one as much as behind a two-metre scroll.',
    category: 'paintings',
    fabric: 'cotton',
    price: 890000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow', 'Indigo'],
    dimensions: '45 × 60 cm, unframed',
    care: ['Hang away from direct sunlight.', 'Dust with a dry soft brush only.'],
    craftDays: 12,
    motifs: ['krishna-leela'],
  },
  {
    slug: 'shiva-parvati-panel',
    name: 'Shiva & Parvati Panel',
    summary: 'The presiding subject of the town this was painted in.',
    description:
      'A seated Shiva and Parvati beneath an arch, with attendants in the border. Srikalahasti is built around one of the oldest Shaiva temples in the south, and this subject is painted here more often, and more carefully, than anywhere else.',
    category: 'paintings',
    fabric: 'cotton',
    price: 1650000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow', 'Indigo', 'Katha brown'],
    dimensions: '75 × 55 cm, unframed',
    care: ['Hang away from direct sunlight.', 'Dust with a dry soft brush only.'],
    craftDays: 19,
    motifs: ['shiva-parvati'],
  },
  {
    slug: 'mahabharata-kurukshetra-panel',
    name: 'Kurukshetra Panel',
    summary: 'A crowded battlefield that still has to be legible at ten paces.',
    description:
      'Chariots, horses, standards and massed figures, arranged so that the eye can still find the centre — the discourse at the chariot — without effort. Density is the difficulty here; a battlefield that reads as texture rather than as figures has failed.',
    category: 'paintings',
    fabric: 'cotton',
    price: 4100000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow', 'Katha brown'],
    dimensions: '120 × 90 cm, unframed',
    care: ['Hang away from direct sunlight.', 'Dust with a dry soft brush only.'],
    craftDays: 41,
    artisan: 'M Viswanath Reddy',
    motifs: ['mahabharata'],
    masterpiece: true,
  },

  // ---------------- Home Decor ----------------
  {
    slug: 'tree-of-life-cushion-cover-pair',
    name: 'Tree of Life Cushion Covers (Pair)',
    summary: 'Two covers, hand-painted, genuinely washable.',
    description:
      'A pair of cotton cushion covers with a compact Tree of Life on each. Because the colour is bound into the fibre rather than printed onto it, these can be washed as often as any other cushion cover — they will soften and settle rather than fade patchily.\n\nThe two are not identical. They were drawn separately.',
    category: 'home-decor',
    fabric: 'cotton',
    price: 340000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow'],
    dimensions: '45 × 45 cm each, with concealed zip',
    care: COTTON_CARE,
    craftDays: 7,
    motifs: ['tree-of-life'],
    featured: true,
    stock: 5,
  },
  {
    slug: 'peacock-table-runner',
    name: 'Peacock Table Runner',
    summary: 'A running vine down two metres of handloom cotton.',
    description:
      'Peacocks in a continuous creeper down the length of the runner, with a narrow border on both edges. Handloom cotton, so the surface has texture the pen had to be steered around.',
    category: 'home-decor',
    fabric: 'handloom-cotton',
    price: 265000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow'],
    dimensions: '200 × 40 cm',
    care: COTTON_CARE,
    craftDays: 8,
    motifs: ['peacock-vine'],
    stock: 4,
  },
  {
    slug: 'floral-jaal-bedspread-double',
    name: 'Floral Jaal Bedspread',
    summary: 'A double bedspread covered edge to edge, entirely by hand.',
    description:
      'The largest everyday piece the store makes. A flowering lattice covers the full surface with a wide border on all four sides — about six square metres of drawing, every line of it made with a bamboo pen.\n\nIt is worth being clear about what that means: this is several weeks of work for something that goes on a bed.',
    category: 'home-decor',
    fabric: 'cotton',
    price: 2850000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow', 'Indigo'],
    dimensions: '270 × 230 cm',
    care: COTTON_CARE,
    craftDays: 36,
    motifs: ['floral-jaal'],
  },
  {
    slug: 'temple-border-wall-panel-pair',
    name: 'Temple Border Wall Panels (Pair)',
    summary: 'Two narrow hanging panels, for either side of a doorway.',
    description:
      'Narrow vertical panels with a stepped gopuram repeat, made to hang either side of a doorway or shrine. They are drawn as a pair and are mirrored rather than identical.',
    category: 'home-decor',
    fabric: 'cotton',
    price: 720000,
    dyes: ['Kasim black', 'Madder red'],
    dimensions: '150 × 35 cm each',
    care: ['Dust with a dry soft brush.', 'Hang away from direct sunlight.'],
    craftDays: 13,
    motifs: ['temple-border'],
    stock: 2,
  },
  {
    slug: 'lotus-cushion-cover-single',
    name: 'Lotus Cushion Cover',
    summary: 'Indigo-led, single cover.',
    description:
      'A single lotus in indigo and green on a cream ground. The green is indigo over yellow — two separate stages, days apart — which is a considerable amount of process for one cushion, and exactly why it looks the way it does.',
    category: 'home-decor',
    fabric: 'cotton',
    price: 175000,
    dyes: ['Kasim black', 'Indigo', 'Myrobalan yellow', 'Indigo over yellow (green)'],
    dimensions: '45 × 45 cm, with concealed zip',
    care: COTTON_CARE,
    craftDays: 4,
    motifs: ['lotus-pond'],
    stock: 6,
  },
  {
    slug: 'krishna-leela-wall-hanging',
    name: 'Krishna Leela Wall Hanging',
    summary: 'Four scenes in a square, with rod pocket.',
    description:
      'Four scenes from the Krishna stories arranged in a square, finished with a rod pocket at the top so it can be hung without framing. Framing behind glass is an option but not required — this cloth was always meant to hang free.',
    category: 'home-decor',
    fabric: 'cotton',
    price: 1240000,
    dyes: ['Kasim black', 'Madder red', 'Myrobalan yellow', 'Indigo'],
    dimensions: '90 × 90 cm',
    care: ['Dust with a dry soft brush.', 'Hang away from direct sunlight.'],
    craftDays: 17,
    motifs: ['krishna-leela'],
  },
];

const blogPosts = [
  {
    slug: 'why-natural-dye-is-slower-and-why-we-keep-doing-it',
    title: 'Why natural dye is slower, and why we keep doing it',
    excerpt:
      'A chemical red takes an afternoon. Ours takes four days and a boiling pot, and the difference is not romance — it is where the colour ends up.',
    body: `Someone asks this in the store most weeks, usually politely: if the finished cloth looks similar, why go the long way?

The honest answer is that it does not look similar for very long.

## Where the colour sits

A synthetic dye is, for the most part, a pigment persuaded to stay on the surface of a fibre with the help of a fixing agent. It is fast because it does not have to do anything difficult. It fades the way surface things fade — evenly, and from the outside in.

What happens here is different in kind, not degree. The black is a chemical reaction between iron dissolved in fermented liquor and tannin that has been sitting inside the fibre since step four. The compound forms *in* the cloth. There is nothing to rub off, because nothing was ever laid on.

The reds are stranger still. The artist never touches a red pigment. They paint with a clear alum solution onto cream cloth, and days later the whole thing goes into a boiling madder bath, where the dye binds only where the alum went. Everything else washes out.

## The cost

Four extra days for one colour. Three weeks of fermentation before the black will strike at all. Up to twenty cycles of washing and sun-drying, most of which exist to *remove* colour that did not bind. A monsoon that stops production entirely, because none of it works without sun to dry between stages.

That is the real price, and we are not going to pretend it is anything other than inconvenient.

## What you get for it

A ground that was never bleached — the cream is the myrobalan nut, and it stays. Colours that deepen in the first year rather than dulling. Cloth with no starch, no finish and no sizing in it, which is why a good Kalamkari cotton feels better after five washes than it did new.

And one thing that is harder to argue for but matters most: the drawing was made once, by a person, at the speed a hand moves. That is visible, and it is the only thing in this process that cannot be reproduced by a faster method.`,
    coverImage: '/images/journal/natural-dye.jpg',
    author: 'Sri Vijaya Lakshmi Fine Kalamkari Arts',
    tags: ['Natural dye', 'Process', 'Craft'],
    readMinutes: 5,
  },
  {
    slug: 'how-to-tell-hand-painted-kalamkari-from-a-print',
    title: 'How to tell hand-painted Kalamkari from a print',
    excerpt:
      'Five things to look at before you buy, none of which require you to trust the seller — including us.',
    body: `Most cloth sold as "Kalamkari" today is screen-printed, and a good print is convincing in a photograph. Here is how to check in person, without taking anyone's word for it.

## 1. Look at the repeat in the border

This is the fastest test. On a printed or block-printed border, every repeat is identical, because it came off the same screen or the same block. On a hand-drawn border, the repeats are *nearly* identical — and the small drifts in spacing and proportion are unmistakable once you know to look.

Perfect repetition is evidence against hand painting, not for it.

## 2. Turn the cloth over

Because the colour in real Kalamkari is bound into the fibre rather than sitting on it, it penetrates. The reverse of a hand-painted piece shows the design clearly, if a little softer. A surface print shows a pale ghost, or nothing.

## 3. Look at the black under good light

Natural iron black is not a flat black. It is warm, slightly uneven, and varies in density along a stroke as the pen ran dry and was recharged. A printed black is uniform.

## 4. Check the ground colour

Hand-dyed Kalamkari sits on a myrobalan cream — a warm, slightly irregular off-white. If the ground is a bright, even, optically-brightened white, the cloth has been treated with something that did not come out of a pot.

## 5. Look at the yellow

Natural yellow from myrobalan flower or pomegranate rind is a soft mustard-gold. It does not go bright. A vivid lemon or acid yellow in a piece sold as natural-dyed is the single clearest tell there is.

## And one non-test

Price alone proves nothing in either direction. Handwork is expensive to make, but an expensive price tag is easy to print. Use your eyes.`,
    coverImage: '/images/journal/telling-the-difference.jpg',
    author: 'Sri Vijaya Lakshmi Fine Kalamkari Arts',
    tags: ['Buying guide', 'Craft', 'Authenticity'],
    readMinutes: 4,
  },
  {
    slug: 'the-monsoon-stops-everything',
    title: 'The monsoon stops everything',
    excerpt:
      'Why we cannot promise delivery dates between June and September, explained honestly.',
    body: `Every stage of this process ends with the cloth going into the sun. Not as a preference — as a step.

The myrobalan bath is followed by sun. The black is followed by washing and sun. The madder bath is followed by many rounds of washing and sun. The yellow is fixed by sun and air. The final finishing is up to twenty cycles of washing and sun.

When it rains for three days, none of that happens. Work stops where it is, half-painted cloth waits, and nothing can be hurried by putting it indoors, because indoor drying does not do what sunlight does. Sun bleaches the unbound colour out of the ground while leaving the bound colour alone. That difference is where the contrast in a finished piece comes from.

## What this means for an order

If you order a piece that is already finished, none of this affects you. It is done, and it ships.

If you commission something, the timeline we give you in July is less reliable than the one we give you in January, and we would rather say so up front than quietly miss a date.

May and June are quiet months for selling here, and the rains follow. It is a seasonal craft in the most literal sense: it depends on weather in the way farming does.`,
    coverImage: '/images/journal/monsoon.jpg',
    author: 'Sri Vijaya Lakshmi Fine Kalamkari Arts',
    tags: ['Store', 'Process', 'Seasons'],
    readMinutes: 3,
  },
  {
    slug: 'srikalahasti-and-machilipatnam-are-not-the-same-craft',
    title: 'Srikalahasti and Machilipatnam are not the same craft',
    excerpt:
      'One is drawn with a pen. One is printed with a block. Both are called Kalamkari, and the confusion costs both of them.',
    body: `Two towns in Andhra Pradesh make something called Kalamkari. They are not variants of one thing.

## Machilipatnam

Block-printed. A design is carved into a wooden block, and the block is used to repeat it across the cloth. It is an old, skilled and legitimate craft with its own history, largely oriented towards Persian-influenced floral and geometric pattern, and it can cover a lot of cloth beautifully and relatively quickly.

## Srikalahasti

Drawn. Every line is made freehand with a bamboo pen, once, with no tracing and no repetition device of any kind. It grew up serving the temple rather than the export trade, which is why the subjects are narrative — epics, deities, stories meant to be read.

That difference in origin explains the difference in technique. You cannot carve a block for a scene that occurs once. Narrative work has to be drawn.

## Why the confusion matters

When "Kalamkari" means both, the market price settles towards the faster of the two, and then towards screen prints imitating the faster of the two. The slowest craft in the category ends up competing on price with a machine.

Srikalahasti Kalamkari holds a registered Geographical Indication, which helps. But the practical protection is people knowing the difference — which is why we would rather explain it than let you assume.`,
    coverImage: '/images/journal/two-traditions.jpg',
    author: 'Sri Vijaya Lakshmi Fine Kalamkari Arts',
    tags: ['Heritage', 'Craft', 'Andhra Pradesh'],
    readMinutes: 4,
  },
  {
    slug: 'caring-for-natural-dyed-cloth',
    title: 'Caring for naturally dyed cloth',
    excerpt:
      'Short version: cold water, mild soap, shade. Long version: why each of those three matters.',
    body: `Naturally dyed cloth is not delicate, but it responds to a few things differently from a synthetic print. All three rules below follow from how the colour got there.

## Cold water

Hot water opens the fibre and encourages anything not firmly bound to leave. In the first few washes there is always a little unbound dye left, however thoroughly the piece was finished. Cold water keeps it where it is.

## Mild soap, and never bleach

Strong alkaline detergent shifts the pH and can dull madder reds noticeably. Bleach has nothing synthetic to attack in this cloth, so it goes for the fibre and the dye directly.

## Dry in shade

This is the one that surprises people, since the piece was made in full sun. But sun was used deliberately, during making, to lighten the *ground*. A finished piece left in the sun keeps doing that, and the contrast you paid for slowly flattens.

## Washing separately, at first

For the first three washes, wash the piece on its own. After that it behaves like any other cotton or silk.

## Storing

Fold in unbleached muslin rather than plastic — the cloth needs to breathe. Refold along a different line every few months so a permanent crease does not set. Sheer pieces such as organza should be rolled rather than folded at all.

## What you should expect over time

Cotton will soften with every wash, and get better in the hand for several years. The reds will settle slightly deeper in the first year. The black will not move. That is the whole point of iron black.`,
    coverImage: '/images/journal/care.jpg',
    author: 'Sri Vijaya Lakshmi Fine Kalamkari Arts',
    tags: ['Care', 'Practical'],
    readMinutes: 4,
  },
];

// ---------------------------------------------------------------------------

async function main() {
  console.log('Seeding Sri Vijaya Lakshmi Fine Kalamkari Arts…');

  // Order matters: children before parents.
  await prisma.orderEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productMotif.deleteMany();
  await prisma.product.deleteMany();
  await prisma.motif.deleteMany();
  await prisma.fabric.deleteMany();
  await prisma.category.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.commissionRequest.deleteMany();

  for (const c of categories) {
    await prisma.category.create({ data: c });
  }
  console.log(`  ${categories.length} categories`);

  for (const f of fabrics) {
    await prisma.fabric.create({ data: f });
  }
  console.log(`  ${fabrics.length} fabrics`);

  for (const m of motifs) {
    await prisma.motif.create({ data: m });
  }
  console.log(`  ${motifs.length} motifs`);

  const categoryIds = new Map(
    (await prisma.category.findMany({ select: { id: true, slug: true } })).map((c) => [c.slug, c.id]),
  );
  const fabricIds = new Map(
    (await prisma.fabric.findMany({ select: { id: true, slug: true } })).map((f) => [f.slug, f.id]),
  );
  const motifIds = new Map(
    (await prisma.motif.findMany({ select: { id: true, slug: true } })).map((m) => [m.slug, m.id]),
  );

  for (const p of products) {
    const categoryId = categoryIds.get(p.category);
    if (!categoryId) throw new Error(`Unknown category "${p.category}" on product ${p.slug}`);

    await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        summary: p.summary,
        description: p.description,
        categoryId,
        fabricId: p.fabric ? fabricIds.get(p.fabric) : undefined,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        // Four placeholder views per piece: full, detail, reverse, in-use.
        images: fromList([
          `${IMG}/${p.slug}-1.jpg`,
          `${IMG}/${p.slug}-2.jpg`,
          `${IMG}/${p.slug}-3.jpg`,
          `${IMG}/${p.slug}-4.jpg`,
        ]),
        naturalDyes: fromList(p.dyes),
        dimensions: p.dimensions,
        careNotes: fromList(p.care ?? []),
        craftDays: p.craftDays,
        artisan: p.artisan,
        stock: p.stock ?? 1,
        featured: p.featured ?? false,
        masterpiece: p.masterpiece ?? false,
        motifs: {
          create: p.motifs
            .map((slug) => motifIds.get(slug))
            .filter((id): id is string => Boolean(id))
            .map((motifId) => ({ motifId })),
        },
      },
    });
  }
  console.log(`  ${products.length} products`);

  for (const post of blogPosts) {
    await prisma.blogPost.create({
      data: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        body: post.body,
        coverImage: post.coverImage,
        author: post.author,
        tags: fromList(post.tags),
        readMinutes: post.readMinutes,
        published: true,
      },
    });
  }
  console.log(`  ${blogPosts.length} journal entries`);

  // An admin account so the dashboard is reachable immediately. Sign in with
  // this address using the email provider; there is no password to leak.
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: { email: adminEmail, name: 'Store Admin', role: 'ADMIN' },
  });
  console.log(`  admin user: ${adminEmail}`);

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
