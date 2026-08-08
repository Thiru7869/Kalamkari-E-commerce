import { defineConfig } from 'vitest/config';

/**
 * Unit tests for the pure logic only.
 *
 * Deliberately no jsdom, no React renderer and no database. What is worth
 * testing here is the code that decides money, validates input, escapes markup,
 * and serialises the newline-delimited lists the schema uses instead of arrays
 * — all of it dependency-free, all of it the kind of thing where a silent
 * regression is expensive and invisible.
 *
 * The end-to-end purchase path is already covered by scripts/smoke-purchase.mjs,
 * which drives the real server actions over HTTP against a production build.
 * Duplicating that here with mocks would only test the mocks.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    alias: {
      // `server-only` throws outside a React Server Component. The modules
      // under test are exercised as plain functions, where there is no client
      // bundle for it to protect.
      'server-only': new URL('./src/test/server-only-stub.ts', import.meta.url).pathname,
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
