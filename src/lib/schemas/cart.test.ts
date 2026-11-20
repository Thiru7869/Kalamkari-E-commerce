import { describe, expect, it } from 'vitest';
import {
  addQuantitySchema,
  idSchema,
  MAX_CART_QUANTITY,
  setQuantitySchema,
} from '@/lib/schemas/cart';

const accepts = (schema: { safeParse: (v: unknown) => { success: boolean } }, v: unknown) =>
  schema.safeParse(v).success;

describe('addQuantitySchema', () => {
  it('accepts whole numbers from 1 to the maximum', () => {
    for (const q of [1, 2, 5, MAX_CART_QUANTITY]) expect(accepts(addQuantitySchema, q)).toBe(true);
  });

  it.each([
    ['zero', 0],
    ['negative', -1],
    ['large negative', -5],
    ['fraction', 1.5],
    ['tiny fraction', 0.0001],
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['negative Infinity', Number.NEGATIVE_INFINITY],
    ['over the maximum', MAX_CART_QUANTITY + 1],
    ['absurdly large', 1e21],
    ['a numeric string', '2'],
    ['null', null],
    ['undefined', undefined],
    ['an object', { valueOf: (): number => 2 }],
  ])('rejects %s', (_label, value) => {
    expect(accepts(addQuantitySchema, value)).toBe(false);
  });
});

describe('setQuantitySchema', () => {
  it('accepts zero, because the stepper uses it to remove a line', () => {
    expect(accepts(setQuantitySchema, 0)).toBe(true);
  });

  it('accepts the normal range', () => {
    for (const q of [1, 3, MAX_CART_QUANTITY]) expect(accepts(setQuantitySchema, q)).toBe(true);
  });

  it.each([-1, -100, 0.5, 2.5, Number.NaN, Infinity, MAX_CART_QUANTITY + 1, 1e21, '1'])(
    'rejects %s',
    (value) => {
      expect(accepts(setQuantitySchema, value)).toBe(false);
    },
  );
});

describe('idSchema', () => {
  it('accepts a cuid-shaped id and trims it', () => {
    expect(idSchema.parse('  clx1abc234  ')).toBe('clx1abc234');
  });

  it.each(['', '   ', 'x'.repeat(65), 5, null, undefined, {}])('rejects %j', (value) => {
    expect(accepts(idSchema, value)).toBe(false);
  });
});
