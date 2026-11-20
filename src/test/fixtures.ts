import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';

/**
 * Rows for integration tests. Every fixture gets a random suffix, so tests
 * never collide with each other or with seeded data, and none needs cleaning up.
 */

const tag = () => randomBytes(4).toString('hex');

let categoryId: string | null = null;

async function category() {
  if (categoryId) return categoryId;
  const row = await prisma.category.create({
    data: {
      slug: `test-${tag()}`,
      name: 'Test category',
      tagline: 't',
      description: 'd',
      heroImage: '/x.jpg',
    },
  });
  categoryId = row.id;
  return row.id;
}

export async function makeProduct(overrides: { stock?: number; price?: number } = {}) {
  const id = tag();
  return prisma.product.create({
    data: {
      slug: `piece-${id}`,
      name: `Test piece ${id}`,
      summary: 's',
      description: 'd',
      categoryId: await category(),
      price: overrides.price ?? 500_000,
      images: '/images/placeholder-cloth.jpg',
      naturalDyes: 'Madder red',
      stock: overrides.stock ?? 1,
    },
  });
}

export async function makeUser(role = 'CUSTOMER') {
  return prisma.user.create({ data: { email: `u-${tag()}@example.test`, role } });
}

export async function makeOrder(
  over: {
    status?: string;
    paymentStatus?: string;
    paymentMethod?: 'COD' | 'RAZORPAY';
    razorpayOrderId?: string | null;
    userId?: string | null;
    total?: number;
    lines?: { productId: string; quantity: number; price?: number }[];
  } = {},
) {
  const total = over.total ?? 500_000;
  return prisma.order.create({
    data: {
      number: `SVL-${tag().toUpperCase()}${tag().toUpperCase()}`.slice(0, 12),
      userId: over.userId ?? null,
      email: `buyer-${tag()}@example.test`,
      phone: '9876543210',
      shipName: 'Test Buyer',
      shipLine1: '1 Test Street',
      shipCity: 'Srikalahasti',
      shipState: 'Andhra Pradesh',
      shipPostalCode: '517644',
      subtotal: total,
      shipping: 0,
      total,
      status: over.status ?? 'PENDING',
      paymentMethod: over.paymentMethod ?? 'RAZORPAY',
      paymentStatus: over.paymentStatus ?? 'PENDING',
      razorpayOrderId: over.razorpayOrderId ?? null,
      items: {
        create: (over.lines ?? []).map((l) => ({
          productId: l.productId,
          name: 'Test piece',
          slug: 'test-piece',
          image: '/x.jpg',
          price: l.price ?? total,
          quantity: l.quantity,
        })),
      },
    },
  });
}

export const stockOf = async (productId: string) =>
  (await prisma.product.findUniqueOrThrow({ where: { id: productId } })).stock;

export const orderOf = (id: string) => prisma.order.findUniqueOrThrow({ where: { id } });
