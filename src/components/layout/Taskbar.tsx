import React from 'react';
import { useWindowContext } from '../../context/WindowContext';
import { LayoutGrid, Layers, Bot, MapPin, CloudSun, Shield, FileText, MessageSquare } from 'lucide-react';

export const Taskbar: React.FC = () => {
  const { windows, bringToFront, activeWindowId, minimizeWindow } = useWindowContext();

  if (windows.length === 0) return null;

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[120] max-w-2xl w-[92%] sm:w-auto px-4 py-2 rounded-2xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3 animate-fadeIn">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
        <div className="flex items-center gap-1 text-xs font-bold text-slate-400 border-r border-slate-800 pr-2.5 mr-1 shrink-0">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">OS Taskbar</span>
        </div>

        {windows.map(win => {
          const isActive = activeWindowId === win.id && !win.isMinimized;

          return (
            <button
              key={win.id}
              onClick={() => {
                if (isActive) {
                  minimizeWindow(win.id);
                } else {
                  bringToFront(win.id);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600/90 to-teal-600/90 text-white border-cyan-400/50 shadow-md shadow-cyan-500/20'
                  : win.isMinimized
                  ? 'bg-slate-900/60 text-slate-500 border-slate-800 hover:text-slate-300'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-ping' : win.isMinimized ? 'bg-slate-600' : 'bg-cyan-400'}`} />
              <span className="truncate max-w-[120px] sm:max-w-[160px]">{win.title}</span>
            </button>
          );
        })}
      </div>

      <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800 text-[11px] text-slate-400 font-mono shrink-0">
        <span className="text-cyan-300 font-bold">{windows.length}</span> активні
      </div>
    </div>
  );
};
