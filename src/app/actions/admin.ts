'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { ORDER_STATUSES, statusDescription, statusLabel } from '@/lib/orders';

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
