import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Money is stored and passed around as integer paise everywhere in this
 * codebase. It is converted to a display string exactly once, here.
 */
export function formatPrice(paise: number, opts?: { withDecimals?: boolean }) {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: opts?.withDecimals ? 2 : 0,
    maximumFractionDigits: opts?.withDecimals ? 2 : 0,
  }).format(rupees);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    // Strip combining diacritics left behind by NFKD decomposition, then
    // anything that is not URL-safe.
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Order numbers are shown to customers over the phone, so the alphabet omits
 * characters that are misheard or misread: I/1, O/0, S/5, B/8.
 */
const REF_ALPHABET = 'ACDEFGHJKLMNPQRTUVWXYZ2346789';

export function generateOrderNumber() {
  let ref = '';
  for (let i = 0; i < 6; i += 1) {
    ref += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)];
  }
  return `SVL-${ref}`;
}

export function absoluteUrl(path = '') {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Average rating, or null when a product has no reviews yet. */
export function averageRating(sum: number, count: number) {
  if (count <= 0) return null;
  return Math.round((sum / count) * 10) / 10;
}

export function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}
