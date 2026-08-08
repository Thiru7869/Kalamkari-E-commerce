/**
 * The schema stores lists as newline-delimited text so it runs unchanged on
 * SQLite and PostgreSQL (SQLite has no array or native JSON column type).
 * These are the only two functions allowed to know that.
 */

export function toList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function fromList(values: readonly string[] | null | undefined): string {
  if (!values?.length) return '';
  return values.map((v) => v.trim()).filter(Boolean).join('\n');
}

/** First image of a product, with a neutral fallback so cards never break. */
export function primaryImage(images: string | null | undefined): string {
  return toList(images)[0] ?? '/images/placeholder-cloth.jpg';
}
