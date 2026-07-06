import { useCallback } from 'react';
import { useStadiumStore } from '../store/stadiumStore';
import { matchService } from '../services/matchService';
import { MatchScheduleRequest } from '../types';

export const useMatches = () => {
  const matches = useStadiumStore((state) => state.matches);
  const standings = useStadiumStore((state) => state.standings);
  const isLoading = useStadiumStore((state) => state.isLoading);
  const error = useStadiumStore((state) => state.error);
  const setMatches = useStadiumStore((state) => state.setMatches);
  const setStandings = useStadiumStore((state) => state.setStandings);
  const setLoading = useStadiumStore((state) => state.setLoading);
  const setError = useStadiumStore((state) => state.setError);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await matchService.getMatches();
      setMatches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred fetching matches');
    } finally {
      setLoading(false);
    }
  }, [setMatches, setLoading, setError]);

  const fetchStandings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await matchService.getStandings();
      setStandings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred fetching standings');
    } finally {
      setLoading(false);
    }
  }, [setStandings, setLoading, setError]);

  const generateSchedule = useCallback(
    async (request: MatchScheduleRequest) => {
      setLoading(true);
      setError(null);
      try {
        const response = await matchService.scheduleMatches(request);
        setMatches(response.schedule);
        return response;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred generating schedule');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setMatches, setLoading, setError]
  );

  return {
    matches,
    standings,
    isLoading,
    error,
    fetchMatches,
    fetchStandings,
    generateSchedule,
  };
};
