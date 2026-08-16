import React, { useState } from 'react';
import { INFRASTRUCTURE_NODES } from '../data/mockData';
import { InfrastructureNode } from '../types';
import {
  MapPin,
  Building2,
  Building,
  HeartPulse,
  GraduationCap,
  Shield,
  Truck,
  Phone,
  Clock,
  Navigation,
  Compass,
  Filter,
  ExternalLink,
  Sparkles,
  Search,
  Zap
} from 'lucide-react';

interface InteractiveMapTabProps {
  onAskAi: (prompt: string) => void;
}

export const InteractiveMapTab: React.FC<InteractiveMapTabProps> = ({ onAskAi }) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeNode, setActiveNode] = useState<InfrastructureNode | null>(INFRASTRUCTURE_NODES[0]);
  const [invincibilityOnly, setInvincibilityOnly] = useState<boolean>(false);

  const nodeTypes = [
    { id: 'all', label: 'Всі об\'єкти', icon: Compass },
    { id: 'cnap', label: 'Рада & ЦНАП', icon: Building2 },
    { id: 'starosta', label: 'Старостати', icon: Building },
    { id: 'medical', label: 'Медичні заклади', icon: HeartPulse },
    { id: 'education', label: 'Школи & Садочки', icon: GraduationCap },
    { id: 'shelter', label: 'Укриття & Незламність', icon: Shield },
    { id: 'communal', label: 'Комунальні служби', icon: Truck },
  ];

  const filteredNodes = INFRASTRUCTURE_NODES.filter((node) => {
    const matchesType = selectedType === 'all' || node.type === selectedType;
    const matchesInvincibility = !invincibilityOnly || node.isPointOfInvincibility;
    const matchesSearch =
      searchQuery.trim() === '' ||
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.settlement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesInvincibility && matchesSearch;
  });

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'cnap': return <Building2 className="w-4 h-4 text-cyan-400" />;
      case 'starosta': return <Building className="w-4 h-4 text-indigo-400" />;
      case 'medical': return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'education': return <GraduationCap className="w-4 h-4 text-amber-400" />;
      case 'shelter': return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'communal': return <Truck className="w-4 h-4 text-teal-400" />;
      default: return <MapPin className="w-4 h-4 text-sky-400" />;
    }
  };

  const getNodeBadgeColor = (type: string) => {
    switch (type) {
      case 'cnap': return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'starosta': return 'bg-indigo-950 text-indigo-300 border-indigo-800';
      case 'medical': return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'education': return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'shelter': return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      default: return 'bg-slate-900 text-slate-300 border-slate-800';
    }
  };

  // Convert lat/lng to stylized SVG canvas coordinate (Rokytne Region Bounding Box)
  // Lat range: 51.18 to 51.36 | Lng range: 27.05 to 27.38
  const getCanvasPos = (lat: number, lng: number) => {
    const minLat = 51.15, maxLat = 51.38;
    const minLng = 27.02, maxLng = 27.39;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;

    return { x: Math.max(8, Math.min(92, x)), y: Math.max(8, Math.min(92, y)) };
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Cosmic Map Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-cyan-500/30 p-8 shadow-2xl overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            Інтерактивна Карта Муніципальної Мережі
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Гео-Інформаційна Схема Рокитнівської Громади
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Повний каталог закладів, віддалених робочих місць ЦНАП, старостинських округів, лікарень, шкіл, пунктів незламності та укриттів Рокитнівської громади.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setInvincibilityOnly(!invincibilityOnly)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-2 ${
                invincibilityOnly
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{invincibilityOnly ? 'Показано тільки Пункти Незламності' : 'Фільтр: Пункти Незламності'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        {nodeTypes.map((t) => {
          const IconComp = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
                selectedType === t.id
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white border-cyan-400 shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Map Layout: Left Stylized Vector Map + Right Node Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vector SVG Stylized Map Viewport */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden min-h-[480px] flex flex-col justify-between">
          {/* Cosmic Grid & Galaxy background overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Map Title Header */}
          <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-extrabold text-slate-200">
                Карта Рівненська обл., Рокитнівський р-н
              </span>
            </div>
            <span className="text-[11px] text-cyan-400 font-medium">
              Знайдено {filteredNodes.length} об'єктів
            </span>
          </div>

          {/* Map Vector Stage Canvas */}
          <div className="relative flex-1 my-4 border border-slate-800/80 rounded-2xl bg-slate-900/60 overflow-hidden shadow-inner flex items-center justify-center">
            {/* SVG Roads & Hromada Contour lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Regional River / Contour curves */}
              <path
                d="M 10 20 Q 30 50, 50 40 T 90 80"
                fill="none"
                stroke="#0284c7"
                strokeWidth="0.6"
                strokeOpacity="0.4"
                strokeDasharray="2 2"
              />
              <path
                d="M 20 80 Q 60 70, 80 20"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="0.8"
                strokeOpacity="0.3"
              />

              {/* Connecting Hromada Network Mesh Lines */}
              {filteredNodes.map((node, i) => {
                if (i === 0) return null;
                const posA = getCanvasPos(filteredNodes[0].coordinates.lat, filteredNodes[0].coordinates.lng);
                const posB = getCanvasPos(node.coordinates.lat, node.coordinates.lng);
                return (
                  <line
                    key={node.id}
                    x1={posA.x}
                    y1={posA.y}
                    x2={posB.x}
                    y2={posB.y}
                    stroke="#1e293b"
                    strokeWidth="0.4"
                    strokeDasharray="1 1"
                  />
                );
              })}
            </svg>

            {/* Interactive Node Pins */}
            {filteredNodes.map((node) => {
              const pos = getCanvasPos(node.coordinates.lat, node.coordinates.lng);
              const isActive = activeNode?.id === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => setActiveNode(node)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  {/* Glowing Radar Ring if active */}
                  {isActive && (
                    <div className="absolute inset-0 w-8 h-8 -left-2 -top-2 rounded-full border-2 border-cyan-400 animate-ping opacity-75 pointer-events-none" />
                  )}

                  <div
                    className={`p-2 rounded-xl border transition-all duration-300 shadow-xl flex items-center justify-center ${
                      isActive
                        ? 'bg-cyan-500 text-white border-cyan-300 scale-125 z-30 shadow-cyan-500/50'
                        : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-cyan-400 hover:scale-110'
                    }`}
                  >
                    {getNodeIcon(node.type)}
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-40">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-100 text-[10px] font-bold whitespace-nowrap border border-slate-700 shadow-xl">
                      {node.settlement} — {node.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Legend Footer */}
          <div className="relative z-10 pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> ЦНАП
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-400" /> Старостати
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Лікарні
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Укриття
              </span>
            </div>
            <span>Клацніть маркер для перегляду деталей</span>
          </div>
        </div>

        {/* Right Node Detail Card & List Search */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук за назвою або населеним пунктом..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Active Node Detail Card */}
          {activeNode ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${getNodeBadgeColor(activeNode.type)}`}>
                    {activeNode.settlement}
                  </span>
                  <h2 className="text-lg font-extrabold text-white mt-2 leading-snug">
                    {activeNode.name}
                  </h2>
                </div>

                {activeNode.isPointOfInvincibility && (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold flex items-center gap-1 shrink-0">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    Пункт Незламності
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                {activeNode.description}
              </p>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{activeNode.address}, {activeNode.settlement}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href={`tel:${activeNode.phone}`} className="text-cyan-400 hover:underline font-semibold">
                    {activeNode.phone}
                  </a>
                </div>

                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{activeNode.hours}</span>
                </div>

                {activeNode.headName && (
                  <div className="flex items-center gap-2.5 pt-1 text-slate-400">
                    <Building className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{activeNode.headName}</span>
                  </div>
                )}
              </div>

              {activeNode.servicesAvailable && activeNode.servicesAvailable.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Доступні послуги:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeNode.servicesAvailable.map((svc, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 text-[11px]">
                        • {svc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => onAskAi(`Як дістатися та графік роботи: ${activeNode.name} у ${activeNode.settlement}`)}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Запитати у AI-робота
                </button>

                <a
                  href={`https://maps.google.com/?q=${activeNode.coordinates.lat},${activeNode.coordinates.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4 text-cyan-400" />
                  Маршрут
                </a>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-900 rounded-2xl border border-slate-800">
              Оберіть об'єкт на карті для детальної інформації
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
