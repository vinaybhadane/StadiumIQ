// Request validation at the trust boundary: every body/query is parsed with
// a strict zod schema before feature logic runs.
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { z } from 'zod';

import { ServiceFault } from '../lib/app-error.js';

/** res.locals key under which validated query params are stored. */
export const PARSED_PARAMS_KEY = 'validatedQuery';

function extractFirstError(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return 'Invalid request';
  }
  const path = issue.path.join('.');
  return path === '' ? issue.message : `${path}: ${issue.message}`;
}

/** Parses and replaces `req.body` with the schema's typed output, or 400s. */
export function enforceBodySchema(schema: z.ZodTypeAny): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(ServiceFault.badRequest(extractFirstError(result.error)));
      return;
    }
    req.body = result.data as unknown;
    next();
  };
}

/**
 * Parses `req.query` against the schema, storing the typed result on
 * `res.locals[PARSED_PARAMS_KEY]` for the route handler to read back.
 */
export function enforceQuerySchema(schema: z.ZodTypeAny): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(ServiceFault.badRequest(extractFirstError(result.error)));
      return;
    }
    res.locals[PARSED_PARAMS_KEY] = result.data as unknown;
    next();
  };
}
