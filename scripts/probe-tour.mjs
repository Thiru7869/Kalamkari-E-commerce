/**
 * Measures the quick-tour card's box and its computed transform.
 *
 *   node scripts/probe-tour.mjs 390
 */
import { chromium } from 'playwright';

const WIDTH = Number(process.argv[2] || 390);
const BASE = process.argv[3] || 'http://localhost:3000';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: WIDTH, height: 844 },
  isMobile: true,
  hasTouch: true,
});
// Everything before the tour marked seen, so the tour is what renders.
await context.addInitScript(() => {
  try {
    sessionStorage.setItem('svl_intro_preloader', '1');
    sessionStorage.setItem('svl_intro_welcome', '1');
    localStorage.setItem('svl_announce', '1');
  } catch {}
});

const page = await context.newPage();
try {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 45000 });
} catch {}
await page.waitForSelector('[role="dialog"][aria-label="Quick tour"]', { timeout: 15000 });
// Let `rise-in` finish — the bug only appears once the animation's final
// transform has been committed by `animation-fill-mode: forwards`.
await page.waitForTimeout(1600);

const out = await page.evaluate(() => {
  const el = document.querySelector('[role="dialog"][aria-label="Quick tour"]');
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const de = document.documentElement;
  return {
    viewport: de.clientWidth,
    left: Math.round(r.left),
    right: Math.round(r.right),
    width: Math.round(r.width),
    overhang: Math.round(r.right - de.clientWidth),
    transform: cs.transform,
    docOverflow: de.scrollWidth - de.clientWidth,
  };
});

console.log(`viewport            ${out.viewport}px`);
console.log(`card left/right     ${out.left} → ${out.right}  (width ${out.width})`);
console.log(`overhang past edge  ${out.overhang}px  ${out.overhang > 0 ? '<-- BROKEN' : 'ok'}`);
console.log(`computed transform  ${out.transform}`);
console.log(`document overflow   ${out.docOverflow}px`);

await browser.close();
process.exit(out.overhang > 0 ? 1 : 0);
