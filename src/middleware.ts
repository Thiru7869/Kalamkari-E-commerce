import { NextResponse, type NextRequest } from 'next/server';
import { resolveSearchDestination } from '@/lib/search-routing';
import { checkRateLimit, clientIp, type LimitName } from '@/lib/rate-limit-core';
import { isOrderNumber } from '@/lib/schemas/order-number';

/**
 * Two jobs, both answered before anything renders.
 *
 * **1. Search terms that name a section are answered as a redirect.**
 *
 * This runs before rendering, which is the whole reason it exists. The same
 * check in the page component is correct but arrives too late: by then the root
 * layout has begun streaming, the status code is already on the wire, and Next
 * can only fall back to a `<meta http-equiv="refresh">` — a blank shell held
 * for a second before the browser moves. Here it is a plain 307 and the visitor
 * never sees `/search` at all.
 *
 * The page keeps its own copy of the check for soft navigations, which never
 * reach the edge. Both read the same resolver, so they cannot disagree.
 *
 * **2. Two endpoints that can be walked or abused are rate-limited.**
 *
 *  - `/orders/track` with an order number and an email is a guest looking an
 *    order up. Each guess is a free test of "is this the right pair", so it is
 *    limited per address *and* per order number — the second stops a
 *    distributed attempt on one order that the first would never see.
 *  - `POST /api/auth/signin/*` sends a magic-link email to whatever address is
 *    typed, which makes it a way to fill somebody's inbox.
 *
 * They live here, not in the pages, because limiting at the edge means the page
 * never runs — and it keeps the rule out of a page component entirely.
 */

function tooMany(retryAfterSeconds: number) {
  return new NextResponse('Too many attempts. Please wait a little and try again.', {
    status: 429,
    headers: {
      'Retry-After': String(retryAfterSeconds),
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

async function limited(name: LimitName, key: string) {
  const result = await checkRateLimit(name, key);
  return result.ok ? null : tooMany(result.retryAfterSeconds);
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === '/orders/track') {
    const number = searchParams.get('number');
    // Only an actual lookup counts. Opening the empty form costs nothing.
    if (number && searchParams.get('email')) {
      const byAddress = await limited('track', clientIp(request.headers));
      if (byAddress) return byAddress;

      const normalised = number.trim().toUpperCase();
      if (isOrderNumber(normalised)) {
        const byOrder = await limited('trackNumber', normalised);
        if (byOrder) return byOrder;
      }
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/auth/signin')) {
    if (request.method === 'POST') {
      return (await limited('signin', clientIp(request.headers))) ?? NextResponse.next();
    }
    return NextResponse.next();
  }

  // /search
  const query = searchParams.get('q');
  if (!query) return NextResponse.next();

  const destination = resolveSearchDestination(query);
  if (!destination) return NextResponse.next();

  return NextResponse.redirect(new URL(destination, request.url), 307);
}

export const config = {
  /*
    Three exact routes. A matcher any wider makes every request on the site pay
    for a middleware invocation — including static assets and the image
    optimiser — to answer questions that can only be asked in these places.
  */
  matcher: ['/search', '/orders/track', '/api/auth/signin/:path*'],
};
