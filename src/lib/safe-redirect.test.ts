import { describe, expect, it } from 'vitest';
import { safeCallbackPath } from './safe-redirect';

describe('safeCallbackPath', () => {
  it('keeps a plain same-site path', () => {
    expect(safeCallbackPath('/wishlist')).toBe('/wishlist');
    expect(safeCallbackPath('/account')).toBe('/account');
    expect(safeCallbackPath('/orders/track')).toBe('/orders/track');
  });

  it('keeps a query string and a fragment', () => {
    expect(safeCallbackPath('/shop?fabric=mulmul&sort=new')).toBe('/shop?fabric=mulmul&sort=new');
    expect(safeCallbackPath('/process#colours')).toBe('/process#colours');
  });

  it('falls back when there is nothing usable', () => {
    expect(safeCallbackPath(undefined)).toBe('/account');
    expect(safeCallbackPath(null)).toBe('/account');
    expect(safeCallbackPath('')).toBe('/account');
    expect(safeCallbackPath('   ')).toBe('/account');
  });

  it('uses the fallback it is given', () => {
    expect(safeCallbackPath('https://elsewhere.example', '/')).toBe('/');
  });

  it.each([
    ['absolute https', 'https://elsewhere.example'],
    ['absolute http', 'http://elsewhere.example/path'],
    ['protocol-relative', '//elsewhere.example'],
    ['protocol-relative with path', '//elsewhere.example/account'],
    ['backslash authority', '/\\elsewhere.example'],
    ['double backslash', '\\\\elsewhere.example'],
    ['javascript scheme', 'javascript:alert(1)'],
    ['data scheme', 'data:text/html,<script>alert(1)</script>'],
    ['bare host', 'elsewhere.example'],
    ['relative path without a slash', 'account'],
    ['encoded protocol-relative', '/%2F/elsewhere.example'],
    ['encoded double slash', '/%2F%2Felsewhere.example'],
    ['encoded backslash', '/%5Celsewhere.example'],
    ['tab inside the authority', '/\t/elsewhere.example'],
    ['newline inside the authority', '/\n/elsewhere.example'],
    ['malformed escape', '/%E0%A4%A'],
  ])('refuses %s', (_label, input) => {
    expect(safeCallbackPath(input)).toBe('/account');
  });

  it('refuses an absurdly long value', () => {
    expect(safeCallbackPath('/' + 'a'.repeat(3000))).toBe('/account');
  });
});
