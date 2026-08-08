/**
 * A deliberately tiny Markdown subset renderer for journal posts.
 *
 * Scope: `##`/`###` headings, paragraphs, `-` lists, `**bold**`, `*italic*`,
 * and `[text](url)`. That is everything the store's writing actually uses, and
 * adding a full Markdown parser plus sanitiser to the bundle for it would be
 * dead weight.
 *
 * Safety: post bodies come from the store's own database, not from user input,
 * but this escapes HTML before any formatting is applied regardless — so a
 * stray `<script>` in a post body renders as text rather than executing. Links
 * are restricted to http(s) and mailto.
 */

type Block =
  | { type: 'heading'; level: 2 | 3; html: string }
  | { type: 'paragraph'; html: string }
  | { type: 'list'; items: string[] };

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeHref(raw: string): string | null {
  const trimmed = raw.trim();
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed;
  // Site-relative links are fine; anything else (javascript:, data:) is not.
  if (trimmed.startsWith('/')) return trimmed;
  return null;
}

/** Inline formatting, applied to already-escaped text. */
function inline(escaped: string): string {
  return escaped
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text: string, href: string) => {
      const url = safeHref(href);
      if (!url) return text;
      const external = /^https?:/i.test(url);
      const rel = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${url}" class="text-primary underline underline-offset-4"${rel}>${text}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
}

export function parseMarkdown(source: string): Block[] {
  const blocks: Block[] = [];
  const chunks = source.replace(/\r\n/g, '\n').split(/\n{2,}/);

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    const heading = /^(#{2,3})\s+(.*)$/.exec(trimmed);
    if (heading) {
      blocks.push({
        type: 'heading',
        level: heading[1].length === 2 ? 2 : 3,
        html: inline(escapeHtml(heading[2])),
      });
      continue;
    }

    const lines = trimmed.split('\n');
    if (lines.every((line) => /^[-*]\s+/.test(line.trim()))) {
      blocks.push({
        type: 'list',
        items: lines.map((line) => inline(escapeHtml(line.trim().replace(/^[-*]\s+/, '')))),
      });
      continue;
    }

    // Single newlines inside a paragraph are soft wraps, not breaks.
    blocks.push({ type: 'paragraph', html: inline(escapeHtml(lines.join(' '))) });
  }

  return blocks;
}
