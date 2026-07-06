import { CrowdSnapshot, SurgePredictionResponse } from '../types';

export const crowdService = {
  async getCrowdSnapshot(): Promise<CrowdSnapshot> {
    const res = await fetch('/api/crowd/snapshot');
    if (!res.ok) {
      throw new Error(`Failed to fetch crowd snapshot: ${res.statusText}`);
    }
    return res.json();
  },

  async getSurgePrediction(): Promise<SurgePredictionResponse> {
    const res = await fetch('/api/crowd/surge');
    if (!res.ok) {
      throw new Error(`Failed to fetch crowd surge prediction: ${res.statusText}`);
    }
    return res.json();
  },
};
