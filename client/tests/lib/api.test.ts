import { afterEach, describe, expect, it, vi } from 'vitest';

import { ServiceError, queryMatchGuide, loadLiveData, generateReport } from '../../src/lib/api.js';

function mockFetch(response: Partial<Response> & { json: () => Promise<unknown> }): void {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('queryMatchGuide', () => {
  it('posts the question and language and returns the parsed answer', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ answer: 'Gate 6', language: 'en', cached: false }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await queryMatchGuide('Where is the accessible gate?', 'en');

    expect(result.answer).toBe('Gate 6');
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({
      question: 'Where is the accessible gate?',
      language: 'en',
    });
  });

  it('throws an ServiceError carrying the server message on a 4xx/5xx', async () => {
    mockFetch({
      ok: false,
      json: () => Promise.resolve({ error: { code: 'BAD_REQUEST', message: 'question required' } }),
    });
    const error = await queryMatchGuide('x', 'en').catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ServiceError);
    expect((error as ServiceError).code).toBe('BAD_REQUEST');
    expect((error as ServiceError).message).toBe('question required');
  });

  it('maps a network failure to a generic ServiceError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const error = await queryMatchGuide('x', 'en').catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ServiceError);
    expect((error as ServiceError).code).toBe('NETWORK');
  });
});

describe('operations API calls', () => {
  it('loadLiveData returns the snapshot payload', async () => {
    mockFetch({
      ok: true,
      json: () =>
          Promise.resolve({ zones: [], incidents: [], sustainability: {}, generatedAt: 'now' }),
    });
    const snapshot = await loadLiveData();
    expect(snapshot.generatedAt).toBe('now');
  });

  it('generateReport returns the briefing payload', async () => {
    mockFetch({
      ok: true,
      json: () => Promise.resolve({ briefing: 'PRIMARY RISKS', generatedAt: 'now' }),
    });
    const briefing = await generateReport();
    expect(briefing.briefing).toBe('PRIMARY RISKS');
  });
});
