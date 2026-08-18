import React from 'react';
import { Home, Users, Video, Zap, Calendar, UserCheck, Bot, Map, AlertTriangle, FileText, FileSpreadsheet, Building2, Briefcase, ShieldCheck, Compass, FileCheck2, Sparkles, Landmark, Wifi } from 'lucide-react';

interface LeftSidebarProps { activeTab: string; onSelectTab: (tab: string) => void; }

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ activeTab, onSelectTab }) => {
  const groups = [
    { title: 'ТВОЯ ГРОМАДА', items: [
      { id:'feed', label:'Стрічка', icon:Home }, { id:'reels', label:'Відео', icon:Video, badge:'NEW' },
      { id:'residents', label:'Жителі', icon:UserCheck }, { id:'groups', label:'Спільноти', icon:Users }, { id:'events', label:'Події', icon:Calendar }
    ]},
    { title: 'МАШУНЯ ТА СЕРВІСИ', items: [
      { id:'chat', label:'Машуня AI', icon:Bot, badge:'AI' }, { id:'network', label:'Мережа', icon:Wifi },
      { id:'problems', label:'Проблеми громади', icon:AlertTriangle, highlight:true }, { id:'appeals', label:'Звернення', icon:FileText },
      { id:'petitions', label:'Петиції', icon:FileSpreadsheet }, { id:'cnap', label:'ЦНАП та послуги', icon:Building2 }
    ]},
    { title: 'ВІДКРИВАЙ РОКИТНЕ', items: [
      { id:'business', label:'Маркетплейс', icon:Briefcase }, { id:'tourism', label:'Туризм', icon:Compass },
      { id:'starostins', label:'Старостинські округи', icon:Landmark }, { id:'map', label:'Карта', icon:Map }, { id:'opendata', label:'Відкриті дані', icon:FileCheck2 },
      { id:'admin', label:'Кабінет', icon:ShieldCheck }
    ]}
  ];

  return <aside className="w-64 shrink-0 hidden lg:block select-none">
    <div className="sticky top-20 rounded-3xl border border-white/10 bg-slate-950/65 backdrop-blur-2xl p-3 shadow-[0_20px_60px_rgba(0,0,0,.35)]">
      <div className="px-3 pb-3 mb-2 border-b border-white/5 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/><span className="text-[10px] uppercase tracking-[.18em] text-slate-400 font-bold">Громада онлайн</span></div>
      <div className="space-y-5">
        {groups.map((group, gi) => <section key={gi}>
          <div className="px-3 mb-1.5 text-[9px] font-black tracking-[.18em] text-slate-500">{group.title}</div>
          <div className="space-y-1">{group.items.map(item => { const Icon=item.icon; const active=activeTab===item.id; return <button key={item.id} onClick={()=>onSelectTab(item.id)} className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all border ${active ? 'bg-cyan-500/15 border-cyan-400/30 text-white shadow-lg shadow-cyan-950/20' : item.highlight ? 'bg-amber-500/5 border-amber-500/15 text-amber-300 hover:bg-amber-500/10' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <span className="flex items-center gap-3 min-w-0"><span className={`w-8 h-8 rounded-xl flex items-center justify-center ${active?'bg-cyan-400/15 text-cyan-300':'bg-white/[.04] text-slate-400'}`}><Icon className="w-4 h-4"/></span><span className="truncate">{item.label}</span></span>
            {item.badge && <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">{item.badge}</span>}
          </button> })}</div>
        </section>)}
      </div>
      <div className="mt-5 p-3 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-teal-500/5 border border-cyan-400/10"><div className="flex items-center gap-2 text-cyan-300 text-[10px] font-black"><Sparkles className="w-3.5 h-3.5"/> HROMADA SOCIAL</div><p className="mt-1 text-[10px] leading-relaxed text-slate-500">Спілкуйся, знаходь людей, події та сервіси своєї громади.</p></div>
    </div>
  </aside>;
};
