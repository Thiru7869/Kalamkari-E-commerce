import { describe, expect, it } from 'vitest';
import { computeTotals, type CartLine } from '@/lib/totals';
import { site } from '@/content/site';
import { SoldOutError, isSoldOutError } from '@/lib/errors';

/**
 * `computeTotals` decides what a customer is charged. It is called once on the
 * cart page and again inside the checkout transaction, and the second call is
 * the authoritative one — so a bug here is a bug in the amount taken.
 *
 * Every figure below is in paise. If any assertion here starts reading like a
 * plausible rupee amount, something has begun dividing too early.
 */

function line(price: number, quantity = 1): CartLine {
  return {
    id: 'line',
    productId: 'p',
    quantity,
    name: 'A piece',
    slug: 'a-piece',
    image: '/x.jpg',
    price,
    stock: 1,
    categorySlug: 'sarees',
  };
}

describe('computeTotals', () => {
  it('returns an empty, shipping-free total for an empty cart', () => {
    const totals = computeTotals([]);
    expect(totals).toMatchObject({ subtotal: 0, itemCount: 0, shipping: 0, total: 0 });
  });

  it('never charges shipping on an empty cart', () => {
    // Otherwise an empty bag shows a flat rate and a total above zero.
    expect(computeTotals([]).shipping).toBe(0);
  });

  it('multiplies by quantity', () => {
    const totals = computeTotals([line(120_000, 3)]);
    expect(totals.subtotal).toBe(360_000);
    expect(totals.itemCount).toBe(3);
  });

  it('sums mixed lines', () => {
    const totals = computeTotals([line(120_000), line(45_500, 2)]);
    expect(totals.subtotal).toBe(211_000);
    expect(totals.itemCount).toBe(3);
  });

  it('charges the flat rate below the free-shipping threshold', () => {
    const totals = computeTotals([line(site.shipping.freeAbove - 1)]);
    expect(totals.shipping).toBe(site.shipping.flatRate);
    expect(totals.total).toBe(site.shipping.freeAbove - 1 + site.shipping.flatRate);
  });

  it('treats the threshold itself as free — the copy says "free above", inclusive', () => {
    const totals = computeTotals([line(site.shipping.freeAbove)]);
    expect(totals.shipping).toBe(0);
    expect(totals.total).toBe(site.shipping.freeAbove);
  });

  it('reaches free shipping on the sum, not on any single piece', () => {
    const half = Math.ceil(site.shipping.freeAbove / 2);
    expect(computeTotals([line(half), line(half)]).shipping).toBe(0);
  });

  it('reports the gap to free shipping, and never a negative one', () => {
    expect(computeTotals([line(100_000)]).freeShippingGap).toBe(
      site.shipping.freeAbove - 100_000,
    );
    expect(computeTotals([line(site.shipping.freeAbove * 2)]).freeShippingGap).toBe(0);
  });

  it('keeps every figure an integer', () => {
    const totals = computeTotals([line(33_333, 3), line(1, 7)]);
    for (const value of [totals.subtotal, totals.shipping, totals.total, totals.freeShippingGap]) {
      expect(Number.isInteger(value)).toBe(true);
    }
  });
});

describe('SoldOutError', () => {
  it('carries the product name instead of encoding it in a string', () => {
    const error = new SoldOutError('Tree of Life: Tussar Silk Saree');
    expect(error.productName).toBe('Tree of Life: Tussar Silk Saree');
  });

  it('is recognised by its type, so a colon in a name cannot break the check', () => {
    // The previous implementation matched on `message.startsWith('SOLD_OUT:')`,
    // which a product name containing a colon could confuse.
    expect(isSoldOutError(new SoldOutError('A: B'))).toBe(true);
    expect(isSoldOutError(new Error('SOLD_OUT:A'))).toBe(false);
    expect(isSoldOutError('SOLD_OUT:A')).toBe(false);
  });
});
