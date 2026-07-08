// Crash-fast environment validation: the process refuses to start with a
// malformed configuration instead of failing on the first request.
import { z } from 'zod';

import { FALLBACK_PORT } from './constants.js';

const toggleSwitch = z
  .enum(['true', 'false'])
  .default('true')
  .transform((value) => value === 'true');

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(FALLBACK_PORT),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().min(1).default('gemini-2.5-flash'),
  GOOGLE_CLOUD_PROJECT: z.string().optional(),
  ALLOWED_ORIGINS: z.string().default(''),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  TELEMETRY_SIM_ENABLED: toggleSwitch,
});

/** Validated application configuration derived from process.env. */
export type AppConfig = z.infer<typeof configSchema>;

/**
 * Parses and validates environment variables.
 *
 * @param source - Raw variables, injectable for tests.
 * @throws Error listing every invalid variable when validation fails.
 */
export function parseConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const result = configSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration — ${details}`);
  }
  return result.data;
}

/** Configuration validated once at module load. */
export const config: AppConfig = parseConfig();
