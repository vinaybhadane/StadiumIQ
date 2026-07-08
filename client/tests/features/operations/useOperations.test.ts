import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as api from '../../../src/lib/api.js';
import { useCommandHub } from '../../../src/features/operations/useOperations.js';
import type { LiveSituationData } from '../../../src/lib/api-types.js';

const SNAPSHOT: LiveSituationData = {
  zones: [],
  incidents: [],
  sustainability: { wasteDivertedPct: 60, energyKwh: 1, waterRefillCount: 2, co2SavedKg: 3 },
  generatedAt: '2026-07-06T17:00:00.000Z',
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useCommandHub', () => {
  it('surfaces a generic message when the briefing fails without an ApiError', async () => {
    vi.spyOn(api, 'loadLiveData').mockResolvedValue(SNAPSHOT);
    vi.spyOn(api, 'generateReport').mockRejectedValue(new Error('unexpected'));

    const { result } = renderHook(() => useCommandHub());
    await waitFor(() => {
      expect(result.current.situation).not.toBeNull();
    });

    await act(async () => {
      await result.current.requestSituationReport();
    });

    expect(result.current.reportError).toBe('Unable to generate a briefing right now.');
  });
});
