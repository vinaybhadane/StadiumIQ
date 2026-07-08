// Gemini access through the official @google/genai SDK. One client is
// shared across requests; every call gets a hard timeout and one retry.
import { GoogleGenAI } from '@google/genai';

import { config } from '../config/env.js';
import {
  AI_OUTPUT_TOKEN_CAP,
  AI_REASONING_BUDGET,
  AI_REQUEST_TIMEOUT_MS,
} from '../config/constants.js';
import { ServiceFault } from './app-error.js';
import { appLog } from './logger.js';

let aiInstance: GoogleGenAI | undefined;

function resolveAiClient(): GoogleGenAI {
  aiInstance ??= new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
  return aiInstance;
}

async function invokeModel(prompt: string): Promise<string | undefined> {
  const response = await resolveAiClient().models.generateContent({
    model: config.GEMINI_MODEL,
    contents: prompt,
    config: {
      maxOutputTokens: AI_OUTPUT_TOKEN_CAP,
      thinkingConfig: { thinkingBudget: AI_REASONING_BUDGET },
      abortSignal: AbortSignal.timeout(AI_REQUEST_TIMEOUT_MS),
    },
  });
  return response.text;
}

/**
 * Generates plain text from Gemini for the given prompt.
 *
 * Transient failures are retried once; persistent failures surface as a 502
 * ServiceFault so the client sees a sanitized, actionable message.
 *
 * @param prompt - Full prompt including system framing and grounding data.
 * @returns The model's text response.
 */
export async function produceText(prompt: string): Promise<string> {
  let text: string | undefined;
  try {
    text = await invokeModel(prompt);
  } catch (firstError) {
    appLog.warn({ err: firstError }, 'Gemini call failed, retrying once');
    try {
      text = await invokeModel(prompt);
    } catch (secondError) {
      appLog.error({ err: secondError }, 'Gemini call failed after retry');
      throw ServiceFault.upstreamFailure('gemini', 'The AI service is temporarily unavailable.');
    }
  }
  if (text === undefined || text.trim() === '') {
    throw ServiceFault.upstreamFailure('gemini', 'The AI service returned an empty response.');
  }
  return text.trim();
}
