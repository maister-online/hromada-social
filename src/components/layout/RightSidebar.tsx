import React from 'react';
import { useWindowContext } from '../../context/WindowContext';
import { WeatherModalView } from '../weather/WeatherModalView';
import { InteractiveCommunityMap } from '../map/InteractiveCommunityMap';
import { Sun, MapPin, ShieldAlert, ExternalLink, Flame, Shield, Ambulance, Wrench, Users, Bot, CalendarDays } from 'lucide-react';

interface RightSidebarProps { onSelectNavTab: (tab: string) => void; }

export const RightSidebar: React.FC<RightSidebarProps> = ({ onSelectNavTab }) => {
  const { openWindow } = useWindowContext();
  const openWeather=()=>openWindow({id:'weather-window',title:'🌦 Погода Рокитного',component:<WeatherModalView/>,initialSize:{width:680,height:520}});
  const openMap=()=>openWindow({id:'map-window',title:'🗺 Карта громади',component:<InteractiveCommunityMap/>,initialSize:{width:840,height:600}});

  return <aside className="w-80 shrink-0 hidden xl:block select-none"><div className="sticky top-20 space-y-4">
    <div className="rounded-3xl border border-white/10 bg-slate-950/65 backdrop-blur-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-xl bg-amber-400/10 flex items-center justify-center"><Sun className="w-4 h-4 text-amber-400"/></div><div><div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Рокитне</div><div className="text-xs font-bold text-white">Погода зараз</div></div></div><button onClick={openWeather} className="text-slate-500 hover:text-cyan-300"><ExternalLink className="w-3.5 h-3.5"/></button></div>
      <div className="flex items-end justify-between"><div><span className="text-4xl font-black text-white tracking-tight">+24°</span><div className="text-[10px] text-slate-500 mt-1">Сонячно • малохмарно</div></div><Sun className="w-12 h-12 text-amber-400/80"/></div>
    </div>

    <div className="rounded-3xl border border-white/10 bg-slate-950/65 backdrop-blur-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-400"/><span className="text-xs font-bold text-white">Карта громади</span></div><button onClick={openMap} className="text-[10px] text-cyan-300">Відкрити</button></div>
      <button onClick={openMap} className="w-full h-28 rounded-2xl overflow-hidden relative border border-white/10 bg-slate-900 text-cyan-300 hover:border-cyan-400/30 transition-all"><div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:18px_18px]"/><div className="relative text-xs font-bold">🗺 Відкрити карту Рокитного</div></button>
    </div>

    <div className="rounded-3xl border border-cyan-400/10 bg-slate-950/65 backdrop-blur-2xl p-4 shadow-xl"><div className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-3">Громада поруч</div>
      <button onClick={()=>onSelectNavTab('residents')} className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/5 text-left"><span className="w-9 h-9 rounded-xl bg-cyan-400/10 flex items-center justify-center"><Users className="w-4 h-4 text-cyan-300"/></span><span><b className="block text-xs text-white">Жителі громади</b><small className="text-[10px] text-slate-500">Знайти людей та друзів</small></span></button>
      <button onClick={()=>onSelectNavTab('events')} className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/5 text-left"><span className="w-9 h-9 rounded-xl bg-amber-400/10 flex items-center justify-center"><CalendarDays className="w-4 h-4 text-amber-300"/></span><span><b className="block text-xs text-white">Події</b><small className="text-[10px] text-slate-500">Що відбувається в громаді</small></span></button>
      <button onClick={()=>onSelectNavTab('chat')} className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/5 text-left"><span className="w-9 h-9 rounded-xl bg-purple-400/10 flex items-center justify-center"><Bot className="w-4 h-4 text-purple-300"/></span><span><b className="block text-xs text-white">Машуня AI</b><small className="text-[10px] text-slate-500">Запитай про громаду</small></span></button>
    </div>

    <div className="rounded-3xl border border-rose-500/15 bg-slate-950/65 backdrop-blur-2xl p-4 shadow-xl"><div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-wider text-rose-300"><ShieldAlert className="w-4 h-4"/> Екстрені служби</div><div className="grid grid-cols-2 gap-2">{[['101','ДСНС',Flame,'text-rose-400'],['102','Поліція',Shield,'text-sky-400'],['103','Швидка',Ambulance,'text-emerald-400'],['104','Газ',Wrench,'text-amber-400']].map(([num,label,Icon,color])=><a key={String(num)} href={`tel:${num}`} className="p-2.5 rounded-xl bg-white/[.03] border border-white/5 hover:bg-white/[.06] text-xs text-slate-200 flex items-center gap-2"><Icon className={`w-4 h-4 ${color}`}/><span>{label} {num}</span></a>)}</div><div className="mt-3 text-[9px] text-slate-600 text-center">Диспетчер селищної ради: +380 (3635) 2-11-22</div></div>
  </div></aside>;
};
