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
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  q?: string;
  page?: number;
  /** Hide sold pieces. Off by default — a sold piece still shows the work. */
  inStockOnly?: boolean;
};

export const PAGE_SIZE = 12;

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
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 12,
        include: { user: { select: { name: true, image: true } } },
      },
    },
  });
});

/** Pieces to show under a product: same motif first, then same category. */
export async function getRelatedProducts(productId: string, categoryId: string, motifIds: string[]) {
  const byMotif = motifIds.length
    ? await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
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
      categoryId,
      id: { not: productId, notIn: byMotif.map((p) => p.id) },
    },
    select: productCardSelect,
    take: 4 - byMotif.length,
  });

  return [...byMotif, ...fill];
}

export async function getFeaturedProducts(take = 6) {
  return prisma.product.findMany({
    where: { status: 'ACTIVE', featured: true },
    select: productCardSelect,
    orderBy: [{ masterpiece: 'desc' }, { createdAt: 'desc' }],
    take,
  });
}

export const getCategories = cache(async () => {
  return prisma.category.findMany({ orderBy: { position: 'asc' } });
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

  const [fabrics, motifs, bounds] = await Promise.all([
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
    prisma.product.aggregate({
      where: scope,
      _min: { price: true },
      _max: { price: true },
    }),
  ]);

  return {
    fabrics,
    motifs,
    minPrice: bounds._min.price ?? 0,
    maxPrice: bounds._max.price ?? 0,
  };
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
    category: { slug: categorySlug },
  };

  const fabrics = await prisma.fabric.findMany({
    where: { products: { some: scope } },
    orderBy: { position: 'asc' },
    select: {
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

/** Motifs present in one category, with counts. Drives the "drawn here" rail. */
export const getTypeMotifs = cache(async (categorySlug: string) => {
  const scope: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
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
    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(kind === 'featured' ? { featured: true } : {}),
      ...(kind === 'premium' ? { masterpiece: true } : {}),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput[] =
      kind === 'new'
        ? [{ createdAt: 'desc' }]
        : [{ masterpiece: 'desc' }, { featured: 'desc' }, { createdAt: 'desc' }];

    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, select: productCardSelect, orderBy, take }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  },
);

/** A few pieces of a given category, for the type page's lead grid. */
export const getTypeProducts = cache(async (categorySlug: string, take = 8) => {
  const where: Prisma.ProductWhereInput = { status: 'ACTIVE', category: { slug: categorySlug } };
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productCardSelect,
      orderBy: [{ stock: 'desc' }, { masterpiece: 'desc' }, { featured: 'desc' }, { createdAt: 'desc' }],
      take,
    }),
    prisma.product.count({ where }),
  ]);
  return { items, total };
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
