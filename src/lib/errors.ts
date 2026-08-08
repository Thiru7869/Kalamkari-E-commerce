/**
 * Typed domain errors.
 *
 * These exist so that control flow across a transaction boundary does not
 * depend on string matching. A thrown `Error('SOLD_OUT:' + name)` caught by
 * `message.startsWith('SOLD_OUT:')` works right up until a piece is named with
 * a colon in it, or until someone rewords the message — and then it fails
 * silently, as the wrong kind of error, in the middle of taking money.
 *
 * Deliberately free of `server-only`: nothing here touches a request, and the
 * types are useful either side of the boundary.
 */

/**
 * A piece was taken by someone else between the cart being read and the stock
 * being decremented. Carries the name so the customer can be told which one.
 */
export class SoldOutError extends Error {
  readonly productName: string;

  constructor(productName: string) {
    super(`Sold out: ${productName}`);
    this.name = 'SoldOutError';
    this.productName = productName;
  }
}

export function isSoldOutError(error: unknown): error is SoldOutError {
  return error instanceof SoldOutError;
}
