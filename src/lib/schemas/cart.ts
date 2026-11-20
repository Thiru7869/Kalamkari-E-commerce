import { z } from 'zod';

/**
 * Cart input, validated where it enters the server.
 *
 * Server actions are public POST endpoints. TypeScript's `quantity: number`
 * constrains the component that calls them and nothing else — a hand-built
 * request can send `-5`, `0.5`, `NaN` or `1e21`, and before this existed the
 * negative one passed straight through: a cart line of -5 priced as a
 * discount at checkout, and a stock decrement of -5 *added* stock.
 */

/** No single line in a bag is ever larger than this. */
export const MAX_CART_QUANTITY = 10;

/** An id as it arrives from the browser: opaque, bounded, never trusted. */
export const idSchema = z.string().trim().min(1).max(64);

/** A quantity somebody is adding: a whole number, at least one. */
export const addQuantitySchema = z.number().int().min(1).max(MAX_CART_QUANTITY);

/**
 * A quantity somebody is setting. Zero is accepted and means "remove" because
 * the quantity stepper in the bag sends it; negatives and fractions are not.
 */
export const setQuantitySchema = z.number().int().min(0).max(MAX_CART_QUANTITY);

/** A quantity already stored on a cart or order line. Never zero. */
export const storedQuantitySchema = addQuantitySchema;
