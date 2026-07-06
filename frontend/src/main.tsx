import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/accessibility.css';

// Inject global Tailwind import references inside a root style directory if required
import './index.css';

// Accessibility mounting target
document.documentElement.lang = 'en';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
