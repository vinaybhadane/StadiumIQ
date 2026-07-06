import React from 'react';
import { Insight } from '../../types';
import { InsightCard } from './InsightCard';

interface InsightsListProps {
  insights: Insight[];
}

export const InsightsList: React.FC<InsightsListProps> = ({ insights }) => {
  return (
    <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-6" aria-labelledby="insights-title">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 id="insights-title" className="text-lg font-semibold text-slate-100">
            AI Operations & Intelligence Center
          </h3>
          <p className="text-sm text-slate-400 mt-1">Real-time alerts and action lists parsed from Gemini and safety engines.</p>
        </div>
      </div>

      <div className="space-y-4" role="list">
        {insights.map((insight) => (
          <div key={insight.insight_id} role="listitem">
            <InsightCard insight={insight} />
          </div>
        ))}
      </div>
    </section>
  );
};
