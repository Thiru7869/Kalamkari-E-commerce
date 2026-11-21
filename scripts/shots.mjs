/**
 * Capture full-page screenshots of routes at chosen widths, for looking at
 * rather than measuring. Companion to audit-layout.mjs.
 *
 *   node scripts/shots.mjs --width=390 --routes=/,/archive --out=.shots
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const arg = (n, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${n}=`));
  return hit ? hit.slice(n.length + 3) : d;
};

const BASE = arg('base', 'http://localhost:3000').replace(/\/$/, '');
const WIDTH = Number(arg('width', '390'));
const OUT = arg('out', '.shots');
const FULL = arg('full', 'true') === 'true';
const ROUTES = arg('routes', '/,/archive,/process,/our-story').split(',');

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: WIDTH, height: 844 },
  deviceScaleFactor: 2,
  isMobile: WIDTH < 768,
  hasTouch: WIDTH < 768,
});
await context.addInitScript(() => {
  try {
    localStorage.setItem('svl_announce', '1');
  } catch {}
});

const page = await context.newPage();
for (const route of ROUTES) {
  try {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 });
  } catch {
    /* layout has resolved even if a connection stays open */
  }
  await page.waitForTimeout(1200);
  const name = (route === '/' ? 'home' : route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, ''));
  const file = `${OUT}/${WIDTH}-${name}.png`;
  await page.screenshot({ path: file, fullPage: FULL });
  console.log(file);
}

await browser.close();
