// Sustainability metrics for the current event day, shown as labelled stat
// tiles.
import type { EcoIndicators } from '../../lib/api-types.js';

interface EcoMetricTilesProps {
  metrics: EcoIndicators;
}

/** Four sustainability stat tiles. */
export function EcoMetricTiles({ metrics }: EcoMetricTilesProps): React.JSX.Element {
  const tiles = [
    { label: 'Landfill waste diversion', value: `${String(metrics.wasteDivertedPct)}%` },
    { label: 'Power consumption today', value: `${metrics.energyKwh.toLocaleString()} kWh` },
    { label: 'Refilled water counts', value: metrics.waterRefillCount.toLocaleString() },
    { label: 'Carbon offset vs reference', value: `${metrics.co2SavedKg.toLocaleString()} kg` },
  ];

  return (
    <div className="metric-grid">
      {tiles.map((tile) => (
        <div key={tile.label} className="metric">
          <p className="metric__value">{tile.value}</p>
          <p className="metric__label">{tile.label}</p>
        </div>
      ))}
    </div>
  );
}
