import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CrowdHeatmap } from '../src/components/Dashboard/CrowdHeatmap';
import { StadiumZone } from '../src/types';

describe('CrowdHeatmap Component', () => {
  const mockZones: StadiumZone[] = [
    { zone_id: 'Z1', name: 'North Stand', zone_type: 'general', capacity: 1000, current_occupancy: 850 },
    { zone_id: 'Z2', name: 'VIP Stand', zone_type: 'vip', capacity: 100, current_occupancy: 95 },
  ];

  test('renders zones with occupancy data', () => {
    render(<CrowdHeatmap zones={mockZones} />);
    expect(screen.getByText('North Stand')).toBeInTheDocument();
    expect(screen.getByText('VIP Stand')).toBeInTheDocument();
    expect(screen.getByText('850 / 1,000')).toBeInTheDocument();
    expect(screen.getByText('95 / 100')).toBeInTheDocument();
  });
});
