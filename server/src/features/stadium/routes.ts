// HTTP surface of the stadium feature. Routes dispatch; the service holds
// the logic.
import { Router } from 'express';

import { enforceQuerySchema, PARSED_PARAMS_KEY } from '../../middleware/validate.js';
import { amenitiesFilterSchema, type AmenitiesFilter } from './schemas.js';
import { getAmenities } from './service.js';
import { ARENA } from './venue-data.js';

/** Router mounted at /api/stadium. */
export const arenaEndpoints: Router = Router();

arenaEndpoints.get('/facilities', enforceQuerySchema(amenitiesFilterSchema), (_req, res) => {
  const query = res.locals[PARSED_PARAMS_KEY] as AmenitiesFilter;
  res.json({ facilities: getAmenities(query.category) });
});

arenaEndpoints.get('/venue', (_req, res) => {
  const { name, city, tournament, capacity } = ARENA;
  res.json({ venue: { name, city, tournament, capacity } });
});
