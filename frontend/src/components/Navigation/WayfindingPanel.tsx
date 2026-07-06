import React, { useState } from 'react';
import { useNavigation } from '../../hooks/useNavigation';

export const WayfindingPanel: React.FC = () => {
  const { directions, fetchDirections, isLoading, error } = useNavigation();
  const [startZone, setStartZone] = useState('Z-NORTH');
  const [destination, setDestination] = useState('restroom');
  const [accessRequired, setAccessRequired] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDirections(startZone, destination, accessRequired);
  };

  return (
    <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-6" aria-labelledby="wayfind-title">
      <h3 id="wayfind-title" className="text-lg font-semibold text-slate-100 mb-2">
        Smart Indoor Navigation (Feature 8)
      </h3>
      <p className="text-sm text-slate-400 mb-6">
        Dynamic wayfinding routing seats, facilities, and exits avoiding congested paths.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-zone" className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Current Location Zone
            </label>
            <select
              id="start-zone"
              value={startZone}
              onChange={(e) => setStartZone(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded px-3 py-2 text-slate-150 focus:outline-none focus:border-primary-505"
            >
              <option value="Z-NORTH">North Stand (Z-NORTH)</option>
              <option value="Z-SOUTH">South Stand (Z-SOUTH)</option>
              <option value="Z-EAST">East VIP Stand (Z-EAST)</option>
              <option value="Z-WEST">West Premium Stand (Z-WEST)</option>
              <option value="Z-ACCESSIBLE">Accessible Section (Z-ACCESSIBLE)</option>
              <option value="Z-STANDING">Standing Zone (Z-STANDING)</option>
            </select>
          </div>

          <div>
            <label htmlFor="dest-type" className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Destination Category
            </label>
            <select
              id="dest-type"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded px-3 py-2 text-slate-150 focus:outline-none focus:border-primary-505"
            >
              <option value="restroom">Restrooms</option>
              <option value="exit">Nearest Exit Gate</option>
              <option value="concession">Concessions & Food</option>
              <option value="medical">Medical Aid Stations</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="access-req"
            checked={accessRequired}
            onChange={(e) => setAccessRequired(e.target.checked)}
            className="w-4 h-4 text-primary-550 border-slate-800 rounded bg-slate-950 focus:ring-0"
          />
          <label htmlFor="access-req" className="text-sm text-slate-300">
            Wheelchair-friendly (Step-free path)
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-primary-505 hover:bg-primary-600 disabled:bg-slate-850 disabled:text-slate-500 transition rounded font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary-505"
        >
          {isLoading ? 'Calculating path...' : 'Calculate Safest Route'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-950/40 border border-red-500/30 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {directions && (
        <div className="mt-6 border-t border-slate-800 pt-4 space-y-3" aria-live="polite">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 font-medium">Estimated Time:</span>
            <span className="font-bold text-slate-200">{directions.estimated_time_minutes} minutes</span>
          </div>

          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded text-sm text-slate-200">
            <span className="text-xs uppercase font-bold text-primary-400 block mb-2 tracking-widest">
              AI Navigation Directions
            </span>
            <p className="leading-relaxed">{directions.gemini_instructions}</p>
          </div>

          {directions.accessibility_note && (
            <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded text-xs text-blue-300">
              {directions.accessibility_note}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
