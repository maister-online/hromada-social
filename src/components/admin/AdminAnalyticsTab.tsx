import React, { useState } from 'react';
import { ShieldCheck, BarChart3, TrendingUp, Users, AlertTriangle, FileSpreadsheet, Bot, CheckCircle2, Coins, PieChart as PieIcon } from 'lucide-react';
import { BudgetAnalyticsDashboard } from './BudgetAnalyticsDashboard';

export const AdminAnalyticsTab: React.FC = () => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'budget' | 'analytics'>('budget');

  const stats = [
    { label: 'Зареєстровані мешканці', value: '14,820', change: '+12% за місяць', icon: Users, color: 'text-cyan-400' },
    { label: 'Вирішені проблеми', value: '1,240', change: '94% ефективність', icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Електронні петиції', value: '88', change: '12 розглянуто', icon: FileSpreadsheet, color: 'text-purple-400' },
    { label: 'AI аналізів виконано', value: '34,200', change: 'Авто-класифікація', icon: Bot, color: 'text-amber-400' }
  ];

  return (
    <div className="space-y-6 text-slate-100 animate-fadeIn">
      {/* Sub-Navigation Switcher for Admin Panel */}
      <div className="p-2 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveAdminSubTab('budget')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeAdminSubTab === 'budget'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Coins className="w-4 h-4 text-emerald-300" />
            <span>Візуалізація Бюджету (Recharts)</span>
          </button>

          <button
            onClick={() => setActiveAdminSubTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeAdminSubTab === 'analytics'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/25'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-300" />
            <span>Загальна Моніторингова Аналітика</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Синхронізовано з Реєстром Громади 2026</span>
        </div>
      </div>

      {activeAdminSubTab === 'budget' ? (
        <BudgetAnalyticsDashboard />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-cyan-950/80 border border-amber-500/30 flex items-center justify-between shadow-2xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>Панель Управління & Аналітика</span>
              </div>
              <h2 className="text-xl font-black text-white">Адмін-Панель Рокитнівської Громади</h2>
              <p className="text-xs text-slate-300">
                Аналітична панель моніторингу активності мешканців, роботи ЦНАП та автоматичної класифікації звернень.
              </p>
            </div>
          </div>

          {/* Stats Counter Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 shadow-xl">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>{s.label}</span>
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">{s.value}</div>
                  <div className="text-[10px] text-cyan-400 font-mono">{s.change}</div>
                </div>
              );
            })}
          </div>

          {/* Visual Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Розподіл звернень за категоріями</span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <div className="flex justify-between mb-1 text-slate-300">
                    <span>Дороги та інфраструктура</span>
                    <span className="text-cyan-300">42%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-cyan-500 w-[42%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-300">
                    <span>Вуличне освітлення</span>
                    <span className="text-purple-300">28%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-purple-500 w-[28%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-300">
                    <span>Водопостачання та ЖКГ</span>
                    <span className="text-teal-300">18%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-teal-500 w-[18%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-300">
                    <span>Соціальні питання</span>
                    <span className="text-emerald-300">12%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[12%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Log Stream */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="font-bold text-sm text-white flex items-center justify-between">
                <span>Журнал системних подій</span>
                <span className="text-[10px] text-emerald-400 font-mono">LIVE AUDIT</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 space-y-0.5">
                  <div className="text-[10px] text-cyan-400">10:42:15 • AI CLASSIFIER</div>
                  <div>Звернення №393-2026-8812 автоматично скерувати у Відділ ЖКГ.</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 space-y-0.5">
                  <div className="text-[10px] text-emerald-400">10:38:00 • ЦНАП КВИТАНЦІЯ</div>
                  <div>Сформовано талон електронної черги №A-104 (Паспортні послуги).</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 space-y-0.5">
                  <div className="text-[10px] text-purple-400">10:15:22 • ПЕТИЦІЇ</div>
                  <div>Петиція №PET-901 набрала 450 підписів.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

