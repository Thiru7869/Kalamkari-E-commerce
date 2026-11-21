import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { getTypeCataloguePage, TYPE_PAGE_SIZE } from '@/lib/queries';
import { makeProduct } from '@/test/fixtures';

/**
 * A type page's catalogue is cut in the database, eight to a page, from the URL.
 */

const tag = () => randomBytes(4).toString('hex');

async function categorySlugOf(productId: string) {
  const row = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    select: { category: { select: { slug: true } } },
  });
  return row.category.slug;
}

describe('getTypeCataloguePage', () => {
  it('returns eight to a page, never repeats a piece across pages, and leaves sold ones out', async () => {
    const available = [];
    for (let i = 0; i < 19; i++) available.push(await makeProduct({ stock: 1 }));
    const sold = [await makeProduct({ stock: 0 }), await makeProduct({ stock: 0 })];
    const slug = await categorySlugOf(available[0].id);

    const one = await getTypeCataloguePage(slug, {}, 1);
    const two = await getTypeCataloguePage(slug, {}, 2);
    const three = await getTypeCataloguePage(slug, {}, 3);

    expect(TYPE_PAGE_SIZE).toBe(8);
    expect(one.items).toHaveLength(8);
    expect(two.items).toHaveLength(8);
    expect(three.items).toHaveLength(3);
    expect(one.total).toBe(19);
    expect(one.pageCount).toBe(3);

    const ids = [...one.items, ...two.items, ...three.items].map((p) => p.id);
    expect(new Set(ids).size).toBe(19);
    for (const p of sold) expect(ids).not.toContain(p.id);
    expect(one.soldTotal).toBeGreaterThanOrEqual(2);
  });

  it('answers a page past the end with the last page, and a page below one with the first', async () => {
    const slug = await categorySlugOf((await makeProduct({ stock: 1 })).id);
    for (let i = 0; i < 9; i++) await makeProduct({ stock: 1 });

    const past = await getTypeCataloguePage(slug, {}, 999);
    const last = await getTypeCataloguePage(slug, {}, past.pageCount);
    expect(past.page).toBe(past.pageCount);
    expect(past.items.map((p) => p.id)).toEqual(last.items.map((p) => p.id));

    const below = await getTypeCataloguePage(slug, {}, -3);
    expect(below.page).toBe(1);
  });

  it('filters by one cloth or by a family, and counts only what matches', async () => {
    const family = `fam-${tag()}`;
    const make = (slug: string) =>
      prisma.fabric.create({
        data: { slug, name: slug, family, description: 'd', careNote: 'c' },
      });
    const a = await make(`cloth-a-${tag()}`);
    const b = await make(`cloth-b-${tag()}`);

    const base = await makeProduct({ stock: 1 });
    const slug = await categorySlugOf(base.id);
    const categoryId = (await prisma.product.findUniqueOrThrow({ where: { id: base.id } })).categoryId;

    const onA = [await makeProduct({ stock: 1 }), await makeProduct({ stock: 1 })];
    const onB = [await makeProduct({ stock: 1 })];
    const soldOnA = await makeProduct({ stock: 0 });
    await prisma.product.updateMany({ where: { id: { in: [...onA, soldOnA].map((p) => p.id) } }, data: { fabricId: a.id, categoryId } });
    await prisma.product.updateMany({ where: { id: { in: onB.map((p) => p.id) } }, data: { fabricId: b.id, categoryId } });

    const justA = await getTypeCataloguePage(slug, { cloth: a.slug }, 1);
    expect(justA.total).toBe(2);
    expect(justA.items.map((p) => p.id).sort()).toEqual(onA.map((p) => p.id).sort());

    const wholeFamily = await getTypeCataloguePage(slug, { family }, 1);
    expect(wholeFamily.total).toBe(3);

    const none = await getTypeCataloguePage(slug, { cloth: 'no-such-cloth' }, 1);
    expect(none.total).toBe(0);
    expect(none.items).toEqual([]);
    expect(none.pageCount).toBe(1);
  });
});
