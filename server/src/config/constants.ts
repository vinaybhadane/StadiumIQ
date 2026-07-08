// Application-wide constants. Every tunable number lives here so behaviour
// is auditable in one place.

/** Fallback HTTP port when Cloud Run does not inject one. */
export const FALLBACK_PORT = 8080;

/** Reported by GET /api/health so a deploy can be matched to a commit. */
export const SERVER_VERSION = '1.0.0';

/** Maximum accepted JSON request body. */
export const REQUEST_SIZE_CAP = '100kb';

/** Maximum length of a fan question sent to the assistant. */
export const QUERY_CHAR_LIMIT = 500;

/** How long an identical assistant answer is served from cache. */
export const GUIDE_CACHE_DURATION_MS = 5 * 60_000;

/** How long an operations briefing is reused before regenerating. */
export const REPORT_CACHE_DURATION_MS = 60_000;

/** Upper bound on cached entries before the oldest is evicted. */
export const MAX_CACHED_ITEMS = 500;

/** Hard timeout for a single Gemini call. */
export const AI_REQUEST_TIMEOUT_MS = 30_000;

/** Output budget for Gemini responses (answers and briefings are short). */
export const AI_OUTPUT_TOKEN_CAP = 1024;

/**
 * Thinking-token budget. Zero disables Gemini 2.5's internal reasoning, which
 * these well-structured prompts do not need — it removes latency and prevents
 * thinking from consuming the whole output budget and returning empty text.
 */
export const AI_REASONING_BUDGET = 0;

/** Interval between simulated crowd-telemetry updates written to Firestore. */
export const SIMULATION_INTERVAL_MS = 60_000;

/** Bounds of the simulated zone occupancy random walk, as a percentage. */
export const SIM_MIN_OCCUPANCY_PCT = 15;
export const SIM_MAX_OCCUPANCY_PCT = 98;
export const SIM_MAX_CHANGE_PCT = 6;

/** Zone density above which a zone is flagged busy / critical. */
export const CROWD_BUSY_THRESHOLD = 65;
export const CROWD_CRITICAL_THRESHOLD = 85;

/** General API rate limit per client IP. */
export const GENERAL_THROTTLE = { windowMs: 15 * 60_000, limit: 300 } as const;

/** Stricter limit for the two Gemini-backed endpoints (cost control). */
export const AI_ENDPOINT_THROTTLE = { windowMs: 60_000, limit: 15 } as const;
