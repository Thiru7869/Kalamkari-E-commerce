import { describe, expect, it } from 'vitest';
import { catalogueHref, pageList, parseCatalogue } from './type-catalogue';

const cloths = [
  { slug: 'chanderi', family: 'silk' },
  { slug: 'mulmul', family: 'cotton' },
  { slug: 'kota', family: 'cotton' },
];

describe('parseCatalogue', () => {
  it('reads nothing as everything, page one', () => {
    expect(parseCatalogue({}, cloths)).toEqual({ page: 1 });
  });

  it('reads a cloth and a page', () => {
    expect(parseCatalogue({ fabric: 'mulmul', page: '3' }, cloths)).toEqual({ cloth: 'mulmul', page: 3 });
  });

  it('reads a family', () => {
    expect(parseCatalogue({ fabric: 'family:cotton' }, cloths)).toEqual({ family: 'cotton', page: 1 });
  });

  it('ignores a cloth or family this page does not offer', () => {
    expect(parseCatalogue({ fabric: 'nylon' }, cloths)).toEqual({ page: 1 });
    expect(parseCatalogue({ fabric: 'family:plastic' }, cloths)).toEqual({ page: 1 });
  });

  it('treats a bad page as the first and caps a huge one', () => {
    expect(parseCatalogue({ page: 'abc' }, cloths).page).toBe(1);
    expect(parseCatalogue({ page: '-4' }, cloths).page).toBe(1);
    expect(parseCatalogue({ page: '0' }, cloths).page).toBe(1);
    expect(parseCatalogue({ page: '99999999' }, cloths).page).toBe(1);
    expect(parseCatalogue({ page: '5000' }, cloths).page).toBe(1000);
  });

  it('takes the first of a repeated parameter', () => {
    expect(parseCatalogue({ fabric: ['kota', 'mulmul'], page: ['2', '9'] }, cloths)).toEqual({
      cloth: 'kota',
      page: 2,
    });
  });
});

describe('catalogueHref', () => {
  it('keeps the filter, drops page one, and anchors at the catalogue', () => {
    expect(catalogueHref('/types/sarees', { cloth: 'kota', page: 1 })).toBe(
      '/types/sarees?fabric=kota#catalogue-top',
    );
    expect(catalogueHref('/types/sarees', { page: 1 })).toBe('/types/sarees#catalogue-top');
  });

  it('writes a family and a page', () => {
    expect(catalogueHref('/types/sarees', { family: 'cotton', page: 1 }, 4)).toBe(
      '/types/sarees?fabric=family:cotton&page=4#catalogue-top',
    );
  });
});

describe('pageList', () => {
  it('lists every page when there are few', () => {
    expect(pageList(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('collapses the middle of a long list', () => {
    expect(pageList(6, 12)).toEqual([1, 2, 'gap', 5, 6, 7, 'gap', 11, 12]);
  });
});
