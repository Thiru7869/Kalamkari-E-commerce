import { afterAll, beforeEach, vi } from 'vitest';
import { resetRateLimitState } from '@/lib/rate-limit-core';
import { currentRequest, resetTestState, testState, TestRedirect } from '@/test/state';

/**
 * Per-file setup for integration tests. Mocks only the edges of the framework —
 * request cookies and headers, the session, redirects, cache invalidation and
 * the mail transport. Everything between those edges (actions, services,
 * Prisma, Postgres) is the real thing.
 */

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = currentRequest().cookies.get(name);
      return value === undefined ? undefined : { name, value };
    },
    set: (name: string, value: string) => void currentRequest().cookies.set(name, value),
    delete: (name: string) => void currentRequest().cookies.delete(name),
  }),
  headers: async () => new Headers(currentRequest().headers),
}));

vi.mock('next/cache', () => ({
  revalidatePath: () => undefined,
  revalidateTag: () => undefined,
}));

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new TestRedirect(url);
  },
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

vi.mock('@/auth', () => ({
  auth: async () => currentRequest().session,
}));

vi.mock('@/lib/mail/transport', () => ({
  sendMail: async (message: { to: string; subject: string; text: string }) => {
    testState.sent.push({ to: message.to, subject: message.subject, text: message.text });
    return { status: 'sent' as const };
  },
  storeInbox: () => 'store@example.test',
  isMailConfigured: () => true,
  willDeliver: () => true,
}));

beforeEach(() => {
  resetTestState();
  resetRateLimitState();
  process.env.AUTH_SECRET = 'integration-test-secret-0123456789abcdef';
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

afterAll(async () => {
  // Without this the Prisma engine keeps the worker alive after the tests end.
  const { prisma } = await import('@/lib/prisma');
  await prisma.$disconnect();
});
