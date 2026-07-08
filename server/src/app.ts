// Express application wiring: security middleware, API routes, and static
// serving of the built React client. Route handlers dispatch to feature
// services; errors funnel into the central error handler.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { SERVER_VERSION, REQUEST_SIZE_CAP } from './config/constants.js';
import { config } from './config/env.js';
import { guideEndpoints } from './features/assistant/routes.js';
import { commandHubEndpoints } from './features/operations/routes.js';
import { arenaEndpoints } from './features/stadium/routes.js';
import { globalErrorHandler, missingRouteHandler } from './middleware/error-handler.js';
import { generalThrottle } from './middleware/rate-limit.js';

const FRONTEND_BUILD_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../client/dist',
);

/** One year in seconds — safe for content-hashed Vite assets. */
const STATIC_CACHE_DURATION_MS = 365 * 24 * 60 * 60 * 1000;

function allowedOrigins(): string[] {
  return config.ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin !== '');
}

function serveFrontend(app: express.Express): void {
  app.use(
    express.static(FRONTEND_BUILD_DIR, {
      index: false,
      maxAge: STATIC_CACHE_DURATION_MS,
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      },
    }),
  );
  // SPA fallback: every non-API GET renders the client shell.
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(FRONTEND_BUILD_DIR, 'index.html'));
  });
}

/** Builds the fully-wired Express app (exported for supertest). */
export function createServer(): express.Express {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          // Stylesheets must be same-origin; only inline style *attributes*
          // (React's data-driven `style` prop) are allowed, not inline
          // <style> blocks — a tighter grant than a blanket 'unsafe-inline'.
          styleSrc: ["'self'"],
          styleSrcAttr: ["'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
    }),
  );
  app.use(cors({ origin: allowedOrigins() }));
  app.use(compression());
  app.use(express.json({ limit: REQUEST_SIZE_CAP }));

  // Liveness endpoint. Lives under /api because the Google Front End reserves
  // the bare /healthz path and answers it at the edge before Cloud Run. Placed
  // ahead of the rate limiter so health checks are never throttled.
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', version: SERVER_VERSION });
  });

  app.use('/api', generalThrottle);
  app.use('/api/stadium', arenaEndpoints);
  app.use('/api/assistant', guideEndpoints);
  app.use('/api/operations', commandHubEndpoints);

  serveFrontend(app);

  app.use(missingRouteHandler);
  app.use(globalErrorHandler);
  return app;
}
