/**
 * The state of a type page's catalogue, as it lives in the URL.
 *
 *   /types/sarees?fabric=chanderi&page=2#catalogue-top
 *
 * `fabric` is a cloth slug, or `family:<name>` for every cloth in a family.
 * Anything that does not name a cloth this page actually offers is ignored
 * rather than answered with an empty grid, and the page number is clamped on
 * the server, so a stale link lands on a real page instead of an error.
 */

export type CatalogueCloth = { slug: string; family: string };

export type CatalogueState = {
  /** One cloth, by slug. */
  cloth?: string;
  /** Every cloth in a family. Mutually exclusive with `cloth`. */
  family?: string;
  page: number;
};

export const FAMILY_PREFIX = 'family:';
const MAX_PAGE = 1000;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function parseCatalogue(
  params: Record<string, string | string[] | undefined>,
  cloths: CatalogueCloth[],
): CatalogueState {
  const raw = first(params.fabric)?.trim() ?? '';
  const rawPage = first(params.page)?.trim() ?? '';
  const page = /^\d{1,4}$/.test(rawPage) ? Math.min(Math.max(1, Number(rawPage)), MAX_PAGE) : 1;

  if (raw.startsWith(FAMILY_PREFIX)) {
    const family = raw.slice(FAMILY_PREFIX.length);
    if (cloths.some((c) => c.family === family)) return { family, page };
  } else if (raw && cloths.some((c) => c.slug === raw)) {
    return { cloth: raw, page };
  }
  return { page };
}

/** The `fabric` value for a state, or `''` for "everything". */
export function fabricValue(state: Pick<CatalogueState, 'cloth' | 'family'>): string {
  if (state.cloth) return state.cloth;
  if (state.family) return `${FAMILY_PREFIX}${state.family}`;
  return '';
}

/** A link to one page of one state, anchored at the top of the catalogue. */
export function catalogueHref(basePath: string, state: CatalogueState, page = state.page): string {
  const query = new URLSearchParams();
  const fabric = fabricValue(state);
  if (fabric) query.set('fabric', fabric);
  if (page > 1) query.set('page', String(page));
  const qs = query.toString().replace(/%3A/gi, ':');
  return `${basePath}${qs ? `?${qs}` : ''}#catalogue-top`;
}

/** Page numbers with gaps collapsed: 1 … 4 5 6 … 12. */
export function pageList(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}
