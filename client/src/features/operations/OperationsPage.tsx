import { FailureNotice, BusyIndicator } from '../../components/StatusMessage.js';
import { SituationReportPanel } from './BriefingPanel.js';
import { CrowdDensityGrid } from './DensityBoard.js';
import { EventIncidentLog } from './IncidentList.js';
import { EcoMetricTiles } from './SustainabilityMeters.js';
import { useCommandHub } from './useOperations.js';

/** Full operations command center route. */
export function CommandHubPage(): React.JSX.Element {
  const { situation, situationError, report, isReportLoading, reportError, requestSituationReport } =
    useCommandHub();

  return (
    <section aria-labelledby="operations-heading" className="stack">
      <div>
        <h1 id="operations-heading">Event Command Hub</h1>
        <p className="page-intro">
          Real-time management data for Estadio Azteca — covering sector crowd volume, active incidents, and
          ecological markers updated automatically.
        </p>
      </div>

      {situationError !== null ? <FailureNotice message={situationError} /> : null}
      {situation === null && situationError === null ? (
        <BusyIndicator label="Fetching operational updates…" />
      ) : null}

      {situation !== null ? (
        <>
          <div className="grid-two">
            <div className="card">
              <h2>Sector Occupancy Status</h2>
              <CrowdDensityGrid zones={situation.zones} />
            </div>
            <div className="card">
              <h2>Logged Incidents</h2>
              <EventIncidentLog incidents={situation.incidents} />
            </div>
          </div>

          <div className="card">
            <h2>Eco-Performance Indicators</h2>
            <EcoMetricTiles metrics={situation.sustainability} />
          </div>

          <SituationReportPanel
            report={report}
            isLoading={isReportLoading}
            error={reportError}
            onGenerate={() => {
              void requestSituationReport();
            }}
          />
        </>
      ) : null}
    </section>
  );
}
