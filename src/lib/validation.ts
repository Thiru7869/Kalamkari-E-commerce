import { z } from 'zod';
import { orderNumberSchema } from '@/lib/schemas/order-number';

/**
 * Shared schemas. These run on the server for every mutation; client-side
 * validation is a convenience layer only and never the enforcement point.
 */

/** Indian mobile numbers, tolerant of +91, 0 prefixes and spacing. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-()]/g, ''))
  .refine((v) => /^(?:\+?91)?[6-9]\d{9}$/.test(v), {
    message: 'Enter a valid 10-digit Indian mobile number',
  });

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address');

export const pincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit PIN code');

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, 'Name is required').max(120),
  phone: phoneSchema,
  line1: z.string().trim().min(4, 'Address is required').max(200),
  line2: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().min(2, 'City is required').max(100),
  state: z.string().trim().min(2, 'State is required').max(100),
  postalCode: pincodeSchema,
  country: z.string().trim().default('India'),
});

export const checkoutSchema = addressSchema.extend({
  email: emailSchema,
  paymentMethod: z.enum(['COD', 'RAZORPAY']),
  customerNote: z.string().trim().max(600).optional().or(z.literal('')),
  saveAddress: z.boolean().optional(),
});

export const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  email: emailSchema,
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  subject: z.string().trim().min(2, 'Subject is required').max(150),
  message: z.string().trim().min(10, 'Please tell us a little more').max(2000),
  // Honeypot: a hidden field only a bot will fill.
  website: z.string().max(0).optional(),
});

export const commissionSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  email: emailSchema,
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  pieceType: z.enum(['saree', 'dupatta', 'blouse', 'painting', 'home-decor', 'other']),
  fabric: z.string().trim().max(80).optional().or(z.literal('')),
  brief: z
    .string()
    .trim()
    .min(20, 'Please describe what you would like painted — even a few sentences helps')
    .max(3000),
  budgetMin: z.coerce.number().int().min(0).max(100_000_000).optional(),
  budgetMax: z.coerce.number().int().min(0).max(100_000_000).optional(),
  timeline: z.string().trim().max(200).optional().or(z.literal('')),
  website: z.string().max(0).optional(),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().or(z.literal('')),
  body: z.string().trim().min(10, 'Please write at least a sentence').max(2000),
});

export const newsletterSchema = z.object({
  email: emailSchema,
  website: z.string().max(0).optional(),
});

/**
 * Profile. Email is absent on purpose — it is the sign-in identity and the
 * second factor on order tracking, so changing it is account recovery rather
 * than a profile edit.
 */
export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  phone: phoneSchema.optional(),
});

export const cancelOrderSchema = z.object({
  number: orderNumberSchema,
  reason: z.string().trim().max(600).optional().or(z.literal('')),
});

export const returnRequestSchema = z.object({
  number: orderNumberSchema,
  reason: z
    .string()
    .trim()
    .min(15, 'Please tell us what is wrong — a sentence is enough')
    .max(2000),
});

export const trackOrderSchema = z.object({
  number: orderNumberSchema,
  email: emailSchema,
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CommissionInput = z.infer<typeof commissionSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;
