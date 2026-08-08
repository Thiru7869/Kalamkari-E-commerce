'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { ORDER_STATUSES, statusDescription, statusLabel } from '@/lib/orders';
import { notifyOrderDispatched, notifyOrderCancelled, notifyOrderStatus } from '@/lib/mail';

type Result = { ok: true; message: string } | { ok: false; error: string };

/** Every admin action goes through this. There is no other way in. */
async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('NOT_AUTHORISED');
  return session.user;
}

export async function updateOrderStatus(
  orderNumber: string,
  status: string,
  note?: string,
): Promise<Result> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Not authorised.' };
  }

  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    return { ok: false, error: 'Unknown status.' };
  }

  const order = await prisma.order.findUnique({
    where: { number: orderNumber },
    include: { items: true },
  });
  if (!order) return { ok: false, error: 'Order not found.' };

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status,
        // Timestamps are only ever set, never cleared, so the history of an
        // order stays readable even if it moves backwards through statuses.
        ...(status === 'CONFIRMED' && !order.confirmedAt ? { confirmedAt: now } : {}),
        ...(status === 'SHIPPED' && !order.shippedAt ? { shippedAt: now } : {}),
        ...(status === 'DELIVERED' && !order.deliveredAt ? { deliveredAt: now } : {}),
        ...(status === 'CANCELLED' && !order.cancelledAt ? { cancelledAt: now } : {}),
        // Cancelling an order that was actually paid for owes the customer
        // money. Recording that here means the refund shows on the order and
        // in the admin list, rather than living only in somebody's memory.
        // The money itself moves in the payment provider's dashboard; this is
        // the store's record that it should.
        ...(status === 'CANCELLED' && order.paymentStatus === 'PAID'
          ? { paymentStatus: 'REFUNDED' }
          : {}),
      },
    });

    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        status,
        message: note?.trim() || statusDescription(status) || statusLabel(status),
      },
    });

    // Cancelling returns the pieces to the catalogue — on a one-of-one
    // catalogue, failing to do this permanently removes a saleable item.
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      for (const item of order.items) {
        if (!item.productId) continue;
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  });

  // Tell the customer, for the transitions they would want to hear about.
  // A status the store moves through internally (PACKED) is not one of them —
  // an email per internal step trains people to stop reading them.
  const message = note?.trim() || statusDescription(status);

  if (status === 'SHIPPED' && order.status !== 'SHIPPED') {
    await notifyOrderDispatched(
      { number: order.number, email: order.email, shipName: order.shipName },
      order.courier,
      order.trackingNumber,
    );
  } else if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
    await notifyOrderCancelled(
      { number: order.number, email: order.email },
      order.paymentStatus === 'PAID',
    );
  } else if ((status === 'IN_PRODUCTION' || status === 'DELIVERED') && order.status !== status) {
    await notifyOrderStatus({ number: order.number, email: order.email }, status, message);
  }

  revalidatePath('/admin');
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderNumber}`);
  return { ok: true, message: `Order marked ${statusLabel(status).toLowerCase()}.` };
}

export async function updateShipping(
  orderNumber: string,
  courier: string,
  trackingNumber: string,
): Promise<Result> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Not authorised.' };
  }

  await prisma.order.update({
    where: { number: orderNumber },
    data: {
      courier: courier.trim() || null,
      trackingNumber: trackingNumber.trim() || null,
    },
  });

  revalidatePath(`/admin/orders/${orderNumber}`);
  return { ok: true, message: 'Courier details saved.' };
}

export async function setCommissionStatus(id: string, status: string): Promise<Result> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Not authorised.' };
  }

  const allowed = ['NEW', 'IN_DISCUSSION', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'DECLINED'];
  if (!allowed.includes(status)) return { ok: false, error: 'Unknown status.' };

  await prisma.commissionRequest.update({ where: { id }, data: { status } });
  revalidatePath('/admin/commissions');
  return { ok: true, message: 'Updated.' };
}

export async function markEnquiryHandled(id: string, handled: boolean): Promise<Result> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Not authorised.' };
  }

  await prisma.enquiry.update({ where: { id }, data: { handled } });
  revalidatePath('/admin/enquiries');
  return { ok: true, message: handled ? 'Marked as handled.' : 'Reopened.' };
}

export async function setProductStatus(id: string, status: string): Promise<Result> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Not authorised.' };
  }

  if (!['ACTIVE', 'DRAFT', 'ARCHIVED'].includes(status)) {
    return { ok: false, error: 'Unknown status.' };
  }

  await prisma.product.update({ where: { id }, data: { status } });
  revalidatePath('/admin/products');
  revalidatePath('/shop');
  return { ok: true, message: 'Updated.' };
}

export async function setProductStock(id: string, stock: number): Promise<Result> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Not authorised.' };
  }

  if (!Number.isInteger(stock) || stock < 0 || stock > 999) {
    return { ok: false, error: 'Stock must be a whole number between 0 and 999.' };
  }

  await prisma.product.update({ where: { id }, data: { stock } });
  revalidatePath('/admin/products');
  revalidatePath('/shop');
  return { ok: true, message: 'Stock updated.' };
}
