import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InsightsList } from '../src/components/Insights/InsightsList';
import { Insight } from '../src/types';

describe('InsightsList Component', () => {
  const mockInsights: Insight[] = [
    {
      insight_id: 'I1',
      category: 'crowd_management',
      priority: 'high',
      title: 'Zone crowding alert',
      description: 'North stand has exceeded 85% density limit.',
      recommendation: 'Open additional auxiliary gates.',
      generated_at: '2026-07-10T16:00:00Z',
      source: 'gemini',
      confidence: 0.95,
    },
  ];

  test('renders insights with title and recommendations', () => {
    render(<InsightsList insights={mockInsights} />);
    expect(screen.getByText('Zone crowding alert')).toBeInTheDocument();
    expect(screen.getByText('North stand has exceeded 85% density limit.')).toBeInTheDocument();
    expect(screen.getByText('Open additional auxiliary gates.')).toBeInTheDocument();
    expect(screen.getByText('Source: gemini')).toBeInTheDocument();
  });
});
