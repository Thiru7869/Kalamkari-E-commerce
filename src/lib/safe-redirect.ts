/**
 * A post-sign-in destination that can only ever be a page on this site.
 *
 * `callbackUrl` arrives in the query string, so it is whatever the sender of
 * the link wants it to be. Passed straight to `redirect()`, a signed-in visitor
 * following `/signin?callbackUrl=https://elsewhere.example` is sent off the
 * site from a page that carries our name, which is a ready-made phishing hop.
 *
 * Only a single-slash path is accepted. Everything that a browser can resolve
 * to another origin is refused, including the forms that look harmless:
 *
 *   //host        protocol-relative
 *   /\host        browsers treat `\` as `/` in the authority position
 *   https://host  absolute
 *   javascript:   scheme
 *   %2F%2Fhost    once decoded by anything downstream
 *
 * Anything refused falls back to `fallback`, never to an error: a mangled link
 * should still land somewhere sensible.
 */
export function safeCallbackPath(
  candidate: string | null | undefined,
  fallback = '/account',
): string {
  if (typeof candidate !== 'string') return fallback;

  const value = candidate.trim();
  if (value === '' || value.length > 2048) return fallback;

  // Control characters are stripped by URL parsers, so `/\t/host` can become
  // `//host` after the check has already passed.
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;

  if (!value.startsWith('/')) return fallback;
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback;

  // Decode once and test again: `/%2F/host` and `/%5Chost` are the same two
  // attacks written so that a naive prefix check does not see them.
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }
  if (decoded.startsWith('//') || decoded.startsWith('/\\')) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(decoded)) return fallback;

  // Last line of defence: it must resolve to this origin by the same rule a
  // browser applies.
  try {
    const base = 'http://origin.invalid';
    if (new URL(value, base).origin !== base) return fallback;
  } catch {
    return fallback;
  }

  return value;
}
