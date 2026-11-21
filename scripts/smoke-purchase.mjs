/**
 * End-to-end smoke test of the purchase path against a running server.
 *
 * Drives the real server actions over HTTP (the same way the browser does),
 * so it exercises validation, the stock transaction and order creation
 * exactly as a customer would — without depending on browser automation.
 *
 * Usage:
 *   npm run build && npm start        # in one terminal
 *   node scripts/smoke-purchase.mjs   # in another
 *
 * Action IDs are read from the build manifest, so this keeps working across
 * rebuilds without hardcoding hashes.
 */

import { readFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';

const BASE = process.env.SMOKE_BASE_URL ?? 'http://localhost:3000';
const prisma = new PrismaClient();

/**
 * Map exportedName -> action id.
 *
 * Prefers the snapshot written at the end of the build (see
 * scripts/snapshot-actions.mjs). The live manifest is a fallback only: a
 * running server can rewrite it to hold just the actions it has loaded, so
 * reading it here finds a subset and the test fails on actions that are
 * perfectly fine.
 */
function loadActionIds() {
  try {
    return JSON.parse(
      readFileSync(new URL('../.next/smoke-action-ids.json', import.meta.url), 'utf8'),
    );
  } catch {
    const manifest = JSON.parse(
      readFileSync(
        new URL('../.next/server/server-reference-manifest.json', import.meta.url),
        'utf8',
      ),
    );
    return Object.fromEntries(
      Object.entries(manifest.node)
        .filter(([, entry]) => entry?.exportedName)
        .map(([id, entry]) => [entry.exportedName, id]),
    );
  }
}

const actionIds = loadActionIds();

let cookieJar = '';

function rememberCookies(response) {
  const raw = response.headers.getSetCookie?.() ?? [];
  for (const line of raw) {
    const [pair] = line.split(';');
    const [name] = pair.split('=');
    // Replace an existing cookie of the same name, then append.
    const kept = cookieJar
      .split('; ')
      .filter(Boolean)
      .filter((c) => !c.startsWith(`${name}=`));
    kept.push(pair);
    cookieJar = kept.join('; ');
  }
}

async function callAction(name, path, args) {
  const id = actionIds[name];
  if (!id) throw new Error(`No action id for "${name}" in the build manifest`);

  const response = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Next-Action': id,
      'Content-Type': 'text/plain;charset=UTF-8',
      ...(cookieJar ? { Cookie: cookieJar } : {}),
    },
    body: JSON.stringify(args),
  });

  rememberCookies(response);
  const text = await response.text();
  return { status: response.status, text };
}

async function get(path) {
  const response = await fetch(`${BASE}${path}`, {
    headers: cookieJar ? { Cookie: cookieJar } : {},
    redirect: 'manual',
  });
  rememberCookies(response);
  return { status: response.status, text: await response.text() };
}

const results = [];
function check(label, pass, detail = '') {
  results.push({ label, pass, detail });
  console.log(`${pass ? '  PASS' : '  FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
}

async function main() {
  console.log(`\nSmoke-testing the purchase path at ${BASE}\n`);

  // Any piece that can be bought, preferring the deepest stock. A fixed slug made
  // this test fail once repeated runs had sold the seed's six cushion covers —
  // an empty shelf, not a broken checkout.
  const product = await prisma.product.findFirst({
    where: { status: 'ACTIVE', stock: { gt: 0 } },
    orderBy: [{ stock: 'desc' }, { createdAt: 'asc' }],
    select: { id: true, slug: true, name: true, price: true, stock: true },
  });
  if (!product) throw new Error('Nothing in stock to buy — run npm run db:seed');

  const stockBefore = product.stock;
  console.log(`Product: ${product.name} (stock ${stockBefore})\n`);

  // 1 — add to cart
  const add = await callAction('addToCart', `/product/${product.slug}`, [
    product.id,
    1,
  ]);
  check('addToCart responds 200', add.status === 200, `status ${add.status}`);
  check('addToCart reports success', add.text.includes('"ok":true'));

  // 2 — cart reflects it
  const cart = await get('/cart');
  check('cart page shows the piece', cart.text.includes(product.name));

  // Identify the cart this run created, by the guest id in our own cookie jar.
  // Scoping to it keeps the test re-runnable: asserting over every cart in the
  // database makes a leftover row from an earlier aborted run fail a perfectly
  // good checkout.
  const guestId = cookieJar
    .split('; ')
    .find((c) => c.startsWith('svl_cart='))
    ?.slice('svl_cart='.length);

  const ourCart = guestId ? await prisma.cart.findUnique({ where: { guestId } }) : null;
  check('cart row created', Boolean(ourCart), ourCart ? ourCart.id : 'no guest cart cookie');

  // 3 — place a COD order
  const place = await callAction('placeOrder', '/checkout', [
    { status: 'idle' },
    // FormData is encoded by the framework in a real submit; the action reads
    // it with Object.fromEntries, so a plain object round-trips identically.
    Object.entries({
      email: 'smoke-test@example.com',
      fullName: 'Smoke Test',
      phone: '9876543210',
      line1: '15-890 B.P. Agraharam',
      line2: '',
      city: 'Srikalahasti',
      state: 'Andhra Pradesh',
      postalCode: '517644',
      country: 'India',
      paymentMethod: 'COD',
      customerNote: 'Automated smoke test',
    }),
  ]);
  check('placeOrder responds', place.status === 200 || place.status === 303, `status ${place.status}`);

  const order = await prisma.order.findFirst({
    where: { email: 'smoke-test@example.com' },
    orderBy: { placedAt: 'desc' },
    include: { items: true, events: true },
  });

  check('order created', Boolean(order), order ? order.number : 'none');
  if (order) {
    check('order has the right item', order.items.length === 1 && order.items[0].name === product.name);
    check('order total is correct', order.total === product.price + (product.price >= 300000 ? 0 : 15000),
      `total ${order.total}`);
    check('order confirmed for COD', order.status === 'CONFIRMED');
    check('timeline event written', order.events.length > 0);

    const after = await prisma.product.findUnique({
      where: { id: product.id },
      select: { stock: true },
    });
    check('stock decremented', after.stock === stockBefore - 1,
      `${stockBefore} -> ${after.stock}`);

    const remaining = ourCart
      ? await prisma.cartItem.count({ where: { cartId: ourCart.id } })
      : -1;
    check('cart emptied after checkout', remaining === 0, `${remaining} item(s) left`);
  }

  // A missing record must answer 404, not a 200 that paints the error page —
  // search engines index the latter. A `loading.tsx` above a route that can
  // `notFound()` flushes its shell with 200 first, which is how this broke.
  const status = async (path) => (await fetch(`${BASE}${path}`, { redirect: 'manual' })).status;
  for (const path of [
    '/product/no-such-piece',
    '/shop/no-such-category',
    '/heritage/motifs/no-such-motif',
    '/types/no-such-type',
    '/collections/no-such-collection',
  ]) {
    const code = await status(path);
    check(`unknown route answers 404: ${path}`, code === 404, `got ${code}`);
  }
  for (const path of ['/', '/archive', '/collections/premium', '/types/sarees']) {
    const code = await status(path);
    check(`known route answers 200: ${path}`, code === 200, `got ${code}`);
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed\n`);
  process.exitCode = failed.length ? 1 : 0;
}

main()
  .catch((error) => {
    console.error('\nSmoke test crashed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
