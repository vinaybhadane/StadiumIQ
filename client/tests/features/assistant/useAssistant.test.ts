import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as api from '../../../src/lib/api.js';
import { useMatchGuide } from '../../../src/features/assistant/useAssistant.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useMatchGuide', () => {
  it('ignores empty questions without calling the API', async () => {
    const ask = vi.spyOn(api, 'queryMatchGuide');
    const { result } = renderHook(() => useMatchGuide());

    await act(async () => {
      await result.current.queryGuide('   ');
    });

    expect(ask).not.toHaveBeenCalled();
    expect(result.current.dialogs).toHaveLength(0);
  });

  it('falls back to a generic message when a non-ApiError is thrown', async () => {
    vi.spyOn(api, 'queryMatchGuide').mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useMatchGuide());

    await act(async () => {
      await result.current.queryGuide('Where is Gate 1?');
    });

    expect(result.current.error).toBe('The assistant is unavailable right now. Please try again.');
  });
});
