import React, { useMemo, useCallback } from 'react';
import { StadiumZone, Gate } from '../../types';
import { formatPercentage } from '../../utils/formatters';

interface StadiumTwinProps {
  zones: StadiumZone[];
  gates: Gate[];
}

export const StadiumTwinComponent: React.FC<StadiumTwinProps> = ({ zones, gates }) => {
  const zoneMap = useMemo(
    () => Object.fromEntries(zones.map((z) => [z.zone_id, z])),
    [zones]
  );

  const getZoneColor = useCallback((occupancy: number, capacity: number) => {
    const pct = capacity > 0 ? (occupancy / capacity) * 100 : 0;
    if (pct > 85) return 'fill-red-500/40 stroke-red-500';
    if (pct > 70) return 'fill-yellow-500/40 stroke-yellow-500';
    return 'fill-green-500/40 stroke-green-500';
  }, []);

  const getZoneStatusText = (occupancy: number, capacity: number) => {
    const pct = capacity > 0 ? (occupancy / capacity) * 100 : 0;
    if (pct > 85) return 'Surge (High Load)';
    if (pct > 70) return 'Elevated';
    return 'Normal';
  };

  return (
    <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-6" aria-labelledby="twin-title">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 id="twin-title" className="text-lg font-semibold text-slate-100">
            Digital Stadium Twin
          </h3>
          <p className="text-slate-400 text-sm">Real-time stadium state simulation replica.</p>
        </div>
        <div className="flex gap-4 text-xs" aria-hidden="true">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
            <span className="text-slate-350">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>
            <span className="text-slate-350">Elevated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            <span className="text-slate-350">Surge</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Visual Twin Simulation using CSS layout instead of actual heavy 3D canvas for lighter execution */}
        <div className="lg:col-span-2 flex flex-col items-center py-6 bg-slate-950/40 rounded-lg border border-slate-800">
          <svg viewBox="0 0 400 400" className="w-72 h-72 md:w-80 md:h-80 select-none" role="img" aria-label="Stadium map layout detailing zone status">
            {/* Outer Stadium wall */}
            <circle cx="200" cy="200" r="180" className="fill-none stroke-slate-800 stroke-[4px]" />
            <circle cx="200" cy="200" r="150" className="fill-none stroke-slate-700 stroke-[2px] stroke-dasharray" />

            {/* Field */}
            <rect x="130" y="150" width="140" height="100" rx="6" className="fill-green-950/30 stroke-green-600/50 stroke-2" />
            <circle cx="200" cy="200" r="25" className="fill-none stroke-green-600/30 stroke-2" />

            {/* Zone Wedges */}
            {/* North Stand */}
            <path
              d="M 120 70 A 150 150 0 0 1 280 70 L 200 200 Z"
              className={`transition-colors duration-500 ${getZoneColor(
                zoneMap['Z-NORTH']?.current_occupancy || 0,
                zoneMap['Z-NORTH']?.capacity || 1
              )} stroke-[2px] cursor-pointer`}
              aria-label={`North Stand: ${formatPercentage(
                zoneMap['Z-NORTH']?.current_occupancy || 0,
                zoneMap['Z-NORTH']?.capacity || 1
              )} occupied, status ${getZoneStatusText(
                zoneMap['Z-NORTH']?.current_occupancy || 0,
                zoneMap['Z-NORTH']?.capacity || 1
              )}`}
            >
              <title>{`North Stand: ${formatPercentage(
                zoneMap['Z-NORTH']?.current_occupancy || 0,
                zoneMap['Z-NORTH']?.capacity || 1
              )} occupancy`}</title>
            </path>

            {/* East VIP */}
            <path
              d="M 280 70 A 150 150 0 0 1 330 280 L 200 200 Z"
              className={`transition-colors duration-500 ${getZoneColor(
                zoneMap['Z-EAST']?.current_occupancy || 0,
                zoneMap['Z-EAST']?.capacity || 1
              )} stroke-[2px] cursor-pointer`}
              aria-label={`East VIP Stand: ${formatPercentage(
                zoneMap['Z-EAST']?.current_occupancy || 0,
                zoneMap['Z-EAST']?.capacity || 1
              )} occupied, status ${getZoneStatusText(
                zoneMap['Z-EAST']?.current_occupancy || 0,
                zoneMap['Z-EAST']?.capacity || 1
              )}`}
            >
              <title>{`East VIP: ${formatPercentage(
                zoneMap['Z-EAST']?.current_occupancy || 0,
                zoneMap['Z-EAST']?.capacity || 1
              )} occupancy`}</title>
            </path>

            {/* South Stand */}
            <path
              d="M 330 280 A 150 150 0 0 1 120 330 L 200 200 Z"
              className={`transition-colors duration-500 ${getZoneColor(
                zoneMap['Z-SOUTH']?.current_occupancy || 0,
                zoneMap['Z-SOUTH']?.capacity || 1
              )} stroke-[2px] cursor-pointer`}
              aria-label={`South Stand: ${formatPercentage(
                zoneMap['Z-SOUTH']?.current_occupancy || 0,
                zoneMap['Z-SOUTH']?.capacity || 1
              )} occupied, status ${getZoneStatusText(
                zoneMap['Z-SOUTH']?.current_occupancy || 0,
                zoneMap['Z-SOUTH']?.capacity || 1
              )}`}
            >
              <title>{`South Stand: ${formatPercentage(
                zoneMap['Z-SOUTH']?.current_occupancy || 0,
                zoneMap['Z-SOUTH']?.capacity || 1
              )} occupancy`}</title>
            </path>

            {/* West Premium */}
            <path
              d="M 120 330 A 150 150 0 0 1 120 70 L 200 200 Z"
              className={`transition-colors duration-500 ${getZoneColor(
                zoneMap['Z-WEST']?.current_occupancy || 0,
                zoneMap['Z-WEST']?.capacity || 1
              )} stroke-[2px] cursor-pointer`}
              aria-label={`West Premium Stand: ${formatPercentage(
                zoneMap['Z-WEST']?.current_occupancy || 0,
                zoneMap['Z-WEST']?.capacity || 1
              )} occupied, status ${getZoneStatusText(
                zoneMap['Z-WEST']?.current_occupancy || 0,
                zoneMap['Z-WEST']?.capacity || 1
              )}`}
            >
              <title>{`West Premium: ${formatPercentage(
                zoneMap['Z-WEST']?.current_occupancy || 0,
                zoneMap['Z-WEST']?.capacity || 1
              )} occupancy`}</title>
            </path>
          </svg>

          {/* Screen reader fallback text list */}
          <div className="sr-only">
            <h4>Stand Occupancies Fallback:</h4>
            <ul>
              <li>North Stand: {formatPercentage(zoneMap['Z-NORTH']?.current_occupancy || 0, zoneMap['Z-NORTH']?.capacity || 1)} occupied, Status: {getZoneStatusText(zoneMap['Z-NORTH']?.current_occupancy || 0, zoneMap['Z-NORTH']?.capacity || 1)}</li>
              <li>East VIP Stand: {formatPercentage(zoneMap['Z-EAST']?.current_occupancy || 0, zoneMap['Z-EAST']?.capacity || 1)} occupied, Status: {getZoneStatusText(zoneMap['Z-EAST']?.current_occupancy || 0, zoneMap['Z-EAST']?.capacity || 1)}</li>
              <li>South Stand: {formatPercentage(zoneMap['Z-SOUTH']?.current_occupancy || 0, zoneMap['Z-SOUTH']?.capacity || 1)} occupied, Status: {getZoneStatusText(zoneMap['Z-SOUTH']?.current_occupancy || 0, zoneMap['Z-SOUTH']?.capacity || 1)}</li>
              <li>West Premium Stand: {formatPercentage(zoneMap['Z-WEST']?.current_occupancy || 0, zoneMap['Z-WEST']?.capacity || 1)} occupied, Status: {getZoneStatusText(zoneMap['Z-WEST']?.current_occupancy || 0, zoneMap['Z-WEST']?.capacity || 1)}</li>
            </ul>
          </div>
        </div>

        {/* Real-time stats panel */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-200 border-b border-slate-800 pb-2">Active Gate Status</h4>
          <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
            {gates.map((gate) => {
              const util = gate.capacity_per_hour > 0 ? (gate.current_throughput / gate.capacity_per_hour) * 100 : 0;
              return (
                <div key={gate.gate_id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="block font-medium text-slate-300">{gate.name}</span>
                    <span className="text-xs text-slate-400">Rate: {gate.current_throughput}/hr</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      gate.status === 'open'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {gate.status.toUpperCase()}
                    </span>
                    <span className="block text-xs text-slate-400 mt-1">{formatPercentage(util)} Utilized</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export const StadiumTwin = React.memo(StadiumTwinComponent);
