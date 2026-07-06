import React from 'react';
import { Gate } from '../../types';

interface GateStatusProps {
  gates: Gate[];
}

export const GateStatus: React.FC<GateStatusProps> = ({ gates }) => {
  return (
    <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-6" aria-labelledby="gates-title">
      <h3 id="gates-title" className="text-lg font-semibold text-slate-100 mb-4">
        Gate Utilization & Throughput
      </h3>

      <div className="space-y-4">
        {gates.map((gate) => {
          const util = gate.capacity_per_hour > 0 ? (gate.current_throughput / gate.capacity_per_hour) * 100 : 0;
          return (
            <div key={gate.gate_id} className="border-b border-slate-800/60 pb-3 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-center text-sm mb-1.5">
                <span className="font-semibold text-slate-200">{gate.name}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                  gate.status === 'open' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {gate.status}
                </span>
              </div>

              <div className="w-full bg-slate-800/40 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${util > 90 ? 'bg-red-500' : util > 70 ? 'bg-yellow-500' : 'bg-primary-505'}`}
                  style={{ width: `${Math.min(util, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Throughput: {gate.current_throughput} / {gate.capacity_per_hour} p/h</span>
                <span>{util.toFixed(0)}% Utilized</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
