import { z } from 'zod';

/**
 * The one definition of what an order number looks like.
 *
 * It used to be written out three times (`validation.ts`, `order-access.ts`,
 * `api/razorpay/route.ts`), which is how a change to the format would have
 * been applied to two of them.
 *
 * Six characters are accepted because every order placed before the move to
 * eight is still addressable under its original number. New numbers are eight.
 * Free of `server-only` so the generator in `utils.ts` and the schemas can
 * share it.
 */
export const ORDER_NUMBER_PATTERN = /^SVL-[A-Z0-9]{6,8}$/;

export const orderNumberSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(ORDER_NUMBER_PATTERN, 'Order numbers look like SVL-2A7F4C9H');

export function isOrderNumber(value: string): boolean {
  return ORDER_NUMBER_PATTERN.test(value);
}
