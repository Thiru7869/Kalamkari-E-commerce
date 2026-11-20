'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { ORDER_STATUSES, statusDescription, statusLabel } from '@/lib/orders';
import { transitionOrder } from '@/lib/order-state';
import { orderNumberSchema } from '@/lib/schemas/order-number';
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

  const parsedNumber = orderNumberSchema.safeParse(orderNumber);
  if (!parsedNumber.success) return { ok: false, error: 'Order not found.' };

  // Every status change goes through the one service: legal moves only, one
  // winner among concurrent callers, and stock returned exactly once.
  const result = await transitionOrder({
    orderNumber: parsedNumber.data,
    to: status,
    actor: 'admin',
    note: note?.trim() || undefined,
  });

  if (!result.ok) {
    switch (result.reason) {
      case 'not-found':
        return { ok: false, error: 'Order not found.' };
      case 'awaiting-payment':
        return { ok: false, error: 'This order is waiting for its online payment and cannot be confirmed by hand.' };
      case 'conflict':
        return { ok: false, error: 'Somebody changed this order just now. Reload and look again.' };
      default:
        return {
          ok: false,
          error: `An order that is ${statusLabel(result.from ?? '').toLowerCase()} cannot be moved to ${statusLabel(status).toLowerCase()}.`,
        };
    }
  }

  const { before } = result;

  // Tell the customer, for the transitions they would want to hear about.
  // A status the store moves through internally (PACKED) is not one of them —
  // an email per internal step trains people to stop reading them.
  const message = note?.trim() || statusDescription(status);

  if (status === 'SHIPPED') {
    await notifyOrderDispatched(
      { number: before.number, email: before.email, shipName: before.shipName },
      before.courier,
      before.trackingNumber,
    );
  } else if (status === 'CANCELLED') {
    await notifyOrderCancelled(
      { number: before.number, email: before.email },
      result.refundPending,
    );
  } else if (status === 'IN_PRODUCTION' || status === 'DELIVERED') {
    await notifyOrderStatus({ number: before.number, email: before.email }, status, message);
  }

  revalidatePath('/admin');
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${before.number}`);
  revalidatePath('/shop');
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
