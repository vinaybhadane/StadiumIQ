// Application shell: skip link, banner with primary navigation, and the main
// landmark that wraps every route. Provides the semantic structure assistive
// technology relies on.
import { NavLink, Outlet } from 'react-router-dom';

/** Navigation entries for the two personas. */
/** Navigation links for the main routes. */
const HEADER_LINKS = [
  { to: '/assistant', label: 'Match Guide' },
  { to: '/operations', label: 'Command Hub' },
] as const;

/** Top-level layout rendered around every route. */
export function AppLayout(): React.JSX.Element {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="app-header">
        <div className="app-header__inner">
          <div className="brand-container">
            <NavLink to="/" className="brand">
              Smart<span>Stadium</span>
            </NavLink>
          </div>
          <nav className="primary-nav" aria-label="Main Navigation">
            {HEADER_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main id="main-content" className="main" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}
