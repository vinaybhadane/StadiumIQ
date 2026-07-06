import { InsightResponse, TournamentSummary, AttendanceTrend } from '../types';

export const insightService = {
  async generateInsights(stadiumId: string, context?: string): Promise<InsightResponse> {
    const res = await fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stadium_id: stadiumId,
        context: context || 'Routine monitoring',
        categories: ['crowd_management', 'resource_optimization', 'safety'],
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to generate insights: ${res.statusText}`);
    }
    return res.json();
  },

  async getLatestInsights(): Promise<InsightResponse> {
    const res = await fetch('/api/insights/latest');
    if (!res.ok) {
      throw new Error(`Failed to fetch latest insights: ${res.statusText}`);
    }
    return res.json();
  },

  async getTournamentSummary(): Promise<TournamentSummary> {
    const res = await fetch('/api/analytics', {
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error(`Failed to generate tournament summary: ${res.statusText}`);
    }
    return res.json();
  },

  async getAttendanceTrends(): Promise<AttendanceTrend[]> {
    const res = await fetch('/api/analytics/attendance');
    if (!res.ok) {
      throw new Error(`Failed to fetch attendance trends: ${res.statusText}`);
    }
    return res.json();
  },
};
