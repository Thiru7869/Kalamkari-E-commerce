import { describe, expect, it } from 'vitest';
import {
  cn,
  formatPrice,
  slugify,
  generateOrderNumber,
  averageRating,
  truncate,
  absoluteUrl,
} from '@/lib/utils';

describe('cn', () => {
  /*
    tailwind-merge decides conflicts by class *group*, and `text-*` covers two
    of them — font size and text colour. It separates them using a list of
    known size keys, which is the stock Tailwind scale and does not contain
    this project's. Without the extension in utils.ts, `text-display-xl` is
    filed as a colour, collides with the real colour beside it, and is dropped.

    That is not a hypothetical: the home page's `<h1>` and the "two crafts"
    `<h2>` both rendered at the inherited 16px, smaller than the body copy
    underneath them, because their size class was being merged away.
  */
  const sizes = [
    'text-display-xl',
    'text-display-lg',
    'text-display-md',
    'text-display-sm',
    'text-body-lg',
    'text-body-base',
    'text-eyebrow',
  ];

  it.each(sizes)('keeps %s when a text colour is merged alongside it', (size) => {
    expect(cn(size, 'text-cotton-50')).toBe(`${size} text-cotton-50`);
  });

  it('still collapses two font sizes down to the last one', () => {
    expect(cn('text-display-sm', 'text-display-xl')).toBe('text-display-xl');
    expect(cn('text-display-xl', 'text-sm')).toBe('text-sm');
  });

  it('still collapses two text colours down to the last one', () => {
    expect(cn('text-cotton-50', 'text-primary')).toBe('text-primary');
  });
});

describe('formatPrice', () => {
  it('renders paise as whole rupees by default', () => {
    // 1_850_000 paise = ₹18,500. If this ever reads 1,850,000 something has
    // started treating the stored integer as rupees.
    expect(formatPrice(1_850_000)).toBe('₹18,500');
  });

  it('groups in the Indian system, not in thousands', () => {
    // ₹1,00,000 — lakh grouping. en-US would give ₹100,000.
    expect(formatPrice(10_000_000)).toBe('₹1,00,000');
  });

  it('shows paise only when asked', () => {
    expect(formatPrice(150_050)).toBe('₹1,501');
    expect(formatPrice(150_050, { withDecimals: true })).toBe('₹1,500.50');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('₹0');
  });
});

describe('generateOrderNumber', () => {
  it('matches the format the tracking form validates against', () => {
    for (let i = 0; i < 200; i += 1) {
      expect(generateOrderNumber()).toMatch(/^SVL-[A-Z0-9]{8}$/);
    }
  });

  it('never emits a character that is misread over the phone', () => {
    // The alphabet deliberately omits I, O, S and B because they are confused
    // with 1, 0, 5 and 8 when an order number is read aloud.
    const forbidden = /[IOSB]/;
    for (let i = 0; i < 500; i += 1) {
      expect(generateOrderNumber().slice(4)).not.toMatch(forbidden);
    }
  });
});

describe('slugify', () => {
  it('strips diacritics rather than dropping the letter', () => {
    expect(slugify('Kalamkarí Sarée')).toBe('kalamkari-saree');
  });

  it('collapses punctuation and trims stray dashes', () => {
    expect(slugify('  Tree of Life — Tussar Silk!  ')).toBe('tree-of-life-tussar-silk');
  });
});

describe('averageRating', () => {
  it('returns null with no reviews rather than zero', () => {
    // Zero would render as a one-star product; null renders as no rating.
    expect(averageRating(0, 0)).toBeNull();
    expect(averageRating(12, 0)).toBeNull();
  });

  it('rounds to one decimal place', () => {
    expect(averageRating(14, 3)).toBe(4.7);
  });
});

describe('truncate', () => {
  it('leaves short text alone', () => {
    expect(truncate('Madder red', 40)).toBe('Madder red');
  });

  it('trims trailing space before the ellipsis', () => {
    expect(truncate('Madder red and indigo', 11)).toBe('Madder red…');
  });
});

describe('absoluteUrl', () => {
  it('joins a path whether or not it is given a leading slash', () => {
    expect(absoluteUrl('/shop')).toMatch(/\/shop$/);
    expect(absoluteUrl('shop')).toMatch(/\/shop$/);
  });
});
