import { useCallback } from 'react';
import { useStadiumStore } from '../store/stadiumStore';

export const useEmergency = () => {
  const activeAlerts = useStadiumStore((state) => state.activeAlerts);
  const addAlert = useStadiumStore((state) => state.addAlert);
  const removeAlert = useStadiumStore((state) => state.removeAlert);
  const clearAlerts = useStadiumStore((state) => state.clearAlerts);

  const broadcastEmergencyAlert = useCallback(
    (message: string) => {
      // Simulate real-time emergency alert broadcasting
      addAlert(message);
    },
    [addAlert]
  );

  return {
    activeAlerts,
    broadcastEmergencyAlert,
    removeAlert,
    clearAlerts,
  };
};
