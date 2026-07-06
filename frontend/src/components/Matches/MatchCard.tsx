import React from 'react';
import { Match } from '../../types';
import { formatDate } from '../../utils/formatters';

interface MatchCardProps {
  match: Match;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const getStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-slate-800 text-slate-350';
      case 'live':
        return 'bg-red-500/10 text-red-400 animate-pulse';
      case 'half_time':
        return 'bg-yellow-500/10 text-yellow-400';
      default:
        return 'bg-primary-505/10 text-primary-400';
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-5 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-mono text-slate-500">{match.match_id}</span>
        <span className={`text-xs uppercase font-semibold px-2 py-0.5 rounded-full ${getStatusColor(match.status)}`}>
          {match.status}
        </span>
      </div>

      <div className="space-y-3 py-2">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-200">{match.home_team.name}</span>
          <span className="text-lg font-bold text-slate-100 font-mono">
            {match.status === 'scheduled' ? '-' : match.statistics.home_score}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-200">{match.away_team.name}</span>
          <span className="text-lg font-bold text-slate-100 font-mono">
            {match.status === 'scheduled' ? '-' : match.statistics.away_score}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-800/60 mt-4 pt-3 flex justify-between items-center text-xs text-slate-400">
        <span>{formatDate(match.scheduled_time)}</span>
        {match.statistics.attendance > 0 && (
          <span>Att: {match.statistics.attendance.toLocaleString()}</span>
        )}
      </div>
    </div>
  );
};
