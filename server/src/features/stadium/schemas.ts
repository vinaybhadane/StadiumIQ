// Boundary validation for the stadium feature.
import { z } from 'zod';

/** Valid facility categories, mirrored from the domain type. */
export const amenityKindSchema = z.enum([
  'food',
  'medical',
  'accessibility',
  'family',
  'prayer',
  'sustainability',
  'services',
]);

/** Query schema for GET /api/stadium/facilities. */
export const amenitiesFilterSchema = z
  .object({ category: amenityKindSchema.optional() })
  .strict();

/** Parsed facilities query. */
export type AmenitiesFilter = z.infer<typeof amenitiesFilterSchema>;
