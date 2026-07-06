import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WayfindingPanel } from '../src/components/Navigation/WayfindingPanel';

// Mock hook
vi.mock('../src/hooks/useNavigation', () => ({
  useNavigation: () => ({
    directions: {
      path_steps: ['Z-NORTH', 'Z-WEST'],
      estimated_time_minutes: 1.5,
      gemini_instructions: 'Walk straight past West stands.',
      accessibility_note: 'Ramp access active.',
    },
    fetchDirections: vi.fn().mockResolvedValue({}),
    isLoading: false,
    error: null,
  }),
}));

describe('WayfindingPanel Component', () => {
  test('renders navigation controls and dropdowns', () => {
    render(<WayfindingPanel />);
    expect(screen.getByText('Smart Indoor Navigation (Feature 8)')).toBeInTheDocument();
    expect(screen.getByLabelText('Current Location Zone')).toBeInTheDocument();
    expect(screen.getByLabelText('Destination Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Wheelchair-friendly (Step-free path)')).toBeInTheDocument();
  });

  test('displays route directions steps after lookup', async () => {
    render(<WayfindingPanel />);
    
    const startSelect = screen.getByLabelText('Current Location Zone');
    fireEvent.change(startSelect, { target: { value: 'Z-SOUTH' } });

    const destSelect = screen.getByLabelText('Destination Category');
    fireEvent.change(destSelect, { target: { value: 'exit' } });

    const accessCheck = screen.getByLabelText('Wheelchair-friendly (Step-free path)');
    fireEvent.click(accessCheck);

    const button = screen.getByRole('button', { name: 'Calculate Safest Route' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Walk straight past West stands.')).toBeInTheDocument();
      expect(screen.getByText('Ramp access active.')).toBeInTheDocument();
    });
  });
});
