import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Mutable stand-ins for what the framework supplies per request, shared between
 * the mocks in `int-setup.ts` and the tests that steer them.
 */

export type TestSession = {
  user: { id: string; role: string; email?: string | null };
} | null;

export type SentMail = { to: string; subject: string; text: string };

export const testState = {
  session: null as TestSession,
  headers: {} as Record<string, string>,
  cookies: new Map<string, string>(),
  sent: [] as SentMail[],
};

export function resetTestState() {
  testState.session = null;
  testState.headers = { 'x-forwarded-for': '203.0.113.1' };
  testState.cookies.clear();
  testState.sent.length = 0;
}

/** Thrown by the mocked `redirect()`, as the real one throws to unwind. */
export class TestRedirect extends Error {
  constructor(readonly url: string) {
    super(`NEXT_REDIRECT ${url}`);
  }
}

/**
 * One visitor's request context. Tests that race several shoppers against each
 * other need each to carry their own cookies, headers and session, which a
 * single shared jar cannot give them; `runAs` scopes a context to an async call
 * tree, and the mocks read whichever applies.
 */
export type RequestContext = {
  cookies: Map<string, string>;
  headers: Record<string, string>;
  session: TestSession;
};

const store = new AsyncLocalStorage<RequestContext>();

export const currentRequest = (): RequestContext => store.getStore() ?? testState;

export function runAs<T>(
  context: { headers?: Record<string, string>; session?: TestSession; cookies?: Map<string, string> },
  run: () => Promise<T>,
): Promise<T> {
  return store.run(
    {
      cookies: context.cookies ?? new Map(),
      headers: { ...testState.headers, ...context.headers },
      session: context.session ?? null,
    },
    run,
  );
}
