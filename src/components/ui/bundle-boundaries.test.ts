import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guards for the first-load JavaScript of every page.
 *
 * `ui/primitives.tsx` is a `'use client'` file that holds Select, Tabs,
 * Accordion, Checkbox and RadioGroup. A module is the unit a bundler ships, so
 * importing even one trivial export from it in a site-wide component sends all
 * of Radix to every visitor. These tests fail the moment that creeps back —
 * nothing else would: the page still works, it is just slower.
 */

const root = join(process.cwd(), 'src');
const read = (path: string) => readFileSync(join(root, path), 'utf8');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

describe('bundle boundaries', () => {
  it('keeps Badge a server-safe module', () => {
    const source = read('components/ui/badge.tsx');
    expect(source).not.toMatch(/^['"]use client['"]/m);
    expect(source).not.toContain('@radix-ui');
  });

  it('keeps the dialog primitives apart from the rest of Radix', () => {
    const source = read('components/ui/dialog.tsx');
    for (const heavy of ['react-select', 'react-tabs', 'react-accordion', 'react-checkbox']) {
      expect(source).not.toContain(heavy);
    }
  });

  it('keeps site-wide components off the primitives barrel', () => {
    const siteWide = [
      ...walk(join(root, 'components/layout')),
      join(root, 'components/cart/cart-drawer.tsx'),
      join(root, 'components/shop/product-card.tsx'),
      join(root, 'app/layout.tsx'),
    ];
    for (const file of siteWide) {
      expect(readFileSync(file, 'utf8'), file).not.toContain('@/components/ui/primitives');
    }
  });

  it('loads the toast layer, GSAP and Lenis lazily', () => {
    expect(read('app/layout.tsx')).not.toMatch(/from 'sonner'/);
    const provider = read('components/providers/smooth-scroll-provider.tsx');
    expect(provider).not.toMatch(/^import (?!type).* from '(gsap|lenis)/m);
    expect(provider).toContain("import('lenis')");
    expect(provider).toContain('(pointer: fine)');
  });
});
