import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const WIDTH = Number(process.argv[2] || 390);
const ROUTE = process.argv[3] || '/';
const SEL = process.argv[4] || 'section.isolate';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: WIDTH, height: 844 }, isMobile: true, hasTouch: true });
await context.addInitScript(() => {
  try {
    for (const s of ['preloader', 'welcome', 'tour']) sessionStorage.setItem(`svl_intro_${s}`, '1');
    localStorage.setItem('svl_announce', '1');
  } catch {}
});
const page = await context.newPage();
try { await page.goto(BASE + ROUTE, { waitUntil: 'networkidle', timeout: 45000 }); } catch {}
await page.waitForTimeout(1200);

const out = await page.evaluate((sel) => {
  const root = document.querySelector(sel);
  if (!root) return { error: 'no match for ' + sel };
  const limit = document.documentElement.clientWidth;
  const rows = [];
  const walk = (el, depth) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    // min-content width: what this box refuses to shrink below.
    const probe = el.cloneNode(true);
    let minContent = null;
    try {
      probe.style.cssText = 'position:absolute;visibility:hidden;width:min-content;max-width:none;min-width:0;left:-99999px;top:0';
      document.body.appendChild(probe);
      minContent = Math.round(probe.getBoundingClientRect().width);
      probe.remove();
    } catch { probe.remove?.(); }
    if (r.right > limit - 10 || (minContent !== null && minContent > limit)) {
      rows.push({
        depth,
        tag: el.tagName.toLowerCase(),
        cls: String(el.getAttribute('class') || '').slice(0, 88),
        w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right),
        minContent,
        minWidth: cs.minWidth, flexShrink: cs.flexShrink, display: cs.display,
        size: el.getAttribute?.('size') || '',
      });
    }
    for (const c of el.children) walk(c, depth + 1);
  };
  walk(root, 0);
  return { limit, rootScrollW: root.scrollWidth, rows };
}, SEL);

if (out.error) { console.log(out.error); }
else {
  console.log(`clientWidth=${out.limit}  root.scrollWidth=${out.rootScrollW}`);
  for (const r of out.rows) {
    console.log(
      `${' '.repeat(r.depth)}<${r.tag}> w=${r.w} l=${r.left} r=${r.right} minContent=${r.minContent} ` +
      `minW=${r.minWidth} shrink=${r.flexShrink} ${r.size ? 'size=' + r.size : ''}\n${' '.repeat(r.depth)}  ${r.cls}`,
    );
  }
}
await browser.close();
