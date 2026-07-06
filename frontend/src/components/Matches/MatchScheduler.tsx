import React, { useState } from 'react';
import { useMatches } from '../../hooks/useMatches';
import { Team } from '../../types';

export const MatchScheduler: React.FC = () => {
  const { generateSchedule, isLoading, error } = useMatches();
  const [success, setSuccess] = useState(false);
  const [restDays, setRestDays] = useState(2);

  // Hardcoded demo teams for scheduling selection
  const defaultTeams: Team[] = [
    { team_id: 'T1', name: 'Metropolis FC', ranking: 3, group: 'A' },
    { team_id: 'T2', name: 'Gotham United', ranking: 5, group: 'A' },
    { team_id: 'T3', name: 'Star City Rovers', ranking: 2, group: 'A' },
    { team_id: 'T4', name: 'Central City FC', ranking: 7, group: 'A' },
  ];

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    try {
      await generateSchedule({
        teams: defaultTeams,
        stadium_ids: ['STD-001'],
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        broadcast_windows: ['evening'],
        weather_forecasts: ['clear'],
        rest_days_between_matches: restDays,
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-6" aria-labelledby="scheduler-title">
      <h3 id="scheduler-title" className="text-lg font-semibold text-slate-100 mb-2">
        AI Match Scheduler & Optimizer
      </h3>
      <p className="text-sm text-slate-400 mb-6">
        Generate conflict-free round-robin tournament brackets optimized via Gemini models.
      </p>

      <form onSubmit={handleScheduleSubmit} className="space-y-4">
        <div>
          <label htmlFor="rest-days" className="block text-sm font-medium text-slate-350 mb-1">
            Minimum Rest Days Between Matches
          </label>
          <input
            type="number"
            id="rest-days"
            min="1"
            max="7"
            value={restDays}
            onChange={(e) => setRestDays(parseInt(e.target.value) || 2)}
            className="w-full md:w-64 bg-slate-950/60 border border-slate-800 rounded px-3 py-2 text-slate-150 focus:outline-none focus:border-primary-505"
            aria-describedby="rest-days-help"
          />
          <p id="rest-days-help" className="text-xs text-slate-500 mt-1">
            Enforces safety rules to prevent player injuries.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-500/30 rounded text-red-400 text-sm" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-950/50 border border-green-500/30 rounded text-green-400 text-sm" role="alert">
            Schedule optimized and generated successfully.
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-primary-505 hover:bg-primary-600 disabled:bg-slate-800 disabled:text-slate-500 transition rounded font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary-505"
        >
          {isLoading ? 'Optimizing Bracket...' : 'Generate AI Bracket'}
        </button>
      </form>
    </section>
  );
};
