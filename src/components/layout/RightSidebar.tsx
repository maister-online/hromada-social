import React from 'react';
import { useWindowContext } from '../../context/WindowContext';
import { WeatherModalView } from '../weather/WeatherModalView';
import { InteractiveCommunityMap } from '../map/InteractiveCommunityMap';
import {
  Sun,
  MapPin,
  ShieldAlert,
  Phone,
  Bot,
  ExternalLink,
  Flame,
  Shield,
  Ambulance,
  Wrench
} from 'lucide-react';

interface RightSidebarProps {
  onSelectNavTab: (tab: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ onSelectNavTab }) => {
  const { openWindow } = useWindowContext();

  const handleOpenWeather = () => {
    openWindow({
      id: 'weather-window',
      title: '🌦 Погода & Космічний Моніторинг',
      component: <WeatherModalView />,
      initialSize: { width: 680, height: 520 }
    });
  };

  const handleOpenMap = () => {
    openWindow({
      id: 'map-window',
      title: '🗺 Карта Громади & Обʼєкти Інфраструктури',
      component: <InteractiveCommunityMap />,
      initialSize: { width: 840, height: 600 }
    });
  };

  return (
    <aside className="w-80 shrink-0 hidden xl:block space-y-4 select-none">
      <div className="sticky top-20 space-y-4">
        {/* Weather Mini Card Widget */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-cyan-400 font-mono">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>РОКИТНЕ • ПОГОДА</span>
            </span>
            <button
              onClick={handleOpenWeather}
              className="text-[10px] text-cyan-300 hover:underline flex items-center gap-0.5"
            >
              <span>Детально</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-black text-white font-mono">+24°C</div>
              <div className="text-[11px] text-slate-400">Сонячно • Малохмарно</div>
            </div>
            <Sun className="w-10 h-10 text-amber-400 animate-spin-slow" />
          </div>
        </div>

        {/* Mini Map Quick Launcher Widget */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-cyan-400 font-mono">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>ГІС КАРТА ГРОМАДИ</span>
            </span>
            <button
              onClick={handleOpenMap}
              className="text-[10px] text-cyan-300 hover:underline flex items-center gap-0.5"
            >
              <span>Розгорнути</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div
            onClick={handleOpenMap}
            className="h-28 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden relative cursor-pointer group flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-40" />
            <span className="px-3 py-1.5 rounded-xl bg-slate-950/90 text-cyan-300 text-xs font-bold border border-cyan-500/40 backdrop-blur-md group-hover:scale-105 transition-transform">
              🗺 Відкрити карту Рокитного
            </span>
          </div>
        </div>

        {/* Emergency Hotline Services */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-rose-500/30 shadow-xl space-y-2.5">
          <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5 font-mono">
            <ShieldAlert className="w-4 h-4" />
            <span>ЕКСТРЕНІ СЛУЖБИ 24/7</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold font-mono">
            <a
              href="tel:101"
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-slate-200 flex items-center gap-2"
            >
              <Flame className="w-4 h-4 text-rose-500" />
              <span>ДСНС - 101</span>
            </a>
            <a
              href="tel:102"
              className="p-2 rounded-xl bg-slate-900 hover:bg-sky-950/40 border border-slate-800 hover:border-sky-500/40 text-slate-200 flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-sky-400" />
              <span>Поліція - 102</span>
            </a>
            <a
              href="tel:103"
              className="p-2 rounded-xl bg-slate-900 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 text-slate-200 flex items-center gap-2"
            >
              <Ambulance className="w-4 h-4 text-emerald-400" />
              <span>Швидка - 103</span>
            </a>
            <a
              href="tel:104"
              className="p-2 rounded-xl bg-slate-900 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 text-slate-200 flex items-center gap-2"
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Газ - 104</span>
            </a>
          </div>

          <div className="text-[10px] text-slate-400 pt-1 text-center font-mono">
            Диспетчер селищної ради: +380 (3635) 2-11-22
          </div>
        </div>
      </div>
    </aside>
  );
};
