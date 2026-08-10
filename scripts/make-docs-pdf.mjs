/**
 * Renders docs/site-documentation.html to PDF.
 *
 * Uses the Playwright Chromium already installed for the layout audit, so
 * there is no extra toolchain. Loaded over file:// so the screenshots in
 * .shots/ resolve by relative path.
 *
 *   node scripts/make-docs-pdf.mjs
 */
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const SOURCE = resolve('docs/site-documentation.html');
const OUT = resolve('docs/Kalamkari-Site-Documentation.pdf');

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(pathToFileURL(SOURCE).href, { waitUntil: 'networkidle' });
// Screenshots are large PNGs decoded from disk; give them a beat to paint.
await page.waitForTimeout(1500);

await page.pdf({
  path: OUT,
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate:
    '<div style="width:100%;font-size:7.5pt;color:#8A857C;padding:0 15mm;' +
    'font-family:Calibri,sans-serif;display:flex;justify-content:space-between;">' +
    '<span>Sri Vijaya Lakshmi Fine Kalamkari Arts — site documentation</span>' +
    '<span class="pageNumber"></span></div>',
  margin: { top: '14mm', bottom: '16mm', left: '15mm', right: '15mm' },
});

await browser.close();
console.log(`wrote ${OUT}`);
