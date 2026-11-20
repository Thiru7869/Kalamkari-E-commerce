import { typeDefs, collectionDefs } from '@/content/catalogue';

/**
 * Where a search term should go when the term *is* a place on this site.
 *
 * Somebody who types "sarees" into the search box has not asked a search
 * question. They have named a section, and this site has a written, editorial
 * page for that section — /types/sarees explains which cloth to choose, what a
 * painted pallu costs in weeks, and what the border means, none of which a
 * result grid says. Sending them to `/search?q=sarees` answers a question they
 * did not ask and buries the page that did.
 *
 * The rule is deliberately narrow: the **whole** query, normalised, must name a
 * destination. "sarees" redirects; "cotton saree" does not, because that is a
 * genuine search with an adjective in it and the grid is the right answer. A
 * substring rule would hijack every one of those, which is the failure mode
 * worth avoiding — a search box that refuses to search is worse than one that
 * occasionally makes you click twice.
 *
 * This runs on the server, in the `/search` route, so every way in is covered
 * by one implementation: the header overlay, the form on the search page, a
 * bookmarked URL and a link from outside all pass through the same check.
 */

/** Lowercase, collapse punctuation and whitespace, drop a trailing plural. */
function normalise(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Singular and plural of the same word are the same destination. English is
 * irregular enough that a stemmer would be a liability here, but the catalogue
 * is a closed set of nine nouns, so stripping one trailing `s` covers it.
 */
function singular(term: string): string {
  return term.endsWith('s') ? term.slice(0, -1) : term;
}

/** Destinations, built from the content layer so a new page is routable free. */
function destinations(): Map<string, string> {
  const map = new Map<string, string>();

  const add = (term: string, href: string) => {
    const key = normalise(term);
    if (!key) return;
    map.set(key, href);
    map.set(singular(key), href);
  };

  for (const type of typeDefs) {
    add(type.slug, `/types/${type.slug}`);
    add(type.label, `/types/${type.slug}`);
  }

  for (const collection of collectionDefs) {
    add(collection.slug, `/collections/${collection.slug}`);
    add(collection.title, `/collections/${collection.slug}`);
  }

  /*
    The words people use that are not the words on the pages.

    "Blouses" is the category slug in the shop but "blouse-pieces" is the type
    page, and the store is asked for both. "Home decor" arrives with and
    without the space. "Stole" and "chunni" are the same cloth as a dupatta
    under regional names — chunni has its own page and says so; stole does not,
    so it goes to the dupatta page, which names it in the first paragraph.
  */
  add('blouse', '/types/blouse-pieces');
  add('blouses', '/types/blouse-pieces');
  add('blouse piece', '/types/blouse-pieces');
  add('homedecor', '/types/home-decor');
  add('home', '/types/home-decor');
  add('decor', '/types/home-decor');
  add('stole', '/types/dupattas');
  add('stoles', '/types/dupattas');
  add('odhni', '/types/dupattas');
  add('painting', '/types/paintings');
  add('panel', '/types/paintings');
  add('panels', '/types/paintings');
  add('wall hanging', '/types/paintings');
  add('saree', '/types/sarees');
  add('sari', '/types/sarees');
  add('saris', '/types/sarees');
  add('shop', '/');
  add('everything', '/');

  return map;
}

const DESTINATIONS = destinations();

/**
 * The page this query names, or `null` when it is a real search.
 *
 * Exported for the route to redirect with, and pinned by
 * `search-routing.test.ts` — the negative cases matter more than the positive
 * ones here, because a wrong redirect silently discards what the visitor typed.
 */
export function resolveSearchDestination(query: string): string | null {
  const key = normalise(query);
  if (!key) return null;
  return DESTINATIONS.get(key) ?? DESTINATIONS.get(singular(key)) ?? null;
}
