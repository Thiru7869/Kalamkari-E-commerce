import { describe, expect, it } from 'vitest';
import { resolveSearchDestination } from './search-routing';

describe('resolveSearchDestination', () => {
  it('sends a bare type name to its editorial page', () => {
    expect(resolveSearchDestination('sarees')).toBe('/types/sarees');
    expect(resolveSearchDestination('dupattas')).toBe('/types/dupattas');
    expect(resolveSearchDestination('chunnis')).toBe('/types/chunnis');
    expect(resolveSearchDestination('paintings')).toBe('/types/paintings');
    expect(resolveSearchDestination('home decor')).toBe('/types/home-decor');
    expect(resolveSearchDestination('blouse pieces')).toBe('/types/blouse-pieces');
  });

  it('treats singular and plural as the same destination', () => {
    expect(resolveSearchDestination('saree')).toBe('/types/sarees');
    expect(resolveSearchDestination('dupatta')).toBe('/types/dupattas');
    expect(resolveSearchDestination('chunni')).toBe('/types/chunnis');
  });

  it('ignores case, padding and punctuation', () => {
    expect(resolveSearchDestination('  SAREES  ')).toBe('/types/sarees');
    expect(resolveSearchDestination('Home-Decor')).toBe('/types/home-decor');
    expect(resolveSearchDestination('blouse-pieces')).toBe('/types/blouse-pieces');
  });

  it('routes the regional names for the same cloth', () => {
    expect(resolveSearchDestination('stole')).toBe('/types/dupattas');
    expect(resolveSearchDestination('sari')).toBe('/types/sarees');
  });

  it('routes collections by slug and by title', () => {
    expect(resolveSearchDestination('premium')).toBe('/collections/premium');
    expect(resolveSearchDestination('new arrivals')).toBe('/collections/new-arrivals');
    expect(resolveSearchDestination('featured sarees')).toBe('/collections/featured-sarees');
  });

  /*
    The cases that must NOT redirect. Each of these is a real search with a
    real answer in the grid, and hijacking it would throw away the qualifier
    the visitor typed — which is the whole reason they used the search box
    rather than the menu.
  */
  it('leaves a qualified search alone', () => {
    expect(resolveSearchDestination('cotton saree')).toBeNull();
    expect(resolveSearchDestination('tussar silk saree')).toBeNull();
    expect(resolveSearchDestination('indigo dupatta')).toBeNull();
    expect(resolveSearchDestination('red')).toBeNull();
    expect(resolveSearchDestination('ramayana')).toBeNull();
    expect(resolveSearchDestination('peacock')).toBeNull();
  });

  it('returns null for an empty or meaningless query', () => {
    expect(resolveSearchDestination('')).toBeNull();
    expect(resolveSearchDestination('   ')).toBeNull();
    expect(resolveSearchDestination('!!!')).toBeNull();
  });
});
