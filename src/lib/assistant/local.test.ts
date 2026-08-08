import { describe, expect, it } from 'vitest';
import { answerLocally } from '@/lib/assistant/local';

/**
 * The offline answer engine.
 *
 * This is what visitors get when no model key is configured, or when the
 * provider is down. It is a documented degradation path rather than a stub, so
 * it is worth testing that the questions this store is actually asked reach an
 * answer instead of the handoff.
 */

describe('answerLocally — the questions this site exists to answer', () => {
  it('answers the hand-painted versus printed question, however it is phrased', () => {
    for (const question of [
      'How do I tell hand-painted from printed?',
      'Is this block printed or painted?',
      'how do i know it is real',
      'What is the difference from Machilipatnam?',
      'Is this genuine or a fake?',
    ]) {
      const answer = answerLocally(question);
      expect(answer.confident, question).toBe(true);
      expect(answer.text.toLowerCase(), question).toContain('freehand');
    }
  });

  it('routes the everyday questions to the right entry', () => {
    const cases: [string, string][] = [
      // Plural of a singular keyword — this missed before stemming.
      ['What dyes do you use?', 'madder'],
      ['How should I wash it?', 'cold water'],
      ['How long does delivery take?', 'free above'],
      ['Do you ship internationally?', 'international'],
      ['How is it made?', 'alum'],
      ['Can you paint something to my own design?', 'commission'],
      ['Who makes these?', 'muni reddy'],
    ];

    for (const [question, expected] of cases) {
      const answer = answerLocally(question);
      expect(answer.confident, question).toBe(true);
      expect(answer.text.toLowerCase(), question).toContain(expected);
    }
  });
});

describe('answerLocally — when it does not know', () => {
  it('hands off rather than guessing', () => {
    const answer = answerLocally('What is the capital of France?');
    expect(answer.confident).toBe(false);
    expect(answer.link?.href).toBe('/contact');
  });

  it('does not answer confidently from a single stray word', () => {
    // "colour" is a keyword on the dye entry, but one loose overlap is not
    // enough evidence — a phrase or a second signal is required. Before the
    // partial-match rule was tightened, "colour" also half-matched the phrase
    // keyword "what colours" and tipped this over the threshold.
    expect(answerLocally('what colour is your logo').confident).toBe(false);
    expect(answerLocally('do you sell furniture').confident).toBe(false);
  });
});

describe('answerLocally — the retracted design editor', () => {
  it('never offers to let someone draw their own design on the site', () => {
    // A design editor was promised in the knowledge base and never built. The
    // copy was corrected; this stops it coming back.
    for (const question of [
      'Can I design my own piece?',
      'Do you have a custom design tool?',
      'Can I draw it myself?',
    ]) {
      const text = answerLocally(question).text.toLowerCase();
      expect(text, question).not.toContain('editor');
      expect(text, question).not.toContain('draw the design yourself');
    }
  });
});
