'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { addressSchema, profileSchema, cancelOrderSchema, returnRequestSchema } from '@/lib/validation';
import { notifyOrderCancelled, notifyReturnRequested } from '@/lib/mail';
import { transitionOrder } from '@/lib/order-state';
import { limitByKey, RATE_LIMITED_MESSAGE } from '@/lib/rate-limit';

// FormState lives in lib/form-state.ts — a 'use server' module may only export
// async functions, and one non-function export breaks every action in the graph.
import type { FormState } from '@/lib/form-state';

function fieldErrors(error: import('zod').ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !out[key]) out[key] = issue.message;
  }
  return out;
}

/** Every action here operates on the caller's own rows and nobody else's. */
async function requireUser() {
  const session = await auth();
  return session?.user?.id ?? null;
}

/* -------------------------------------------------------------------------- */
/* Profile                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Name and phone only.
 *
 * The email address is deliberately not editable: it is the identity Auth.js
 * signs the account in with and the second factor that protects order
 * tracking. Changing it is an account-recovery operation, not a profile field.
 */
export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUser();
  if (!userId) return { status: 'error', message: 'Please sign in.' };

  const raw = Object.fromEntries(formData);
  const parsed = profileSchema.safeParse({
    ...raw,
    phone: raw.phone === '' ? undefined : raw.phone,
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      errors: fieldErrors(parsed.error),
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
    },
  });

  revalidatePath('/account');
  return { status: 'success', message: 'Saved.' };
}

/* -------------------------------------------------------------------------- */
/* Addresses                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Editing an address never changes an order.
 *
 * Orders carry their own snapshot of where they were sent (`shipName`,
 * `shipLine1` and the rest), written at checkout. That is the whole reason the
 * snapshot exists: a customer who moves house must not silently rewrite the
 * despatch record of a parcel that arrived at the old one last year.
 */
export async function saveAddress(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUser();
  if (!userId) return { status: 'error', message: 'Please sign in.' };

  const raw = Object.fromEntries(formData);
  const parsed = addressSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      errors: fieldErrors(parsed.error),
    };
  }

  const id = typeof raw.id === 'string' && raw.id ? raw.id : null;
  const makeDefault = raw.isDefault === 'on' || raw.isDefault === 'true';

  const data = {
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    line1: parsed.data.line1,
    line2: parsed.data.line2 || null,
    city: parsed.data.city,
    state: parsed.data.state,
    postalCode: parsed.data.postalCode,
    country: parsed.data.country || 'India',
  };

  if (id) {
    // Scoped by userId so an id from another account updates nothing.
    const owned = await prisma.address.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!owned) return { status: 'error', message: 'That address is no longer saved.' };

    await prisma.address.update({ where: { id: owned.id }, data });
    if (makeDefault) await promoteDefault(userId, owned.id);

    revalidatePath('/account');
    return { status: 'success', message: 'Address updated.' };
  }

  const count = await prisma.address.count({ where: { userId } });
  if (count >= 12) {
    return { status: 'error', message: 'That is as many addresses as an account can hold.' };
  }

  const created = await prisma.address.create({
    data: { ...data, userId, isDefault: count === 0 },
  });
  if (makeDefault) await promoteDefault(userId, created.id);

  revalidatePath('/account');
  return { status: 'success', message: 'Address saved.' };
}

/** Exactly one address is default at a time. */
async function promoteDefault(userId: string, addressId: string) {
  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.address.update({ where: { id: addressId }, data: { isDefault: true } }),
  ]);
}

export async function setDefaultAddress(
  addressId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await requireUser();
  if (!userId) return { ok: false, error: 'Please sign in.' };

  const owned = await prisma.address.findFirst({
    where: { id: addressId, userId },
    select: { id: true },
  });
  if (!owned) return { ok: false, error: 'That address is no longer saved.' };

  await promoteDefault(userId, owned.id);
  revalidatePath('/account');
  return { ok: true };
}

export async function deleteAddress(
  addressId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await requireUser();
  if (!userId) return { ok: false, error: 'Please sign in.' };

  const owned = await prisma.address.findFirst({
    where: { id: addressId, userId },
    select: { id: true, isDefault: true },
  });
  if (!owned) return { ok: false, error: 'That address is no longer saved.' };

  // Orders reference addresses with onDelete: SetNull and keep their own
  // snapshot, so removing one here cannot damage an order's despatch record.
  await prisma.address.delete({ where: { id: owned.id } });

  // Something should still be the default.
  if (owned.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId },
      orderBy: { id: 'asc' },
      select: { id: true },
    });
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }

  revalidatePath('/account');
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Cancellation and returns                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Customer-initiated cancellation.
 *
 * Only before the piece is being worked on. Once it is IN_PRODUCTION somebody
 * has started drawing, and on a craft where a single piece is weeks of one
 * person's hand that is not a decision a form should be able to take — those
 * become a request the store answers, handled through the return flow below.
 *
 * Stock goes back to the catalogue in the same transaction that cancels, for
 * the same reason the admin path does it: on a one-of-one catalogue, failing
 * to restore stock permanently destroys a saleable piece.
 */
export async function cancelOrder(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUser();
  if (!userId) return { status: 'error', message: 'Please sign in.' };

  const parsed = cancelOrderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      errors: fieldErrors(parsed.error),
    };
  }

  const owned = await prisma.order.findFirst({
    where: { number: parsed.data.number, userId },
    select: { number: true, status: true },
  });
  if (!owned) return { status: 'error', message: 'That order is not on your account.' };

  if (owned.status === 'CANCELLED') {
    return { status: 'error', message: 'That order is already cancelled.' };
  }

  // The state service decides whether a customer may cancel from where the
  // order is *now*, and lets exactly one of any concurrent attempts through.
  const result = await transitionOrder({
    orderNumber: owned.number,
    to: 'CANCELLED',
    actor: 'customer',
    note: parsed.data.reason
      ? `Cancelled at the customer's request — ${parsed.data.reason}`
      : "Cancelled at the customer's request.",
  });

  if (!result.ok) {
    if (result.reason === 'conflict') {
      return { status: 'error', message: 'This order just changed. Please reload and try again.' };
    }
    if (result.reason === 'not-found') {
      return { status: 'error', message: 'That order is not on your account.' };
    }
    if (result.from === 'CANCELLED') {
      return { status: 'error', message: 'That order is already cancelled.' };
    }
    return {
      status: 'error',
      message:
        'This piece is already being worked on, so it cannot be cancelled here. Tell us what has changed and someone will reply.',
    };
  }

  const wasPaid = result.refundPending;
  await notifyOrderCancelled({ number: result.before.number, email: result.before.email }, wasPaid);

  revalidatePath('/account');
  revalidatePath('/admin/orders');
  revalidatePath('/');
  return {
    status: 'success',
    message: wasPaid
      ? 'Cancelled. You had paid for this order, so a refund is due. The store will start it and email you once it has been sent.'
      : 'Cancelled. Nothing was charged.',
  };
}

/**
 * A return or a problem with a delivered piece.
 *
 * Deliberately not automated. Hand-painted work has no returnable-condition
 * checklist a form could apply, and the store's own copy says small variations
 * in line and colour are not defects. So this opens a conversation and records
 * it against the order; a person decides.
 */
export async function requestReturn(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUser();
  if (!userId) return { status: 'error', message: 'Please sign in.' };

  if (!(await limitByKey('returnRequest', userId)).ok) {
    return { status: 'error', message: RATE_LIMITED_MESSAGE };
  }

  const parsed = returnRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      errors: fieldErrors(parsed.error),
    };
  }

  const order = await prisma.order.findFirst({
    where: { number: parsed.data.number, userId },
    select: { id: true, number: true, email: true, status: true },
  });
  if (!order) return { status: 'error', message: 'That order is not on your account.' };

  if (order.status !== 'DELIVERED') {
    return {
      status: 'error',
      message: 'This order has not been delivered yet. Track it, or write to us if something looks wrong.',
    };
  }

  await prisma.orderEvent.create({
    data: {
      orderId: order.id,
      status: order.status,
      message: `Return requested by the customer — ${parsed.data.reason}`,
    },
  });

  await notifyReturnRequested(
    { number: order.number, email: order.email },
    parsed.data.reason,
  );

  revalidatePath('/account');
  revalidatePath('/admin/orders');
  return {
    status: 'success',
    message:
      'Your message is with the store. Someone will read it and reply — please keep the piece and its wrapping as they arrived until you hear back.',
  };
}
