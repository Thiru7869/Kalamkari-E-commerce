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

const manifest = JSON.parse(
  readFileSync(new URL('../.next/server/server-reference-manifest.json', import.meta.url), 'utf8'),
);

/** Map exportedName -> action id from the build manifest. */
const actionIds = Object.fromEntries(
  Object.entries(manifest.node).map(([id, entry]) => [entry.exportedName, id]),
);

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

  const product = await prisma.product.findUnique({
    where: { slug: 'lotus-cushion-cover-single' },
    select: { id: true, name: true, price: true, stock: true },
  });
  if (!product) throw new Error('Seed data missing — run npm run db:seed');

  const stockBefore = product.stock;
  console.log(`Product: ${product.name} (stock ${stockBefore})\n`);

  // 1 — add to cart
  const add = await callAction('addToCart', '/product/lotus-cushion-cover-single', [
    product.id,
    1,
  ]);
  check('addToCart responds 200', add.status === 200, `status ${add.status}`);
  check('addToCart reports success', add.text.includes('"ok":true'));

  // 2 — cart reflects it
  const cart = await get('/cart');
  check('cart page shows the piece', cart.text.includes(product.name));

  const cartRows = await prisma.cart.count();
  check('cart row created', cartRows > 0, `${cartRows} cart(s)`);

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

    const remaining = await prisma.cartItem.count();
    check('cart emptied after checkout', remaining === 0, `${remaining} item(s) left`);
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
