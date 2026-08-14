/**
 * Contrast checker for the theme tokens.
 *
 * The palette in `globals.css` is written in HSL and read by humans, which
 * makes it very easy to change a lightness by four points and take a heading
 * below AA without anything failing. This prints the ratio for every pair that
 * actually appears on the page, so a palette change is a measurement rather
 * than a preference.
 *
 *   node scripts/contrast.mjs
 *
 * Exits non-zero if any pair marked `min` misses its target.
 */

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

function luminance([r, g, b]) {
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Composite `fg` over `bg` at alpha `a`, then measure. Low-alpha text is text. */
function over(fg, bg, a) {
  return fg.map((c, i) => c * a + bg[i] * (1 - a));
}

function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

const hsl = (str) => {
  const [h, s, l] = str.split(/\s+/).map((v) => parseFloat(v));
  return hslToRgb(h, s, l);
};

const THEMES = {
  light: {
    background: '42 45% 96%',
    card: '40 50% 98%',
    foreground: '28 16% 11%',
    'muted-foreground': '30 14% 32%',
    muted: '40 30% 90%',
    primary: '6 70% 34%',
    accent: '214 48% 28%',
    gold: '38 68% 34%',
    success: '82 30% 25%',
    border: '36 26% 74%',
  },
  dark: {
    background: '217 38% 7%',
    card: '216 30% 11%',
    foreground: '40 34% 93%',
    'muted-foreground': '38 22% 74%',
    muted: '215 24% 16%',
    primary: '9 66% 63%',
    accent: '205 52% 68%',
    gold: '44 76% 64%',
    success: '82 32% 62%',
    border: '214 20% 26%',
  },
};

/** [foreground token, background token, minimum, what it is] */
const PAIRS = [
  ['foreground', 'background', 4.5, 'body copy on the page'],
  ['foreground', 'card', 4.5, 'body copy on a card'],
  ['foreground', 'muted', 4.5, 'body copy on a muted panel'],
  ['muted-foreground', 'background', 4.5, 'secondary copy — most of the site'],
  ['muted-foreground', 'card', 4.5, 'secondary copy on a card'],
  ['muted-foreground', 'muted', 4.5, 'secondary copy on a muted panel'],
  ['primary', 'background', 4.5, 'links and prices'],
  ['primary', 'card', 4.5, 'links and prices on a card'],
  ['accent', 'background', 4.5, 'the indigo counterpart'],
  ['gold', 'background', 4.5, 'the pointing colour'],
  ['gold', 'card', 4.5, 'the pointing colour on a card'],
  ['success', 'background', 4.5, 'in stock / confirmed'],
  ['success', 'card', 4.5, 'in stock / confirmed on a card'],
  ['border', 'background', 1.6, 'a rule you can actually see'],
  ['border', 'card', 1.4, 'a rule on a card'],
];

let failed = 0;

for (const [theme, tokens] of Object.entries(THEMES)) {
  console.log(`\n  ${theme.toUpperCase()}`);
  console.log('  ' + '-'.repeat(72));
  for (const [fg, bg, min, label] of PAIRS) {
    const r = ratio(hsl(tokens[fg]), hsl(tokens[bg]));
    const ok = r >= min;
    if (!ok) failed += 1;
    console.log(
      `  ${ok ? 'ok  ' : 'FAIL'}  ${r.toFixed(2).padStart(6)}:1  (min ${min})  ${fg} on ${bg} — ${label}`,
    );
  }

  // The alpha'd variants that carry real words on this site.
  console.log('  ' + '-'.repeat(72));
  for (const a of [0.9, 0.8, 0.75, 0.7]) {
    const r = ratio(over(hsl(tokens.foreground), hsl(tokens.background), a), hsl(tokens.background));
    const ok = r >= 4.5;
    if (!ok) failed += 1;
    console.log(
      `  ${ok ? 'ok  ' : 'FAIL'}  ${r.toFixed(2).padStart(6)}:1  (min 4.5)  foreground/${a * 100} on background`,
    );
  }
}

console.log('');
if (failed) {
  console.error(`  ${failed} pair(s) below target.\n`);
  process.exit(1);
}
console.log('  All pairs meet their target.\n');
