import { describe, expect, it } from 'vitest';

import { simulateNextCount, deriveSectorMetrics } from '../../../src/features/operations/crowd.js';

describe('deriveSectorMetrics', () => {
  it('derives density percentage from occupancy and capacity', () => {
    const zone = deriveSectorMetrics({ id: 'z', name: 'Zone', capacity: 1000, occupancy: 500 });
    expect(zone.densityPct).toBe(50);
    expect(zone.status).toBe('comfortable');
  });

  it('flags a zone busy at 65% density and critical at 85%', () => {
    expect(deriveSectorMetrics({ id: 'z', name: 'Z', capacity: 100, occupancy: 65 }).status).toBe(
      'busy',
    );
    expect(deriveSectorMetrics({ id: 'z', name: 'Z', capacity: 100, occupancy: 85 }).status).toBe(
      'critical',
    );
  });
});

describe('simulateNextCount', () => {
  const zone = { id: 'z', name: 'Zone', capacity: 10_000, occupancy: 5000 };

  it('never exceeds the maximum simulated density', () => {
    const crowded = { ...zone, occupancy: 9700 };
    expect(simulateNextCount(crowded, () => 1)).toBeLessThanOrEqual(9800);
  });

  it('never drops below the minimum simulated density', () => {
    const empty = { ...zone, occupancy: 1600 };
    expect(simulateNextCount(empty, () => 0)).toBeGreaterThanOrEqual(1500);
  });

  it('moves occupancy by at most the configured step', () => {
    const next = simulateNextCount(zone, () => 1);
    expect(Math.abs(next - zone.occupancy)).toBeLessThanOrEqual(600);
  });
});
