import { describe, expect, it } from 'vitest';
import { toList, fromList, primaryImage } from '@/lib/serialize';

/**
 * These two functions are the only place that knows the schema stores lists as
 * newline-delimited text. Everything else — dyes, care notes, tags, image
 * paths — reads through them, so a regression here is silently wrong on every
 * product page at once.
 */

describe('toList', () => {
  it('splits, trims and drops blank lines', () => {
    expect(toList('Kasim black\n  Madder red  \n\nIndigo\n')).toEqual([
      'Kasim black',
      'Madder red',
      'Indigo',
    ]);
  });

  it('treats null, undefined and empty string as an empty list', () => {
    expect(toList(null)).toEqual([]);
    expect(toList(undefined)).toEqual([]);
    expect(toList('')).toEqual([]);
  });

  it('does not invent an entry from whitespace alone', () => {
    expect(toList('   \n  \n')).toEqual([]);
  });
});

describe('fromList', () => {
  it('round-trips through toList unchanged', () => {
    const dyes = ['Kasim black', 'Alum-mordanted chay red', 'Vat indigo'];
    expect(toList(fromList(dyes))).toEqual(dyes);
  });

  it('produces empty string for nothing, so the column is never null-ish text', () => {
    expect(fromList([])).toBe('');
    expect(fromList(null)).toBe('');
    expect(fromList(undefined)).toBe('');
  });

  it('drops blanks on the way in as well as out', () => {
    expect(fromList(['Madder red', '   ', 'Indigo'])).toBe('Madder red\nIndigo');
  });
});

describe('primaryImage', () => {
  it('takes the first entry', () => {
    expect(primaryImage('/a.jpg\n/b.jpg')).toBe('/a.jpg');
  });

  it('falls back rather than returning undefined', () => {
    // A card that renders `undefined` as a src is a broken layout; the
    // fallback keeps the grid intact.
    expect(primaryImage('')).toBe('/images/placeholder-cloth.jpg');
    expect(primaryImage(null)).toBe('/images/placeholder-cloth.jpg');
  });
});
