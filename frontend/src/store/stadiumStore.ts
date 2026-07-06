import { create } from 'zustand';
import {
  Stadium,
  Match,
  CrowdSnapshot,
  SurgePredictionResponse,
  Insight,
  StandingsEntry,
  TournamentSummary,
} from '../types';

interface StadiumState {
  stadium: Stadium | null;
  matches: Match[];
  crowdSnapshot: CrowdSnapshot | null;
  surgePrediction: SurgePredictionResponse | null;
  insights: Insight[];
  standings: StandingsEntry[];
  analyticsSummary: TournamentSummary | null;
  activeAlerts: string[];
  isLoading: boolean;
  error: string | null;

  // Actions (pure state mutation, zero API calls)
  setStadium: (stadium: Stadium) => void;
  setMatches: (matches: Match[]) => void;
  setCrowdSnapshot: (snapshot: CrowdSnapshot) => void;
  setSurgePrediction: (prediction: SurgePredictionResponse) => void;
  setInsights: (insights: Insight[]) => void;
  setStandings: (standings: StandingsEntry[]) => void;
  setAnalyticsSummary: (summary: TournamentSummary) => void;
  addAlert: (alert: string) => void;
  removeAlert: (alert: string) => void;
  clearAlerts: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStadiumStore = create<StadiumState>((set) => ({
  stadium: null,
  matches: [],
  crowdSnapshot: null,
  surgePrediction: null,
  insights: [],
  standings: [],
  analyticsSummary: null,
  activeAlerts: [],
  isLoading: false,
  error: null,

  setStadium: (stadium) => set({ stadium }),
  setMatches: (matches) => set({ matches }),
  setCrowdSnapshot: (crowdSnapshot) => set({ crowdSnapshot }),
  setSurgePrediction: (surgePrediction) => set({ surgePrediction }),
  setInsights: (insights) => set({ insights }),
  setStandings: (standings) => set({ standings }),
  setAnalyticsSummary: (analyticsSummary) => set({ analyticsSummary }),
  addAlert: (alert) => set((state) => ({ activeAlerts: [...state.activeAlerts, alert] })),
  removeAlert: (alert) =>
    set((state) => ({
      activeAlerts: state.activeAlerts.filter((a) => a !== alert),
    })),
  clearAlerts: () => set({ activeAlerts: [] }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
