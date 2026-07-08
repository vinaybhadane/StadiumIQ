// Open and recent incidents. Severity is conveyed with a coloured dot plus
// text, and each incident states its zone and status.
import type { EventRecord } from '../../lib/api-types.js';

interface EventIncidentLogProps {
  incidents: EventRecord[];
}

/** List of operational incidents for the command center. */
export function EventIncidentLog({ incidents }: EventIncidentLogProps): React.JSX.Element {
  if (incidents.length === 0) {
    return <p className="muted">No incidents on record.</p>;
  }

  return (
    <ul className="incident-list">
      {incidents.map((incident) => (
        <li key={incident.id} className="incident">
          <span className={`severity-dot severity-dot--${incident.severity}`} aria-hidden="true" />
          <div>
            <p className="incident__summary">{incident.summary}</p>
            <p className="muted incident__meta">
              {incident.severity} severity · {incident.category} · {incident.zoneId} ·{' '}
              {incident.status}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
