// Central error handling: the only place that turns errors into HTTP
// responses. Handlers throw; this middleware logs and sanitizes.
import type { NextFunction, Request, Response } from 'express';

import { ServiceFault } from '../lib/app-error.js';
import { appLog } from '../lib/logger.js';

const GENERIC_FAILURE_MSG = 'An unexpected error occurred on the server. Please try again.';

/** 404 handler for unmatched routes, forwarded to the error handler. */
export function missingRouteHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ServiceFault.notFound(`No route matches ${req.method} ${req.path}`));
}

/** Express error middleware: structured log + sanitized JSON body. */
export function globalErrorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const serviceFault =
    error instanceof ServiceFault
      ? error
      : new ServiceFault(500, 'INTERNAL', error instanceof Error ? error.message : 'Unknown error');

  appLog.error(
    {
      code: serviceFault.code,
      statusCode: serviceFault.statusCode,
      method: req.method,
      path: req.path,
      message: serviceFault.message,
    },
    'Request failed',
  );

  // ServiceFault messages are authored and safe to expose; anything unexpected
  // (code INTERNAL) is replaced so internals never leak to clients.
  const clientMessage = serviceFault.code === 'INTERNAL' ? GENERIC_FAILURE_MSG : serviceFault.message;
  res.status(serviceFault.statusCode).json({ error: { code: serviceFault.code, message: clientMessage } });
}
