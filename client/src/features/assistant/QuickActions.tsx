// Quick-action chips: common questions a fan can ask with one tap.
import { SUGGESTED_QUERIES } from './assistant-content.js';

interface SuggestedQueriesProps {
  onSelect: (question: string) => void;
  disabled: boolean;
}

/** Row of one-tap suggested questions. */
export function SuggestedQueries({ onSelect, disabled }: SuggestedQueriesProps): React.JSX.Element {
  return (
    <div>
      <h2 className="field-label" id="quick-actions-heading">
        Popular queries
      </h2>
      <ul className="quick-actions" aria-labelledby="quick-actions-heading">
        {SUGGESTED_QUERIES.map((question) => (
          <li key={question}>
            <button
              type="button"
              className="chip"
              disabled={disabled}
              onClick={() => {
                onSelect(question);
              }}
            >
              {question}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
