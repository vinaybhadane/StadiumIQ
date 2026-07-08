// Layered rate limiting: a general API budget per client, plus a stricter
// budget on the Gemini-backed endpoints to bound inference cost.
import { rateLimit } from 'express-rate-limit';

import { GENERAL_THROTTLE, AI_ENDPOINT_THROTTLE } from '../config/constants.js';

const THROTTLE_RESPONSE = {
  error: { code: 'RATE_LIMITED', message: 'Too many requests — please slow down.' },
};

/** General limit applied to every /api route. */
export const generalThrottle = rateLimit({
  windowMs: GENERAL_THROTTLE.windowMs,
  limit: GENERAL_THROTTLE.limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: THROTTLE_RESPONSE,
});

/** Stricter limit for endpoints that trigger Gemini inference. */
export const aiEndpointThrottle = rateLimit({
  windowMs: AI_ENDPOINT_THROTTLE.windowMs,
  limit: AI_ENDPOINT_THROTTLE.limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: THROTTLE_RESPONSE,
});
