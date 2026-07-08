import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SituationData } from '../../../src/features/operations/types.js';

const generateTextMock = vi.fn();
const captureSituationMock = vi.fn();

vi.mock('../../../src/lib/gemini.js', () => ({ produceText: generateTextMock }));
vi.mock('../../../src/features/operations/service.js', () => ({ captureSituation: captureSituationMock }));

const { composeReportPrompt, flushReportCache, produceReport } =
  await import('../../../src/features/operations/briefing.js');

const SNAPSHOT: SituationData = {
  zones: [
    {
      id: 'south',
      name: 'South Concourse',
      capacity: 6000,
      occupancy: 5300,
      densityPct: 88,
      status: 'critical',
    },
    {
      id: 'north',
      name: 'North Stand',
      capacity: 18000,
      occupancy: 9900,
      densityPct: 55,
      status: 'comfortable',
    },
  ],
  incidents: [
    {
      id: 'inc-001',
      zoneId: 'south',
      category: 'crowd',
      severity: 'high',
      summary: 'Queue congestion',
      status: 'open',
      reportedAt: '2026-07-06T17:05:00.000Z',
    },
  ],
  sustainability: {
    wasteDivertedPct: 68,
    energyKwh: 41200,
    waterRefillCount: 5230,
    co2SavedKg: 1840,
  },
  generatedAt: '2026-07-06T17:10:00.000Z',
};

describe('composeReportPrompt', () => {
  it('includes zone density, incidents and sustainability figures', () => {
    const prompt = composeReportPrompt(SNAPSHOT);
    expect(prompt).toContain('South Concourse: 88% full');
    expect(prompt).toContain('Queue congestion');
    expect(prompt).toContain('Waste diverted from landfill: 68%');
  });

  it('asks for the four operational sections', () => {
    const prompt = composeReportPrompt(SNAPSHOT);
    expect(prompt).toContain('PRIMARY RISKS');
    expect(prompt).toContain('CROWD DIRECTIVES');
    expect(prompt).toContain('INCIDENT ACTIONS');
    expect(prompt).toContain('ECOLOGICAL OBSERVATIONS');
  });
});

describe('produceReport', () => {
  beforeEach(() => {
    generateTextMock.mockReset();
    captureSituationMock.mockReset();
    captureSituationMock.mockResolvedValue(SNAPSHOT);
    flushReportCache();
  });

  it('generates a briefing from the current snapshot', async () => {
    generateTextMock.mockResolvedValue('PRIMARY RISKS\n- South Concourse critical');
    const result = await produceReport();
    expect(result.briefing).toContain('South Concourse');
    expect(result.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('reuses the cached briefing on a rapid second call', async () => {
    generateTextMock.mockResolvedValue('briefing text');
    await produceReport();
    await produceReport();
    expect(generateTextMock).toHaveBeenCalledTimes(1);
  });
});
