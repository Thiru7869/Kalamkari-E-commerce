import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getAuthSecret,
  razorpayEnv,
  razorpayPartiallyConfigured,
  trustedProxyHops,
} from '@/lib/env';

afterEach(() => vi.unstubAllEnvs());

const razorpay = (over: Record<string, string> = {}) => {
  vi.stubEnv('RAZORPAY_KEY_ID', 'rzp_test_id');
  vi.stubEnv('RAZORPAY_KEY_SECRET', 'key-secret');
  vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', 'hook-secret');
  for (const [k, v] of Object.entries(over)) vi.stubEnv(k, v);
};

describe('razorpayEnv', () => {
  it('is configured only when key id, key secret AND webhook secret are all set', () => {
    razorpay();
    expect(razorpayEnv().configured).toBe(true);
  });

  it('is NOT configured without the webhook secret, and names exactly that variable', () => {
    razorpay({ RAZORPAY_WEBHOOK_SECRET: '' });
    const env = razorpayEnv();
    expect(env.configured).toBe(false);
    expect(env.configured ? [] : env.missing).toEqual(['RAZORPAY_WEBHOOK_SECRET']);
  });

  it('treats whitespace-only values as missing', () => {
    razorpay({ RAZORPAY_KEY_SECRET: '   ' });
    expect(razorpayEnv().configured).toBe(false);
  });

  it('lists every missing variable and never a value', () => {
    vi.stubEnv('RAZORPAY_KEY_ID', '');
    vi.stubEnv('RAZORPAY_KEY_SECRET', '');
    vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', '');
    const env = razorpayEnv();
    expect(env.configured ? [] : env.missing).toHaveLength(3);
  });

  it('flags a half-finished setup, which is the dangerous one', () => {
    razorpay({ RAZORPAY_WEBHOOK_SECRET: '' });
    expect(razorpayPartiallyConfigured()).toBe(true);
    vi.stubEnv('RAZORPAY_KEY_ID', '');
    vi.stubEnv('RAZORPAY_KEY_SECRET', '');
    expect(razorpayPartiallyConfigured()).toBe(false);
  });
});

describe('getAuthSecret', () => {
  it('refuses to run in production without a secret', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('AUTH_SECRET', '');
    vi.stubEnv('NEXTAUTH_SECRET', '');
    expect(() => getAuthSecret()).toThrow(/AUTH_SECRET/);
  });

  it('refuses a short secret in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('AUTH_SECRET', 'short');
    expect(() => getAuthSecret()).toThrow(/32/);
  });

  it('accepts a strong one in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('AUTH_SECRET', 'x'.repeat(40));
    expect(getAuthSecret()).toBe('x'.repeat(40));
  });

  it('uses a fixed fallback only outside production', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('AUTH_SECRET', '');
    vi.stubEnv('NEXTAUTH_SECRET', '');
    expect(getAuthSecret()).toMatch(/development-only/);
  });
});

describe('trustedProxyHops', () => {
  it('defaults to one proxy', () => {
    vi.stubEnv('TRUSTED_PROXY_HOPS', '');
    expect(trustedProxyHops()).toBe(1);
  });

  it.each([
    ['0', 0],
    ['2', 2],
    ['9', 1],
    ['-1', 1],
    ['abc', 1],
    ['1.5', 1],
  ])('reads %s as %s', (raw, expected) => {
    vi.stubEnv('TRUSTED_PROXY_HOPS', raw);
    expect(trustedProxyHops()).toBe(expected);
  });
});
