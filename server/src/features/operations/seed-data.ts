// Baseline operational state written to Firestore on first start, so a fresh
// deployment has a live dashboard without a manual seeding step.
import type { EventRecord, EcoIndicators, SectorEntry } from './types.js';

/** Initial occupancy state for every monitored stadium zone. */
export const INITIAL_SECTORS: SectorEntry[] = [
  { id: 'north-stand', name: 'North Stand', capacity: 18000, occupancy: 9900 },
  { id: 'south-stand', name: 'South Stand', capacity: 18000, occupancy: 12600 },
  { id: 'east-stand', name: 'East Stand', capacity: 16000, occupancy: 8800 },
  { id: 'west-stand', name: 'West Stand', capacity: 16000, occupancy: 11200 },
  { id: 'north-concourse', name: 'North Concourse', capacity: 6000, occupancy: 4400 },
  { id: 'south-concourse', name: 'South Concourse', capacity: 6000, occupancy: 5300 },
  { id: 'fan-plaza', name: 'Fan Festival Plaza', capacity: 12000, occupancy: 7300 },
  { id: 'transit-hub', name: 'Transit Hub (Tren Ligero)', capacity: 5000, occupancy: 2100 },
];

/** Sample incidents so the incident workflow is demonstrable end-to-end. */
export const INITIAL_EVENTS: EventRecord[] = [
  {
    id: 'inc-001',
    zoneId: 'south-concourse',
    category: 'crowd',
    severity: 'high',
    summary: 'Congestion building at South Concourse food court queue lanes.',
    status: 'open',
    reportedAt: '2026-07-06T17:05:00.000Z',
  },
  {
    id: 'inc-002',
    zoneId: 'transit-hub',
    category: 'facility',
    severity: 'medium',
    summary: 'One ticket barrier out of service at the Tren Ligero entrance.',
    status: 'open',
    reportedAt: '2026-07-06T16:40:00.000Z',
  },
  {
    id: 'inc-003',
    zoneId: 'east-stand',
    category: 'medical',
    severity: 'low',
    summary: 'Minor first-aid case treated at First Aid East; no follow-up needed.',
    status: 'resolved',
    reportedAt: '2026-07-06T15:55:00.000Z',
  },
];

/** Starting sustainability counters for the event day. */
export const INITIAL_ECO_METRICS: EcoIndicators = {
  wasteDivertedPct: 68,
  energyKwh: 41200,
  waterRefillCount: 5230,
  co2SavedKg: 1840,
};
