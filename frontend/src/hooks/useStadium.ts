import { useCallback } from 'react';
import { useStadiumStore } from '../store/stadiumStore';
import { stadiumService } from '../services/stadiumService';

export const useStadium = () => {
  const stadium = useStadiumStore((state) => state.stadium);
  const isLoading = useStadiumStore((state) => state.isLoading);
  const error = useStadiumStore((state) => state.error);
  const setStadium = useStadiumStore((state) => state.setStadium);
  const setLoading = useStadiumStore((state) => state.setLoading);
  const setError = useStadiumStore((state) => state.setError);

  const fetchStadium = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await stadiumService.getStadium();
      setStadium(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred fetching stadium');
    } finally {
      setLoading(false);
    }
  }, [setStadium, setLoading, setError]);

  const fetchDigitalTwin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await stadiumService.getDigitalTwin();
      setStadium(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred fetching digital twin');
    } finally {
      setLoading(false);
    }
  }, [setStadium, setLoading, setError]);

  const createStadium = useCallback(
    async (name: string, city: string, capacity: number) => {
      setLoading(true);
      setError(null);
      try {
        const data = await stadiumService.createStadium({ name, city, total_capacity: capacity });
        setStadium(data);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred creating stadium');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setStadium, setLoading, setError]
  );

  return {
    stadium,
    isLoading,
    error,
    fetchStadium,
    fetchDigitalTwin,
    createStadium,
  };
};
