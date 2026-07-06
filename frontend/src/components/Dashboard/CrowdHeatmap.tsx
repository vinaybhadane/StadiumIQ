import React from 'react';
import { StadiumZone } from '../../types';
import { formatPercentage, formatNumber } from '../../utils/formatters';

interface CrowdHeatmapProps {
  zones: StadiumZone[];
}

export const CrowdHeatmap: React.FC<CrowdHeatmapProps> = ({ zones }) => {
  const getDensityColorClass = (occupancy: number, capacity: number) => {
    const pct = (occupancy / capacity) * 100;
    if (pct > 85) return 'bg-red-500/20 border-red-500 text-red-400';
    if (pct > 70) return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
    return 'bg-green-500/20 border-green-500 text-green-400';
  };

  return (
    <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-6" aria-labelledby="heatmap-title">
      <h3 id="heatmap-title" className="text-lg font-semibold text-slate-100 mb-4">
        Zone Crowd Densities
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
        {zones.map((zone) => {
          const occupancyPct = zone.capacity > 0 ? (zone.current_occupancy / zone.capacity) * 100 : 0;
          return (
            <div
              key={zone.zone_id}
              className={`p-4 rounded-lg border transition duration-300 ${getDensityColorClass(
                zone.current_occupancy,
                zone.capacity
              )}`}
              role="listitem"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-slate-200">{zone.name}</span>
                <span className="text-xs uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {zone.zone_type}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-350">
                  <span>Occupancy</span>
                  <span className="font-mono text-slate-100">
                    {formatNumber(zone.current_occupancy)} / {formatNumber(zone.capacity)}
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      occupancyPct > 85
                        ? 'bg-red-500'
                        : occupancyPct > 70
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(occupancyPct, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Density</span>
                  <span className="font-bold text-slate-200">{formatPercentage(occupancyPct)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
