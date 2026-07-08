// HTTP surface of the operations feature.
import { Router } from 'express';

import { aiEndpointThrottle } from '../../middleware/rate-limit.js';
import { produceReport } from './briefing.js';
import { captureSituation } from './service.js';

/** Router mounted at /api/operations. */
export const commandHubEndpoints: Router = Router();

commandHubEndpoints.get('/snapshot', (_req, res, next) => {
  captureSituation()
    .then((snapshot) => res.json(snapshot))
    .catch((error: unknown) => {
      next(error);
    });
});

commandHubEndpoints.post('/briefing', aiEndpointThrottle, (_req, res, next) => {
  produceReport()
    .then((briefing) => res.json(briefing))
    .catch((error: unknown) => {
      next(error);
    });
});
