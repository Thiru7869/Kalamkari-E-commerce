import { describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { toggleWishlist } from '@/app/actions/cart';
import { getWishlistIds, mergeGuestWishlist } from '@/lib/cart';
import {
  GUEST_WISHLIST_CAP,
  GUEST_WISHLIST_COOKIE,
  parseGuestWishlist,
} from '@/lib/guest-wishlist';
import { makeProduct, makeUser } from '@/test/fixtures';
import { testState } from '@/test/state';

const saved = () => parseGuestWishlist(testState.cookies.get(GUEST_WISHLIST_COOKIE));
const rowsFor = (userId: string) =>
  prisma.wishlistItem.findMany({ where: { userId }, select: { productId: true } });

describe('guest wishlist — a visitor who has not signed in', () => {
  it('saves a piece to a cookie instead of refusing', async () => {
    const piece = await makeProduct();

    const result = await toggleWishlist(piece.id);

    expect(result).toMatchObject({ ok: true, wishlisted: true });
    expect(saved()).toEqual([piece.id]);
    // Nothing is written to the database for somebody with no account.
    expect(await prisma.wishlistItem.count({ where: { productId: piece.id } })).toBe(0);
  });

  it('toggles it back off', async () => {
    const piece = await makeProduct();
    await toggleWishlist(piece.id);

    const result = await toggleWishlist(piece.id);

    expect(result).toMatchObject({ ok: true, wishlisted: false });
    expect(saved()).toEqual([]);
  });

  it('keeps the newest piece first', async () => {
    const a = await makeProduct();
    const b = await makeProduct();
    await toggleWishlist(a.id);
    await toggleWishlist(b.id);
    expect(saved()).toEqual([b.id, a.id]);
  });

  it('reads the list back for the heart on a card', async () => {
    const piece = await makeProduct();
    await toggleWishlist(piece.id);
    expect((await getWishlistIds()).has(piece.id)).toBe(true);
  });

  it('refuses a piece that does not exist, and stores nothing', async () => {
    const result = await toggleWishlist('does-not-exist');
    expect(result.ok).toBe(false);
    expect(saved()).toEqual([]);
  });

  it('refuses a piece that is no longer listed', async () => {
    const piece = await makeProduct();
    await prisma.product.update({ where: { id: piece.id }, data: { status: 'ARCHIVED' } });
    const result = await toggleWishlist(piece.id);
    expect(result.ok).toBe(false);
    expect(saved()).toEqual([]);
  });

  it('refuses a fifty-first piece, and a removal still works at the cap', async () => {
    const pieces = await Promise.all(
      Array.from({ length: GUEST_WISHLIST_CAP + 1 }, () => makeProduct()),
    );
    for (const p of pieces.slice(0, GUEST_WISHLIST_CAP)) {
      expect(await toggleWishlist(p.id)).toMatchObject({ ok: true });
    }
    expect(saved()).toHaveLength(GUEST_WISHLIST_CAP);

    const refused = await toggleWishlist(pieces[GUEST_WISHLIST_CAP].id);
    expect(refused.ok).toBe(false);
    expect(saved()).toHaveLength(GUEST_WISHLIST_CAP);

    const removed = await toggleWishlist(pieces[0].id);
    expect(removed).toMatchObject({ ok: true, wishlisted: false });
    expect(saved()).toHaveLength(GUEST_WISHLIST_CAP - 1);
  });
});

describe('guest wishlist — signing in', () => {
  it('carries the saved pieces onto the account and clears the cookie', async () => {
    const a = await makeProduct();
    const b = await makeProduct();
    await toggleWishlist(a.id);
    await toggleWishlist(b.id);
    const user = await makeUser();

    await mergeGuestWishlist(user.id);

    const rows = (await rowsFor(user.id)).map((r) => r.productId).sort();
    expect(rows).toEqual([a.id, b.id].sort());
    expect(testState.cookies.has(GUEST_WISHLIST_COOKIE)).toBe(false);
  });

  it('does not duplicate a piece the account already had', async () => {
    const a = await makeProduct();
    const user = await makeUser();
    await prisma.wishlistItem.create({ data: { userId: user.id, productId: a.id } });
    await toggleWishlist(a.id);

    await mergeGuestWishlist(user.id);

    expect(await rowsFor(user.id)).toHaveLength(1);
  });

  it('is safe to run twice', async () => {
    const a = await makeProduct();
    const user = await makeUser();
    await toggleWishlist(a.id);
    await mergeGuestWishlist(user.id);
    await mergeGuestWishlist(user.id);
    expect(await rowsFor(user.id)).toHaveLength(1);
  });

  it('ignores ids in a tampered cookie that match no listed piece', async () => {
    const real = await makeProduct();
    const user = await makeUser();
    testState.cookies.set(GUEST_WISHLIST_COOKIE, `ghost-id,${real.id},<script>`);

    await mergeGuestWishlist(user.id);

    expect((await rowsFor(user.id)).map((r) => r.productId)).toEqual([real.id]);
    expect(testState.cookies.has(GUEST_WISHLIST_COOKIE)).toBe(false);
  });

  it('does nothing, and does not fail, when there was no guest list', async () => {
    const user = await makeUser();
    await expect(mergeGuestWishlist(user.id)).resolves.toBeUndefined();
    expect(await rowsFor(user.id)).toHaveLength(0);
  });
});

describe('guest wishlist — the signed-in path is unchanged', () => {
  it('still writes to the account and not to the cookie', async () => {
    const piece = await makeProduct();
    const user = await makeUser();
    testState.session = { user: { id: user.id, role: 'CUSTOMER' } };

    const result = await toggleWishlist(piece.id);

    expect(result).toMatchObject({ ok: true, wishlisted: true });
    expect((await rowsFor(user.id)).map((r) => r.productId)).toEqual([piece.id]);
    expect(testState.cookies.has(GUEST_WISHLIST_COOKIE)).toBe(false);
  });
});
