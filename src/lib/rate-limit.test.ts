import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * What is real and what is not, stated plainly: the Upstash packages are
 * replaced by a fake whose "Redis" is one Map shared by everything in this
 * process. That is the property under test — that the limit is held in a place
 * *outside* any one serverless instance — and it is checked by loading the
 * limiter module twice, as two cold instances would, and showing they share a
 * count. It does NOT exercise Upstash itself; that needs credentials.
 */

const shared = vi.hoisted(() => ({
  store: new Map<string, number[]>(),
  /** What the next `limit()` should do instead of counting, if anything. */
  fault: null as null | 'throw' | 'timeout',
  constructed: 0,
}));

vi.mock('@upstash/redis', () => ({
  Redis: class {
    constructor(readonly options: { url: string; token: string }) {}
  },
}));

vi.mock('@upstash/ratelimit', () => {
  class Ratelimit {
    static slidingWindow(limit: number, window: string) {
      return { limit, windowSeconds: Number(window.split(' ')[0]) };
    }

    private readonly limit_: number;
    private readonly windowMs: number;
    private readonly prefix: string;

    constructor(config: {
      limiter: { limit: number; windowSeconds: number };
      prefix: string;
    }) {
      shared.constructed += 1;
      this.limit_ = config.limiter.limit;
      this.windowMs = config.limiter.windowSeconds * 1000;
      this.prefix = config.prefix;
    }

    async limit(identifier: string) {
      if (shared.fault === 'throw') throw new Error('connect ECONNREFUSED');
      if (shared.fault === 'timeout') {
        // What the real library does: reports success so a slow Redis cannot
        // block traffic. The limiter under test must not trust it.
        return { success: true, limit: this.limit_, remaining: 0, reset: 0, pending: Promise.resolve(), reason: 'timeout' };
      }
      const key = `${this.prefix}:${identifier}`;
      const now = Date.now();
      const recent = (shared.store.get(key) ?? []).filter((t) => now - t < this.windowMs);
      const success = recent.length < this.limit_;
      if (success) recent.push(now);
      shared.store.set(key, recent);
      return {
        success,
        limit: this.limit_,
        remaining: Math.max(0, this.limit_ - recent.length),
        reset: (recent[0] ?? now) + this.windowMs,
        pending: Promise.resolve(),
      };
    }
  }
  return { Ratelimit };
});

type Core = typeof import('@/lib/rate-limit-core');

/** A fresh copy of the module, as a cold serverless instance would load it. */
async function freshInstance(): Promise<Core> {
  vi.resetModules();
  return import('@/lib/rate-limit-core');
}

beforeEach(() => {
  shared.store.clear();
  shared.fault = null;
  shared.constructed = 0;
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io');
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token-that-must-never-be-logged');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('shared limits across independent instances', () => {
  it('counts one caller across two separately-loaded instances', async () => {
    const a = await freshInstance();
    const b = await freshInstance();
    expect(a).not.toBe(b);

    const { limit } = a.LIMITS.checkout;
    // Instance A uses all but one of the allowance, instance B uses the last,
    // and then BOTH are refused. With a per-process Map, each would have
    // started from zero.
    for (let i = 0; i < limit - 1; i += 1) {
      expect((await a.checkRateLimit('checkout', '198.51.100.9')).ok).toBe(true);
    }
    expect((await b.checkRateLimit('checkout', '198.51.100.9')).ok).toBe(true);

    const fromA = await a.checkRateLimit('checkout', '198.51.100.9');
    const fromB = await b.checkRateLimit('checkout', '198.51.100.9');
    expect(fromA.ok).toBe(false);
    expect(fromB.ok).toBe(false);
    expect(fromA.degraded).toBe(false);
    expect(fromB.degraded).toBe(false);
  });

  it('does not make one caller pay for another', async () => {
    const a = await freshInstance();
    for (let i = 0; i < a.LIMITS.checkout.limit + 2; i += 1) {
      await a.checkRateLimit('checkout', '198.51.100.9');
    }
    expect((await a.checkRateLimit('checkout', '198.51.100.9')).ok).toBe(false);
    expect((await a.checkRateLimit('checkout', '198.51.100.10')).ok).toBe(true);
  });

  it('keeps different operations in different buckets', async () => {
    const a = await freshInstance();
    for (let i = 0; i < a.LIMITS.commission.limit + 1; i += 1) {
      await a.checkRateLimit('commission', '198.51.100.9');
    }
    expect((await a.checkRateLimit('commission', '198.51.100.9')).ok).toBe(false);
    expect((await a.checkRateLimit('enquiry', '198.51.100.9')).ok).toBe(true);
  });

  it('gives a positive retry-after when it refuses', async () => {
    const a = await freshInstance();
    for (let i = 0; i < a.LIMITS.track.limit; i += 1) await a.checkRateLimit('track', 'x');
    const refused = await a.checkRateLimit('track', 'x');
    expect(refused.ok).toBe(false);
    expect(refused.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('uses stricter limits for expensive and sensitive operations than for reads', async () => {
    const { LIMITS } = await freshInstance();
    expect(LIMITS.commission.limit).toBeLessThan(LIMITS.enquiry.limit);
    expect(LIMITS.checkout.limit).toBeLessThan(LIMITS.search.limit);
    expect(LIMITS.signin.limit).toBeLessThan(LIMITS.search.limit);
    expect(LIMITS.guestCart.limit).toBeLessThan(LIMITS.cartWrite.limit);
  });
});

describe('when the shared limiter is unavailable', () => {
  it('falls back to a per-instance limit that STILL enforces, rather than allowing everything', async () => {
    const a = await freshInstance();
    shared.fault = 'throw';

    const { limit } = a.LIMITS.enquiry;
    for (let i = 0; i < limit; i += 1) {
      const result = await a.checkRateLimit('enquiry', 'caller');
      expect(result.ok).toBe(true);
      expect(result.degraded).toBe(true);
    }
    const refused = await a.checkRateLimit('enquiry', 'caller');
    expect(refused.ok).toBe(false);
    expect(refused.degraded).toBe(true);
  });

  it('does not treat a Redis timeout as permission', async () => {
    const a = await freshInstance();
    shared.fault = 'timeout';

    const { limit } = a.LIMITS.commission;
    for (let i = 0; i < limit; i += 1) await a.checkRateLimit('commission', 'caller');
    expect((await a.checkRateLimit('commission', 'caller')).ok).toBe(false);
  });

  it('says so in the logs, once, without leaking the token', async () => {
    const a = await freshInstance();
    shared.fault = 'throw';
    for (let i = 0; i < 5; i += 1) await a.checkRateLimit('enquiry', 'caller');

    const logged = vi.mocked(console.error).mock.calls.flat().join(' ');
    expect(logged).toMatch(/per-instance limiter/);
    expect(logged).not.toMatch(/token-that-must-never-be-logged/);
    expect(vi.mocked(console.error).mock.calls.length).toBe(1);
  });

  it('is enforced, and loud, when Upstash is not configured at all', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    const a = await freshInstance();

    const { limit } = a.LIMITS.newsletter;
    for (let i = 0; i < limit; i += 1) {
      expect((await a.checkRateLimit('newsletter', 'caller')).ok).toBe(true);
    }
    const refused = await a.checkRateLimit('newsletter', 'caller');
    expect(refused.ok).toBe(false);
    expect(refused.degraded).toBe(true);
    expect(shared.constructed).toBe(0);
    expect(vi.mocked(console.error).mock.calls.flat().join(' ')).toMatch(/not set/);
  });
});

describe('clientIp: not believing the caller', () => {
  const headers = (init: Record<string, string>) => new Headers(init);

  it('takes the entry our own proxy appended, not the one the client chose', async () => {
    const { clientIp } = await freshInstance();
    // The client sent "1.2.3.4" hoping to be somebody else; the edge appended
    // the address it actually saw.
    expect(clientIp(headers({ 'x-forwarded-for': '1.2.3.4, 203.0.113.50' }))).toBe('203.0.113.50');
  });

  it('gives a spoofer no way to pick a fresh bucket per request', async () => {
    const { clientIp } = await freshInstance();
    const real = '203.0.113.50';
    const seen = new Set(
      ['9.9.9.1', '9.9.9.2', '9.9.9.3'].map((fake) =>
        clientIp(headers({ 'x-forwarded-for': `${fake}, ${real}` })),
      ),
    );
    expect([...seen]).toEqual([real]);
  });

  it('honours the configured number of trusted hops', async () => {
    vi.stubEnv('TRUSTED_PROXY_HOPS', '2');
    const { clientIp } = await freshInstance();
    expect(clientIp(headers({ 'x-forwarded-for': 'spoof, 203.0.113.7, 10.0.0.1' }))).toBe('203.0.113.7');
  });

  it('ignores forwarding headers entirely when told no proxy is trusted', async () => {
    vi.stubEnv('TRUSTED_PROXY_HOPS', '0');
    const { clientIp } = await freshInstance();
    expect(clientIp(headers({ 'x-forwarded-for': '1.2.3.4', 'x-real-ip': '5.6.7.8' }))).toBe('unknown');
  });

  it('falls back to x-real-ip, then to a fixed bucket', async () => {
    const { clientIp } = await freshInstance();
    expect(clientIp(headers({ 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4');
    expect(clientIp(headers({}))).toBe('unknown');
  });
});
