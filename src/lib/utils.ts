import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * The custom font sizes from tailwind.config, declared to tailwind-merge.
 *
 * This is not tidiness. tailwind-merge resolves conflicts by deciding which
 * *group* a class belongs to, and `text-*` is two groups wearing one prefix:
 * `font-size` and `text-color`. It tells them apart from a list of known size
 * keys, and that list is the stock Tailwind scale — it has never heard of
 * `display-xl`. So `text-display-xl` was being filed as a colour, found to
 * conflict with the colour beside it, and dropped.
 *
 * Silently, and only through `cn()`. A plain `className="text-display-xl
 * text-cotton-50"` string is untouched and renders correctly, which is why
 * this survived: it only appears when a component merges a caller's classes,
 * and then the heading simply inherits 16px from the body. The site's largest
 * headline rendering smaller than the paragraph under it is what it looks
 * like from the outside.
 *
 * Every custom key in `theme.extend.fontSize` has to be listed here. If you
 * add one there, add it here, or it will disappear the first time it meets a
 * text colour inside `cn()`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-xl',
            'display-lg',
            'display-md',
            'display-sm',
            'body-lg',
            'body-base',
            'eyebrow',
          ],
        },
      ],
    },
  },
});

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

/** Eight characters from a 29-letter alphabet: about 5e11 numbers. */
const ORDER_REF_LENGTH = 8;

/**
 * A uniformly random index below `limit`, from the platform CSPRNG.
 *
 * `Math.random` is not a security primitive and an order number is half of what
 * unlocks an order. Rejection sampling avoids the modulo bias of `x % 29`.
 * Web Crypto rather than `node:crypto` because this module is also bundled for
 * the browser.
 */
function secureIndex(limit: number): number {
  const ceiling = 256 - (256 % limit);
  const byte = new Uint8Array(1);
  for (;;) {
    globalThis.crypto.getRandomValues(byte);
    if (byte[0] < ceiling) return byte[0] % limit;
  }
}

export function generateOrderNumber() {
  let ref = '';
  for (let i = 0; i < ORDER_REF_LENGTH; i += 1) {
    ref += REF_ALPHABET[secureIndex(REF_ALPHABET.length)];
  }
  return `SVL-${ref}`;
}

/**
 * The site's public origin, for canonicals, OG images, the sitemap and robots.
 *
 * The order matters, and the last two entries are the point of it.
 *
 * This used to be `NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'`, which is
 * correct right up until somebody deploys without setting the variable — and
 * then every canonical tag, every Open Graph image and every URL in
 * sitemap.xml confidently points at localhost. Nothing fails, nothing is
 * logged, and the damage is done in a search index rather than in a build log.
 *
 * Vercel injects its own domains at build time, so the deployment can name
 * itself when nobody has named it: the project's stable production domain
 * first, then the per-deployment URL (which is what a preview build gets).
 * An explicit NEXT_PUBLIC_SITE_URL still wins, and is what a custom domain
 * should always set.
 */
function siteOrigin() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit;

  // Vercel supplies these without a scheme.
  const production = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;

  const deployment = process.env.NEXT_PUBLIC_VERCEL_URL;
  if (deployment) return `https://${deployment}`;

  return 'http://localhost:3000';
}

export function absoluteUrl(path = '') {
  const base = siteOrigin().replace(/\/$/, '');
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
