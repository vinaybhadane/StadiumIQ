import React from 'react';

interface AlertPanelProps {
  alerts: string[];
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3" role="region" aria-label="System Alerts">
      {alerts.map((alert, idx) => (
        <div
          key={idx}
          className="p-4 bg-red-950/50 border border-red-500/30 rounded-xl text-red-200 flex justify-between items-center"
          role="alert"
          aria-live="assertive"
        >
          <div>
            <span className="text-xs uppercase font-bold text-red-400 tracking-widest block mb-0.5">Critical Emergency</span>
            <p className="text-sm font-semibold">{alert}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
