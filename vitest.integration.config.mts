import { defineConfig } from 'vitest/config';

/**
 * Integration tests: real PostgreSQL, real Prisma, real migrations.
 *
 * Concurrency and database constraints cannot be tested against mocks — a mock
 * does what you told it to, which is exactly what these tests exist to
 * question. So the database is real:
 *
 *  - With `TEST_DATABASE_URL` set (CI), that database is used. Point it at a
 *    scratch schema (`?schema=integration`), never at data you care about.
 *  - Without it, a throwaway PostgreSQL is started from the `embedded-postgres`
 *    dev dependency in a temp directory and destroyed afterwards.
 *
 * Migrations are applied with `prisma migrate deploy`, the same command
 * production uses, so the CHECK constraints under test are the shipped ones.
 *
 * Only the edges of the framework are mocked (see src/test/int-setup.ts): the
 * request's cookies and headers, the session, and the mail transport.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.int.test.ts'],
    globalSetup: ['src/test/global-db.ts'],
    setupFiles: ['src/test/int-setup.ts'],
    // One database, tests that deliberately race each other: run files in turn.
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 120_000,
    alias: {
      'server-only': new URL('./src/test/server-only-stub.ts', import.meta.url).pathname,
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
