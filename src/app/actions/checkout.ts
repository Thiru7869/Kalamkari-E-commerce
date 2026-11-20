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
import { notifyOrderPlaced } from '@/lib/mail';
import { grantOrderAccess } from '@/lib/order-access';
import { SoldOutError, isSoldOutError } from '@/lib/errors';
import { Prisma } from '@prisma/client';
import { storedQuantitySchema } from '@/lib/schemas/cart';
import { limitByIp, limitByPrivateKey, RATE_LIMITED_MESSAGE } from '@/lib/rate-limit';

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
  // Placing an order takes a piece off sale before anybody has paid for it, so
  // this is the most valuable thing on the site to abuse. Limited by address
  // first (cheap, before any parsing) and by email once we have one.
  if (!(await limitByIp('checkout')).ok) {
    return { status: 'error', message: RATE_LIMITED_MESSAGE };
  }

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

  if (!(await limitByPrivateKey('checkoutEmail', input.email)).ok) {
    return { status: 'error', message: RATE_LIMITED_MESSAGE };
  }

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

  // The cart is data in a table, not a promise. A row written before quantity
  // was validated — or by hand — could hold zero, a negative or a figure no bag
  // should carry; nothing downstream may be allowed to do arithmetic on it.
  if (
    items.some(
      (i) =>
        !storedQuantitySchema.safeParse(i.quantity).success ||
        !Number.isInteger(i.product.price) ||
        i.product.price <= 0,
    )
  ) {
    return {
      status: 'error',
      message: 'Something in your bag is not valid. Please remove it and add it again.',
    };
  }

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

  if (!Number.isInteger(totals.total) || totals.total <= 0) {
    return { status: 'error', message: 'Your bag could not be priced. Please review it.' };
  }

  // Locked in a fixed order, so two orders that share pieces cannot each take
  // one lock and wait for the other's.
  const lockOrder = [...lines].sort((a, b) => a.productId.localeCompare(b.productId));

  const place = (orderNumber: string) => prisma.$transaction(async (tx) => {
    // Re-check stock inside the transaction and decrement atomically. On a
    // one-of-one catalogue this is the difference between selling a piece once
    // and selling it twice.
    for (const line of lockOrder) {
      const updated = await tx.product.updateMany({
        where: { id: line.productId, stock: { gte: line.quantity }, status: 'ACTIVE' },
        data: { stock: { decrement: line.quantity } },
      });
      if (updated.count === 0) {
        throw new SoldOutError(line.name);
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
  });

  let order: Awaited<ReturnType<typeof place>> | { soldOut: string };
  try {
    order = await placeWithFreshNumber(place);
  } catch (error) {
    if (isSoldOutError(error)) order = { soldOut: error.productName };
    else throw error;
  }

  if ('soldOut' in order) {
    return {
      status: 'error',
      message: `${order.soldOut} sold while you were checking out. Nothing has been charged.`,
    };
  }

  // Receipt to the customer, notice to the store.
  //
  // Only for cash on delivery: an online order is not really an order until
  // the payment clears, and telling somebody their order is confirmed before
  // that would be a lie the webhook would then have to retract. The Razorpay
  // path sends the same mail from the payment handler.
  if (input.paymentMethod === 'COD') {
    await notifyOrderPlaced({
      number: order.number,
      email: order.email,
      shipName: order.shipName,
      shipLine1: order.shipLine1,
      shipLine2: order.shipLine2,
      shipCity: order.shipCity,
      shipState: order.shipState,
      shipPostalCode: order.shipPostalCode,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      paymentMethod: order.paymentMethod,
      items: lines.map((l) => ({ name: l.name, quantity: l.quantity, price: l.price })),
    });
  }

  revalidatePath('/cart');
  revalidatePath('/', 'layout');

  // Entitle this browser to read the order, so the confirmation URL does not
  // have to carry the email address that protects it.
  await grantOrderAccess(order.number);

  // redirect() throws internally, so it must be outside the transaction.
  redirect(`/checkout/confirmation/${order.number}`);
}

/**
 * Runs the order transaction, drawing a new number if one is already taken.
 *
 * Numbers are random, so a collision is possible in principle; the unique
 * constraint turns it into an error, and the whole transaction — stock
 * included — has rolled back by then, so trying again with a new number is safe.
 */
async function placeWithFreshNumber<T>(run: (orderNumber: string) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await run(generateOrderNumber());
    } catch (error) {
      const collision =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        String(error.meta?.target ?? '').includes('number');
      if (!collision || attempt >= 4) throw error;
    }
  }
}
