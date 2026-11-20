import { describe, expect, it } from 'vitest';
import {
  GRANT_TTL_SECONDS,
  MAX_GRANTS,
  readGrants,
  signGrants,
} from '@/lib/order-access-token';

const SECRET = 'a-test-secret-that-is-long-enough-0123456789';
const NOW = 1_800_000_000;
const grant = (number: string, ttl = GRANT_TTL_SECONDS) => ({ number, expiresAt: NOW + ttl });

describe('order-access token', () => {
  it('round-trips a grant it signed', () => {
    const value = signGrants([grant('SVL-2A7F4C9H')], SECRET);
    expect(readGrants(value, SECRET, NOW).map((g) => g.number)).toEqual(['SVL-2A7F4C9H']);
  });

  it('keeps several grants and their order', () => {
    const value = signGrants([grant('SVL-AAAAAAAA'), grant('SVL-BBBBBBBB')], SECRET);
    expect(readGrants(value, SECRET, NOW).map((g) => g.number)).toEqual([
      'SVL-AAAAAAAA',
      'SVL-BBBBBBBB',
    ]);
  });

  describe('forgery', () => {
    it('rejects the old plaintext cookie format outright', () => {
      expect(readGrants('SVL-2A7F4C9H', SECRET, NOW)).toEqual([]);
      expect(readGrants('SVL-2A7F4C,SVL-AAAAAA', SECRET, NOW)).toEqual([]);
    });

    it('rejects a hand-built value with a made-up signature', () => {
      const body = Buffer.from(JSON.stringify([['SVL-2A7F4C9H', NOW + 3600]])).toString('base64url');
      expect(readGrants(`v1.${body}.AAAA`, SECRET, NOW)).toEqual([]);
    });

    it('rejects a value signed with a different secret', () => {
      const value = signGrants([grant('SVL-2A7F4C9H')], 'another-secret-entirely-0123456789abcdef');
      expect(readGrants(value, SECRET, NOW)).toEqual([]);
    });

    it('rejects a tampered payload even when the old signature is kept', () => {
      const real = signGrants([grant('SVL-2A7F4C9H')], SECRET);
      const [version, , signature] = real.split('.');
      const forgedBody = Buffer.from(JSON.stringify([['SVL-ZZZZZZZZ', NOW + 3600]])).toString(
        'base64url',
      );
      expect(readGrants(`${version}.${forgedBody}.${signature}`, SECRET, NOW)).toEqual([]);
    });

    it('rejects an extended expiry on an otherwise real token', () => {
      const real = signGrants([grant('SVL-2A7F4C9H', 60)], SECRET);
      const [version, , signature] = real.split('.');
      const longer = Buffer.from(
        JSON.stringify([['SVL-2A7F4C9H', NOW + 10 * 365 * 86400]]),
      ).toString('base64url');
      expect(readGrants(`${version}.${longer}.${signature}`, SECRET, NOW)).toEqual([]);
    });

    it('rejects a change to any sampled character of a valid token', () => {
      const real = signGrants([grant('SVL-2A7F4C9H')], SECRET);
      let checked = 0;
      for (let i = 0; i < real.length; i += 3) {
        const flipped = real.slice(0, i) + (real[i] === 'A' ? 'B' : 'A') + real.slice(i + 1);
        if (flipped === real) continue;
        checked += 1;
        expect(readGrants(flipped, SECRET, NOW)).toEqual([]);
      }
      expect(checked).toBeGreaterThan(10);
    });

    it('rejects a wrong version prefix and malformed shapes', () => {
      const real = signGrants([grant('SVL-2A7F4C9H')], SECRET);
      expect(readGrants(real.replace(/^v1/, 'v2'), SECRET, NOW)).toEqual([]);
      expect(readGrants('', SECRET, NOW)).toEqual([]);
      expect(readGrants(undefined, SECRET, NOW)).toEqual([]);
      expect(readGrants(null, SECRET, NOW)).toEqual([]);
      expect(readGrants('v1..', SECRET, NOW)).toEqual([]);
      expect(readGrants('v1.a.b.c', SECRET, NOW)).toEqual([]);
    });
  });

  describe('expiry', () => {
    it('rejects a grant at the instant it expires, and after', () => {
      const value = signGrants([grant('SVL-2A7F4C9H', 60)], SECRET);
      expect(readGrants(value, SECRET, NOW + 59)).toHaveLength(1);
      expect(readGrants(value, SECRET, NOW + 60)).toEqual([]);
      expect(readGrants(value, SECRET, NOW + 7200)).toEqual([]);
    });

    it('drops only the expired grant and keeps the live one', () => {
      const value = signGrants([grant('SVL-AAAAAAAA', 30), grant('SVL-BBBBBBBB', 3000)], SECRET);
      expect(readGrants(value, SECRET, NOW + 100).map((g) => g.number)).toEqual(['SVL-BBBBBBBB']);
    });
  });

  describe('contents', () => {
    it('ignores a signed entry whose number is not an order number', () => {
      const value = signGrants([grant('not-an-order'), grant('SVL-2A7F4C9H')], SECRET);
      expect(readGrants(value, SECRET, NOW).map((g) => g.number)).toEqual(['SVL-2A7F4C9H']);
    });

    it('never carries more than the cap', () => {
      const many = Array.from({ length: MAX_GRANTS + 5 }, (_, i) =>
        grant(`SVL-AAAAAA${String(i).padStart(2, '0')}`),
      );
      const value = signGrants(many, SECRET);
      expect(readGrants(value, SECRET, NOW)).toHaveLength(MAX_GRANTS);
    });
  });
});
