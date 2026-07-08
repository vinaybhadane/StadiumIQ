// Shared status surfaces: a loading indicator and an error panel, both
// announced to assistive technology via the appropriate ARIA roles.

interface BusyIndicatorProps {
  label: string;
}

/** Accessible busy indicator with a spinner and a visible label. */
export function BusyIndicator({ label }: BusyIndicatorProps): React.JSX.Element {
  return (
    <p className="status-message" role="status">
      <span className="spinner" aria-hidden="true" /> {label}
    </p>
  );
}

interface FailureNoticeProps {
  message: string;
}

/** Accessible error panel announced through role="alert". */
export function FailureNotice({ message }: FailureNoticeProps): React.JSX.Element {
  return (
    <p className="status-message status-message--error" role="alert">
      {message}
    </p>
  );
}
