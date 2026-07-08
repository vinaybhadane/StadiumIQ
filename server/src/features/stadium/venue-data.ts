// Canonical venue profile: Estadio Azteca (Mexico City), the FIFA World Cup
// 2026 opening-match venue. Static reference data lives in code (typed and
// reviewable); dynamic operational state lives in Firestore. The gate,
// facility and transit datasets are composed from focused modules in ./data.
import { AMENITIES } from './data/facilities.js';
import { ENTRY_POINTS } from './data/gates.js';
import { TRAVEL_OPTIONS } from './data/transit.js';
import type { ArenaInfo } from './types.js';

/** Static profile of the venue used to ground every assistant answer. */
export const ARENA: ArenaInfo = {
  name: 'Estadio Azteca',
  city: 'Mexico City',
  tournament: 'FIFA World Cup 2026',
  capacity: 83264,
  gates: ENTRY_POINTS,
  facilities: AMENITIES,
  transit: TRAVEL_OPTIONS,
};
