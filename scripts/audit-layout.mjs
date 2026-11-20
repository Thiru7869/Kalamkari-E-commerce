/**
 * Horizontal-overflow audit.
 *
 * `overflow-x: hidden` is banned on this site (see CLAUDE.md — it once hid a
 * broken header rather than preventing one). That ban only holds if horizontal
 * scroll is treated as a bug with a *location*, so this script finds the
 * location: every route, at the four phone widths that matter, reporting
 *
 *     documentElement.scrollWidth - documentElement.clientWidth
 *
 * and then the elements whose box actually crosses the edge — shallowest first,
 * because the shallow one is the cause and everything under it is a symptom.
 *
 *   node scripts/audit-layout.mjs                 # against localhost:3000
 *   node scripts/audit-layout.mjs --base=http://localhost:3000
 *   node scripts/audit-layout.mjs --widths=320,430
 *   node scripts/audit-layout.mjs --routes=/,/shop
 *   node scripts/audit-layout.mjs --intro=welcome # measure the welcome overlay
 *
 * Exits non-zero if anything overflows, so it can gate a build.
 */
import { chromium } from 'playwright';

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const BASE = arg('base', 'http://localhost:3000').replace(/\/$/, '');
const WIDTHS = arg('widths', '320,375,390,430').split(',').map(Number);
/**
 * Which stage of the first-visit sequence to leave running.
 *
 * `skip` (default) dismisses both. Naming a stage marks everything
 * *before* it as already seen, so that stage appears immediately and can be
 * measured without waiting out a 14-second preloader film first.
 */
const INTRO_STAGES = ['preloader', 'welcome'];
const INTRO = arg('intro', 'skip');
if (INTRO !== 'skip' && !INTRO_STAGES.includes(INTRO)) {
  console.error(`--intro must be one of: skip, ${INTRO_STAGES.join(', ')}`);
  process.exit(2);
}
/** The stages to mark as seen so the requested one is what renders. */
const SEEN_STAGES =
  INTRO === 'skip' ? INTRO_STAGES : INTRO_STAGES.slice(0, INTRO_STAGES.indexOf(INTRO));

/**
 * The widest span of layouts on the site, not every URL.
 *
 * `/types/sarees` and `/collections/premium` are here because they were not,
 * and both carry a layout no other route does: the type pages a sticky cloth
 * rail of chips, the collection pages a banner. The rail scrolled every type
 * page ~990px sideways at every phone width and nothing caught it, because the
 * only route in this list that reached one was `/search?q=saree` — and that
 * only started redirecting here once search learned to route section names.
 *
 * `/privacy`, `/terms`, `/care` and a product page were added after the same
 * lesson was learned a second time, and more expensively. The store's own
 * email address — forty characters with no break opportunity in it — pushed
 * `/contact` fifty-six pixels off a 320px phone. `/contact` was in this list,
 * so it was caught. The identical bug on `/privacy`, on the error boundary and
 * on the order detail was not, because none of those routes were measured. A
 * prose page is exactly where a long unbreakable string ends up, and a product
 * page is the single most-visited layout on the site and was never here at all.
 *
 * The product slug is a seeded one. If the seed is rewritten this becomes a
 * 404 and the audit will say so loudly rather than silently measuring nothing.
 */
const ROUTES = arg(
  'routes',
  [
    '/',
    '/shop',
    '/shop/sarees',
    '/product/tree-of-life-tussar-silk-saree',
    '/types/sarees',
    // The cloth filter applied in place. A different render of the same route
    // — thirty cards with group markers instead of eight, plus the "clear the
    // filter" header — and therefore a layout the unfiltered URL never
    // exercises.
    '/types/sarees?fabric=cotton',
    '/types/dupattas',
    '/collections/premium',
    '/process',
    '/our-story',
    '/journal',
    '/custom',
    '/contact',
    '/care',
    '/faq',
    // The long-form essay, and the only route on the site that is a single
    // capped measure with a wrapping contents rail above it. Neither shape is
    // exercised anywhere else in this list.
    '/heritage',
    '/shipping',
    '/privacy',
    '/terms',
    '/cart',
    '/search?q=indigo',
  ].join(','),
).split(',');

/**
 * Runs in the page. Returns the overflow amount plus the offenders.
 *
 * An element is only interesting if it crosses the edge *and* its parent does
 * not — a child inside an already-overflowing parent is being carried, not
 * causing. Elements inside a deliberate scroll container (`.snap-rail`, any
 * `overflow-x: auto`) are excluded: those are designed to scroll and their
 * content is meant to exceed them.
 */
const PROBE = () => {
  const de = document.documentElement;
  const limit = de.clientWidth;
  const overflowPx = de.scrollWidth - limit;

  const crosses = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;
    return r.right > limit + 1 || r.left < -1;
  };

  const inScroller = (el) => {
    for (let p = el.parentElement; p; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') return true;
    }
    return false;
  };

  /*
    Scanned unconditionally, and this matters.

    This used to run only when the document already overflowed, which made the
    scan blind to exactly the case that shipped: a `position: fixed` element
    does not contribute to `documentElement.scrollWidth` at all. The quick-tour
    card hung 163px off the right edge of a 390px phone with the document
    measuring a perfectly clean 0px of overflow, because a fixed box cannot
    widen the scroll area — it just sits there, off-screen, with its text
    unreadable and no scrollbar to reveal it.

    So: any visible element crossing the viewport edge is a finding, whether or
    not the page scrolls sideways because of it.
  */
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') return false;
    if (Number(cs.opacity) === 0) return false;
    // Off-canvas drawers park themselves entirely outside the viewport and are
    // usually inert as well; they are parked, not broken.
    if (el.closest('[inert]')) return false;
    const r = el.getBoundingClientRect();
    if (r.left >= limit || r.right <= 0) return false; // fully off-screen
    if (r.bottom <= 0 || r.top >= window.innerHeight) return false; // fully above/below
    return true;
  };

  const offenders = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!crosses(el) || inScroller(el)) continue;
    if (!visible(el)) continue;
    if (el.parentElement && crosses(el.parentElement)) continue; // symptom
    const r = el.getBoundingClientRect();
    let depth = 0;
    for (let p = el; p; p = p.parentElement) depth++;
    offenders.push({
      tag: el.tagName.toLowerCase(),
      id: el.id || '',
      cls: String(el.getAttribute('class') || '').slice(0, 120),
      left: Math.round(r.left),
      right: Math.round(r.right),
      width: Math.round(r.width),
      over: Math.round(r.right - limit),
      position: getComputedStyle(el).position,
      depth,
    });
  }

  offenders.sort((a, b) => a.depth - b.depth || b.over - a.over);

  /*
    Clipped overflow — the same bug wearing a disguise.

    A section that carries `overflow-hidden` for a bleeding decoration will
    happily hide a layout fault inside itself: the document measures clean,
    nothing scrolls, and the reader simply finds the last few letters of every
    line missing. That is exactly how the hero shipped — 86px of headline and
    body copy clipped by the section's own `overflow-hidden`, invisible to a
    documentElement check.

    So: any element that clips horizontally and whose content is meaningfully
    wider than its box. The threshold is 8px because a handful of these are
    legitimate (a rotated decoration, a bleeding gradient); a section clipping
    tens of pixels of its own content is not.
  */
  const clipped = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.overflowX !== 'hidden') continue;
    /*
      `sr-only` is a 1x1px box with `overflow: hidden` holding a whole
      sentence, so by this measure every one of them "clips 250px of its own
      content" — which is precisely what it is for. Anything this small is
      visually hidden by construction and cannot be the bug we are hunting.
    */
    if (el.clientWidth <= 2 || el.clientHeight <= 2) continue;
    /*
      Clipping with an ellipsis is a decision; clipping without one is a bug.
      `truncate` says "this may not fit, and the reader will be told so" — the
      fault we are looking for is the silent kind, where a line simply loses
      its last three letters and nothing marks the loss.
    */
    if (cs.textOverflow === 'ellipsis') continue;
    /*
      A marquee is a box that clips content far wider than itself by design.
      There is no way to infer that from geometry — it looks identical to a
      section accidentally hiding its own text — so the markup declares it.
      Currently just the announcement bar.
    */
    if (el.closest('[data-clips-intentionally]')) continue;
    const excess = el.scrollWidth - el.clientWidth;
    if (excess <= 8) continue;
    // Text is the tell. A clipped decoration is fine; clipped words are not.
    const text = (el.textContent || '').trim();
    if (!text) continue;
    clipped.push({
      tag: el.tagName.toLowerCase(),
      cls: String(el.getAttribute('class') || '').slice(0, 110),
      excess,
      clientWidth: el.clientWidth,
    });
  }
  clipped.sort((a, b) => b.excess - a.excess);

  return {
    limit,
    scrollWidth: de.scrollWidth,
    overflowPx,
    offenders: offenders.slice(0, 10),
    clipped: clipped.slice(0, 6),
    /*
      Every page on this site has exactly one h1 — that is an accessibility
      rule the README states, and it doubles here as the only reliable way to
      tell that a route rendered the thing it was meant to.

      An HTTP status is not enough on its own. An unknown *product slug*
      answers 200 and paints the error boundary: no heading, no product, and a
      layout that measures perfectly clean. A route in this list that quietly
      stops rendering its page would otherwise report `ok` forever, which is
      the exact failure mode this script exists to prevent.
    */
    h1Count: document.querySelectorAll('h1').length,
  };
};

const browser = await chromium.launch();
let failures = 0;

for (const width of WIDTHS) {
  const context = await browser.newContext({
    viewport: { width, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 ' +
      '(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });

  /*
    The first-visit sequence is audited separately, not skipped.

    By default the preloader and welcome overlay are dismissed the
    way a returning visitor has already dismissed them — otherwise they cover
    the page and are the only thing measured. That default hid a real bug: a
    quick-tour card (since removed) centred itself with `-translate-x-1/2` while also animating
    `transform`, so it settled at `left: 50%` and ran off the right edge of
    every phone, clipping its own copy. It shipped, because the audit
    suppressed the one component that was broken.

    `--intro=welcome` (or `preloader`) runs the same measurements
    with that stage live. Anything that can cover the viewport has to be
    measured on the viewport.
  */
  await context.addInitScript((seen) => {
    try {
      // Matches first-visit.tsx (sessionStorage, `svl_intro_<step>`).
      for (const step of seen) sessionStorage.setItem(`svl_intro_${step}`, '1');
      // announcement-bar.tsx (localStorage) is dismissed either way — it is a
      // server-rendered strip, not an overlay, and never covers anything.
      localStorage.setItem('svl_announce', '1');
    } catch {}
  }, SEEN_STAGES);

  const page = await context.newPage();

  for (const route of ROUTES) {
    let result;
    let response;
    try {
      response = await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 });
    } catch {
      // networkidle never settles on pages holding an open connection; the
      // layout is already resolved by then, so measure anyway.
    }

    /*
      A 404 renders a perfectly well-behaved page.

      Without this, a route whose slug has changed measures the not-found
      layout, reports `ok`, and quietly stops covering the thing it was added
      to cover — which is the same shape of failure this whole script exists to
      catch. One route in the list is a seeded product slug, so this is not
      hypothetical.
    */
    const status = response?.status();
    if (status && status >= 400) {
      console.log(
        `${String(width).padStart(4)}px  ${String(route).padEnd(38)} HTTP ${status} — not measured`,
      );
      failures++;
      continue;
    }

    await page.waitForTimeout(900);
    try {
      result = await page.evaluate(PROBE);
    } catch (err) {
      console.log(`  ${String(route).padEnd(38)} probe failed: ${err.message}`);
      continue;
    }

    const scrolls = result.overflowPx > 0;
    const clips = result.clipped.length > 0;
    const hangs = result.offenders.length > 0;
    // No heading means the route did not render its page — see the note in
    // PROBE. A clean measurement of the error boundary is not a pass.
    const empty = result.h1Count === 0;
    const bad = scrolls || clips || hangs || empty;
    if (bad) failures++;
    const mark = empty
      ? 'NO <H1>'
      : scrolls
        ? 'OVERFLOW'
        : hangs
          ? 'OFF-EDGE'
          : clips
            ? 'CLIPPED'
            : 'ok';
    console.log(
      `${String(width).padStart(4)}px  ${String(route).padEnd(38)} ` +
        `${mark.padEnd(9)} ${scrolls ? `+${result.overflowPx}px (scrollWidth ${result.scrollWidth} vs ${result.limit})` : ''}`,
    );
    for (const o of result.offenders) {
      console.log(
        `            └ <${o.tag}${o.id ? '#' + o.id : ''}> [${o.position}] w=${o.width} ` +
          `right=${o.right} (+${o.over} past edge) depth=${o.depth}\n              class="${o.cls}"`,
      );
    }
    for (const c of result.clipped) {
      console.log(
        `            ✂ <${c.tag}> hides ${c.excess}px of its own content ` +
          `(content ${c.clientWidth + c.excess} in a ${c.clientWidth} box)\n              class="${c.cls}"`,
      );
    }
  }

  await context.close();
}

await browser.close();

console.log(
  failures === 0
    ? '\nNo horizontal overflow, and nothing clipping its own text, at any width.'
    : `\n${failures} route/width combination(s) overflow or clip content.`,
);
process.exit(failures === 0 ? 0 : 1);
