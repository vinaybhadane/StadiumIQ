// Operations repository: reads the live operational picture from Firestore
// and advances the simulated crowd-telemetry feed. The simulator stands in
// for real gate/turnstile sensors — swapping it for a sensor ingest keeps
// every read path unchanged (see docs/decisions.md). Pure density logic
// lives in crowd.ts.
import { FieldValue } from '@google-cloud/firestore';

import { DB_TABLES, resolveDatabase, ECO_METRICS_KEY } from '../../lib/firestore.js';
import { appLog } from '../../lib/logger.js';
import { simulateNextCount, deriveSectorMetrics } from './crowd.js';
import { INITIAL_EVENTS, INITIAL_ECO_METRICS, INITIAL_SECTORS } from './seed-data.js';
import type { EventRecord, SituationData, EcoIndicators, SectorEntry } from './types.js';

/** Seeds baseline zones, incidents and sustainability if the DB is empty. */
export async function initializeData(): Promise<void> {
  const db = resolveDatabase();
  const existing = await db.collection(DB_TABLES.zones).limit(1).get();
  if (!existing.empty) {
    return;
  }
  const batch = db.batch();
  for (const zone of INITIAL_SECTORS) {
    batch.set(db.collection(DB_TABLES.zones).doc(zone.id), zone);
  }
  for (const incident of INITIAL_EVENTS) {
    batch.set(db.collection(DB_TABLES.incidents).doc(incident.id), incident);
  }
  batch.set(
    db.collection(DB_TABLES.sustainability).doc(ECO_METRICS_KEY),
    INITIAL_ECO_METRICS,
  );
  await batch.commit();
  appLog.info('Successfully initialized default operational records in Firestore');
}

/** Reads the current operational snapshot from Firestore. */
export async function captureSituation(): Promise<SituationData> {
  const db = resolveDatabase();
  const [zonesSnap, incidentsSnap, sustainabilitySnap] = await Promise.all([
    db.collection(DB_TABLES.zones).get(),
    db.collection(DB_TABLES.incidents).get(),
    db.collection(DB_TABLES.sustainability).doc(ECO_METRICS_KEY).get(),
  ]);

  const zones = zonesSnap.docs
    .map((doc) => deriveSectorMetrics(doc.data() as SectorEntry))
    .sort((a, b) => b.densityPct - a.densityPct);
  const incidents = (incidentsSnap.docs.map((doc) => doc.data()) as EventRecord[]).sort((a, b) =>
    b.reportedAt.localeCompare(a.reportedAt),
  );
  const sustainability =
    (sustainabilitySnap.data() as EcoIndicators | undefined) ?? INITIAL_ECO_METRICS;

  return { zones, incidents, sustainability, generatedAt: new Date().toISOString() };
}

/**
 * Advances the simulated telemetry feed one tick: nudges every zone's
 * occupancy and grows the water-refill sustainability counter.
 *
 * @param random - Injectable source of randomness for deterministic tests.
 */
export async function progressSimulation(random: () => number = Math.random): Promise<void> {
  const db = resolveDatabase();
  const zonesSnap = await db.collection(DB_TABLES.zones).get();
  if (zonesSnap.empty) {
    return;
  }
  const batch = db.batch();
  for (const doc of zonesSnap.docs) {
    const zone = doc.data() as SectorEntry;
    batch.update(doc.ref, { occupancy: simulateNextCount(zone, random) });
  }
  const refillGrowth = Math.round(random() * 40);
  batch.set(
    db.collection(DB_TABLES.sustainability).doc(ECO_METRICS_KEY),
    { waterRefillCount: FieldValue.increment(refillGrowth) },
    { merge: true },
  );
  await batch.commit();
}
