import React, { useState } from 'react';
import { INITIAL_INFRASTRUCTURE_NODES } from '../../data/mockData';
import { InfrastructureNode } from '../../types';
import {
  MapPin,
  Layers,
  Search,
  Shield,
  Crosshair,
  AlertTriangle,
  Compass,
  Building2,
  TreePine,
  Bus,
  Sparkles,
  Info
} from 'lucide-react';

export const InteractiveCommunityMap: React.FC = () => {
  const [nodes] = useState<InfrastructureNode[]>(INITIAL_INFRASTRUCTURE_NODES);
  const [selectedLayer, setSelectedLayer] = useState<string>('all');
  const [activeNode, setActiveNode] = useState<InfrastructureNode | null>(nodes[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const layerOptions = [
    { id: 'all', label: 'Всі обʼєкти', icon: Layers },
    { id: 'shelter', label: 'Укриття', icon: Shield },
    { id: 'medicine', label: 'Медицина', icon: Building2 },
    { id: 'tourism', label: 'Туризм & Озера', icon: TreePine },
    { id: 'transport', label: 'Зупинки', icon: Bus },
    { id: 'problem', label: 'Проблеми', icon: AlertTriangle }
  ];

  const filteredNodes = nodes.filter(n => {
    const matchesLayer = selectedLayer === 'all' || n.category === selectedLayer;
    const matchesQuery = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         n.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLayer && matchesQuery;
  });

  return (
    <div className="space-y-4 text-slate-100 animate-fadeIn">
      {/* Top Map Layer Selector Bar */}
      <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full md:w-auto">
          {layerOptions.map(l => {
            const Icon = l.icon;
            const isActive = selectedLayer === l.id;

            return (
              <button
                key={l.id}
                onClick={() => setSelectedLayer(l.id)}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                  isActive
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{l.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Пошук об'єкта на карті..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Main Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Interactive GIS Visualizer Canvas */}
        <div className="lg:col-span-8 h-[520px] rounded-2xl bg-slate-950 border border-cyan-500/30 overflow-hidden relative shadow-2xl flex flex-col items-center justify-center">
          {/* Simulated Cartographic Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-95" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-25" />

          {/* Top GIS Status Overlay */}
          <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 backdrop-blur-md flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span>51.2825° N, 27.2091° E • ГІС РОКИТНІВСЬКОГО РАЙОНУ</span>
          </div>

          {/* Pin Markers rendering over map coordinates */}
          <div className="relative w-full h-full p-8 flex flex-wrap items-center justify-around z-10">
            {filteredNodes.map(node => {
              const isSelected = activeNode?.id === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => setActiveNode(node)}
                  className={`cursor-pointer transition-all duration-300 transform hover:scale-125 p-2 rounded-2xl border flex flex-col items-center gap-1 backdrop-blur-md ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-white ring-4 ring-cyan-500/40 scale-110 z-30 shadow-2xl'
                      : node.category === 'shelter'
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                      : node.category === 'problem'
                      ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                      : 'bg-slate-900/90 text-cyan-300 border-cyan-500/30'
                  }`}
                >
                  <MapPin className="w-5 h-5 fill-current" />
                  <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-950/80 text-white max-w-[100px] truncate">
                    {node.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Marker Details Drawer */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-2xl">
          {activeNode ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold uppercase">
                    {activeNode.category}
                  </span>
                  <h3 className="text-base font-black text-white mt-1">{activeNode.title}</h3>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse mt-1" />
              </div>

              <div className="text-xs text-slate-300 space-y-2">
                <p className="leading-relaxed">{activeNode.description}</p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1">
                  <div><strong>Адреса:</strong> {activeNode.address}</div>
                  <div><strong>Статус:</strong> <span className="text-emerald-400">{activeNode.status}</span></div>
                  {activeNode.capacity && <div><strong>Місткість:</strong> {activeNode.capacity} осіб</div>}
                  {activeNode.workingHours && <div><strong>Графік:</strong> {activeNode.workingHours}</div>}
                  {activeNode.contactPhone && <div><strong>Телефон:</strong> {activeNode.contactPhone}</div>}
                </div>
              </div>

              <button
                onClick={() => alert(`Побудова гео-маршруту до ${activeNode.title}`)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crosshair className="w-4 h-4" />
                <span>Побудувати маршрут</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Оберіть маркер на карті для перегляду деталей
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
