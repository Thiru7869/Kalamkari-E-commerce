import 'server-only';

import { redirect } from 'next/navigation';
import { auth } from '@/auth';

/**
 * Gate for admin routes. Call as the FIRST statement of every admin page, not
 * just in the admin layout.
 *
 * Why both: Next renders a layout and its page concurrently. A `redirect()` in
 * the layout does bounce the browser — but by the time it lands, the page has
 * already run its queries, and their results are serialised into the flight
 * payload of the response that carries the redirect. The browser never shows
 * them; an unauthenticated `curl` reads them straight out of the HTML.
 *
 * Awaiting this before touching the database means an unauthorised request
 * never causes a query, so there is nothing to leak.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect('/signin?callbackUrl=/admin');
  if (session.user.role !== 'ADMIN') redirect('/account');
  return session.user;
}
