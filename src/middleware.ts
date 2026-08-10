import { NextResponse, type NextRequest } from 'next/server';
import { resolveSearchDestination } from '@/lib/search-routing';

/**
 * Search terms that name a section are answered as a redirect, not a search.
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
 */
export function middleware(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  if (!query) return NextResponse.next();

  const destination = resolveSearchDestination(query);
  if (!destination) return NextResponse.next();

  return NextResponse.redirect(new URL(destination, request.url), 307);
}

export const config = {
  /*
    `/search` only. A matcher any wider makes every request on the site pay for
    a middleware invocation — including static assets and the image optimiser —
    to answer a question that can only ever be asked on one route.
  */
  matcher: '/search',
};
