import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SurgePredictor } from '../src/components/Crowd/SurgePredictor';
import { SurgePredictionResponse } from '../src/types';

describe('SurgePredictor Component', () => {
  test('renders empty state when prediction is null', () => {
    render(<SurgePredictor prediction={null} />);
    expect(screen.getByText('No surge predictions loaded. Run analysis below.')).toBeInTheDocument();
  });

  test('renders predictions lists with risk levels', () => {
    const mockPrediction: SurgePredictionResponse = {
      predictions: [
        {
          gate_id: 'G1',
          zone_id: 'Z1',
          predicted_peak_time: '2026-07-10T16:00:00Z',
          risk_level: 'red',
          expected_inflow: 1500,
          confidence: 0.9,
          recommended_action: 'Open Gate G2',
        },
      ],
      overall_risk: 'red',
      summary: 'High surge warning',
      source: 'rules',
    };

    render(<SurgePredictor prediction={mockPrediction} />);
    expect(screen.getByText('High surge warning')).toBeInTheDocument();
    expect(screen.getByText('Gate: G1')).toBeInTheDocument();
    expect(screen.getByText('Open Gate G2')).toBeInTheDocument();
  });
});
