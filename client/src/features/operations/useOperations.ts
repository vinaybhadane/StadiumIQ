// State and side effects for the operations command center: loads the live
// snapshot on mount, refreshes it on an interval, and generates AI briefings
// on demand.
import { useCallback, useEffect, useState } from 'react';

import { ServiceError, loadLiveData, generateReport } from '../../lib/api.js';
import type { SituationReport, LiveSituationData } from '../../lib/api-types.js';

/** How often the dashboard re-fetches the live snapshot, in milliseconds. */
const LIVE_DATA_INTERVAL_MS = 30_000;

interface UseCommandHubOutput {
  situation: LiveSituationData | null;
  situationError: string | null;
  report: SituationReport | null;
  isReportLoading: boolean;
  reportError: string | null;
  requestSituationReport: () => Promise<void>;
}

function extractErrorMessage(caught: unknown, fallback: string): string {
  return caught instanceof ServiceError ? caught.message : fallback;
}

/** Manages live snapshot polling and briefing generation for the dashboard. */
export function useCommandHub(): UseCommandHubOutput {
  const [situation, setSituation] = useState<LiveSituationData | null>(null);
  const [situationError, setSituationError] = useState<string | null>(null);
  const [report, setReport] = useState<SituationReport | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async (): Promise<void> => {
      try {
        const next = await loadLiveData();
        if (active) {
          setSituation(next);
          setSituationError(null);
        }
      } catch (caught) {
        if (active) {
          setSituationError(extractErrorMessage(caught, 'Unable to load live operations data.'));
        }
      }
    };
    void load();
    const timer = setInterval(() => void load(), LIVE_DATA_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const requestSituationReport = useCallback(async (): Promise<void> => {
    if (isReportLoading) {
      return;
    }
    setReportError(null);
    setIsReportLoading(true);
    try {
      setReport(await generateReport());
    } catch (caught) {
      setReportError(extractErrorMessage(caught, 'Unable to generate a briefing right now.'));
    } finally {
      setIsReportLoading(false);
    }
  }, [isReportLoading]);

  return {
    situation,
    situationError,
    report,
    isReportLoading,
    reportError,
    requestSituationReport,
  };
}
