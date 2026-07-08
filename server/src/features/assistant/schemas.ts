// Boundary validation for the assistant feature.
import { z } from 'zod';

import { QUERY_CHAR_LIMIT } from '../../config/constants.js';

/** Language codes accepted by the assistant. */
export const ACCEPTED_LOCALES = ['en', 'es', 'fr', 'pt', 'ar'] as const;

/** Body schema for POST /api/assistant/ask. Unknown keys are rejected. */
export const guideQuerySchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(1, 'question must not be empty')
      .max(
        QUERY_CHAR_LIMIT,
        `question must be at most ${String(QUERY_CHAR_LIMIT)} characters`,
      ),
    language: z.enum(ACCEPTED_LOCALES).default('en'),
  })
  .strict();

/** Parsed ask request. */
export type GuideQuery = z.infer<typeof guideQuerySchema>;
