import { describe, expect, it } from 'vitest';
import {
  GUEST_WISHLIST_CAP,
  parseGuestWishlist,
  serializeGuestWishlist,
  toggleGuestWishlist,
} from './guest-wishlist';

const ids = (n: number) => Array.from({ length: n }, (_, i) => `piece${i}`);

describe('parseGuestWishlist', () => {
  it('reads a comma-separated list in order', () => {
    expect(parseGuestWishlist('abc,def,ghi')).toEqual(['abc', 'def', 'ghi']);
  });

  it('returns an empty list for nothing', () => {
    expect(parseGuestWishlist(undefined)).toEqual([]);
    expect(parseGuestWishlist(null)).toEqual([]);
    expect(parseGuestWishlist('')).toEqual([]);
  });

  it('drops duplicates, blanks and padding', () => {
    expect(parseGuestWishlist(' abc , ,abc,def,,')).toEqual(['abc', 'def']);
  });

  it('drops anything that is not shaped like an id', () => {
    expect(parseGuestWishlist("abc,<script>,d e f,../x,ok_1,'; DROP")).toEqual(['abc', 'ok_1']);
    expect(parseGuestWishlist('a'.repeat(65))).toEqual([]);
  });

  it('never returns more than the cap', () => {
    expect(parseGuestWishlist(ids(GUEST_WISHLIST_CAP + 30).join(','))).toHaveLength(
      GUEST_WISHLIST_CAP,
    );
  });

  it('round-trips through serialize', () => {
    const list = ['one', 'two', 'three'];
    expect(parseGuestWishlist(serializeGuestWishlist(list))).toEqual(list);
  });
});

describe('toggleGuestWishlist', () => {
  it('adds a new piece at the front', () => {
    expect(toggleGuestWishlist(['a', 'b'], 'c')).toEqual({
      ok: true,
      ids: ['c', 'a', 'b'],
      wishlisted: true,
    });
  });

  it('removes a piece that is already saved', () => {
    expect(toggleGuestWishlist(['a', 'b', 'c'], 'b')).toEqual({
      ok: true,
      ids: ['a', 'c'],
      wishlisted: false,
    });
  });

  it('refuses an add at the cap instead of evicting something', () => {
    const full = ids(GUEST_WISHLIST_CAP);
    expect(toggleGuestWishlist(full, 'newcomer')).toEqual({ ok: false, reason: 'full' });
  });

  it('still allows a removal at the cap', () => {
    const full = ids(GUEST_WISHLIST_CAP);
    const result = toggleGuestWishlist(full, 'piece3');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.wishlisted).toBe(false);
      expect(result.ids).toHaveLength(GUEST_WISHLIST_CAP - 1);
    }
  });

  it('refuses an id that is not shaped like one', () => {
    expect(toggleGuestWishlist([], '')).toEqual({ ok: false, reason: 'invalid' });
    expect(toggleGuestWishlist([], 'a,b')).toEqual({ ok: false, reason: 'invalid' });
    expect(toggleGuestWishlist([], '<x>')).toEqual({ ok: false, reason: 'invalid' });
  });

  it('does not mutate the list it was given', () => {
    const current = ['a', 'b'];
    toggleGuestWishlist(current, 'c');
    expect(current).toEqual(['a', 'b']);
  });
});
