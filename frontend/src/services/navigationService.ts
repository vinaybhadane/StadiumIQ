import { NavigationResponse } from '../types';

export const navigationService = {
  async getDirections(data: {
    current_zone: string;
    destination_type: string;
    accessibility_required: boolean;
  }): Promise<NavigationResponse> {
    const res = await fetch('/api/navigation/directions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Failed to calculate wayfinding paths: ${res.statusText}`);
    }
    return res.json();
  },
};
