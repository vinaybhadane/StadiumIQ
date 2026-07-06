import { AssistResponse } from '../types';

export const assistService = {
  async askAssistant(data: {
    query: string;
    preferred_language: string;
    persona_type: string;
    context?: string;
  }): Promise<AssistResponse> {
    const res = await fetch('/api/assist/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Failed to submit query: ${res.statusText}`);
    }
    return res.json();
  },
};
