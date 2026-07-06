import React from 'react';
import { SurgePredictionResponse } from '../../types';
import { formatDate } from '../../utils/formatters';

interface SurgePredictorProps {
  prediction: SurgePredictionResponse | null;
}

export const SurgePredictor: React.FC<SurgePredictorProps> = ({ prediction }) => {
  if (!prediction) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-6">
        <p className="text-slate-400 text-sm">No surge predictions loaded. Run analysis below.</p>
      </div>
    );
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'red':
        return 'bg-red-500/20 border-red-500 text-red-400';
      case 'yellow':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      default:
        return 'bg-green-500/20 border-green-500 text-green-400';
    }
  };

  return (
    <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-6" aria-labelledby="surge-title">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 id="surge-title" className="text-lg font-semibold text-slate-100">
            Surge Risk Projections
          </h3>
          <p className="text-sm text-slate-400 mt-1">{prediction.summary}</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-350 uppercase tracking-wider font-mono">
          Engine: {prediction.source}
        </span>
      </div>

      <div className="space-y-4" role="list">
        {prediction.predictions.map((pred) => (
          <div
            key={pred.gate_id}
            className={`p-4 rounded-lg border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${getRiskBadgeColor(
              pred.risk_level
            )}`}
            role="listitem"
          >
            <div>
              <span className="font-semibold text-slate-200">Gate: {pred.gate_id}</span>
              <span className="text-slate-400 text-xs mx-2">|</span>
              <span className="text-slate-350 text-sm">Targeting: {pred.zone_id}</span>
              <p className="text-xs text-slate-450 mt-1">
                Peak expected around: {formatDate(pred.predicted_peak_time, { timeStyle: 'short' })}
              </p>
            </div>

            <div className="flex flex-col md:items-end gap-1.5">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                Confidence: {(pred.confidence * 100).toFixed(0)}%
              </span>
              {pred.recommended_action && (
                <span className="text-xs bg-slate-950/60 px-3 py-1 rounded text-slate-200 border border-slate-850">
                  {pred.recommended_action}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
