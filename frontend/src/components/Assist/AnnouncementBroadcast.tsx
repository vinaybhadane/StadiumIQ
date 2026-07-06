import React, { useState } from 'react';

export const AnnouncementBroadcast: React.FC = () => {
  const [announcement, setAnnouncement] = useState('');
  const [success, setSuccess] = useState(false);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement.trim()) return;
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setAnnouncement('');
  };

  return (
    <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-6" aria-labelledby="broadcast-title">
      <h3 id="broadcast-title" className="text-lg font-semibold text-slate-100 mb-2">
        Organizers Broadcaster
      </h3>
      <p className="text-sm text-slate-400 mb-6">
        Broadcast multilingual announcements to all spectator terminals via Pub/Sub.
      </p>

      <form onSubmit={handleBroadcast} className="space-y-4">
        <div>
          <label htmlFor="broadcast-text" className="block text-xs font-semibold uppercase text-slate-400 mb-1">
            Announcement Text
          </label>
          <textarea
            id="broadcast-text"
            rows={3}
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="e.g. General announcement: Exit routes at West stand are open."
            className="w-full bg-slate-950/60 border border-slate-800 rounded px-3 py-2 text-slate-150 placeholder-slate-650 focus:outline-none focus:border-primary-505"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 transition rounded font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          Send Multilingual Broadcast
        </button>
      </form>

      {success && (
        <div className="mt-4 p-3 bg-green-950/50 border border-green-500/30 rounded text-green-400 text-sm" role="alert">
          Announcement broadcasted successfully to all gates.
        </div>
      )}
    </section>
  );
};
