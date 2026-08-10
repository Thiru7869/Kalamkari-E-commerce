import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const WIDTH = Number(process.argv[2] || 390);
const ROUTE = process.argv[3] || '/';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: WIDTH, height: 844 },
  isMobile: WIDTH < 768,
  hasTouch: WIDTH < 768,
});
await context.addInitScript(() => {
  try {
    for (const s of ['preloader', 'welcome', 'tour']) sessionStorage.setItem(`svl_intro_${s}`, '1');
    localStorage.setItem('svl_announce', '1');
  } catch {}
});
const page = await context.newPage();
try {
  await page.goto(BASE + ROUTE, { waitUntil: 'networkidle', timeout: 45000 });
} catch {}
await page.waitForTimeout(1200);

const out = await page.evaluate(() => {
  const de = document.documentElement;
  const rows = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('h1,h2,h3,p,section,a,button,.container')) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.height === 0) continue;
    const tag = el.tagName.toLowerCase();
    const key = tag + '|' + String(el.getAttribute('class') || '').slice(0, 60);
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      tag,
      cls: String(el.getAttribute('class') || '').slice(0, 70),
      fs: cs.fontSize,
      lh: cs.lineHeight,
      py: `${cs.paddingTop}/${cs.paddingBottom}`,
      box: `${Math.round(r.width)}x${Math.round(r.height)}@${Math.round(r.left)}`,
      scrollW: el.scrollWidth > Math.ceil(r.width) + 1 ? el.scrollWidth : '',
    });
  }
  return {
    docOverflow: de.scrollWidth - de.clientWidth,
    clientWidth: de.clientWidth,
    bodyH: document.body.scrollHeight,
    rows: rows.slice(0, 60),
  };
});

console.log(`viewport ${WIDTH}  route ${ROUTE}  docOverflow=${out.docOverflow}  pageHeight=${out.bodyH}`);
for (const r of out.rows) {
  console.log(
    `${r.tag.padEnd(7)} fs=${r.fs.padEnd(8)} lh=${r.lh.padEnd(8)} pad=${r.py.padEnd(16)} box=${r.box.padEnd(16)}${r.scrollW ? ' INNER-SCROLL=' + r.scrollW : ''}  ${r.cls}`,
  );
}
await browser.close();
