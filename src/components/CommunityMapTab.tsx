import React, { useState } from 'react';
import { INFRASTRUCTURE_NODES } from '../data/mockData';
import { InfrastructureNode } from '../types';
import {
  MapPin,
  Building2,
  Phone,
  Clock,
  ShieldAlert,
  Search,
  Crosshair,
  Compass,
  Zap,
  ExternalLink,
  ChevronRight,
  School,
  Activity,
  Home,
  Waves
} from 'lucide-react';

interface CommunityMapTabProps {
  onNavigateTab: (tab: string, payload?: any) => void;
}

export const CommunityMapTab: React.FC<CommunityMapTabProps> = ({ onNavigateTab }) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSettlement, setSelectedSettlement] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeNode, setActiveNode] = useState<InfrastructureNode>(INFRASTRUCTURE_NODES[0]);

  const filteredNodes = INFRASTRUCTURE_NODES.filter((node) => {
    const matchesType = selectedType === 'all' || node.type === selectedType;
    const matchesSettlement = selectedSettlement === 'all' || node.settlement === selectedSettlement;
    const matchesSearch =
      searchQuery === '' ||
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSettlement && matchesSearch;
  });

  const settlements = [
    'all',
    'смт Рокитне',
    'с. Блажове',
    'с. Кисоричі',
    'с. Сновидовичі',
    'смт Томашгород',
    'с. Березнове'
  ];

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'cnap': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'starosta': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'medical': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'education': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'shelter': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default: return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cnap': return <Building2 className="w-4 h-4 text-cyan-400" />;
      case 'starosta': return <Home className="w-4 h-4 text-indigo-400" />;
      case 'medical': return <Activity className="w-4 h-4 text-rose-400" />;
      case 'education': return <School className="w-4 h-4 text-amber-400" />;
      case 'shelter': return <Zap className="w-4 h-4 text-emerald-400" />;
      default: return <MapPin className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-12 text-slate-100">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-indigo-500/30 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Інтерактивна Карта та Мережа Закладів</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Інфраструктура Рокитнівської Громади
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl">
              Швидкий пошук старостинських округів, лікарень, опорних шкіл, Пунктів Незламності та ЦНАПу на єдиній інтерактивній карті.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelectedType('shelter');
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/50 text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
            >
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Пункти Незламності</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map + Sidebar Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map Stage */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter Toolbar */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  selectedType === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-400'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Усі об'єкти
              </button>
              <button
                onClick={() => setSelectedType('cnap')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  selectedType === 'cnap'
                    ? 'bg-cyan-600 text-white border-cyan-400'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                ЦНАП та Селищна рада
              </button>
              <button
                onClick={() => setSelectedType('starosta')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  selectedType === 'starosta'
                    ? 'bg-indigo-600 text-white border-indigo-400'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Старостати
              </button>
              <button
                onClick={() => setSelectedType('medical')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  selectedType === 'medical'
                    ? 'bg-rose-600 text-white border-rose-400'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Лікарні
              </button>
            </div>

            <div className="relative w-full sm:w-48">
              <input
                type="text"
                placeholder="Пошук об'єкта..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Map Simulation Container */}
          <div className="relative w-full h-[480px] bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            {/* Dark Styled Map Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

            {/* Stylized River Line representing Rokytne region waters */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 800 500">
              <path d="M0 100 C 200 180, 400 120, 800 350" stroke="#0284c7" strokeWidth="12" fill="none" strokeLinecap="round" />
            </svg>

            {/* Map Markers */}
            <div className="absolute inset-0 p-8 flex flex-wrap items-center justify-around">
              {filteredNodes.map((node, index) => {
                const isActive = activeNode.id === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => setActiveNode(node)}
                    className={`relative group transition-transform hover:scale-110 focus:outline-none m-4`}
                  >
                    {/* Pulsing ring for selected marker or Point of Invincibility */}
                    {(isActive || node.isPointOfInvincibility) && (
                      <span className="absolute -inset-2 rounded-full bg-cyan-400/30 animate-ping" />
                    )}

                    <div
                      className={`relative z-10 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border shadow-xl transition-all ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 border-white scale-110 shadow-cyan-500/50'
                          : 'bg-slate-900/95 text-slate-200 border-slate-700 hover:border-cyan-400'
                      }`}
                    >
                      {getTypeIcon(node.type)}
                      <span className="max-w-[120px] truncate">{node.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Floating Compass / Info Badge */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-2 backdrop-blur-md">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              <span>Рокитнівський район, Рівненська область</span>
            </div>
          </div>
        </div>

        {/* Right Column: Active Node Details Panel */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between backdrop-blur-md">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeBadgeColor(activeNode.type)}`}>
                {activeNode.settlement}
              </span>

              {activeNode.isPointOfInvincibility && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" /> Пункт Незламності
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-white">
              {activeNode.name}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeNode.description}
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-400">Точна адреса:</div>
                  <div className="font-semibold text-slate-200">{activeNode.address}, {activeNode.settlement}</div>
                </div>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-400">Графік прийому:</div>
                  <div className="font-semibold text-slate-200">{activeNode.hours}</div>
                </div>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-400">Телефон для довідок:</div>
                  <div className="font-bold text-cyan-300">{activeNode.phone}</div>
                </div>
              </div>

              {activeNode.headName && (
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Керівництво / Контактна особа:</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{activeNode.headName}</div>
                </div>
              )}

              {activeNode.servicesAvailable && (
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[11px] mb-1.5">Доступні послуги:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeNode.servicesAvailable.map((srv, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[11px] text-cyan-300">
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 mt-6 space-y-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${activeNode.coordinates.lat},${activeNode.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Прокласти маршрут на картах</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
