import { describe, expect, it } from 'vitest';
import {
  phoneSchema,
  emailSchema,
  pincodeSchema,
  checkoutSchema,
  commissionSchema,
  reviewSchema,
  trackOrderSchema,
  profileSchema,
  returnRequestSchema,
} from '@/lib/validation';

/**
 * These schemas are the enforcement point for every mutation on the site —
 * client-side validation is a convenience layer only. A schema that quietly
 * widens is a schema that lets bad data into an order.
 */

describe('phoneSchema', () => {
  it('accepts the forms an Indian customer actually types', () => {
    for (const input of [
      '9876543210',
      '+91 98765 43210',
      '+919876543210',
      '98765-43210',
      '(98765) 43210',
    ]) {
      expect(phoneSchema.safeParse(input).success, input).toBe(true);
    }
  });

  it('rejects numbers that cannot be Indian mobiles', () => {
    for (const input of ['1234567890', '5876543210', '98765', '98765432101', 'abcdefghij']) {
      expect(phoneSchema.safeParse(input).success, input).toBe(false);
    }
  });

  it('normalises away spacing and punctuation', () => {
    expect(phoneSchema.parse('+91 98765-43210')).toBe('+919876543210');
  });
});

describe('emailSchema', () => {
  it('lowercases and trims so the same address matches an order once', () => {
    expect(emailSchema.parse('  Person@Example.COM ')).toBe('person@example.com');
  });

  it('rejects malformed addresses', () => {
    for (const input of ['not-an-email', 'a@', '@b.com', 'a b@c.com']) {
      expect(emailSchema.safeParse(input).success, input).toBe(false);
    }
  });
});

describe('pincodeSchema', () => {
  it('accepts a six-digit code that does not start with zero', () => {
    expect(pincodeSchema.safeParse('517644').success).toBe(true);
  });

  it('rejects the near misses', () => {
    for (const input of ['017644', '51764', '5176445', '51764a']) {
      expect(pincodeSchema.safeParse(input).success, input).toBe(false);
    }
  });
});

describe('checkoutSchema', () => {
  const valid = {
    fullName: 'A Customer',
    phone: '9876543210',
    line1: '12 Temple Street',
    city: 'Srikalahasti',
    state: 'Andhra Pradesh',
    postalCode: '517644',
    email: 'customer@example.com',
    paymentMethod: 'COD' as const,
  };

  it('accepts a complete order', () => {
    expect(checkoutSchema.safeParse(valid).success).toBe(true);
  });

  it('defaults country to India', () => {
    expect(checkoutSchema.parse(valid).country).toBe('India');
  });

  it('accepts only the two payment methods that exist', () => {
    expect(checkoutSchema.safeParse({ ...valid, paymentMethod: 'RAZORPAY' }).success).toBe(true);
    expect(checkoutSchema.safeParse({ ...valid, paymentMethod: 'PAYPAL' }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, paymentMethod: 'FREE' }).success).toBe(false);
  });

  it('requires an address that could be delivered to', () => {
    expect(checkoutSchema.safeParse({ ...valid, line1: 'x' }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, postalCode: '0' }).success).toBe(false);
  });

  it('caps the customer note rather than accepting unbounded text', () => {
    expect(checkoutSchema.safeParse({ ...valid, customerNote: 'x'.repeat(601) }).success).toBe(
      false,
    );
  });
});

describe('commissionSchema', () => {
  const valid = {
    name: 'A Customer',
    email: 'customer@example.com',
    pieceType: 'saree' as const,
    brief: 'A Tree of Life across the pallu, in madder and indigo, on tussar.',
  };

  it('accepts a real brief', () => {
    expect(commissionSchema.safeParse(valid).success).toBe(true);
  });

  it('asks for more than a couple of words', () => {
    expect(commissionSchema.safeParse({ ...valid, brief: 'a saree' }).success).toBe(false);
  });

  it('accepts only piece types the store makes', () => {
    expect(commissionSchema.safeParse({ ...valid, pieceType: 'rug' }).success).toBe(false);
  });

  it('coerces budget figures from form strings', () => {
    const parsed = commissionSchema.parse({ ...valid, budgetMin: '5000', budgetMax: '20000' });
    expect(parsed.budgetMin).toBe(5000);
    expect(parsed.budgetMax).toBe(20000);
  });

  it('treats a filled honeypot as a value the action must check', () => {
    // Non-empty `website` fails the schema; an empty one passes. Either way the
    // submission is never silently stored as a real enquiry.
    expect(commissionSchema.safeParse({ ...valid, website: 'http://spam' }).success).toBe(false);
    expect(commissionSchema.safeParse({ ...valid, website: '' }).success).toBe(true);
  });
});

describe('reviewSchema', () => {
  const valid = { productId: 'abc', rating: 5, body: 'The cloth is heavier than I expected.' };

  it('holds ratings to one through five', () => {
    for (const rating of [1, 3, 5]) {
      expect(reviewSchema.safeParse({ ...valid, rating }).success).toBe(true);
    }
    for (const rating of [0, 6, -1, 2.5]) {
      expect(reviewSchema.safeParse({ ...valid, rating }).success, String(rating)).toBe(false);
    }
  });

  it('requires at least a sentence', () => {
    expect(reviewSchema.safeParse({ ...valid, body: 'Good' }).success).toBe(false);
  });
});

describe('trackOrderSchema', () => {
  it('upper-cases a reference typed in lower case', () => {
    const parsed = trackOrderSchema.parse({ number: 'svl-2a7f4c', email: 'a@b.com' });
    expect(parsed.number).toBe('SVL-2A7F4C');
  });

  it('rejects a malformed reference', () => {
    for (const number of ['SVL-2A7F4', 'SVL2A7F4C', '2A7F4C', 'XXX-2A7F4C']) {
      expect(trackOrderSchema.safeParse({ number, email: 'a@b.com' }).success, number).toBe(false);
    }
  });
});

describe('profileSchema', () => {
  it('does not accept an email field — changing it is account recovery', () => {
    const parsed = profileSchema.parse({
      name: 'A Customer',
      email: 'attacker@example.com',
    } as Record<string, unknown>);
    expect('email' in parsed).toBe(false);
  });

  it('allows an absent phone', () => {
    expect(profileSchema.safeParse({ name: 'A Customer' }).success).toBe(true);
  });
});

describe('returnRequestSchema', () => {
  it('needs enough detail for a person to act on', () => {
    expect(returnRequestSchema.safeParse({ number: 'SVL-2A7F4C', reason: 'bad' }).success).toBe(
      false,
    );
    expect(
      returnRequestSchema.safeParse({
        number: 'SVL-2A7F4C',
        reason: 'The pallu arrived with a tear along the border.',
      }).success,
    ).toBe(true);
  });
});
