// Pure crowd-density logic: deriving dashboard status from occupancy and
// advancing the simulated telemetry feed. No I/O, so these are trivially
// unit-testable and reused by the Firestore repository in service.ts.
import {
  CROWD_BUSY_THRESHOLD,
  CROWD_CRITICAL_THRESHOLD,
  SIM_MAX_OCCUPANCY_PCT,
  SIM_MAX_CHANGE_PCT,
  SIM_MIN_OCCUPANCY_PCT,
} from '../../config/constants.js';
import type { SectorMetrics, SectorEntry } from './types.js';

/** Derives dashboard density percentage and crowd status from a zone record. */
export function deriveSectorMetrics(zone: SectorEntry): SectorMetrics {
  const densityPct = Math.round((zone.occupancy / zone.capacity) * 100);
  const status =
    densityPct >= CROWD_CRITICAL_THRESHOLD
      ? 'critical'
      : densityPct >= CROWD_BUSY_THRESHOLD
        ? 'busy'
        : 'comfortable';
  return { ...zone, densityPct, status };
}

/**
 * Applies one bounded random-walk step to a zone's occupancy, keeping the
 * simulated crowd inside realistic density bounds.
 *
 * @param zone - The zone whose occupancy is being advanced.
 * @param random - Injectable source of randomness for deterministic tests.
 */
export function simulateNextCount(zone: SectorEntry, random: () => number = Math.random): number {
  const stepPct = (random() * 2 - 1) * SIM_MAX_CHANGE_PCT;
  const proposed = zone.occupancy + Math.round((stepPct / 100) * zone.capacity);
  const min = Math.round((SIM_MIN_OCCUPANCY_PCT / 100) * zone.capacity);
  const max = Math.round((SIM_MAX_OCCUPANCY_PCT / 100) * zone.capacity);
  return Math.min(max, Math.max(min, proposed));
}
