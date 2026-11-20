import { describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { getProducts, getRelatedProducts, getSoldProducts } from '@/lib/queries';
import { makeProduct } from '@/test/fixtures';

/**
 * Sold pieces are kept out of the shop grid and live in the archive, and a
 * piece's "similar" rail never recommends one that cannot be bought.
 */

const categoryOf = async (id: string) => {
  const row = await prisma.product.findUniqueOrThrow({
    where: { id },
    select: { categoryId: true, category: { select: { slug: true } } },
  });
  return { categoryId: row.categoryId, slug: row.category.slug };
};

describe('shop visibility — available versus sold', () => {
  it('the shop grid lists available pieces and not sold ones', async () => {
    const available = await makeProduct({ stock: 1 });
    const sold = await makeProduct({ stock: 0 });
    const { slug } = await categoryOf(available.id);

    const { items } = await getProducts({ category: slug, inStockOnly: true, page: 1 });
    const ids = items.map((p) => p.id);

    expect(ids).toContain(available.id);
    expect(ids).not.toContain(sold.id);
  });

  it('the archive lists sold pieces and not available ones', async () => {
    const available = await makeProduct({ stock: 1 });
    const sold = await makeProduct({ stock: 0 });

    const { items, total } = await getSoldProducts(1);
    const ids = items.map((p) => p.id);

    expect(total).toBeGreaterThan(0);
    expect(ids).toContain(sold.id);
    expect(ids).not.toContain(available.id);
  });

  it('similar pieces never include a sold piece', async () => {
    const subject = await makeProduct({ stock: 0 });
    const sold = await makeProduct({ stock: 0 });
    const available = await makeProduct({ stock: 1 });
    const { categoryId } = await categoryOf(subject.id);

    const related = await getRelatedProducts(subject.id, categoryId, []);
    const ids = related.map((p) => p.id);

    expect(ids).toContain(available.id);
    expect(ids).not.toContain(sold.id);
    expect(ids).not.toContain(subject.id);
  });
});
