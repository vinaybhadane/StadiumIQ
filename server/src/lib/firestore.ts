// Firestore access. The client is created once at module scope and reused
// across requests; on Cloud Run it authenticates via the service account.
import { Firestore } from '@google-cloud/firestore';

/** Firestore collection names used by the operations feature. */
export const DB_TABLES = {
  zones: 'zones',
  incidents: 'incidents',
  sustainability: 'sustainability',
} as const;

/** Document id of the single sustainability metrics document. */
export const ECO_METRICS_KEY = 'current';

let dbInstance: Firestore | undefined;

/** Returns the shared Firestore client, creating it on first use. */
export function resolveDatabase(): Firestore {
  dbInstance ??= new Firestore();
  return dbInstance;
}
