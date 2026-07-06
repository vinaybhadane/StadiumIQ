import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock all lazy-loaded components to bypass Suspense delays
vi.mock('../src/components/Dashboard/StadiumTwin', () => ({
  StadiumTwin: () => <div>MockedStadiumTwin</div>
}));
vi.mock('../src/components/Dashboard/CrowdHeatmap', () => ({
  CrowdHeatmap: () => <div>MockedCrowdHeatmap</div>
}));
vi.mock('../src/components/Dashboard/MetricsPanel', () => ({
  MetricsPanel: () => <div>MockedMetricsPanel</div>
}));
vi.mock('../src/components/Matches/MatchScheduler', () => ({
  MatchScheduler: () => <div>MockedMatchScheduler</div>
}));
vi.mock('../src/components/Matches/StandingsTable', () => ({
  StandingsTable: () => <div>MockedStandingsTable</div>
}));
vi.mock('../src/components/Crowd/SurgePredictor', () => ({
  SurgePredictor: () => <div>MockedSurgePredictor</div>
}));
vi.mock('../src/components/Crowd/GateStatus', () => ({
  GateStatus: () => <div>MockedGateStatus</div>
}));
vi.mock('../src/components/Insights/InsightsList', () => ({
  InsightsList: () => <div>MockedInsightsList</div>
}));
vi.mock('../src/components/Emergency/EvacuationMap', () => ({
  EvacuationMap: () => <div>MockedEvacuationMap</div>
}));
vi.mock('../src/components/Navigation/WayfindingPanel', () => ({
  WayfindingPanel: () => <div>MockedWayfindingPanel</div>
}));
vi.mock('../src/components/Assist/AssistPanel', () => ({
  AssistPanel: () => <div>MockedAssistPanel</div>
}));
vi.mock('../src/components/Assist/AnnouncementBroadcast', () => ({
  AnnouncementBroadcast: () => <div>MockedAnnouncementBroadcast</div>
}));

// Setup global fetch mock
const mockStadiumData = {
  stadium_id: 'STD-001',
  name: 'StadiumIQ Arena',
  city: 'Metropolis',
  total_capacity: 60000,
  zones: [],
  gates: []
};

const mockMatchesData: any[] = [];
const mockStandingsData: any[] = [];
const mockInsightsData = { insights: [] };
const mockSurgeData = { predictions: [], overall_risk: 'green', summary: 'ok', source: 'rules' };

describe('App Integration Test', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/stadium/twin') || url.includes('/api/stadium')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStadiumData)
        });
      }
      if (url.includes('/api/matches/standings/current')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStandingsData)
        });
      }
      if (url.includes('/api/matches')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMatchesData)
        });
      }
      if (url.includes('/api/insights/latest')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockInsightsData)
        });
      }
      if (url.includes('/api/crowd/surge')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSurgeData)
        });
      }
      return Promise.reject(new Error(`Unhandled URL in mock: ${url}`));
    }));
  });

  test('renders full app shell and updates store data', async () => {
    render(<App />);

    // Check header present
    expect(screen.getByText('StadiumIQ')).toBeInTheDocument();

    // Check that our mocked components are rendered, proving mount logic successfully ran
    await waitFor(() => {
      expect(screen.getByText('MockedStadiumTwin')).toBeInTheDocument();
      expect(screen.getByText('MockedWayfindingPanel')).toBeInTheDocument();
      expect(screen.getByText('MockedAssistPanel')).toBeInTheDocument();
    });
  });
});
