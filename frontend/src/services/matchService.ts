import { Match, MatchScheduleRequest, MatchScheduleResponse, StandingsEntry } from '../types';

export const matchService = {
  async getMatches(): Promise<Match[]> {
    const res = await fetch('/api/matches');
    if (!res.ok) {
      throw new Error(`Failed to fetch matches: ${res.statusText}`);
    }
    return res.json();
  },

  async scheduleMatches(data: MatchScheduleRequest): Promise<MatchScheduleResponse> {
    const res = await fetch('/api/matches/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Failed to generate schedule: ${res.statusText}`);
    }
    return res.json();
  },

  async getStandings(): Promise<StandingsEntry[]> {
    const res = await fetch('/api/matches/standings/current');
    if (!res.ok) {
      throw new Error(`Failed to fetch standings: ${res.statusText}`);
    }
    return res.json();
  },
};
