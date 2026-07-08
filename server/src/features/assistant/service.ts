// Assistant feature logic: grounded, cached, multilingual answers.
import { GUIDE_CACHE_DURATION_MS, MAX_CACHED_ITEMS } from '../../config/constants.js';
import { produceText } from '../../lib/gemini.js';
import { ExpiringStore } from '../../lib/ttl-cache.js';
import { assembleVenueContext } from '../stadium/service.js';
import { composeGuidePrompt } from './prompts.js';
import type { GuideQuery } from './schemas.js';
import type { GuideResponse } from './types.js';

const responseCache = new ExpiringStore<string>(GUIDE_CACHE_DURATION_MS, MAX_CACHED_ITEMS);

function buildCacheKey(request: GuideQuery): string {
  return `${request.language}:${request.question.toLowerCase()}`;
}

/**
 * Answers a fan question in the requested language, grounded in the venue
 * dataset. Identical questions are served from cache to keep quick actions
 * instant and Gemini cost bounded.
 */
export async function answerQuery(request: GuideQuery): Promise<GuideResponse> {
  const key = buildCacheKey(request);
  const cachedAnswer = responseCache.get(key);
  if (cachedAnswer !== undefined) {
    return { answer: cachedAnswer, language: request.language, cached: true };
  }

  const prompt = composeGuidePrompt(request.question, request.language, assembleVenueContext());
  const answer = await produceText(prompt);
  responseCache.set(key, answer);
  return { answer, language: request.language, cached: false };
}

/** Clears the answer cache (used by tests). */
export function flushGuideCache(): void {
  responseCache.clear();
}
