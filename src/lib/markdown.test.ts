import { describe, expect, it } from 'vitest';
import { parseMarkdown } from '@/lib/markdown';

/**
 * The journal renderer writes its output through `dangerouslySetInnerHTML`, so
 * the escaping tests below are load-bearing security tests rather than
 * formatting ones.
 */

describe('parseMarkdown — structure', () => {
  it('splits blocks on blank lines', () => {
    const blocks = parseMarkdown('First para.\n\nSecond para.');
    expect(blocks).toHaveLength(2);
    expect(blocks.every((b) => b.type === 'paragraph')).toBe(true);
  });

  it('treats a single newline as a soft wrap, not a break', () => {
    const [block] = parseMarkdown('One line\ncontinued here.');
    expect(block).toMatchObject({ type: 'paragraph', html: 'One line continued here.' });
  });

  it('reads heading levels', () => {
    const blocks = parseMarkdown('## Two\n\n### Three');
    expect(blocks[0]).toMatchObject({ type: 'heading', level: 2, html: 'Two' });
    expect(blocks[1]).toMatchObject({ type: 'heading', level: 3, html: 'Three' });
  });

  it('collects a run of dashes into one list', () => {
    const [block] = parseMarkdown('- Myrobalan\n- Madder\n- Indigo');
    expect(block).toMatchObject({ type: 'list', items: ['Myrobalan', 'Madder', 'Indigo'] });
  });
});

describe('parseMarkdown — inline formatting', () => {
  it('renders bold and italic', () => {
    const [block] = parseMarkdown('**Kasim** and *chay*.');
    expect(block.type === 'paragraph' && block.html).toBe(
      '<strong>Kasim</strong> and <em>chay</em>.',
    );
  });

  it('opens external links in a new tab with a safe rel', () => {
    const [block] = parseMarkdown('[GI registry](https://example.com/gi)');
    const html = block.type === 'paragraph' ? block.html : '';
    expect(html).toContain('href="https://example.com/gi"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('keeps site-relative links in the same tab', () => {
    const [block] = parseMarkdown('[The process](/process)');
    const html = block.type === 'paragraph' ? block.html : '';
    expect(html).toContain('href="/process"');
    expect(html).not.toContain('target="_blank"');
  });
});

describe('parseMarkdown — escaping', () => {
  it('renders a script tag as text rather than executing it', () => {
    const [block] = parseMarkdown('<script>alert(1)</script>');
    const html = block.type === 'paragraph' ? block.html : '';
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes attribute-breaking characters', () => {
    const [block] = parseMarkdown('He said "hello" & left.');
    const html = block.type === 'paragraph' ? block.html : '';
    expect(html).toBe('He said &quot;hello&quot; &amp; left.');
  });

  it('refuses a javascript: URL and keeps only the text', () => {
    const [block] = parseMarkdown('[click](javascript:alert(1))');
    const html = block.type === 'paragraph' ? block.html : '';
    expect(html).not.toContain('href');
    expect(html).toContain('click');
  });

  it('refuses a data: URL', () => {
    const [block] = parseMarkdown('[x](data:text/html;base64,PHNjcmlwdD4=)');
    const html = block.type === 'paragraph' ? block.html : '';
    expect(html).not.toContain('href');
  });

  it('escapes markup inside a list item and a heading too', () => {
    const [list] = parseMarkdown('- <img onerror=x>');
    expect(list.type === 'list' && list.items[0]).toContain('&lt;img');

    const [heading] = parseMarkdown('## <b>bold</b>');
    expect(heading.type === 'heading' && heading.html).toContain('&lt;b&gt;');
  });
});
