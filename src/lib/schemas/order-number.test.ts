import { describe, expect, it } from 'vitest';
import { isOrderNumber, orderNumberSchema } from '@/lib/schemas/order-number';
import { generateOrderNumber } from '@/lib/utils';

describe('order number format', () => {
  it('accepts the six-character numbers every existing order carries', () => {
    expect(isOrderNumber('SVL-2A7F4C')).toBe(true);
  });

  it('accepts the eight-character numbers new orders get', () => {
    expect(isOrderNumber('SVL-2A7F4C9H')).toBe(true);
  });

  it.each([
    'SVL-2A7F4',
    'SVL-2A7F4C9H2',
    'svl-2a7f4c',
    'XYZ-2A7F4C',
    'SVL-2A7F4C!',
    '',
    ' SVL-2A7F4C',
  ])('rejects %j', (value) => {
    expect(isOrderNumber(value)).toBe(false);
  });

  it('normalises case and whitespace when parsing user input', () => {
    expect(orderNumberSchema.parse('  svl-2a7f4c ')).toBe('SVL-2A7F4C');
  });
});

describe('generateOrderNumber', () => {
  it('always produces a number the validator accepts, at eight characters', () => {
    for (let i = 0; i < 500; i += 1) {
      const number = generateOrderNumber();
      expect(isOrderNumber(number)).toBe(true);
      expect(number).toHaveLength(12);
    }
  });

  it('does not repeat across a large sample', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 20_000; i += 1) seen.add(generateOrderNumber());
    expect(seen.size).toBe(20_000);
  });

  it('is not driven by Math.random', () => {
    const original = Math.random;
    Math.random = () => {
      throw new Error('Math.random must not be used for order numbers');
    };
    try {
      expect(() => generateOrderNumber()).not.toThrow();
    } finally {
      Math.random = original;
    }
  });
});
