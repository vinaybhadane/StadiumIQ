import { Stadium } from '../types';

export const stadiumService = {
  async getStadium(): Promise<Stadium> {
    const res = await fetch('/api/stadium');
    if (!res.ok) {
      throw new Error(`Failed to fetch stadium: ${res.statusText}`);
    }
    return res.json();
  },

  async getDigitalTwin(): Promise<Stadium> {
    const res = await fetch('/api/stadium/twin');
    if (!res.ok) {
      throw new Error(`Failed to fetch Digital Stadium Twin: ${res.statusText}`);
    }
    return res.json();
  },

  async createStadium(data: { name: string; city: string; total_capacity: number }): Promise<Stadium> {
    const res = await fetch('/api/stadium', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Failed to create stadium: ${res.statusText}`);
    }
    return res.json();
  },
};
