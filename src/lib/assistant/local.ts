import { knowledge, type KnowledgeEntry } from '@/content/assistant';
import { site } from '@/content/site';

/**
 * The no-model answer engine.
 *
 * When `ANTHROPIC_API_KEY` is not configured — a fresh clone, a preview
 * deploy, an outage at the provider — the assistant still answers, from the
 * same knowledge base the model is given. It does this by scoring the question
 * against each entry's keywords rather than by generating text, so it can only
 * ever say things the store has actually written down.
 *
 * This is deliberately not a "sorry, I'm offline" stub. The most common
 * questions in a craft shop are the same twelve questions, and twelve good
 * canned answers beat an apology.
 */

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'do', 'does', 'you', 'your', 'i', 'me', 'my',
  'and', 'or', 'to', 'of', 'in', 'on', 'for', 'it', 'this', 'that', 'can',
  'what', 'how', 'why', 'when', 'where', 'please', 'tell', 'about', 'with',
]);

function tokenise(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9₹\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Crudest possible stemming: drop a trailing plural `s`.
 *
 * Enough to stop "what dyes do you use" missing the keyword "dye", which is
 * about as ordinary a question as this store receives. `ss` is left alone so
 * "process" does not become "proces".
 */
function stem(word: string): string {
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

/**
 * Flattens punctuation to spaces for phrase matching.
 *
 * Without this, "how do I tell hand-painted from printed?" fails to match the
 * keyword "hand painted", because the hyphen is not a space. That is not a
 * hypothetical: it is the single most common question this store is asked and
 * the one the whole site is built to answer, and it was falling through to
 * "I would rather not guess at that one".
 */
function normalise(input: string): string {
  return ` ${input.toLowerCase().replace(/[^a-z0-9₹\s]/g, ' ').replace(/\s+/g, ' ').trim()} `;
}

function scoreEntry(entry: KnowledgeEntry, question: string, tokens: string[]) {
  const flattened = normalise(question);
  let score = 0;

  for (const keyword of entry.keywords) {
    // A whole phrase appearing verbatim is far stronger evidence than a word
    // overlap, so it is weighted an order of magnitude higher.
    if (keyword.includes(' ') && flattened.includes(normalise(keyword).slice(1, -1))) {
      score += 10;
      continue;
    }
    const keywordStem = stem(keyword);

    for (const token of tokens) {
      // Exact, or the same word in the other number ("dye" / "dyes").
      if (token === keyword || stem(token) === keywordStem) {
        score += 4;
        continue;
      }
      // A partial overlap is weak evidence and is scored as such. Multi-word
      // keywords are excluded: they have already had their chance as a phrase
      // above, and letting "colour" half-match "what colours" is how an
      // unrelated question ends up confidently answered with the dye list.
      if (!keyword.includes(' ') && token.length > 4 && keyword.includes(token)) {
        score += 2;
      }
    }
  }

  return score;
}

export type LocalAnswer = {
  text: string;
  link?: KnowledgeEntry['link'];
  /** False when nothing matched well enough and we fell back to a handoff. */
  confident: boolean;
};

export function answerLocally(question: string): LocalAnswer {
  const tokens = tokenise(question);
  const ranked = knowledge
    .map((entry) => ({ entry, score: scoreEntry(entry, question, tokens) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];

  // Threshold chosen so a single weak word overlap ("colour" in an unrelated
  // sentence) does not produce a confidently wrong answer.
  if (!best || best.score < 6) {
    return {
      confident: false,
      text: `I would rather not guess at that one. The family answers messages themselves — ${site.hours.note.toLowerCase()} Send them the question and you will get a real answer rather than my approximation of one.`,
      link: { label: 'Message the store', href: '/contact' },
    };
  }

  const second = ranked[1];
  let text = best.entry.answer;

  // If a second entry scored nearly as well, the question probably straddles
  // both — offer the other thread rather than silently picking one.
  if (second && second.score >= best.score * 0.75 && second.score >= 6) {
    text += `\n\nYou may also be asking about ${second.entry.keywords[0]} — ask me and I will go into it.`;
  }

  return { text, link: best.entry.link, confident: true };
}
