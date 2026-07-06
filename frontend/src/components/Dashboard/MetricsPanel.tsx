import React from 'react';
import { Stadium } from '../../types';
import { formatPercentage, formatNumber } from '../../utils/formatters';

interface MetricsPanelProps {
  stadium: Stadium;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ stadium }) => {
  const currentOccupancy = stadium.zones.reduce((acc, z) => acc + z.current_occupancy, 0);
  const occupancyPct = stadium.total_capacity > 0 ? (currentOccupancy / stadium.total_capacity) * 100 : 0;

  // Active gates count
  const activeGates = stadium.gates.filter((g) => g.status === 'open').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="region" aria-label="Stadium Live Metrics" aria-live="polite">
      {/* Total Occupancy */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-6">
        <span className="text-sm font-medium text-slate-400">Live Occupancy</span>
        <div className="flex justify-between items-baseline mt-2">
          <span className="text-3xl font-bold text-slate-100">{formatNumber(currentOccupancy)}</span>
          <span className="text-sm font-semibold text-slate-400">/ {formatNumber(stadium.total_capacity)}</span>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>Overall Fill Rate</span>
          <span className="font-bold text-slate-200">{formatPercentage(occupancyPct)}</span>
        </div>
      </div>

      {/* Gates Utilization */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-6">
        <span className="text-sm font-medium text-slate-400">Active Gates</span>
        <div className="flex justify-between items-baseline mt-2">
          <span className="text-3xl font-bold text-slate-100">{activeGates}</span>
          <span className="text-sm font-semibold text-slate-400">/ {stadium.gates.length} Online</span>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>Safety Standard Status</span>
          <span className="text-green-400 font-semibold uppercase">Nominal</span>
        </div>
      </div>

      {/* Operations Briefing / Core Loop */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-6">
        <span className="text-sm font-medium text-slate-400">Core Loop Status</span>
        <div className="flex justify-between items-baseline mt-2">
          <span className="text-lg font-bold text-slate-200">Navigate → Decide → Assist</span>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>Operational Mode</span>
          <span className="text-primary-400 font-semibold uppercase">Active Assist</span>
        </div>
      </div>
    </div>
  );
};
