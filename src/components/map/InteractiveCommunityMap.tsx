import React, { useEffect, useRef, useState } from 'react';
import { INITIAL_INFRASTRUCTURE_NODES } from '../../data/mockData';
import { InfrastructureNode } from '../../types';
import { MapPin, Layers, Search, Shield, Crosshair, AlertTriangle, Building2, TreePine, Bus, LocateFixed, ExternalLink } from 'lucide-react';

const ROKYTNE_CENTER = { lat: 51.2825, lng: 27.2091 };

export const InteractiveCommunityMap: React.FC = () => {
  const [nodes] = useState<InfrastructureNode[]>(INITIAL_INFRASTRUCTURE_NODES);
  const [selectedLayer, setSelectedLayer] = useState('all');
  const [activeNode, setActiveNode] = useState<InfrastructureNode | null>(nodes[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef<HTMLIFrameElement | null>(null);

  const layerOptions = [
    { id: 'all', label: 'Всі обʼєкти', icon: Layers },
    { id: 'shelter', label: 'Укриття', icon: Shield },
    { id: 'medicine', label: 'Медицина', icon: Building2 },
    { id: 'tourism', label: 'Туризм & Озера', icon: TreePine },
    { id: 'transport', label: 'Зупинки', icon: Bus },
    { id: 'problem', label: 'Проблеми', icon: AlertTriangle }
  ];

  const filteredNodes = nodes.filter(node => {
    const matchesLayer = selectedLayer === 'all' || node.category === selectedLayer;
    const text = `${node.title || node.name || ''} ${node.address || ''}`.toLowerCase();
    return matchesLayer && text.includes(searchQuery.toLowerCase());
  });

  // Google Maps without Maps JavaScript API: the map itself is loaded by the
  // normal Google Maps web URL. No API key or Google Cloud project is needed.
  const googleMapUrl = `https://www.google.com/maps?q=${ROKYTNE_CENTER.lat},${ROKYTNE_CENTER.lng}&z=13&output=embed`;

  const openGoogleMaps = () => {
    if (!activeNode?.coordinates) {
      window.open(`https://www.google.com/maps/@${ROKYTNE_CENTER.lat},${ROKYTNE_CENTER.lng},13z`, '_blank', 'noopener,noreferrer');
      return;
    }
    const { lat, lng } = activeNode.coordinates;
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank', 'noopener,noreferrer');
  };

  const openRoute = () => {
    if (!activeNode?.coordinates) return;
    const { lat, lng } = activeNode.coordinates;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank', 'noopener,noreferrer');
  };

  const locateUser = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      window.open(`https://www.google.com/maps/@${coords.latitude},${coords.longitude},16z`, '_blank', 'noopener,noreferrer');
    });
  };

  // When a local object is selected, update the iframe to that object's
  // coordinates. Google renders the actual map; we do not need an API key.
  useEffect(() => {
    if (!mapRef.current || !activeNode?.coordinates) return;
    const { lat, lng } = activeNode.coordinates;
    mapRef.current.src = `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
  }, [activeNode]);

  return (
    <div className="space-y-4 text-slate-100 animate-fadeIn">
      <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full md:w-auto">
          {layerOptions.map(layer => {
            const Icon = layer.icon;
            const isActive = selectedLayer === layer.id;
            return (
              <button key={layer.id} onClick={() => setSelectedLayer(layer.id)} className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 border ${isActive ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'}`}>
                <Icon className="w-3.5 h-3.5" />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Пошук об'єкта на карті..." className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-500" />
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/90 overflow-hidden shadow-2xl">
        <div className="h-[520px] relative">
          <iframe
            ref={mapRef}
            title="Google Maps — Рокитнівська громада"
            src={googleMapUrl}
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 backdrop-blur-md">
            Рокитне • 51.2825° N, 27.2091° E • GOOGLE MAPS
          </div>
          <button onClick={locateUser} className="absolute bottom-4 right-4 z-10 w-11 h-11 rounded-xl bg-slate-950/90 border border-slate-700 text-cyan-300 flex items-center justify-center shadow-xl" title="Моє місцезнаходження">
            <LocateFixed className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500">
          Google Maps підключено без Google Maps JavaScript API key. Об'єкти громади вибираються у панелі праворуч.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 rounded-2xl bg-slate-950/90 border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div><h3 className="font-black text-white">Об'єкти громади</h3><p className="text-xs text-slate-500">{filteredNodes.length} знайдено</p></div>
            <button onClick={openGoogleMaps} className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 hover:text-cyan-200"><ExternalLink className="w-3.5 h-3.5" />Відкрити Google Maps</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[330px] overflow-y-auto pr-1">
            {filteredNodes.map(node => (
              <button key={node.id} onClick={() => setActiveNode(node)} className={`text-left p-3 rounded-xl border transition ${activeNode?.id === node.id ? 'bg-cyan-950/60 border-cyan-500/50' : 'bg-slate-900 border-slate-800 hover:border-cyan-500/30'}`}>
                <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" /><div className="min-w-0"><div className="text-xs font-bold text-white truncate">{node.title || node.name}</div><div className="text-[10px] text-slate-500 mt-1 truncate">{node.address}</div></div></div>
              </button>
            ))}
            {!filteredNodes.length && <div className="col-span-full text-center py-8 text-xs text-slate-500">Нічого не знайдено.</div>}
          </div>
        </div>

        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-2xl">
          {activeNode ? <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3"><div><span className="px-2.5 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold uppercase">{activeNode.category}</span><h3 className="text-base font-black text-white mt-1">{activeNode.title || activeNode.name}</h3></div><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse mt-1" /></div>
            <div className="text-xs text-slate-300 space-y-2"><p className="leading-relaxed">{activeNode.description}</p><div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1"><div><strong>Адреса:</strong> {activeNode.address}</div>{activeNode.coordinates && <div><strong>Координати:</strong> {activeNode.coordinates.lat.toFixed(5)}, {activeNode.coordinates.lng.toFixed(5)}</div>}{activeNode.status && <div><strong>Статус:</strong> <span className="text-emerald-400">{activeNode.status}</span></div>}{activeNode.capacity && <div><strong>Місткість:</strong> {activeNode.capacity} осіб</div>}{activeNode.workingHours && <div><strong>Графік:</strong> {activeNode.workingHours}</div>}{activeNode.contactPhone && <div><strong>Телефон:</strong> {activeNode.contactPhone}</div>}</div></div>
            <div className="grid grid-cols-2 gap-2"><button onClick={openRoute} disabled={!activeNode.coordinates} className="py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2"><Crosshair className="w-4 h-4" />Маршрут</button><button onClick={openGoogleMaps} className="py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2"><ExternalLink className="w-4 h-4" />Показати</button></div>
          </div> : <div className="text-center py-12 text-slate-500 text-xs">Оберіть об'єкт</div>}
        </div>
      </div>
    </div>
  );
};
