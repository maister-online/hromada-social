import React from 'react';
import {
  Home,
  Users,
  Video,
  Zap,
  Calendar,
  UserCheck,
  Bot,
  Map,
  Sun,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  Building2,
  Briefcase,
  ShieldCheck,
  Compass,
  FileCheck2,
  Sparkles,
  Landmark,
  Wifi
} from 'lucide-react';

interface LeftSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ activeTab, onSelectTab }) => {
  const menuGroups = [
    {
      title: 'СОЦІАЛЬНА МЕРЕЖА',
      items: [
        { id: 'feed', label: 'Головна Стрічка', icon: Home, badge: 'Соціум' },
        { id: 'reels', label: 'Reels & Відео', icon: Video, badge: 'NEW' },
        { id: 'x-trends', label: 'X-Тренди', icon: Zap },
        { id: 'residents', label: 'Жителі & Друзі', icon: UserCheck, badge: '1,240+' },
        { id: 'groups', label: 'Спільноти & Групи', icon: Users },
        { id: 'events', label: 'Події & Ярмарки', icon: Calendar }
      ]
    },
    {
      title: 'ШІ ПОМІЧНИК & СЕРВІСИ',
      items: [
        { id: 'chat', label: 'AI Машуня (ШІ)', icon: Bot, badge: 'Voice' },
        { id: 'network', label: 'Мережа & Помилки', icon: Wifi, badge: 'Live' },
        { id: 'cnap', label: 'ЦНАП & Послуги', icon: Building2 },
        { id: 'problems', label: 'Проблеми громади', icon: AlertTriangle, highlight: true },
        { id: 'appeals', label: 'Електронні Звернення', icon: FileText },
        { id: 'petitions', label: 'Петиції мешканців', icon: FileSpreadsheet },
        { id: 'starostins', label: 'Старостинські округи', icon: Landmark }
      ]
    },
    {
      title: 'РИНОК & ТУРИЗМ & ДАНІ',
      items: [
        { id: 'business', label: 'Маркетплейс', icon: Briefcase },
        { id: 'tourism', label: 'Туризм & Відпочинок', icon: Compass },
        { id: 'opendata', label: 'Відкрита Громада', icon: FileCheck2 },
        { id: 'map', label: 'Карта Громади', icon: Map },
        { id: 'admin', label: 'Кабінет & Адмінка', icon: ShieldCheck }
      ]
    }
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block space-y-6 select-none">
      <div className="sticky top-20 bg-slate-950/80 rounded-2xl border border-slate-800/80 p-3.5 backdrop-blur-2xl shadow-xl space-y-5">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center justify-between">
              <span>{group.title}</span>
            </div>

            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-600/90 to-teal-600/90 text-white shadow-md shadow-cyan-600/20 border border-cyan-400/40'
                        : item.highlight
                        ? 'text-amber-300 hover:bg-slate-900/90 hover:text-white border border-amber-500/20 bg-amber-950/20'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-cyan-400'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-1.5 py-0.2 text-[9px] rounded-md font-mono font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Footer Banner */}
        <div className="pt-2 border-t border-slate-900">
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/20 text-xs space-y-1.5">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Рокитне Соціум v3.0</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Єдиний онлайн-простір для жителів Рокитнівської громади.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

