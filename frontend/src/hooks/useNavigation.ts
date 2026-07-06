import { useState, useCallback } from 'react';
import { navigationService } from '../services/navigationService';
import { NavigationResponse } from '../types';

export const useNavigation = () => {
  const [directions, setDirections] = useState<NavigationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDirections = useCallback(
    async (currentZone: string, destinationType: string, accessibilityRequired: boolean) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await navigationService.getDirections({
          current_zone: currentZone,
          destination_type: destinationType,
          accessibility_required: accessibilityRequired,
        });
        setDirections(res);
        return res;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error calculating directions');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearDirections = useCallback(() => {
    setDirections(null);
  }, []);

  return {
    directions,
    isLoading,
    error,
    fetchDirections,
    clearDirections,
  };
};
