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

  it('keeps every module off the primitives barrel', () => {
    // Importing the barrel ships Select, Tabs, Accordion, Checkbox and
    // RadioGroup to the page whether it uses them or not. Import the module.
    const barrel = join(root, 'components/ui/primitives.tsx');
    for (const file of walk(root)) {
      if (file === barrel || file.endsWith('.test.ts')) continue;
      expect(readFileSync(file, 'utf8'), file).not.toContain('@/components/ui/primitives');
    }
  });

  it('keeps the Radix Dialog out of the first-load bundle', () => {
    // Four controls open a dialog. Each is a small shell (button + state) that
    // requests its panel on first approach or press; only the panel may import
    // the dialog. Otherwise react-remove-scroll and the focus lock ship on every
    // page, to be parsed by visitors who never open anything.
    const shells = [
      'components/layout/mobile-menu.tsx',
      'components/layout/explore-menu.tsx',
      'components/cart/cart-drawer.tsx',
      'components/shop/shop-filters.tsx',
    ];
    for (const file of shells) {
      const source = read(file);
      expect(source, file).not.toContain('@/components/ui/dialog');
      expect(source, file).toMatch(/dynamic\(/);
    }
  });

  it('imports sonner only from the lazily mounted renderer', () => {
    // `@/lib/toast` loads the library on the first message. A direct import
    // anywhere else puts all of sonner back into the page's own bundle.
    for (const file of walk(root)) {
      if (file.endsWith('toaster-layer.tsx') || file.endsWith('.test.ts')) continue;
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/from 'sonner'/);
    }
  });

  it('keeps the search overlay shell off the Radix Dialog', () => {
    const shell = read('components/shop/search-overlay.tsx');
    expect(shell).not.toContain('@radix-ui/react-dialog');
    expect(shell).toMatch(/dynamic\(/);
  });

  it('loads the toast layer, GSAP and Lenis lazily', () => {
    expect(read('app/layout.tsx')).not.toMatch(/from 'sonner'/);
    const provider = read('components/providers/smooth-scroll-provider.tsx');
    expect(provider).not.toMatch(/^import (?!type).* from '(gsap|lenis)/m);
    expect(provider).toContain("import('lenis')");
    expect(provider).toContain('(pointer: fine)');
  });
});
