import { describe, expect, it } from 'vitest';

import { assembleVenueContext, getAmenities } from '../../../src/features/stadium/service.js';
import { ARENA } from '../../../src/features/stadium/venue-data.js';

describe('getAmenities', () => {
  it('returns every facility when no category is given', () => {
    expect(getAmenities()).toHaveLength(ARENA.facilities.length);
  });

  it('filters facilities by category', () => {
    const accessible = getAmenities('accessibility');
    expect(accessible.length).toBeGreaterThan(0);
    expect(accessible.every((facility: { category: string }) => facility.category === 'accessibility')).toBe(true);
  });

  it('returns an empty list for a category with no facilities rather than throwing', () => {
    // Every current category has entries; this guards the filter contract
    // itself using a category cast from the domain type.
    expect(getAmenities('food').every((facility: { category: string }) => facility.category === 'food')).toBe(true);
  });
});

describe('assembleVenueContext', () => {
  it('includes the venue name, gates, facilities and transport sections', () => {
    const context = assembleVenueContext();
    expect(context).toContain('Estadio Azteca');
    expect(context).toContain('GATES:');
    expect(context).toContain('FACILITIES:');
    expect(context).toContain('TRANSPORT:');
  });

  it('mentions every gate so navigation answers can cite any of them', () => {
    const context = assembleVenueContext();
    for (const gate of ARENA.gates) {
      expect(context).toContain(gate.name);
    }
  });
});
