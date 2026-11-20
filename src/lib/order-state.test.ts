import { describe, expect, it, vi } from 'vitest';

// The transition table is pure. The service that applies it needs a database
// and is exercised in order-state.int.test.ts.
vi.mock('@/lib/prisma', () => ({ prisma: {} }));

import { allowedTargets, canTransition, isTerminalStatus } from '@/lib/order-state';
import { ORDER_STATUSES } from '@/lib/orders';

const ACTORS = ['admin', 'customer', 'payment', 'system'] as const;

describe('order transition table', () => {
  it('never lets a cancelled order move anywhere, for anyone', () => {
    for (const to of ORDER_STATUSES) {
      for (const actor of ACTORS) expect(canTransition('CANCELLED', to, actor)).toBe(false);
    }
  });

  it('never lets a delivered order go back', () => {
    for (const to of ORDER_STATUSES) expect(canTransition('DELIVERED', to, 'admin')).toBe(false);
  });

  it('does not allow CANCELLED -> CONFIRMED (the stock-resurrection bug)', () => {
    expect(canTransition('CANCELLED', 'CONFIRMED', 'admin')).toBe(false);
    expect(canTransition('CANCELLED', 'CONFIRMED', 'payment')).toBe(false);
  });

  it('only a payment or an admin confirms a pending order; a customer cannot', () => {
    expect(canTransition('PENDING', 'CONFIRMED', 'payment')).toBe(true);
    expect(canTransition('PENDING', 'CONFIRMED', 'admin')).toBe(true);
    expect(canTransition('PENDING', 'CONFIRMED', 'customer')).toBe(false);
  });

  it('a payment can do nothing except confirm a pending order', () => {
    for (const from of ORDER_STATUSES) {
      for (const to of ORDER_STATUSES) {
        expect(canTransition(from, to, 'payment')).toBe(from === 'PENDING' && to === 'CONFIRMED');
      }
    }
  });

  it('a customer may cancel only before work starts', () => {
    expect(canTransition('PENDING', 'CANCELLED', 'customer')).toBe(true);
    expect(canTransition('CONFIRMED', 'CANCELLED', 'customer')).toBe(true);
    for (const from of ['IN_PRODUCTION', 'PACKED', 'SHIPPED', 'DELIVERED']) {
      expect(canTransition(from, 'CANCELLED', 'customer')).toBe(false);
    }
  });

  it('nobody cancels a parcel that has already shipped', () => {
    expect(canTransition('SHIPPED', 'CANCELLED', 'admin')).toBe(false);
  });

  it('a customer can do nothing except cancel', () => {
    for (const from of ORDER_STATUSES) {
      for (const to of ORDER_STATUSES) {
        if (to !== 'CANCELLED') expect(canTransition(from, to, 'customer')).toBe(false);
      }
    }
  });

  it('allows the normal forward path for an admin', () => {
    const path = ['CONFIRMED', 'IN_PRODUCTION', 'PACKED', 'SHIPPED', 'DELIVERED'];
    for (let i = 0; i < path.length - 1; i += 1) {
      expect(canTransition(path[i], path[i + 1], 'admin')).toBe(true);
    }
  });

  it('does not let an order stay put, or move to or from an unknown status', () => {
    expect(canTransition('CONFIRMED', 'CONFIRMED', 'admin')).toBe(false);
    expect(canTransition('CONFIRMED', 'REFUNDED', 'admin')).toBe(false);
    expect(canTransition('NOPE', 'CONFIRMED', 'admin')).toBe(false);
  });

  it('reports terminal statuses and the targets an actor really has', () => {
    expect(isTerminalStatus('CANCELLED')).toBe(true);
    expect(isTerminalStatus('PENDING')).toBe(false);
    expect(allowedTargets('CANCELLED', 'admin')).toEqual([]);
    expect(allowedTargets('PENDING', 'customer')).toEqual(['CANCELLED']);
  });
});
