'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
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

  await prisma.enquiry.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject,
      message: parsed.data.message,
    },
  });

  return {
    status: 'success',
    message:
      'Thank you. Your message has reached the store — someone will reply, usually within a day or two.',
  };
}

/* -------------------------------------------------------------------------- */

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

  await prisma.commissionRequest.create({
    data: {
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

  return {
    status: 'success',
    message:
      'Your commission enquiry has reached the store. Expect a reply within a few days — we will talk through the drawing, the cloth and a realistic timeline before anything is agreed.',
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

  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId } },
  });
  if (existing) {
    return { status: 'error', message: 'You have already reviewed this piece.' };
  }

  // "Verified" means there is a delivered order containing this piece.
  const purchased = await prisma.orderItem.findFirst({
    where: { productId, order: { userId, status: 'DELIVERED' } },
    select: { id: true },
  });

  await prisma.$transaction([
    prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        title: title || null,
        body,
        verified: Boolean(purchased),
      },
    }),
    // Denormalised aggregates, kept in the same transaction as the write that
    // invalidates them.
    prisma.product.update({
      where: { id: productId },
      data: { ratingSum: { increment: rating }, ratingCount: { increment: 1 } },
    }),
  ]);

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
