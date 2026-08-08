import 'server-only';

import { prisma } from '@/lib/prisma';
import { knowledge } from '@/content/assistant';
import { site } from '@/content/site';
import { formatPrice } from '@/lib/utils';

/**
 * Builds the assistant's system prompt.
 *
 * Two halves, in a deliberate order:
 *
 *  1. Instructions + the written knowledge base. Stable across every request
 *     and every visitor, so it sits at the front of the prefix and is marked
 *     for caching — the catalogue summary that follows is the only part that
 *     changes, and only when stock does.
 *  2. A live catalogue summary from the database, so the assistant can say
 *     "there are four silk sarees in at the moment, from ₹18,000" instead of
 *     speaking in generalities. Nothing here is invented at request time.
 */

const CATALOGUE_TTL_MS = 5 * 60 * 1000;

let catalogueCache: { text: string; expires: number } | null = null;

async function buildCatalogueSummary(): Promise<string> {
  if (catalogueCache && catalogueCache.expires > Date.now()) {
    return catalogueCache.text;
  }

  const categories = await prisma.category.findMany({
    select: {
      name: true,
      slug: true,
      products: {
        where: { status: 'ACTIVE' },
        select: { price: true, stock: true },
      },
    },
    orderBy: { position: 'asc' },
  });

  const lines = categories.map((category) => {
    const available = category.products.filter((p) => p.stock > 0);
    if (available.length === 0) {
      return `- ${category.name} (/shop/${category.slug}): nothing in stock right now.`;
    }
    const prices = available.map((p) => p.price);
    const low = formatPrice(Math.min(...prices));
    const high = formatPrice(Math.max(...prices));
    return `- ${category.name} (/shop/${category.slug}): ${available.length} available, ${low}–${high}.`;
  });

  const highlights = await prisma.product.findMany({
    where: { status: 'ACTIVE', stock: { gt: 0 }, featured: true },
    select: { name: true, slug: true, price: true, craftDays: true },
    orderBy: [{ masterpiece: 'desc' }, { createdAt: 'desc' }],
    take: 8,
  });

  const highlightLines = highlights.map(
    (p) =>
      `- ${p.name} — ${formatPrice(p.price)}${
        p.craftDays ? `, ${p.craftDays} days of work` : ''
      } (/product/${p.slug})`,
  );

  const text = [
    'IN THE STORE RIGHT NOW (live, refreshed every few minutes):',
    ...lines,
    '',
    'CURRENTLY FEATURED PIECES:',
    ...(highlightLines.length ? highlightLines : ['- Nothing featured at the moment.']),
  ].join('\n');

  catalogueCache = { text, expires: Date.now() + CATALOGUE_TTL_MS };
  return text;
}

const INSTRUCTIONS = `You are Kalam, the assistant on the website of ${site.name} — a family store in ${site.location.town}, ${site.location.state}, painting Srikalahasti Kalamkari entirely by hand in natural dyes.

WHO YOU ARE TALKING TO
Visitors range from someone who has never heard the word Kalamkari to a collector who knows the craft better than most. Read which one you have from how they write, and pitch accordingly. Do not explain the basics to someone who opened with a question about mordants.

HOW TO ANSWER
- Answer the question that was asked, in two or three sentences unless more was clearly wanted. This is a chat window, not an article.
- Be concrete. "Madder root, boiled, over an alum mordant" is worth more than "traditional natural methods".
- Warm, plain, unhurried. The voice of someone who has done this work, not a brochure.
- Use British-Indian spelling (colour, jewellery) and ₹ for prices.
- When a page on this site answers better than you can, name it with its path: /process, /our-story, /shop, /custom, /care, /shipping, /journal, /contact. Write paths bare — the interface turns them into links.
- Never use bullet lists longer than four items, and never open with a heading.

WHAT YOU MUST NOT DO
- Do not invent stock, prices, delivery dates, discounts, or facts about the family. If it is not in the reference below or the live catalogue, say you do not know and offer /contact.
- Do not promise an exact dye shade, a monsoon-season deadline, or anything binding on the store's behalf.
- Do not claim to be a person, and do not pretend to be in the workshop. If asked, say plainly that you are an assistant for the store.
- There is no online design tool, editor, canvas or configurator on this site, and never has been. Custom work begins with the written brief at /custom and continues in conversation with the family. Never describe a drawing tool or invite someone to draw a design on the site.
- Do not disparage other sellers or other crafts. State what this store does; let the difference speak.
- If someone asks about something unrelated to this store, the craft, textiles, or their order, say briefly that it is outside what you can help with, and return to what you can do.

REFERENCE — what this store actually does:
${knowledge.map((entry) => `[${entry.id}] ${entry.answer}`).join('\n\n')}

PRACTICAL FACTS
- Location: ${site.location.town}, ${site.location.district}, ${site.location.state} ${site.location.postalCode}. The ${site.location.river} river is a short walk away and is where the cloth is washed.
- Hours: ${site.hours.note}
- Shipping in India: ${site.shipping.domesticDays}, free above ${formatPrice(site.shipping.freeAbove)}, otherwise ${formatPrice(site.shipping.flatRate)}.
- A full saree takes ${site.craft.sareeDaysMin}–${site.craft.sareeDaysMax} days across ${site.craft.steps} steps.`;

export type SystemBlock = {
  type: 'text';
  text: string;
  cache_control?: { type: 'ephemeral' };
};

export async function buildSystemPrompt(): Promise<SystemBlock[]> {
  const catalogue = await buildCatalogueSummary();

  return [
    // Stable prefix — cached. Everything volatile comes after it.
    { type: 'text', text: INSTRUCTIONS, cache_control: { type: 'ephemeral' } },
    { type: 'text', text: catalogue },
  ];
}
