/**
 * Generates placeholder images for every path the seed data and content files
 * reference, so a fresh clone renders with no broken images and no 404s.
 *
 * These are not stock photos — they are flat woven-texture swatches in the
 * store's dye palette, deliberately obviously synthetic so nobody mistakes
 * one for a real piece. Replace them with store photography; the paths are
 * listed in prisma/seed.ts, src/content/family.ts and the category rows.
 *
 * Written as a raw PNG encoder rather than pulling in an image library,
 * because this runs once at setup and should not add a dependency.
 *
 * Note: files ending .jpg contain PNG bytes. This is deliberate — the paths
 * are kept as .jpg so real photography can be dropped in without touching the
 * seed data, and Next's image optimiser detects format from the bytes rather
 * than the extension, so it re-encodes them correctly either way.
 *
 * Usage: node scripts/generate-placeholders.mjs
 */

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');

/* ------------------------------------------------------------------ PNG --- */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const out = Buffer.alloc(body.length + 8);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), body.length + 4);
  return out;
}

/**
 * width, height, and a (x, y) => [r, g, b] shader.
 *
 * Uses PNG filter type 2 ("Up", each byte minus the byte above it) for every
 * row after the first. Because these images change only gradually down the
 * frame, that turns almost the whole buffer into near-zero deltas and lets
 * deflate compress it to a few kilobytes — encoding unfiltered instead
 * produces files roughly a hundred times larger.
 */
function encodePng(width, height, shade) {
  const stride = width * 3;
  const raw = Buffer.alloc(height * (1 + stride));
  let prev = Buffer.alloc(stride);
  const row = Buffer.alloc(stride);
  let p = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [r, g, b] = shade(x, y);
      row[x * 3] = r;
      row[x * 3 + 1] = g;
      row[x * 3 + 2] = b;
    }

    if (y === 0) {
      raw[p] = 0; // None
      p += 1;
      row.copy(raw, p);
      p += stride;
    } else {
      raw[p] = 2; // Up
      p += 1;
      for (let i = 0; i < stride; i += 1) {
        raw[p + i] = (row[i] - prev[i]) & 0xff;
      }
      p += stride;
    }

    row.copy(prev);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering
  ihdr[12] = 0; // no interlace

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* --------------------------------------------------------------- palette --- */

const PALETTE = [
  [0xf4, 0xed, 0xe0], // cotton
  [0x8e, 0x2f, 0x22], // chay red
  [0x2c, 0x42, 0x68], // indigo
  [0xd4, 0xa3, 0x37], // myrobalan
  [0x6f, 0x4b, 0x31], // katha
  [0x3d, 0x3a, 0x35], // kasim
];

/** Deterministic per-path colour, so a piece looks the same on every rebuild. */
function hashString(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeShader(seed) {
  const ground = PALETTE[0];
  const accent = PALETTE[1 + (seed % (PALETTE.length - 1))];

  return (x, y) => {
    // Weave on an exact 4px repeat rather than an arbitrary frequency: an
    // integer period keeps rows self-similar, which is what lets the Up filter
    // and deflate do their job.
    const warp = (x & 3) < 2 ? 1 : 0;
    const weft = (y & 3) < 2 ? 1 : 0;
    const weave = (warp ^ weft) * 0.05;

    // A soft diagonal band of dye, so the swatch is not a flat rectangle.
    const band = Math.sin((x * 0.9 + y * 1.5 + (seed % 90)) * 0.018);
    const mix = Math.max(0, Math.min(1, band * 0.85 + 0.32));

    const out = [0, 0, 0];
    for (let c = 0; c < 3; c += 1) {
      const base = ground[c] * (1 - mix) + accent[c] * mix;
      // Quantise to 4-level steps: invisible at these flat tones, and it
      // collapses the number of distinct byte values deflate has to encode.
      out[c] = Math.min(255, Math.max(0, Math.round((base * (1 - weave)) / 4) * 4));
    }
    return out;
  };
}

function write(relPath, width, height) {
  const target = join(PUBLIC, relPath.replace(/^\//, ''));
  mkdirSync(dirname(target), { recursive: true });
  if (existsSync(target) && !process.argv.includes('--force')) return false;
  writeFileSync(target, encodePng(width, height, makeShader(hashString(relPath))));
  return true;
}

/* ----------------------------------------------------------------- paths --- */

const PRODUCT_SLUGS = [
  'ramayana-pallu-cotton-saree-madder', 'tree-of-life-tussar-silk-saree',
  'krishna-leela-soft-silk-saree', 'lotus-pond-indigo-chanderi-saree',
  'floral-jaal-mulmul-cotton-saree', 'dashavatara-pure-silk-saree',
  'temple-border-linen-saree', 'peacock-vine-organza-silk-saree',
  'shiva-parvati-kota-saree', 'floral-jaal-modal-silk-saree',
  'tree-of-life-cotton-silk-saree', 'mahabharata-kora-silk-saree',
  'tree-of-life-cotton-dupatta', 'peacock-vine-chanderi-dupatta',
  'lotus-pond-tussar-dupatta', 'temple-border-linen-cotton-dupatta',
  'krishna-leela-organza-dupatta', 'floral-jaal-mulmul-stole',
  'shiva-parvati-georgette-dupatta', 'temple-border-cotton-blouse-piece',
  'peacock-blouse-piece-silk-cotton', 'floral-jaal-blouse-piece-raw-silk',
  'krishna-blouse-piece-mysore-silk', 'ramayana-scroll-panel-large',
  'dashavatara-panel-framed', 'tree-of-life-wall-panel',
  'krishna-kaliya-panel-small', 'shiva-parvati-panel',
  'mahabharata-kurukshetra-panel', 'tree-of-life-cushion-cover-pair',
  'peacock-table-runner', 'floral-jaal-bedspread-double',
  'temple-border-wall-panel-pair', 'lotus-cushion-cover-single',
  'krishna-leela-wall-hanging',
];

const targets = [
  // Product views: four per piece, portrait.
  ...PRODUCT_SLUGS.flatMap((slug) =>
    [1, 2, 3, 4].map((n) => ({ path: `/images/products/${slug}-${n}.jpg`, w: 600, h: 800 })),
  ),
  // Category heroes, landscape.
  ...['sarees', 'dupattas', 'blouses', 'paintings', 'home-decor'].map((slug) => ({
    path: `/images/products/hero-${slug}.jpg`,
    w: 800,
    h: 600,
  })),
  // Family portraits.
  ...['muni-reddy', 'rajeshwari', 'muniratnamma', 'vijaya-lakshmi', 'viswanath-reddy'].map(
    (id) => ({ path: `/images/family/${id}.jpg`, w: 600, h: 750 }),
  ),
  // Journal covers.
  ...[
    'natural-dye', 'telling-the-difference', 'monsoon', 'two-traditions', 'care',
  ].map((slug) => ({ path: `/images/journal/${slug}.jpg`, w: 800, h: 500 })),
  // Store, OG images, generic fallback.
  { path: '/images/store/store-wide.jpg', w: 1200, h: 700 },
  { path: '/images/placeholder-cloth.jpg', w: 600, h: 800 },
  { path: '/images/og/default.jpg', w: 1200, h: 630 },
  { path: '/images/og/process.jpg', w: 1200, h: 630 },
  { path: '/images/og/our-story.jpg', w: 1200, h: 630 },
  // PWA icons.
  { path: '/icons/icon-192.png', w: 192, h: 192 },
  { path: '/icons/icon-512.png', w: 512, h: 512 },
  { path: '/icons/maskable-192.png', w: 192, h: 192 },
  { path: '/icons/maskable-512.png', w: 512, h: 512 },
  { path: '/favicon.ico', w: 48, h: 48 },
  // PWA store screenshots.
  { path: '/images/screenshots/mobile-home.jpg', w: 540, h: 960 },
  { path: '/images/screenshots/desktop-process.jpg', w: 960, h: 540 },
];

let written = 0;
let skipped = 0;
for (const { path, w, h } of targets) {
  if (write(path, w, h)) written += 1;
  else skipped += 1;
}

console.log(
  `Placeholders: ${written} written, ${skipped} already present (pass --force to overwrite).`,
);
console.log('Replace these with store photography — paths are set in prisma/seed.ts.');
