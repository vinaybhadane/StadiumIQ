// Route configuration with route-level code splitting: each persona page is
// lazily loaded so the initial route ships minimal JavaScript.
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppLayout } from './components/AppLayout.js';
import { AppErrorBoundary } from './components/ErrorBoundary.js';
import { BusyIndicator } from './components/StatusMessage.js';
import { LandingPage } from './features/home/HomePage.js';

const MatchGuidePage = lazy(() =>
  import('./features/assistant/AssistantPage.js').then((module) => ({
    default: module.MatchGuidePage,
  })),
);
const CommandHubPage = lazy(() =>
  import('./features/operations/OperationsPage.js').then((module) => ({
    default: module.CommandHubPage,
  })),
);

/** Root application component wiring routes, layout and error handling. */
export function App(): React.JSX.Element {
  return (
    <AppErrorBoundary>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<LandingPage />} />
          <Route
            path="assistant"
            element={
              <Suspense fallback={<BusyIndicator label="Loading match guide…" />}>
                <MatchGuidePage />
              </Suspense>
            }
          />
          <Route
            path="operations"
            element={
              <Suspense fallback={<BusyIndicator label="Loading command hub…" />}>
                <CommandHubPage />
              </Suspense>
            }
          />
          <Route path="*" element={<LandingPage />} />
        </Route>
      </Routes>
    </AppErrorBoundary>
  );
}
