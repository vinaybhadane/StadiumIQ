// Renders the assistant conversation. New answers are announced politely via
// aria-live so screen-reader users hear responses without moving focus.
import type { DialogEntry } from './useAssistant.js';

interface DialogThreadProps {
  dialogs: DialogEntry[];
}

const SENDER_LABEL: Record<DialogEntry['role'], string> = {
  fan: 'You asked',
  assistant: 'SmartStadium',
};

/** Accessible, live-updating transcript of the fan conversation. */
export function DialogThread({ dialogs }: DialogThreadProps): React.JSX.Element {
  if (dialogs.length === 0) {
    return (
      <p className="muted" aria-live="polite">
        Input a query or select a popular prompt above to check stadium routes, step-free access, and transit details.
      </p>
    );
  }

  return (
    <ul className="chat-log" aria-live="polite" aria-label="Conversation">
      {dialogs.map((entry) => (
        <li key={entry.id} className={`chat-message chat-message--${entry.role}`}>
          <p className="chat-message__role">{SENDER_LABEL[entry.role]}</p>
          <p className="chat-message__body">{entry.text}</p>
        </li>
      ))}
    </ul>
  );
}
