import React from 'react';

export const EvacuationMap: React.FC = () => {
  return (
    <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-6" aria-labelledby="evac-title">
      <h3 id="evac-title" className="text-lg font-semibold text-slate-100 mb-2">
        Emergency Evacuation Routes
      </h3>
      <p className="text-sm text-slate-400 mb-6">
        Dynamic crowd egress routes automatically mapped.
      </p>

      {/* Visual representations of emergency pathways */}
      <div className="bg-slate-950/40 rounded-lg p-6 border border-slate-850 flex flex-col md:flex-row justify-around gap-6">
        <div className="border-l-4 border-red-500 pl-4">
          <span className="block font-semibold text-slate-200 text-sm">Zone: North & East VIP</span>
          <span className="text-xs text-slate-450 block mt-1">Primary Route</span>
          <span className="text-sm text-red-400 font-bold font-mono">EXIT GATE G7 (Accessible)</span>
        </div>

        <div className="border-l-4 border-orange-500 pl-4">
          <span className="block font-semibold text-slate-200 text-sm">Zone: South & Standing</span>
          <span className="text-xs text-slate-450 block mt-1">Primary Route</span>
          <span className="text-sm text-orange-400 font-bold font-mono">EXIT GATE G8 (Standing)</span>
        </div>
      </div>
    </section>
  );
};
