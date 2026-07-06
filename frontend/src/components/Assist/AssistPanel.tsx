import React, { useState } from 'react';
import { useAssist } from '../../hooks/useAssist';

export const AssistPanel: React.FC = () => {
  const { assistResponse, askAssistant, isLoading, error } = useAssist();
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState('en');
  const [persona, setPersona] = useState('fan');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    askAssistant(query, lang, persona);
  };

  return (
    <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-6" aria-labelledby="assist-title">
      <h3 id="assist-title" className="text-lg font-semibold text-slate-100 mb-2">
        AI Multilingual Assistant (Feature 9)
      </h3>
      <p className="text-sm text-slate-400 mb-6">
        Ask questions in Hindi, Spanish, French, Arabic or English. Prompt input values are checked for safety.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="persona-select" className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Select Your Profile
            </label>
            <select
              id="persona-select"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded px-3 py-2 text-slate-150 focus:outline-none focus:border-primary-505"
            >
              <option value="fan">Fan 🏟️</option>
              <option value="organizer">Organizer 📋</option>
              <option value="volunteer">Volunteer 🙋</option>
              <option value="staff">On-Ground Staff 👷</option>
            </select>
          </div>

          <div>
            <label htmlFor="lang-select" className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Preferred Language
            </label>
            <select
              id="lang-select"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded px-3 py-2 text-slate-150 focus:outline-none focus:border-primary-505"
              aria-label="Select language"
            >
              <option value="en">English (en)</option>
              <option value="hi">Hindi (hi)</option>
              <option value="es">Spanish (es)</option>
              <option value="fr">French (fr)</option>
              <option value="ar">Arabic (ar)</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="query-text" className="block text-xs font-semibold uppercase text-slate-400 mb-1">
            Your Question / Command
          </label>
          <input
            type="text"
            id="query-text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Namaste! Gate 1 kidhar hai?"
            className="w-full bg-slate-950/60 border border-slate-800 rounded px-3 py-2 text-slate-150 placeholder-slate-650 focus:outline-none focus:border-primary-505"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-primary-505 hover:bg-primary-600 disabled:bg-slate-850 disabled:text-slate-500 transition rounded font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary-505"
        >
          {isLoading ? 'Querying Assistant...' : 'Ask Assistant'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-950/40 border border-red-500/30 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {assistResponse && (
        <div className="mt-6 border-t border-slate-800 pt-4 space-y-4" aria-live="polite">
          <div className="flex justify-between items-center text-xs text-slate-450 font-mono">
            <span>Detected Language: {assistResponse.detected_language.toUpperCase()}</span>
            <span>Engine: {assistResponse.source}</span>
          </div>

          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded text-sm text-slate-200">
            <span className="text-xs uppercase font-bold text-primary-400 block mb-2 tracking-widest">
              Assistant Response
            </span>
            <p className="leading-relaxed">{assistResponse.response_text}</p>
          </div>
        </div>
      )}
    </section>
  );
};
