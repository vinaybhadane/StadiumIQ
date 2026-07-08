// AI operations briefing: turns the live snapshot into prioritized,
// actionable recommendations for the venue operations team.
import { REPORT_CACHE_DURATION_MS, MAX_CACHED_ITEMS } from '../../config/constants.js';
import { produceText } from '../../lib/gemini.js';
import { ExpiringStore } from '../../lib/ttl-cache.js';
import { captureSituation } from './service.js';
import type { SituationReport, SituationData } from './types.js';

const reportCache = new ExpiringStore<SituationReport>(REPORT_CACHE_DURATION_MS, MAX_CACHED_ITEMS);
const REPORT_CACHE_KEY = 'latest';

function summarizeSituation(snapshot: SituationData): string {
  const zoneLines = snapshot.zones.map(
    (zone) =>
      `- ${zone.name}: ${String(zone.densityPct)}% full (${String(zone.occupancy)}/${String(zone.capacity)}) — ${zone.status}`,
  );
  const incidentLines = snapshot.incidents.map(
    (incident) =>
      `- [${incident.status}] ${incident.severity} ${incident.category} in ${incident.zoneId}: ${incident.summary}`,
  );
  const s = snapshot.sustainability;
  return [
    'ZONE DENSITY:',
    ...zoneLines,
    'INCIDENTS:',
    ...incidentLines,
    'SUSTAINABILITY:',
    `- Waste diverted from landfill: ${String(s.wasteDivertedPct)}%`,
    `- Energy used today: ${String(s.energyKwh)} kWh`,
    `- Water bottle refills: ${String(s.waterRefillCount)}`,
    `- CO2 saved vs. baseline: ${String(s.co2SavedKg)} kg`,
  ].join('\n');
}

/**
 * Builds the briefing prompt from a snapshot. Exported separately so the
 * prompt content is unit-testable without calling Gemini.
 */
export function composeReportPrompt(snapshot: SituationData): string {
  return [
    'You act as the operations intelligence coordinator for Estadio Azteca during the FIFA World Cup 2026.',
    'Based on the live stadium info below, draft a situation report for the operations manager containing',
    'exactly these four plain-text sections, each a short dash list (no markdown headings or bold):',
    'PRIMARY RISKS — the 2-3 most pressing crowd or incident risks right now.',
    'CROWD DIRECTIVES — concrete redirections, gate changes or staffing moves, named by zone and gate.',
    'INCIDENT ACTIONS — next step for each open incident.',
    'ECOLOGICAL OBSERVATIONS — one observation and one action based on the metrics.',
    'Provide clear, concise updates; keep the total response under 220 words.',
    '',
    '--- LIVE VENUE DATA ---',
    summarizeSituation(snapshot),
    '--- END LIVE VENUE DATA ---',
  ].join('\n');
}

/**
 * Generates (or serves the cached) operations briefing from the current
 * Firestore snapshot. A short cache keeps repeated clicks from re-running
 * inference on effectively unchanged data.
 */
export async function produceReport(): Promise<SituationReport> {
  const cached = reportCache.get(REPORT_CACHE_KEY);
  if (cached !== undefined) {
    return cached;
  }
  const snapshot = await captureSituation();
  const briefing = await produceText(composeReportPrompt(snapshot));
  const result: SituationReport = { briefing, generatedAt: new Date().toISOString() };
  reportCache.set(REPORT_CACHE_KEY, result);
  return result;
}

/** Clears the briefing cache (used by tests). */
export function flushReportCache(): void {
  reportCache.clear();
}
