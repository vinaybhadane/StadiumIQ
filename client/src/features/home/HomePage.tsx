// Landing page: a short orientation and entry points into the two personas.
import { Link } from 'react-router-dom';

/** Home route introducing SmartStadium and linking to both experiences. */
export function LandingPage(): React.JSX.Element {
  return (
    <section aria-labelledby="home-heading" className="stack">
      <div>
        <h1 id="home-heading">Intelligent Venue &amp; Event Management</h1>
        <p className="page-intro">
          SmartStadium is an advanced AI system created for the FIFA World Cup 2026 at Estadio Azteca.
          It provides spectators with multilingual direction support, transit info, and accessibility routing,
          while offering coordinators real-time crowd dynamics and AI situation analysis.
        </p>
      </div>
      <div className="grid-two">
        <div className="card stack">
          <h2>Spectator Experience</h2>
          <p className="muted">
            Retrieve your gate, identify accessible paths, locate multi-faith spaces, or get local transit guidance
            — sourced directly from stadium records in five different languages.
          </p>
          <p>
            <Link className="button" to="/assistant">
              Launch Match Guide
            </Link>
          </p>
        </div>
        <div className="card stack">
          <h2>Event Management</h2>
          <p className="muted">
            Keep tabs on sector occupancy, check active incident logs, oversee green metrics, and request
            an immediate AI report to support venue operations.
          </p>
          <p>
            <Link className="button" to="/operations">
              Enter Command Hub
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
