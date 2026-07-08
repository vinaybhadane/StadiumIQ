// AI briefing panel: a button that turns the live snapshot into prioritized
// operational recommendations, with accessible loading and error states.
import { FailureNotice, BusyIndicator } from '../../components/StatusMessage.js';
import type { SituationReport } from '../../lib/api-types.js';

interface SituationReportPanelProps {
  report: SituationReport | null;
  isLoading: boolean;
  error: string | null;
  onGenerate: () => void;
}

/** Generate-and-display panel for the AI operations briefing. */
export function SituationReportPanel({
  report,
  isLoading,
  error,
  onGenerate,
}: SituationReportPanelProps): React.JSX.Element {
  return (
    <div className="card stack">
      <div>
        <h2>AI Situation Report</h2>
        <p className="muted">
          Compile customized crowd directions, security updates, and ecological insights from the active dashboard to assist event management.
        </p>
      </div>
      <button type="button" className="button" onClick={onGenerate} disabled={isLoading}>
        {isLoading ? 'Creating…' : 'Create AI report'}
      </button>

      {isLoading ? <BusyIndicator label="Reviewing live stadium data…" /> : null}
      {error !== null ? <FailureNotice message={error} /> : null}

      {report !== null && !isLoading ? (
        <div aria-live="polite">
          <p className="muted briefing__timestamp">
            Prepared {new Date(report.generatedAt).toLocaleTimeString()}
          </p>
          <p className="briefing">{report.briefing}</p>
        </div>
      ) : null}
    </div>
  );
}
