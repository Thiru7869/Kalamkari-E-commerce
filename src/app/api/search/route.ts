import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getProducts } from '@/lib/queries';
import { primaryImage } from '@/lib/serialize';

/**
 * Live results for the in-page search panel.
 *
 * The panel needs answers while the visitor is still typing, which a server
 * component cannot give it — so this is the one read path on the site that is
 * fetched rather than rendered.
 *
 * It is deliberately a **narrower** surface than the page it shadows. `/search`
 * accepts the full filter set and renders whatever the catalogue holds; this
 * takes one bounded query string, returns at most eight rows, and projects each
 * down to the five fields the panel actually draws. Nothing here is reachable
 * that a visitor could not already read on `/shop` — the point of the
 * projection is that a public JSON endpoint should hand back the answer to the
 * question asked and not a serialisation of the row behind it.
 *
 * Money stays integer paise across the wire, as everywhere else. The panel
 * formats it through `formatPrice` like every other price on the site.
 */

export const runtime = 'nodejs';
// Live catalogue data — a cached search result would show sold pieces as
// available, which on a one-of-one catalogue is the expensive kind of wrong.
export const dynamic = 'force-dynamic';

/** Long enough for "Ramayana pallu cotton saree", short enough to bound work. */
const MAX_QUERY_CHARS = 80;
const MAX_RESULTS = 8;

const querySchema = z.string().trim().min(1).max(MAX_QUERY_CHARS);

/* -------------------------------------------------------------------------- */
/* Rate limiting                                                              */
/* -------------------------------------------------------------------------- */

/*
  Same sliding window as the assistant endpoint, with a much higher ceiling:
  this one is typed into rather than talked to, so a single visitor legitimately
  produces a burst of requests per sentence. It exists to stop a script walking
  the catalogue, not to ration real use.
*/
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 90;

const hits = new Map<string, number[]>();

function rateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }

  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

function clientKey(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anonymous';
}

/* -------------------------------------------------------------------------- */

/** What the panel draws. Kept in step with the client by this type alone. */
export type SearchHit = {
  slug: string;
  name: string;
  /** Integer paise, like every other price on this site. */
  price: number;
  image: string;
  category: string;
  /** Sold pieces stay findable — see the catalogue note in CLAUDE.md. */
  soldOut: boolean;
};

export async function GET(request: Request) {
  if (rateLimited(clientKey(request))) {
    return NextResponse.json({ hits: [], total: 0 }, { status: 429 });
  }

  const raw = new URL(request.url).searchParams.get('q') ?? '';
  const parsed = querySchema.safeParse(raw);

  // An empty or over-long query is not an error the panel needs to render —
  // it is simply nothing to show yet.
  if (!parsed.success) {
    return NextResponse.json({ hits: [], total: 0 });
  }

  // `getProducts` pages at PAGE_SIZE; the panel wants fewer than that, so the
  // cut happens here rather than by inventing a page size the shop does not use.
  const { items, total } = await getProducts({ q: parsed.data });

  const hits: SearchHit[] = items.slice(0, MAX_RESULTS).map((product) => ({
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: primaryImage(product.images),
    category: product.category.name,
    soldOut: product.stock <= 0,
  }));

  return NextResponse.json({ hits, total });
}
