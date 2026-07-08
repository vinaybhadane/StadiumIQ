import { useState } from 'react';

import { FailureNotice, BusyIndicator } from '../../components/StatusMessage.js';
import { DialogThread } from './ChatMessageList.js';
import { LocalePicker } from './LanguageSelector.js';
import { SuggestedQueries } from './QuickActions.js';
import { useMatchGuide } from './useAssistant.js';

/** Full match guide page. */
export function MatchGuidePage(): React.JSX.Element {
  const { dialogs, locale, isLoading, error, setLocale, queryGuide } = useMatchGuide();
  const [pendingInput, setPendingInput] = useState('');

  const executeSuggestedQuery = (question: string): void => {
    void queryGuide(question);
  };

  return (
    <section aria-labelledby="assistant-heading" className="stack">
      <div>
        <h1 id="assistant-heading">Match Day Guide</h1>
        <p className="page-intro">
          Get info regarding entryways, barrier-free paths, public transit, dining options, multi-faith spaces,
          and family facilities at Estadio Azteca. Responses are retrieved from certified venue documentation
          in your selected language.
        </p>
      </div>

      <div className="card stack">
        <LocalePicker value={locale} onChange={setLocale} disabled={isLoading} />
        <SuggestedQueries onSelect={executeSuggestedQuery} disabled={isLoading} />

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void queryGuide(pendingInput).then(() => {
              setPendingInput('');
            });
          }}
        >
          <label className="field-label" htmlFor="assistant-question">
            Enter your question
          </label>
          <input
            id="assistant-question"
            className="text-input"
            type="text"
            value={pendingInput}
            maxLength={500}
            placeholder="e.g. How do I access step-free entry?"
            onChange={(event) => {
              setPendingInput(event.target.value);
            }}
            disabled={isLoading}
          />
          <p className="form-actions">
            <button type="submit" className="button" disabled={isLoading || pendingInput.trim() === ''}>
              {isLoading ? 'Asking…' : 'Ask SmartStadium'}
            </button>
          </p>
        </form>

        {isLoading ? <BusyIndicator label="Searching for responses…" /> : null}
        {error !== null ? <FailureNotice message={error} /> : null}
      </div>

      <div className="card">
        <h2>Dialogue History</h2>
        <DialogThread dialogs={dialogs} />
      </div>
    </section>
  );
}
