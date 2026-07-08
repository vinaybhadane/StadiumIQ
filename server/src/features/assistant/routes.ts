// HTTP surface of the assistant feature.
import { Router } from 'express';

import { aiEndpointThrottle } from '../../middleware/rate-limit.js';
import { enforceBodySchema } from '../../middleware/validate.js';
import { guideQuerySchema, type GuideQuery } from './schemas.js';
import { answerQuery } from './service.js';

/** Router mounted at /api/assistant. */
export const guideEndpoints: Router = Router();

guideEndpoints.post('/ask', aiEndpointThrottle, enforceBodySchema(guideQuerySchema), (req, res, next) => {
  answerQuery(req.body as GuideQuery)
    .then((result) => res.json(result))
    .catch((error: unknown) => {
      next(error);
    });
});
