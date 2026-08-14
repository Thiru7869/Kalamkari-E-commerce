/**
 * Does the ink chosen for each flooded colour actually read on it?
 *
 * `TwoCrafts` floods the whole section with a dye's real hex and then sets
 * every word in it from one stated `ink` value — `light` or `dark`. That value
 * is written by hand rather than computed, and deliberately so: a luminance
 * test calls myrobalan gold "bright" and picks white for it, which is wrong.
 *
 * Hand-written means unverified, though, and the component uses four opacities
 * of that ink (100 / 85 / 70 / 60 for light, 100 / 75 / 65 / 55 for dark). This
 * checks every one of them against the real ground, so a colour whose body copy
 * fails at 75% cannot ship looking fine in a screenshot of its heading.
 *
 *   node scripts/ink-check.mjs
 */
import { readFileSync } from 'node:fs';

const src = readFileSync('src/content/process.ts', 'utf8');

/* Pull the (name, hex, ink) triples straight out of the content file, so this
   can never drift from what the page actually renders. */
const stories = [];
const re =
  /name:\s*'([^']+)'[\s\S]{0,400}?hex:\s*'(#[0-9A-Fa-f]{6})'[\s\S]{0,200}?ink:\s*'(light|dark)'/g;
let m;
while ((m = re.exec(src))) stories.push({ name: m[1], hex: m[2], ink: m[3] });

/* The Best Works grounds, checked the same way and against the same ladder.
   These take no veil — they are chosen rather than sampled from a dye, so a
   ground that needs one is simply the wrong ground and should be changed. */
const groundsSrc = readFileSync('src/content/best-works.ts', 'utf8');
const groundRe =
  /hex:\s*'(#[0-9A-Fa-f]{6})',\s*ink:\s*'(light|dark)',\s*note:\s*'([^']+)'/g;
const grounds = [];
while ((m = groundRe.exec(groundsSrc))) {
  grounds.push({ name: m[3], hex: m[1], ink: m[2], noVeil: true });
}

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const lum = (c) => {
  const f = (x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const over = (fg, bg, a) => fg.map((c, i) => c * a + bg[i] * (1 - a));

/* The exact tone ladder in two-crafts.tsx. `strong` is display type and is
   allowed the large-text 3:1 floor; the rest carry body copy and need 4.5:1. */
/** Must match the `tone` ladder and `FLOOD_VEIL` in two-crafts.tsx. */
const FLOOD_VEIL = 0.07;

const LADDER = {
  light: [
    ['strong  (text-white)', 1, 3.0],
    ['body    (white/.92)', 0.92, 4.5],
    ['quiet   (white/.84)', 0.84, 4.5],
    ['faint   (white/.76)', 0.76, 4.5],
  ],
  dark: [
    ['strong  (text-black)', 1, 3.0],
    ['body    (black/.90)', 0.9, 4.5],
    ['quiet   (black/.82)', 0.82, 4.5],
    ['faint   (black/.74)', 0.74, 4.5],
  ],
};

let failures = 0;

function check(items, title) {
  console.log(`\n  ${title} (${items.length})\n`);
  for (const s of items) {
    // The dye floods are painted through a veil; the Best Works grounds are
    // painted as written. Measure whichever the page actually paints.
    const raw = rgb(s.hex);
    const towards = s.ink === 'dark' ? 1 : 0;
    const veil = s.noVeil ? 0 : FLOOD_VEIL;
    const bg = raw.map((c) => c * (1 - veil) + towards * veil);
    const ink = s.ink === 'light' ? [1, 1, 1] : [0, 0, 0];

    const rows = LADDER[s.ink].map(([label, alpha, min]) => {
      const r = ratio(over(ink, bg, alpha), bg);
      const ok = r >= min;
      if (!ok) failures += 1;
      return `      ${ok ? 'ok  ' : 'FAIL'} ${r.toFixed(2).padStart(6)}:1 (min ${min})  ${label}`;
    });
    console.log(`  ${s.name.padEnd(20)} ${s.hex}  ink=${s.ink}`);
    console.log(rows.join('\n'));
  }
}

check(stories, 'Flooded dye colours — TwoCrafts');
check(grounds, 'Mounted grounds — Best Works');

console.log('');
if (failures) {
  console.error(`  ${failures} tone(s) below target.\n`);
  process.exit(1);
}
console.log('  Every tone on every ground meets its target.\n');
