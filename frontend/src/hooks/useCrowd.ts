import { useCallback } from 'react';
import { useStadiumStore } from '../store/stadiumStore';
import { crowdService } from '../services/crowdService';

export const useCrowd = () => {
  const crowdSnapshot = useStadiumStore((state) => state.crowdSnapshot);
  const surgePrediction = useStadiumStore((state) => state.surgePrediction);
  const isLoading = useStadiumStore((state) => state.isLoading);
  const error = useStadiumStore((state) => state.error);
  const setCrowdSnapshot = useStadiumStore((state) => state.setCrowdSnapshot);
  const setSurgePrediction = useStadiumStore((state) => state.setSurgePrediction);
  const setLoading = useStadiumStore((state) => state.setLoading);
  const setError = useStadiumStore((state) => state.setError);

  const fetchCrowdSnapshot = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await crowdService.getCrowdSnapshot();
      setCrowdSnapshot(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch crowd snapshot');
    } finally {
      setLoading(false);
    }
  }, [setCrowdSnapshot, setLoading, setError]);

  const fetchSurgePrediction = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await crowdService.getSurgePrediction();
      setSurgePrediction(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to predict crowd surge');
    } finally {
      setLoading(false);
    }
  }, [setSurgePrediction, setLoading, setError]);

  return {
    crowdSnapshot,
    surgePrediction,
    isLoading,
    error,
    fetchCrowdSnapshot,
    fetchSurgePrediction,
  };
};
