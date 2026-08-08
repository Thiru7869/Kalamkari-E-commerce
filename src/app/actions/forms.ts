'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { notifyEnquiry, notifyCommission } from '@/lib/mail';
import { REFERENCE_LIMITS } from '@/content/commission';
import {
  commissionSchema,
  enquirySchema,
  newsletterSchema,
  reviewSchema,
} from '@/lib/validation';

// FormState and initialFormState live in lib/form-state.ts: a 'use server'
// module may only export async functions, and a single non-function export
// breaks every action in the graph.
import type { FormState } from '@/lib/form-state';

function fieldErrors(error: import('zod').ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !out[key]) out[key] = issue.message;
  }
  return out;
}

/* -------------------------------------------------------------------------- */

export async function submitEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = enquirySchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      errors: fieldErrors(parsed.error),
    };
  }

  // Honeypot filled — accept silently so the bot does not learn anything.
  if (parsed.data.website) return { status: 'success', message: 'Thank you — we will be in touch.' };

  const enquiry = await prisma.enquiry.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject,
      message: parsed.data.message,
    },
  });

  // The store has no reason to sit refreshing /admin. Notification failures are
  // swallowed inside the mail layer: the enquiry is already saved, and telling
  // the visitor it failed would be both untrue and useless to them.
  await notifyEnquiry({
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone,
    subject: enquiry.subject,
    message: enquiry.message,
  });

  return {
    status: 'success',
    message:
      'Thank you. Your message has reached the store — someone will reply, usually within a day or two.',
  };
}

/* -------------------------------------------------------------------------- */

/**
 * Reads and validates attached reference pictures.
 *
 * Type is checked against the declared MIME rather than the extension, size is
 * capped per file and by count, and anything that fails is dropped silently
 * rather than failing the whole enquiry — losing a picture is recoverable,
 * losing a commission enquiry because a phone attached a HEIC is not. The
 * store is told in the notification how many arrived.
 */
async function readReferences(formData: FormData) {
  const files = formData
    .getAll('references')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)
    .slice(0, REFERENCE_LIMITS.maxFiles);

  // `Uint8Array<ArrayBuffer>` rather than the default `ArrayBufferLike`:
  // Prisma's Bytes input rejects a view that might be over a SharedArrayBuffer.
  const accepted: {
    filename: string;
    mimeType: string;
    size: number;
    data: Uint8Array<ArrayBuffer>;
  }[] = [];

  for (const file of files) {
    if (!REFERENCE_LIMITS.accept.includes(file.type as (typeof REFERENCE_LIMITS.accept)[number])) {
      continue;
    }
    if (file.size > REFERENCE_LIMITS.maxBytes) continue;

    accepted.push({
      // Never trust a client-supplied filename as a path. This is stored and
      // shown back to the store, never used to open anything.
      filename: file.name.replace(/[^\w.\- ]+/g, '_').slice(0, 200) || 'reference',
      mimeType: file.type,
      size: file.size,
      // Uint8Array rather than Buffer: Prisma Bytes wants a plain view.
      data: new Uint8Array(await file.arrayBuffer()),
    });
  }

  return accepted;
}

export async function submitCommission(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData);
  // Empty budget inputs arrive as '' and must not be coerced to 0.
  const parsed = commissionSchema.safeParse({
    ...raw,
    budgetMin: raw.budgetMin === '' ? undefined : raw.budgetMin,
    budgetMax: raw.budgetMax === '' ? undefined : raw.budgetMax,
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      errors: fieldErrors(parsed.error),
    };
  }

  if (parsed.data.website) {
    return { status: 'success', message: 'Thank you — we will be in touch.' };
  }

  const { budgetMin, budgetMax } = parsed.data;
  if (budgetMin != null && budgetMax != null && budgetMin > budgetMax) {
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      errors: { budgetMax: 'The upper figure should be at least the lower one' },
    };
  }

  const session = await auth();

  const references = await readReferences(formData);

  const commission = await prisma.commissionRequest.create({
    data: {
      attachments: references.length
        ? { create: references.map((r) => ({ ...r })) }
        : undefined,
      userId: session?.user?.id ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      pieceType: parsed.data.pieceType,
      fabric: parsed.data.fabric || null,
      brief: parsed.data.brief,
      // Budgets are entered in rupees and stored in paise like all other money.
      budgetMin: budgetMin != null ? budgetMin * 100 : null,
      budgetMax: budgetMax != null ? budgetMax * 100 : null,
      timeline: parsed.data.timeline || null,
    },
  });

  await notifyCommission({
    attachmentCount: references.length,
    name: commission.name,
    email: commission.email,
    phone: commission.phone,
    pieceType: commission.pieceType,
    fabric: commission.fabric,
    brief: commission.brief,
    budgetMin: commission.budgetMin,
    budgetMax: commission.budgetMax,
    timeline: commission.timeline,
  });

  return {
    status: 'success',
    message: references.length
      ? `Your commission enquiry has reached the store, with ${references.length} reference ${references.length === 1 ? 'picture' : 'pictures'}. Expect a reply within a few days — we will talk through the drawing, the cloth and a realistic timeline before anything is agreed.`
      : 'Your commission enquiry has reached the store. Expect a reply within a few days — we will talk through the drawing, the cloth and a realistic timeline before anything is agreed.',
  };
}

/* -------------------------------------------------------------------------- */

export async function subscribeNewsletter(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = newsletterSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { status: 'error', message: 'Please enter a valid email address.' };
  }
  if (parsed.data.website) return { status: 'success', message: 'Thank you.' };

  // Idempotent: re-subscribing is not an error the visitor needs to see.
  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: {},
    create: { email: parsed.data.email },
  });

  return { status: 'success', message: 'Thank you. We write rarely, and only about the work.' };
}

/* -------------------------------------------------------------------------- */

export async function submitReview(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: 'error', message: 'Please sign in to leave a review.' };
  }

  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      errors: fieldErrors(parsed.error),
    };
  }

  const userId = session.user.id;
  const { productId, rating, title, body } = parsed.data;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });
  if (!product) return { status: 'error', message: 'That piece is no longer listed.' };

  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId } },
  });
  if (existing) {
    return { status: 'error', message: 'You have already reviewed this piece.' };
  }

  // Reviews are restricted to people who actually received the piece. On a
  // one-of-one catalogue an unverified review is close to worthless — there is
  // only ever one buyer, so "someone who owns this" is the only voice that can
  // say anything about it that the product page does not already say.
  const purchased = await prisma.orderItem.findFirst({
    where: { productId, order: { userId, status: 'DELIVERED' } },
    select: { id: true },
  });

  if (!purchased) {
    return {
      status: 'error',
      message:
        'Reviews are written by the person the piece went to. Once your order is marked delivered, this opens up.',
    };
  }

  await prisma.$transaction([
    prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        title: title || null,
        body,
        verified: true,
      },
    }),
    // Denormalised aggregates, kept in the same transaction as the write that
    // invalidates them.
    prisma.product.update({
      where: { id: productId },
      data: { ratingSum: { increment: rating }, ratingCount: { increment: 1 } },
    }),
  ]);

  // The product page is ISR with a 300s window; without this the confirmation
  // below would be untrue for up to five minutes.
  revalidatePath(`/product/${product.slug}`);

  return { status: 'success', message: 'Thank you for writing. Your review is now published.' };
}

/* -------------------------------------------------------------------------- */

/** Used by the admin dashboard to record notes against a commission. */
export async function updateCommissionStatus(
  id: string,
  status: string,
  adminNote?: string,
): Promise<FormState> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { status: 'error', message: 'Not authorised.' };
  }

  const allowed = ['NEW', 'IN_DISCUSSION', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'DECLINED'];
  if (!allowed.includes(status)) return { status: 'error', message: 'Unknown status.' };

  await prisma.commissionRequest.update({
    where: { id },
    data: { status, ...(adminNote !== undefined ? { adminNote } : {}) },
  });

  return { status: 'success', message: 'Updated.' };
}
