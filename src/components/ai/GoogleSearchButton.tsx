import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export const GoogleSearchButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const searchGoogle = () => {
    const q = query.trim();
    if (!q) return;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed right-4 bottom-24 lg:bottom-6 z-50">
      {open && (
        <div className="mb-2 w-[min(92vw,360px)] rounded-2xl border border-slate-700 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-black text-white">Google — пошук по всьому вебу</div>
            <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-white" aria-label="Закрити">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); searchGoogle(); }} className="flex gap-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Що знайти в Google?"
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
            />
            <button type="submit" className="rounded-xl bg-cyan-600 px-3 text-white hover:bg-cyan-500" aria-label="Шукати в Google">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 rounded-full border border-cyan-500/40 bg-slate-950/95 px-4 py-3 text-sm font-bold text-cyan-200 shadow-xl backdrop-blur-xl hover:border-cyan-400 hover:text-white"
        title="Відкрити Google пошук"
      >
        <Search className="w-4 h-4" />
        <span>Google</span>
      </button>
    </div>
  );
};
