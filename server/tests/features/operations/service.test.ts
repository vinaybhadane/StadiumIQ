import { beforeEach, describe, expect, it } from 'vitest';
import { vi } from 'vitest';

import { FakeFirestore } from '../../helpers/fake-firestore.js';

const fakeDb = new FakeFirestore();

vi.mock('../../../src/lib/firestore.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../../src/lib/firestore.js')>();
  return { ...original, resolveDatabase: () => fakeDb.asFirestore() };
});

const { progressSimulation, initializeData, captureSituation } =
  await import('../../../src/features/operations/service.js');

describe('initializeData / captureSituation / progressSimulation', () => {
  beforeEach(() => {
    fakeDb.reset();
  });

  it('seeds baseline data only when the zones collection is empty', async () => {
    await initializeData();
    expect(fakeDb.read('zones', 'north-stand')).toBeDefined();
    expect(fakeDb.read('incidents', 'inc-001')).toBeDefined();
    expect(fakeDb.read('sustainability', 'current')).toBeDefined();
  });

  it('does not overwrite existing data on a second start', async () => {
    await initializeData();
    await fakeDb.collection('zones').doc('north-stand').set({
      id: 'north-stand',
      name: 'North Stand',
      capacity: 18_000,
      occupancy: 17_000,
    });
    await initializeData();
    expect(fakeDb.read('zones', 'north-stand')?.['occupancy']).toBe(17_000);
  });

  it('returns zones sorted by density with incidents and sustainability', async () => {
    await initializeData();
    const snapshot = await captureSituation();
    expect(snapshot.zones.length).toBeGreaterThan(0);
    const densities = snapshot.zones.map((zone: { densityPct: number }) => zone.densityPct);
    expect(densities).toEqual([...densities].sort((a, b) => b - a));
    expect(snapshot.sustainability.wasteDivertedPct).toBeGreaterThan(0);
    expect(snapshot.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('progressSimulation keeps every zone inside simulated density bounds', async () => {
    await initializeData();
    await progressSimulation(() => 1);
    const snapshot = await captureSituation();
    for (const zone of snapshot.zones as { densityPct: number }[]) {
      expect(zone.densityPct).toBeGreaterThanOrEqual(15);
      expect(zone.densityPct).toBeLessThanOrEqual(98);
    }
  });
});
