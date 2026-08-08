'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { resolveCart, computeTotals } from '@/lib/cart';
import { checkoutSchema } from '@/lib/validation';
import { generateOrderNumber } from '@/lib/utils';
import { primaryImage } from '@/lib/serialize';
import { isRazorpayConfigured } from '@/lib/payments';

// CheckoutState and initialCheckoutState live in lib/form-state.ts — see the
// note there on why a 'use server' module cannot export them.
import type { CheckoutState } from '@/lib/form-state';

/**
 * Places an order.
 *
 * The important property here is that prices and stock are read from the
 * database inside the transaction — never from the client. A cart posted with
 * tampered prices, or containing a piece that sold thirty seconds ago, is
 * rejected rather than honoured.
 */
export async function placeOrder(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const raw = Object.fromEntries(formData);
  const parsed = checkoutSchema.safeParse({
    ...raw,
    saveAddress: raw.saveAddress === 'on' || raw.saveAddress === 'true',
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !errors[key]) errors[key] = issue.message;
    }
    return { status: 'error', message: 'Please check the highlighted fields.', errors };
  }

  const input = parsed.data;

  if (input.paymentMethod === 'RAZORPAY' && !isRazorpayConfigured()) {
    return {
      status: 'error',
      message: 'Online payment is not available right now. Please choose cash on delivery.',
    };
  }

  const session = await auth();
  const cart = await resolveCart();
  if (!cart) return { status: 'error', message: 'Your bag is empty.' };

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true,
          stock: true,
          status: true,
        },
      },
    },
  });

  if (items.length === 0) return { status: 'error', message: 'Your bag is empty.' };

  const unavailable = items.filter(
    (i) => i.product.status !== 'ACTIVE' || i.product.stock < i.quantity,
  );
  if (unavailable.length > 0) {
    return {
      status: 'error',
      message: `${unavailable
        .map((i) => i.product.name)
        .join(', ')} sold before this order was placed. Please remove it from your bag.`,
    };
  }

  // Authoritative pricing, computed server-side from current catalogue rows.
  const lines = items.map((i) => ({
    productId: i.product.id,
    name: i.product.name,
    slug: i.product.slug,
    image: primaryImage(i.product.images),
    price: i.product.price,
    quantity: i.quantity,
    stock: i.product.stock,
    categorySlug: '',
    id: i.id,
  }));
  const totals = computeTotals(lines);

  const orderNumber = generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    // Re-check stock inside the transaction and decrement atomically. On a
    // one-of-one catalogue this is the difference between selling a piece once
    // and selling it twice.
    for (const line of lines) {
      const updated = await tx.product.updateMany({
        where: { id: line.productId, stock: { gte: line.quantity }, status: 'ACTIVE' },
        data: { stock: { decrement: line.quantity } },
      });
      if (updated.count === 0) {
        throw new Error(`SOLD_OUT:${line.name}`);
      }
    }

    const created = await tx.order.create({
      data: {
        number: orderNumber,
        userId: session?.user?.id ?? null,
        email: input.email,
        phone: input.phone,
        shipName: input.fullName,
        shipLine1: input.line1,
        shipLine2: input.line2 || null,
        shipCity: input.city,
        shipState: input.state,
        shipPostalCode: input.postalCode,
        shipCountry: input.country || 'India',
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        total: totals.total,
        paymentMethod: input.paymentMethod,
        // COD orders are confirmed immediately; online orders wait for payment.
        status: input.paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
        paymentStatus: 'PENDING',
        confirmedAt: input.paymentMethod === 'COD' ? new Date() : null,
        customerNote: input.customerNote || null,
        items: {
          create: lines.map((l) => ({
            productId: l.productId,
            name: l.name,
            slug: l.slug,
            image: l.image,
            price: l.price,
            quantity: l.quantity,
          })),
        },
        events: {
          create: {
            status: input.paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
            message:
              input.paymentMethod === 'COD'
                ? 'Order received at the store in Srikalahasti. We will call to confirm before dispatch.'
                : 'Order created. Waiting for payment to complete.',
          },
        },
      },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    if (input.saveAddress && session?.user?.id) {
      await tx.address.create({
        data: {
          userId: session.user.id,
          fullName: input.fullName,
          phone: input.phone,
          line1: input.line1,
          line2: input.line2 || null,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country || 'India',
        },
      });
    }

    return created;
  }).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : '';
    if (message.startsWith('SOLD_OUT:')) {
      return { soldOut: message.slice('SOLD_OUT:'.length) } as const;
    }
    throw error;
  });

  if ('soldOut' in order) {
    return {
      status: 'error',
      message: `${order.soldOut} sold while you were checking out. Nothing has been charged.`,
    };
  }

  revalidatePath('/cart');
  revalidatePath('/', 'layout');

  // redirect() throws internally, so it must be outside the transaction.
  redirect(`/checkout/confirmation/${order.number}?email=${encodeURIComponent(input.email)}`);
}
