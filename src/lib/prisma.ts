import { PrismaClient } from '@prisma/client';

/**
 * One Prisma client, over Prisma's own engine.
 *
 * The deployment target is Vercel's Node runtime, which has a TCP stack, so
 * the default engine is the right driver and no adapter is needed. An earlier
 * revision of this file used `@prisma/adapter-neon` because the target was
 * briefly Cloudflare Workers, where there is no TCP to open a socket with.
 * That adapter is gone along with the Workers target, and taking it out fixed
 * a diagnostic problem as well as a dependency one: a failure in the WebSocket
 * driver surfaces as
 *
 *     prisma:error undefined
 *     ⨯ [Error: [object ErrorEvent]]
 *
 * which names neither the query nor the cause. The default engine reports the
 * host it could not reach.
 *
 * Connection pooling is the database's job, not ours. Point DATABASE_URL at a
 * **pooled** endpoint — on Neon, the host containing `-pooler`. Each serverless
 * invocation is its own process with its own client, so a direct connection
 * string will exhaust Postgres' connection limit under any real traffic. The
 * direct endpoint is only for migrations, which must not run through a
 * transaction pooler; see DIRECT_DATABASE_URL in .env.example.
 */

function client() {
  if (!process.env.DATABASE_URL) {
    // Louder, and earlier, than the engine's own failure — which otherwise
    // surfaces as a connection error on the first query, inside a page render,
    // where it reads as a broken page rather than a missing variable.
    throw new Error(
      'DATABASE_URL is not set. Prisma cannot start without it. ' +
        'Copy .env.example to .env and point it at a PostgreSQL instance.',
    );
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

// Next's dev server hot-reloads modules, which would otherwise open a new pool
// on every edit until the database refuses connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? client();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
