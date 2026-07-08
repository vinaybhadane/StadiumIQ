// Typed fetch wrapper. Every network call goes through here so error
// handling and JSON parsing are consistent across features.
import type {
  ServiceErrorPayload,
  GuideResponse,
  SituationReport,
  LiveSituationData,
  SupportedLanguage,
} from './api-types.js';

/** Error thrown for any non-2xx API response, carrying a display message. */
export class ServiceError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

const GENERIC_ERROR = 'The service is temporarily unavailable. Please try again.';

function isServiceErrorPayload(value: unknown): value is ServiceErrorPayload {
  if (typeof value !== 'object' || value === null || !('error' in value)) {
    return false;
  }
  const { error } = value;
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    throw new ServiceError('NETWORK', GENERIC_ERROR);
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const { code, message } = isServiceErrorPayload(payload)
      ? payload.error
      : { code: 'UNKNOWN', message: GENERIC_ERROR };
    throw new ServiceError(code, message);
  }
  return payload as T;
}

/** Asks the fan assistant a grounded question in the given language. */
export function queryMatchGuide(
  question: string,
  language: SupportedLanguage,
): Promise<GuideResponse> {
  return request<GuideResponse>('/api/assistant/ask', {
    method: 'POST',
    body: JSON.stringify({ question, language }),
  });
}

/** Fetches the current operations snapshot. */
export function loadLiveData(): Promise<LiveSituationData> {
  return request<LiveSituationData>('/api/operations/snapshot');
}

/** Requests a freshly generated AI operations briefing. */
export function generateReport(): Promise<SituationReport> {
  return request<SituationReport>('/api/operations/briefing', { method: 'POST' });
}
