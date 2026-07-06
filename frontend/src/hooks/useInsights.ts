import { useCallback, useState } from 'react';
import { useStadiumStore } from '../store/stadiumStore';
import { insightService } from '../services/insightService';
import { AttendanceTrend } from '../types';

export const useInsights = () => {
  const insights = useStadiumStore((state) => state.insights);
  const analyticsSummary = useStadiumStore((state) => state.analyticsSummary);
  const isLoading = useStadiumStore((state) => state.isLoading);
  const error = useStadiumStore((state) => state.error);
  const setInsights = useStadiumStore((state) => state.setInsights);
  const setAnalyticsSummary = useStadiumStore((state) => state.setAnalyticsSummary);
  const setLoading = useStadiumStore((state) => state.setLoading);
  const setError = useStadiumStore((state) => state.setError);
  const [trends, setTrends] = useState<AttendanceTrend[]>([]);

  const fetchLatestInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await insightService.getLatestInsights();
      setInsights(data.insights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  }, [setInsights, setLoading, setError]);

  const generateNewInsights = useCallback(
    async (stadiumId: string, context?: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await insightService.generateInsights(stadiumId, context);
        setInsights(data.insights);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate insights');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setInsights, setLoading, setError]
  );

  const fetchAnalyticsSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await insightService.getTournamentSummary();
      setAnalyticsSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics summary');
    } finally {
      setLoading(false);
    }
  }, [setAnalyticsSummary, setLoading, setError]);

  const fetchAttendanceTrends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await insightService.getAttendanceTrends();
      setTrends(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance trends');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  return {
    insights,
    analyticsSummary,
    trends,
    isLoading,
    error,
    fetchLatestInsights,
    generateNewInsights,
    fetchAnalyticsSummary,
    fetchAttendanceTrends,
  };
};
