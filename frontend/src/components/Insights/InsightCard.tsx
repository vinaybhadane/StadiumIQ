import React from 'react';
import { Insight } from '../../types';
import { formatDate } from '../../utils/formatters';

interface InsightCardProps {
  insight: Insight;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const getPriorityClass = (priority: Insight['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-slate-800/40 text-slate-300 border-slate-700/30';
    }
  };

  return (
    <div className={`p-5 rounded-lg border transition duration-300 ${getPriorityClass(insight.priority)}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider opacity-90">{insight.category.replace('_', ' ')}</span>
          <span className="text-slate-500 text-xs mx-2">•</span>
          <span className="text-xs font-mono text-slate-400">{formatDate(insight.generated_at, { timeStyle: 'short' })}</span>
        </div>
        <span className="text-xs font-mono bg-slate-950/60 px-2 py-0.5 rounded text-slate-400">
          Source: {insight.source}
        </span>
      </div>

      <h4 className="font-semibold text-slate-100 text-base mb-2">{insight.title}</h4>
      <p className="text-sm text-slate-300 leading-relaxed mb-4">{insight.description}</p>

      {insight.recommendation && (
        <div className="bg-slate-950/40 border border-slate-800/60 p-3.5 rounded">
          <span className="text-xs font-semibold text-primary-400 block mb-1 uppercase tracking-wider">Recommendation</span>
          <p className="text-sm text-slate-200">{insight.recommendation}</p>
        </div>
      )}
    </div>
  );
};
