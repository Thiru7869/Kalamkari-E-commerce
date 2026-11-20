import 'server-only';

import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

/** The exact product shape every card on the site needs — and nothing more. */
export const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  summary: true,
  price: true,
  compareAtPrice: true,
  images: true,
  stock: true,
  featured: true,
  masterpiece: true,
  craftDays: true,
  /**
   * Named on the card, not only on the product page.
   *
   * Populated on 15 of 43 pieces — attribution is stated where the store has
   * confirmed it and left silent where it has not, which is the same rule
   * `family.ts` follows. The card must therefore treat it as optional rather
   * than printing "Painted by —" for the rest.
   */
  artisan: true,
  ratingSum: true,
  ratingCount: true,
  category: { select: { slug: true, name: true } },
  fabric: { select: { slug: true, name: true } },
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

/**
 * Named cross-category views of the catalogue.
 *
 * These are collections, not categories: a "premium" piece may be a saree or a
 * panel. They exist as a filter rather than as separate routes so every other
 * filter — fabric, price, motif — keeps working inside them.
 */
export const collections = {
  featured: {
    label: 'Featured',
    title: 'Featured pieces',
    blurb:
      'What the family would put in your hands first this week. Chosen for the drawing, not for the margin — the selection changes as work comes off the line.',
  },
  premium: {
    label: 'Premium',
    title: 'Premium and signed work',
    blurb:
      'Exhibition-grade pieces: signed, award-lineage, or simply the ones that took a month of somebody\'s undivided attention. Narrative pallus, dense jaal, the hardest drawing this workshop does.',
  },
} as const;

export type CollectionKey = keyof typeof collections;

export function isCollection(value: string | undefined): value is CollectionKey {
  return value === 'featured' || value === 'premium';
}

export type ShopFilters = {
  category?: string;
  collection?: CollectionKey;
  fabrics?: string[];
  motifs?: string[];
  /** Dye slugs. A piece matches if it carries *any* of them — see buildWhere. */
  dyes?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  q?: string;
  page?: number;
  /** Hide sold pieces. Off by default — a sold piece still shows the work. */
  inStockOnly?: boolean;
};

/**
 * How many pieces a listing page shows at once.
 *
 * **Ten**, paged, at three across.
 *
 * This was thirty in one continuous run, on the reasoning that a one-of-one
 * catalogue is browsed rather than searched and a pager interrupts browsing.
 * The store asked for ten with numbered pages instead, and the argument for
 * thirty does not survive contact with the actual grid: thirty cards at three
 * across is ten rows, which on a phone is roughly six screens of scrolling with
 * no way to say "about two thirds down" to yourself and no way to get back to
 * where you were after opening a piece. A numbered page is a place you can
 * return to; a scroll position is not.
 *
 * Ten is three rows and a row of one. That orphan is the one real cost of the
 * change and it is accepted rather than hidden — padding to twelve would be
 * choosing a tidier grid over the number the store asked for.
 *
 * Note this makes `ProductGrid`'s `groupEvery={10}` a no-op on listing pages,
 * since a page never now exceeds ten cards. The prop stays: it is what breaks
 * the run on any surface that shows more, and removing it would have to be
 * undone the first time a page size changes back.
 */
export const PAGE_SIZE = 10;

function buildWhere(filters: ShopFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { status: 'ACTIVE' };

  if (filters.category) where.category = { slug: filters.category };
  if (filters.collection === 'featured') where.featured = true;
  if (filters.collection === 'premium') where.masterpiece = true;
  if (filters.inStockOnly) where.stock = { gt: 0 };
  if (filters.fabrics?.length) where.fabric = { slug: { in: filters.fabrics } };
  if (filters.motifs?.length) {
    where.motifs = { some: { motif: { slug: { in: filters.motifs } } } };
  }

  /*
    Any, not all — the same rule the motif filter follows.

    Ticking madder and indigo asks for "pieces with madder or indigo in them",
    which is what somebody choosing two swatches means. Requiring both would
    be a different and much less useful question, and on a palette of eight
    pots where kasim black is on 43 of 43 pieces it would mostly return the
    intersection of two things nobody asked to intersect.
  */
  if (filters.dyes?.length) {
    where.dyes = { some: { dye: { slug: { in: filters.dyes } } } };
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {
      ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
    };
  }

  if (filters.q) {
    const q = filters.q.trim();
    if (q) {
      /*
        Postgres' LIKE is case-sensitive, so every clause states `insensitive`
        explicitly.

        This is not cosmetic. Without it a visitor searching "ramayana" or
        "TUSSAR" gets nothing back while the same search in the old SQLite
        build worked, because SQLite's LIKE is case-insensitive for ASCII by
        default and was quietly carrying this. It is also the one thing on the
        Postgres move that no build step can catch: the query is valid, it
        returns zero rows, and the page renders a perfectly good "nothing
        found".

        If the provider is ever set back to "sqlite", `mode` has to come out
        again — SQLite rejects the option outright.
      */
      const insensitive = 'insensitive' as const;

      where.OR = [
        { name: { contains: q, mode: insensitive } },
        { summary: { contains: q, mode: insensitive } },
        { description: { contains: q, mode: insensitive } },
        { artisan: { contains: q, mode: insensitive } },
        { category: { name: { contains: q, mode: insensitive } } },
        { fabric: { name: { contains: q, mode: insensitive } } },
        { motifs: { some: { motif: { name: { contains: q, mode: insensitive } } } } },
      ];
    }
  }

  return where;
}

function buildOrderBy(sort?: string): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'price-asc':
      return [{ price: 'asc' }];
    case 'price-desc':
      return [{ price: 'desc' }];
    case 'newest':
      return [{ createdAt: 'desc' }];
    case 'craft':
      // Most hand-work first — a genuinely useful sort for this catalogue.
      return [{ craftDays: 'desc' }, { price: 'desc' }];
    default:
      // Default: the store's own view — signed pieces, then featured, then new.
      return [{ masterpiece: 'desc' }, { featured: 'desc' }, { createdAt: 'desc' }];
  }
}

export async function getProducts(filters: ShopFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const where = buildWhere(filters);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productCardSelect,
      orderBy: buildOrderBy(filters.sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/**
 * Cached per request: `generateMetadata` and the page body both need the full
 * product, and without this each product render costs two identical queries.
 */
export const getProductBySlug = cache(async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      fabric: true,
      motifs: { include: { motif: true } },
      // The indexed dyes behind `naturalDyes`, for "where the colours come from".
      dyes: { include: { dye: true }, orderBy: { dye: { position: 'asc' } } },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 12,
        include: { user: { select: { name: true, image: true } } },
      },
    },
  });
});

/**
 * Pieces to show under a product: same motif first, then same category.
 *
 * Only pieces still in stock. Recommending a sold piece beside the one you are
 * looking at sends you to a dead end; the sold ones live in the archive.
 */
export async function getRelatedProducts(productId: string, categoryId: string, motifIds: string[]) {
  const byMotif = motifIds.length
    ? await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          stock: { gt: 0 },
          id: { not: productId },
          motifs: { some: { motifId: { in: motifIds } } },
        },
        select: productCardSelect,
        take: 4,
      })
    : [];

  if (byMotif.length >= 4) return byMotif;

  const fill = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      stock: { gt: 0 },
      categoryId,
      id: { not: productId, notIn: byMotif.map((p) => p.id) },
    },
    select: productCardSelect,
    take: 4 - byMotif.length,
  });

  return [...byMotif, ...fill];
}

/**
 * The best of the work, for /collections/premium.
 *
 * Signed and exhibition-grade pieces, newest first, and *only* those — the
 * store's own `masterpiece` flag decides, not a rating average and not a
 * hand-written list of slugs in a content file. A "best works" section built
 * from a list of slugs is a section that shows a sold piece for a year after it
 * went, and one built from ratings is a section that shows nothing at all on a
 * catalogue with no reviews in it.
 *
 * Sold pieces are deliberately *not* excluded. This section is the argument
 * that the workshop can do this, not an offer to sell — a Ramayana pallu that
 * went last spring is evidence in exactly the way a piece still in stock is,
 * and the card marks it "Sold" on its own.
 */
export async function getBestWorks(take = 6) {
  return prisma.product.findMany({
    where: { status: 'ACTIVE', masterpiece: true },
    select: productCardSelect,
    orderBy: [{ craftDays: 'desc' }, { createdAt: 'desc' }],
    take,
  });
}

/**
 * The sold archive, newest sale first, paged like the shop.
 *
 * Kept apart from the shop grid on purpose: the grid is what can be bought, and
 * a sold piece in it is a card that cannot be acted on. Each of these keeps its
 * own page, which marks it sold and recommends pieces still available.
 */
export async function getSoldProducts(page = 1) {
  const current = Math.max(1, page);
  const where = { status: 'ACTIVE', stock: { lte: 0 } } satisfies Prisma.ProductWhereInput;
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productCardSelect,
      orderBy: { updatedAt: 'desc' },
      skip: (current - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);
  return { items, total, page: current, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/**
 * One motif and the pieces that carry it, for `/heritage/motifs/<slug>`.
 *
 * Available pieces are returned as cards; the sold ones are only counted, so
 * the page can point at the archive without listing pieces nobody can buy.
 * Cached: `generateMetadata` and the page body both resolve the same slug.
 */
export const getMotifWithPieces = cache(async (slug: string) => {
  const motif = await prisma.motif.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true, story: true },
  });
  if (!motif) return null;

  const carries = { motifs: { some: { motifId: motif.id } }, status: 'ACTIVE' };
  const [available, soldCount] = await Promise.all([
    prisma.product.findMany({
      where: { ...carries, stock: { gt: 0 } },
      select: productCardSelect,
      orderBy: [{ masterpiece: 'desc' }, { featured: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.product.count({ where: { ...carries, stock: { lte: 0 } } }),
  ]);

  return { motif, available, soldCount };
});

/** Cached: `generateMetadata` and the shop page each resolve the same slug. */
export const getCategoryBySlug = cache(async (slug: string) => {
  return prisma.category.findUnique({ where: { slug } });
});

export async function getFilterOptions(categorySlug?: string) {
  const scope: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  };

  const [fabrics, motifs, dyes, bounds] = await Promise.all([
    prisma.fabric.findMany({
      where: { products: { some: scope } },
      orderBy: { position: 'asc' },
      select: {
        slug: true,
        name: true,
        family: true,
        _count: { select: { products: { where: scope } } },
      },
    }),
    prisma.motif.findMany({
      where: { products: { some: { product: scope } } },
      orderBy: { position: 'asc' },
      select: {
        slug: true,
        name: true,
        _count: { select: { products: { where: { product: scope } } } },
      },
    }),
    prisma.dye.findMany({
      where: { products: { some: { product: scope } } },
      orderBy: { position: 'asc' },
      select: {
        slug: true,
        name: true,
        source: true,
        hex: true,
        _count: { select: { products: { where: { product: scope } } } },
      },
    }),
    prisma.product.aggregate({
      where: scope,
      _min: { price: true },
      _max: { price: true },
    }),
  ]);

  return {
    fabrics,
    motifs,
    dyes,
    // Paise, like every other money value in this codebase. The filter UI
    // rounds these to whole rupees for its own steps and converts back before
    // it puts anything in the URL.
    minPrice: bounds._min.price ?? 0,
    maxPrice: bounds._max.price ?? 0,
  };
}

/**
 * The pieces behind a visitor's history cookie, in the order they read them.
 *
 * Two things this has to do that a plain `findMany` does not.
 *
 * **Keep the order.** Postgres returns an `in` list in whatever order it
 * likes, and the whole meaning of this rail is "most recent first". So the
 * rows are re-sorted in memory against the id list rather than by any column.
 *
 * **Survive gone pieces.** A cookie can be thirty days old on a catalogue
 * where almost everything is one of one. Anything sold, archived or deleted
 * since simply does not come back from the query, and the rail is shorter —
 * which is correct. Filtering to ACTIVE here rather than trusting the cookie
 * is also what stops a stale id resurrecting a piece that was withdrawn.
 */
export async function getRecentlyViewed(ids: string[], excludeId?: string) {
  const wanted = ids.filter((id) => id !== excludeId);
  if (wanted.length === 0) return [];

  const rows = await prisma.product.findMany({
    where: { id: { in: wanted }, status: 'ACTIVE' },
    select: productCardSelect,
  });

  const byId = new Map(rows.map((row) => [row.id, row]));
  return wanted.map((id) => byId.get(id)).filter((row): row is (typeof rows)[number] => !!row);
}

export async function getBlogPosts() {
  return prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
  });
}

export const getBlogPost = cache(async (slug: string) => {
  return prisma.blogPost.findFirst({ where: { slug, published: true } });
});

/* -------------------------------------------------------------------------- */
/* The editorial type and collection pages                                    */
/* -------------------------------------------------------------------------- */

/**
 * The varieties within one category, grouped by fabric family.
 *
 * Counts are scoped to the category, so the sarees page says how many cotton
 * *sarees* exist rather than how many cotton pieces the store holds. Fabrics
 * with nothing in them are dropped — a variety list that offers a cloth the
 * store cannot currently supply is worse than a shorter list.
 */
export const getTypeVarieties = cache(async (categorySlug: string) => {
  const scope: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
    stock: { gt: 0 },
    category: { slug: categorySlug },
  };

  const fabrics = await prisma.fabric.findMany({
    where: { products: { some: scope } },
    orderBy: { position: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      family: true,
      description: true,
      careNote: true,
      _count: { select: { products: { where: scope } } },
    },
  });

  const byFamily = new Map<string, typeof fabrics>();
  for (const fabric of fabrics) {
    if (fabric._count.products === 0) continue;
    const list = byFamily.get(fabric.family) ?? [];
    list.push(fabric);
    byFamily.set(fabric.family, list);
  }

  return byFamily;
});

/**
 * The pots that appear on one category, with counts.
 *
 * The same shape as `getTypeVarieties` and for the same reason: the sarees
 * page should say how many *sarees* carry indigo, not how many pieces in the
 * store do. Pots with nothing in this category are dropped rather than shown
 * at zero — the eight are a closed set, but not all eight reach every kind of
 * cloth, and offering a colour the page cannot produce is the same mistake as
 * offering a fabric the store cannot supply.
 */
export const getTypeDyes = cache(async (categorySlug: string) => {
  const scope: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
    stock: { gt: 0 },
    category: { slug: categorySlug },
  };

  return prisma.dye.findMany({
    where: { products: { some: { product: scope } } },
    orderBy: { position: 'asc' },
    select: {
      slug: true,
      name: true,
      source: true,
      hex: true,
      _count: { select: { products: { where: { product: scope } } } },
    },
  });
});

/**
 * The lowest price among pieces available now, per cloth, in one category.
 * Keyed by fabric id; a cloth with nothing in stock has no entry. Paise.
 */
export const getTypeFabricFromPrices = cache(async (categorySlug: string) => {
  const rows = await prisma.product.groupBy({
    by: ['fabricId'],
    where: {
      status: 'ACTIVE',
      stock: { gt: 0 },
      category: { slug: categorySlug },
      fabricId: { not: null },
    },
    _min: { price: true },
  });
  const map = new Map<string, number>();
  for (const row of rows) {
    if (row.fabricId && row._min.price != null) map.set(row.fabricId, row._min.price);
  }
  return map;
});

/** Motifs present in one category, with counts. Drives the "drawn here" rail. */
export const getTypeMotifs = cache(async (categorySlug: string) => {
  const scope: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
    stock: { gt: 0 },
    category: { slug: categorySlug },
  };

  return prisma.motif.findMany({
    where: { products: { some: { product: scope } } },
    orderBy: { position: 'asc' },
    select: {
      slug: true,
      name: true,
      story: true,
      _count: { select: { products: { where: { product: scope } } } },
    },
  });
});

/** Price floor and ceiling within a category, for the "from" line. */
export const getTypePriceRange = cache(async (categorySlug: string) => {
  const bounds = await prisma.product.aggregate({
    where: { status: 'ACTIVE', stock: { gt: 0 }, category: { slug: categorySlug } },
    _min: { price: true },
    _max: { price: true },
    _count: true,
  });
  return {
    min: bounds._min.price,
    max: bounds._max.price,
    available: bounds._count,
  };
});

/**
 * The pieces behind a collection page.
 *
 * `new` is ordered by completion date rather than by a flag: on a catalogue
 * where one saree is six weeks of work, "recently finished" is a fact the
 * database already holds and does not need a curator to maintain.
 */
export const getCollectionProducts = cache(
  async (kind: 'featured' | 'premium' | 'new', categorySlug?: string, take = 24) => {
    const base: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(kind === 'featured' ? { featured: true } : {}),
      ...(kind === 'premium' ? { masterpiece: true } : {}),
    };
    // Purchasable pieces only; sold ones are counted and live in the archive.
    const where: Prisma.ProductWhereInput = { ...base, stock: { gt: 0 } };

    const orderBy: Prisma.ProductOrderByWithRelationInput[] =
      kind === 'new'
        ? [{ createdAt: 'desc' }]
        : [{ masterpiece: 'desc' }, { featured: 'desc' }, { createdAt: 'desc' }];

    const [items, total, soldTotal] = await Promise.all([
      prisma.product.findMany({ where, select: productCardSelect, orderBy, take }),
      prisma.product.count({ where }),
      prisma.product.count({ where: { ...base, stock: { lte: 0 } } }),
    ]);

    return { items, total, soldTotal };
  },
);

/** A few pieces of a given category, for the type page's lead grid. */
/**
 * The pieces shown on a type page.
 *
 * `fabric` is what makes "choose by cloth" work in place. The cloth cards used
 * to link out to `/shop/<category>?fabric=<slug>`, which answered a question
 * about cloth by navigating away from the page explaining cloth — the reader
 * lost the varieties, the colours, the motifs and the craft notes to see six
 * cards they could have been shown where they stood. Now the cards filter this
 * grid and scroll to it, and the page keeps its argument.
 *
 * An unknown fabric slug returns nothing rather than everything. Silently
 * ignoring the filter would show the full category under a heading saying it
 * had been narrowed to organza.
 */
export const getTypeProducts = cache(async (categorySlug: string, take = 8, fabric?: string) => {
  const base: Prisma.ProductWhereInput = { status: 'ACTIVE', category: { slug: categorySlug } };
  if (fabric) base.fabric = { slug: fabric };
  // Purchasable pieces only. Sold ones are counted so the page can point at the
  // archive, and are never in the grid beside work that can be bought.
  const [items, total, soldTotal] = await Promise.all([
    prisma.product.findMany({
      where: { ...base, stock: { gt: 0 } },
      select: productCardSelect,
      orderBy: [{ masterpiece: 'desc' }, { featured: 'desc' }, { createdAt: 'desc' }],
      take,
    }),
    prisma.product.count({ where: { ...base, stock: { gt: 0 } } }),
    prisma.product.count({ where: { ...base, stock: { lte: 0 } } }),
  ]);
  return { items, total, soldTotal };
});

/**
 * Whether the current visitor may review a piece.
 *
 * Two conditions, both enforced again in `submitReview` — this is only so the
 * page can avoid offering a form that would be rejected: the piece must have
 * reached them (a delivered order), and they must not have written already.
 */
export const getReviewEligibility = cache(
  async (productId: string): Promise<{ canReview: boolean; reason: 'guest' | 'not-purchased' | 'already-reviewed' | null }> => {
    const { auth } = await import('@/auth');
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { canReview: false, reason: 'guest' };

    const [purchased, existing] = await Promise.all([
      prisma.orderItem.findFirst({
        where: { productId, order: { userId, status: 'DELIVERED' } },
        select: { id: true },
      }),
      prisma.review.findUnique({
        where: { productId_userId: { productId, userId } },
        select: { id: true },
      }),
    ]);

    if (existing) return { canReview: false, reason: 'already-reviewed' };
    if (!purchased) return { canReview: false, reason: 'not-purchased' };
    return { canReview: true, reason: null };
  },
);
