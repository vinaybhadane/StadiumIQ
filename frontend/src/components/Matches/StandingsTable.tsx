import React from 'react';
import { StandingsEntry } from '../../types';

interface StandingsTableProps {
  standings: StandingsEntry[];
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ standings }) => {
  return (
    <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-6" aria-labelledby="standings-title">
      <h3 id="standings-title" className="text-lg font-semibold text-slate-100 mb-4">
        Tournament Standings
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-350">
          <thead className="bg-slate-950/40 text-slate-200 uppercase text-xs font-semibold">
            <tr>
              <th scope="col" className="px-4 py-3">Team</th>
              <th scope="col" className="px-4 py-3 text-center">Played</th>
              <th scope="col" className="px-4 py-3 text-center">Won</th>
              <th scope="col" className="px-4 py-3 text-center">Drawn</th>
              <th scope="col" className="px-4 py-3 text-center">Lost</th>
              <th scope="col" className="px-4 py-3 text-center">GF</th>
              <th scope="col" className="px-4 py-3 text-center">GA</th>
              <th scope="col" className="px-4 py-3 text-center font-bold text-primary-400">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {standings.map((entry) => (
              <tr key={entry.team.team_id} className="hover:bg-slate-800/20 transition-colors">
                <td className="px-4 py-3.5 font-semibold text-slate-100">{entry.team.name}</td>
                <td className="px-4 py-3.5 text-center font-mono">{entry.played}</td>
                <td className="px-4 py-3.5 text-center font-mono">{entry.won}</td>
                <td className="px-4 py-3.5 text-center font-mono">{entry.drawn}</td>
                <td className="px-4 py-3.5 text-center font-mono">{entry.lost}</td>
                <td className="px-4 py-3.5 text-center font-mono">{entry.goals_for}</td>
                <td className="px-4 py-3.5 text-center font-mono">{entry.goals_against}</td>
                <td className="px-4 py-3.5 text-center font-bold font-mono text-primary-450">{entry.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
