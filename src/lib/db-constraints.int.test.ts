import { describe, expect, it } from 'vitest';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { makeOrder, makeProduct } from '@/test/fixtures';

/**
 * The database is the last line of defence. These write *around* the
 * application — straight through Prisma — to prove the constraints in the
 * shipped migration hold when the validation above them has been bypassed or
 * has a bug. (This is the "direct invalid database quantity insertion" case.)
 */

const rejected = async (run: () => Promise<unknown>) => {
  const error = await run().then(
    () => null,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(Error);
  return String((error as Error).message);
};

describe('CHECK constraints from the Phase 1 migration', () => {
  it('rejects a cart line with a negative quantity', async () => {
    const product = await makeProduct();
    const cart = await prisma.cart.create({ data: { guestId: crypto.randomUUID() } });

    const message = await rejected(() =>
      prisma.cartItem.create({ data: { cartId: cart.id, productId: product.id, quantity: -5 } }),
    );
    expect(message).toMatch(/CartItem_quantity_positive|check constraint/i);
  });

  it('rejects a cart line with a zero quantity', async () => {
    const product = await makeProduct();
    const cart = await prisma.cart.create({ data: { guestId: crypto.randomUUID() } });
    await rejected(() =>
      prisma.cartItem.create({ data: { cartId: cart.id, productId: product.id, quantity: 0 } }),
    );
  });

  it('rejects an order line with a non-positive quantity', async () => {
    const product = await makeProduct();
    const order = await makeOrder({ lines: [{ productId: product.id, quantity: 1 }] });
    await rejected(() =>
      prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          name: 'x',
          slug: 'x',
          image: '/x.jpg',
          price: 1,
          quantity: -2,
        },
      }),
    );
  });

  it('rejects negative stock, however it is reached', async () => {
    const product = await makeProduct({ stock: 1 });
    await rejected(() =>
      prisma.product.update({ where: { id: product.id }, data: { stock: { decrement: 2 } } }),
    );
    await rejected(() =>
      prisma.product.update({ where: { id: product.id }, data: { stock: -1 } }),
    );
    expect((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stock).toBe(1);
  });

  it('rejects an order with a negative total', async () => {
    await rejected(() => makeOrder({ total: -1 }));
  });

  it('still accepts the values it is meant to', async () => {
    const product = await makeProduct({ stock: 0 });
    const order = await makeOrder({ total: 0, lines: [{ productId: product.id, quantity: 1 }] });
    expect(order.total).toBe(0);
    expect(product.stock).toBe(0);
  });

  it('is a CHECK on the table, not just a Prisma-level rule', async () => {
    const rows = await prisma.$queryRaw<{ conname: string }[]>(
      Prisma.sql`SELECT conname FROM pg_constraint WHERE contype = 'c' AND conname LIKE '%_positive' OR conname LIKE '%_nonnegative'`,
    );
    const names = rows.map((r) => r.conname);
    expect(names).toEqual(
      expect.arrayContaining([
        'CartItem_quantity_positive',
        'OrderItem_quantity_positive',
        'Product_stock_nonnegative',
        'Order_total_nonnegative',
      ]),
    );
  });
});
