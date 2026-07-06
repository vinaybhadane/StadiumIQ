import { useState, useCallback } from 'react';
import { assistService } from '../services/assistService';
import { AssistResponse } from '../types';

export const useAssist = () => {
  const [assistResponse, setAssistResponse] = useState<AssistResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askAssistant = useCallback(
    async (query: string, language: string, persona: string, context?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await assistService.askAssistant({
          query,
          preferred_language: language,
          persona_type: persona,
          context,
        });
        setAssistResponse(res);
        return res;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error query help assistant');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    assistResponse,
    isLoading,
    error,
    askAssistant,
  };
};
