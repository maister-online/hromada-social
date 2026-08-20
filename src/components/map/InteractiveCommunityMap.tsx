import React, { useEffect, useRef, useState } from 'react';
import { INITIAL_INFRASTRUCTURE_NODES } from '../../data/mockData';
import { InfrastructureNode } from '../../types';
import {
  MapPin, Layers, Search, Shield, Crosshair, AlertTriangle, Compass,
  Building2, TreePine, Bus, LocateFixed, ExternalLink
} from 'lucide-react';

const ROKYTNE_CENTER = { lat: 51.2825, lng: 27.2091 };
const GOOGLE_MAPS_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();

declare global {
  interface Window { google?: typeof google; }
}

function loadGoogleMaps(): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (!GOOGLE_MAPS_KEY) return Promise.reject(new Error('Не задано VITE_GOOGLE_MAPS_API_KEY'));

  const existing = document.querySelector('script[data-google-maps="hromada-social"]') as HTMLScriptElement | null;
  if (existing) return new Promise((resolve, reject) => {
    existing.addEventListener('load', () => resolve());
    existing.addEventListener('error', () => reject(new Error('Google Maps не завантажився')));
  });

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.dataset.googleMaps = 'hromada-social';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_KEY)}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Не вдалося завантажити Google Maps'));
    document.head.appendChild(script);
  });
}

export const InteractiveCommunityMap: React.FC = () => {
  const [nodes] = useState<InfrastructureNode[]>(INITIAL_INFRASTRUCTURE_NODES);
  const [selectedLayer, setSelectedLayer] = useState<string>('all');
  const [activeNode, setActiveNode] = useState<InfrastructureNode | null>(nodes[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapError, setMapError] = useState('');
  const mapRef = useRef<HTMLDivElement | null>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

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
    const text = `${n.title || n.name || ''} ${n.address || ''}`.toLowerCase();
    return matchesLayer && text.includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapRef.current || !window.google) return;
        googleMapRef.current = new google.maps.Map(mapRef.current, {
          center: ROKYTNE_CENTER,
          zoom: 13,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          mapTypeId: 'roadmap',
        });
        setMapError('');
      })
      .catch((error) => {
        if (!cancelled) setMapError(error instanceof Error ? error.message : 'Помилка Google Maps');
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const map = googleMapRef.current;
    if (!map || !window.google) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    filteredNodes.forEach(node => {
      if (!node.coordinates) return;
      const marker = new google.maps.Marker({
        map,
        position: node.coordinates,
        title: node.title || node.name,
        label: { text: '●', color: '#06b6d4', fontSize: '22px' },
      });
      marker.addListener('click', () => {
        setActiveNode(node);
        map.panTo(node.coordinates!);
        map.setZoom(Math.max(map.getZoom() || 13, 15));
      });
      markersRef.current.push(marker);
    });

    return () => markersRef.current.forEach(marker => marker.setMap(null));
  }, [filteredNodes]);

  const locateUser = () => {
    if (!navigator.geolocation || !googleMapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = { lat: coords.latitude, lng: coords.longitude };
        googleMapRef.current?.panTo(position);
        googleMapRef.current?.setZoom(16);
        new google.maps.Marker({ map: googleMapRef.current!, position, title: 'Ви тут', label: 'Я' });
      },
      () => setMapError('Не вдалося отримати ваше місцезнаходження. Дозвольте доступ до геолокації.')
    );
  };

  const openRoute = () => {
    if (!activeNode?.coordinates) return;
    const { lat, lng } = activeNode.coordinates;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4 text-slate-100 animate-fadeIn">
      <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full md:w-auto">
          {layerOptions.map(l => {
            const Icon = l.icon;
            const isActive = selectedLayer === l.id;
            return <button key={l.id} onClick={() => setSelectedLayer(l.id)} className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 border ${isActive ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'}`}><Icon className="w-3.5 h-3.5" /><span>{l.label}</span></button>;
          })}
        </div>
        <div className="relative w-full md:w-64"><Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" /><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Пошук об'єкта на карті..." className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-500" /></div>
      </div>

      {mapError && <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4 text-xs text-amber-200"><strong>Google Maps:</strong> {mapError}<div className="mt-1 text-amber-300/70">Для продакшену додайте VITE_GOOGLE_MAPS_API_KEY у змінні середовища Render.</div></div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 h-[520px] rounded-2xl bg-slate-950 border border-cyan-500/30 overflow-hidden relative shadow-2xl">
          <div ref={mapRef} className="absolute inset-0" />
          {!GOOGLE_MAPS_KEY && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 p-6 text-center"><div><MapPin className="w-10 h-10 text-cyan-400 mx-auto mb-3" /><div className="font-black text-white">Потрібен ключ Google Maps</div><div className="text-xs text-slate-500 mt-2 max-w-sm">Коли VITE_GOOGLE_MAPS_API_KEY буде доданий у Render, тут автоматично з'явиться справжня карта Google.</div></div></div>}
          <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 backdrop-blur-md flex items-center gap-2"><Compass className="w-4 h-4 text-cyan-400" /><span>Рокитне • 51.2825° N, 27.2091° E</span></div>
          <button onClick={locateUser} className="absolute bottom-4 right-4 z-10 w-11 h-11 rounded-xl bg-slate-950/90 border border-slate-700 text-cyan-300 flex items-center justify-center shadow-xl" title="Моє місцезнаходження"><LocateFixed className="w-5 h-5" /></button>
        </div>

        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-2xl">
          {activeNode ? <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3"><div><span className="px-2.5 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold uppercase">{activeNode.category}</span><h3 className="text-base font-black text-white mt-1">{activeNode.title || activeNode.name}</h3></div><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse mt-1" /></div>
            <div className="text-xs text-slate-300 space-y-2"><p className="leading-relaxed">{activeNode.description}</p><div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1"><div><strong>Адреса:</strong> {activeNode.address}</div>{activeNode.coordinates && <div><strong>Координати:</strong> {activeNode.coordinates.lat.toFixed(5)}, {activeNode.coordinates.lng.toFixed(5)}</div>}<div><strong>Статус:</strong> <span className="text-emerald-400">{activeNode.status}</span></div>{activeNode.capacity && <div><strong>Місткість:</strong> {activeNode.capacity} осіб</div>}{activeNode.workingHours && <div><strong>Графік:</strong> {activeNode.workingHours}</div>}{activeNode.contactPhone && <div><strong>Телефон:</strong> {activeNode.contactPhone}</div>}</div></div>
            <div className="grid grid-cols-2 gap-2"><button onClick={openRoute} disabled={!activeNode.coordinates} className="py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2"><Crosshair className="w-4 h-4" />Маршрут</button><button onClick={() => activeNode.coordinates && googleMapRef.current?.panTo(activeNode.coordinates)} disabled={!activeNode.coordinates} className="py-2.5 rounded-xl bg-slate-900 border border-slate-700 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2"><ExternalLink className="w-4 h-4" />Показати</button></div>
          </div> : <div className="text-center py-12 text-slate-500 text-xs">Оберіть маркер на карті</div>}
        </div>
      </div>
    </div>
  );
};
