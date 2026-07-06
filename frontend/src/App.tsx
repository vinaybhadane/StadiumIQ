import React, { useEffect, Suspense } from 'react';
import { useStadium } from './hooks/useStadium';
import { useMatches } from './hooks/useMatches';
import { useCrowd } from './hooks/useCrowd';
import { useInsights } from './hooks/useInsights';
import { useEmergency } from './hooks/useEmergency';

import { SkipLink } from './components/shared/SkipLink';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { AlertPanel } from './components/Emergency/AlertPanel';

// Lazy loading segments for heavy features as specified by optimization targets
const StadiumTwin = React.lazy(() =>
  import('./components/Dashboard/StadiumTwin').then((module) => ({ default: module.StadiumTwin }))
);
const CrowdHeatmap = React.lazy(() =>
  import('./components/Dashboard/CrowdHeatmap').then((module) => ({ default: module.CrowdHeatmap }))
);
const MetricsPanel = React.lazy(() =>
  import('./components/Dashboard/MetricsPanel').then((module) => ({ default: module.MetricsPanel }))
);
const MatchScheduler = React.lazy(() =>
  import('./components/Matches/MatchScheduler').then((module) => ({ default: module.MatchScheduler }))
);
const StandingsTable = React.lazy(() =>
  import('./components/Matches/StandingsTable').then((module) => ({ default: module.StandingsTable }))
);
const SurgePredictor = React.lazy(() =>
  import('./components/Crowd/SurgePredictor').then((module) => ({ default: module.SurgePredictor }))
);
const GateStatus = React.lazy(() =>
  import('./components/Crowd/GateStatus').then((module) => ({ default: module.GateStatus }))
);
const InsightsList = React.lazy(() =>
  import('./components/Insights/InsightsList').then((module) => ({ default: module.InsightsList }))
);
const EvacuationMap = React.lazy(() =>
  import('./components/Emergency/EvacuationMap').then((module) => ({ default: module.EvacuationMap }))
);
const WayfindingPanel = React.lazy(() =>
  import('./components/Navigation/WayfindingPanel').then((module) => ({ default: module.WayfindingPanel }))
);
const AssistPanel = React.lazy(() =>
  import('./components/Assist/AssistPanel').then((module) => ({ default: module.AssistPanel }))
);
const AnnouncementBroadcast = React.lazy(() =>
  import('./components/Assist/AnnouncementBroadcast').then((module) => ({ default: module.AnnouncementBroadcast }))
);


const App: React.FC = () => {
  const { stadium, fetchStadium } = useStadium();
  const { standings, fetchMatches, fetchStandings } = useMatches();
  const { surgePrediction, fetchSurgePrediction } = useCrowd();
  const { insights, fetchLatestInsights } = useInsights();
  const { activeAlerts } = useEmergency();

  useEffect(() => {
    fetchStadium();
    fetchMatches();
    fetchStandings();
    fetchLatestInsights();
    fetchSurgePrediction();

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchStadium();
        fetchLatestInsights();
        fetchSurgePrediction();
      }
    }, 15000); // 15 seconds polling interval

    return () => clearInterval(intervalId);
  }, [fetchStadium, fetchMatches, fetchStandings, fetchLatestInsights, fetchSurgePrediction]);

  return (
    <ErrorBoundary>
      <SkipLink />
      <div className="min-h-screen bg-[#05070c] text-slate-100 font-sans antialiased selection:bg-primary-505 selection:text-white pb-12">
        {/* Header bar */}
        <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100">StadiumIQ</h1>
              <span className="text-xs text-slate-400 font-medium">Smart Tournament & Stadium Intelligence</span>
            </div>
            <div className="flex gap-4">
              <span className="text-xs px-2.5 py-1 rounded bg-[#0b0f19] border border-slate-800 text-slate-350">
                Tournament Cup 2026
              </span>
            </div>
          </div>
        </header>

        {/* Main layout */}
        <main id="main-content" className="max-w-7xl mx-auto px-6 mt-8 space-y-8 focus:outline-none">
          <AlertPanel alerts={activeAlerts} />

          {stadium && (
            <Suspense fallback={<LoadingSpinner />}>
              <MetricsPanel stadium={stadium} />
              <StadiumTwin zones={stadium.zones} gates={stadium.gates} />
              <CrowdHeatmap zones={stadium.zones} />
            </Suspense>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Suspense fallback={<LoadingSpinner />}>
              <MatchScheduler />
              <StandingsTable standings={standings} />
            </Suspense>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Suspense fallback={<LoadingSpinner />}>
              <SurgePredictor prediction={surgePrediction} />
              {stadium && <GateStatus gates={stadium.gates} />}
            </Suspense>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Suspense fallback={<LoadingSpinner />}>
              <WayfindingPanel />
              <AssistPanel />
            </Suspense>
          </div>

          <Suspense fallback={<LoadingSpinner />}>
            <AnnouncementBroadcast />
            <InsightsList insights={insights} />
            <EvacuationMap />
          </Suspense>

        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
