import { describe, expect, it } from 'vitest';

import { guideQuerySchema } from '../../../src/features/assistant/schemas.js';

describe('guideQuerySchema', () => {
  it('accepts a valid question and defaults the language to English', () => {
    const parsed = guideQuerySchema.parse({ question: 'Where is Gate 4?' });
    expect(parsed.language).toBe('en');
    expect(parsed.question).toBe('Where is Gate 4?');
  });

  it('trims surrounding whitespace from the question', () => {
    const parsed = guideQuerySchema.parse({ question: '  metro?  ' });
    expect(parsed.question).toBe('metro?');
  });

  it('rejects an empty question', () => {
    expect(guideQuerySchema.safeParse({ question: '   ' }).success).toBe(false);
  });

  it('rejects a question longer than 500 characters', () => {
    const oversized = 'a'.repeat(501);
    expect(guideQuerySchema.safeParse({ question: oversized }).success).toBe(false);
  });

  it('rejects an unsupported language code', () => {
    expect(guideQuerySchema.safeParse({ question: 'hola', language: 'de' }).success).toBe(false);
  });

  it('rejects unknown keys (strict boundary)', () => {
    const result = guideQuerySchema.safeParse({ question: 'hi', injected: 'payload' });
    expect(result.success).toBe(false);
  });
});
