import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MatchScheduler } from '../src/components/Matches/MatchScheduler';

// Mock hook
vi.mock('../src/hooks/useMatches', () => ({
  useMatches: () => ({
    generateSchedule: vi.fn().mockResolvedValue({}),
    isLoading: false,
    error: null,
  }),
}));

describe('MatchScheduler Component', () => {
  test('renders form elements correctly', () => {
    render(<MatchScheduler />);
    expect(screen.getByText('AI Match Scheduler & Optimizer')).toBeInTheDocument();
    expect(screen.getByLabelText('Minimum Rest Days Between Matches')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate AI Bracket' })).toBeInTheDocument();
  });

  test('submits successfully when button clicked', async () => {
    render(<MatchScheduler />);
    const submitBtn = screen.getByRole('button', { name: 'Generate AI Bracket' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Schedule optimized and generated successfully.')).toBeInTheDocument();
    });
  });
});
