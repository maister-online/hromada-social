import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookMarked,
  BookOpen,
  Compass,
  House,
  Navigation,
  Package,
  ScrollText,
  Shield,
  Warehouse,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { LOCATIONS, MAP_IMAGE_URL, formatClock } from '../game/data';
import { LocationDef, LocationId, WeatherType } from '../game/types';

interface PolissiaMapViewProps {
  currentLocationId: LocationId;
  day: number;
  timeOfDay: number;
  weather: WeatherType;
  credits: number;
  goldCoins: number;
  amberShards: number;
  level: number;
  radSuitLevel: number;
  hunger: number;
  keepnetCount: number;
  keepnetWeightKg: number;
  keepnetCapacityKg: number;
  lootCount: number;
  readyQuestsCount: number;
  visitedLocationIds: LocationId[];
  activeGroundbaitLocs: LocationId[];
  muted: boolean;
  onSelectDestination: (locId: LocationId) => void;
  onOpenHome: () => void;
  compact?: boolean;
  onClose?: () => void;
  onOpenInventory: () => void;
  onOpenQuests: () => void;
  onOpenBestiary: () => void;
  onOpenJournal: () => void;
  onToggleMute: () => void;
}


const WEATHER_LABELS: Record<WeatherType, string> = {
  clear: 'Ясно',
  fog: 'Густий туман',
  rain: 'Мряка / Дощ',
};

const MIN_ZOOM = 1; // Карта не зменшується нижче повноекранного масштабу
const MAX_ZOOM = 3.5;

export const PolissiaMapView: React.FC<PolissiaMapViewProps> = ({
  currentLocationId,
  day,
  timeOfDay,
  weather,
  credits,
  goldCoins,
  amberShards,
  level,
  radSuitLevel,
  hunger,
  keepnetCount,
  keepnetWeightKg,
  keepnetCapacityKg,
  lootCount,
  readyQuestsCount,
  visitedLocationIds,
  activeGroundbaitLocs,
  muted,
  onSelectDestination,
  onOpenHome,
  compact = false,
  onClose,
  onOpenInventory,
  onOpenQuests,
  onOpenBestiary,
  onOpenJournal,
  onToggleMute,
}) => {
  const [selectedId, setSelectedId] = useState<LocationId>(
    currentLocationId === 'rokitne_bunker' || currentLocationId === 'rokitne_city' ? 'tomashgorod' : currentLocationId
  );
  const [mapImgErr, setMapImgErr] = useState(false);
  const [mapEditMode, setMapEditMode] = useState(false);
  const [mapPositions, setMapPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    try {
      const raw = window.localStorage.getItem('polissia_map_positions_v1');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [editPositions, setEditPositions] = useState<Record<string, { x: number; y: number }> | null>(null);
  const [draggingMapPoint, setDraggingMapPoint] = useState<string | null>(null);
  const [mapCopyStatus, setMapCopyStatus] = useState('');
  const mapPointPointerRef = useRef<number | null>(null);
  const getMapPosition = (id: string, defaultX: number, defaultY: number) =>
    (editPositions ?? mapPositions)[id] ?? { x: defaultX, y: defaultY };
  const beginMapEdit = () => {
    setEditPositions({ ...mapPositions });
    setMapEditMode(true);
  };
  const cancelMapEdit = () => {
    setEditPositions(null);
    setDraggingMapPoint(null);
    setMapEditMode(false);
  };
  const copyMapPositions = async () => {
    const completePositions = Object.fromEntries([
      ['home', getMapPosition('home', 48.7, 48.4)],
      ...Object.values(LOCATIONS).map((loc) => [loc.id, getMapPosition(loc.id, loc.mapX, loc.mapY)]),
    ]);
    const config = JSON.stringify({ version: 1, map: 'polissia-world-map', positions: completePositions }, null, 2);
    try {
      await navigator.clipboard.writeText(config);
      setMapCopyStatus('Координати скопійовано — надішли їх сюди');
    } catch {
      setMapCopyStatus('Не вдалося скопіювати. Дозволь буфер обміну в браузері');
    }
  };
  const saveMapEdit = () => {
    if (!editPositions) return;
    setMapPositions(editPositions);
    window.localStorage.setItem('polissia_map_positions_v1', JSON.stringify(editPositions));
    setEditPositions(null);
    setDraggingMapPoint(null);
    setMapEditMode(false);
  };
  const moveMapPoint = (e: React.PointerEvent<HTMLElement>, pointId: string) => {
    if (!mapEditMode || mapPointPointerRef.current !== e.pointerId || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.max(1, Math.min(99, ((e.clientX - rect.left - rect.width / 2 - panRef.current.x) / zoomRef.current + rect.width / 2) / rect.width * 100));
    const y = Math.max(1, Math.min(99, ((e.clientY - rect.top - rect.height / 2 - panRef.current.y) / zoomRef.current + rect.height / 2) / rect.height * 100));
    setEditPositions((prev) => ({ ...(prev ?? mapPositions), [pointId]: { x, y } }));
  };
  const startMapPointDrag = (e: React.PointerEvent<HTMLButtonElement>, pointId: string) => {
    if (!mapEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    mapPointPointerRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingMapPoint(pointId);
  };
  const endMapPointDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (mapPointPointerRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    mapPointPointerRef.current = null;
    setDraggingMapPoint(null);
  };

  // Zoom & Pan Engine State
  const [zoom, setZoom] = useState(() => {
    try {
      const saved = Number(window.localStorage.getItem('polissia_map_zoom_v1'));
      return Number.isFinite(saved) ? Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, saved)) : 1;
    } catch {
      return 1;
    }
  });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const panRef = useRef(pan);
  panRef.current = pan;

  const dragStateRef = useRef<{
    active: boolean;
    moved: boolean;
    startX: number;
    startY: number;
    origPanX: number;
    origPanY: number;
  }>({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    origPanX: 0,
    origPanY: 0,
  });

  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{ startDist: number; startZoom: number; startPanX: number; startPanY: number } | null>(null);

  // Масштаб карти зберігається окремо від прогресу гри та відновлюється після завантаження.
  useEffect(() => {
    try {
      window.localStorage.setItem('polissia_map_zoom_v1', String(zoom));
    } catch {
      // Якщо сховище недоступне, карта все одно працює.
    }
  }, [zoom]);

  // Обмежуємо переміщення краями збільшеної карти, щоб не з'являлися порожні поля.
  const clampPan = useCallback((x: number, y: number, z: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    const width = rect?.width ?? window.innerWidth;
    const height = rect?.height ?? window.innerHeight;
    const maxX = Math.max(0, (width * (z - 1)) / 2);
    const maxY = Math.max(0, (height * (z - 1)) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  // Масштаб змінюється від центру. При 100% карта завжди повертається у фіксоване положення.
  const applyZoomAtPoint = useCallback((nextZoom: number) => {
    const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number(nextZoom.toFixed(3))));
    setZoom(z);
    setPan((current) => z <= 1 ? { x: 0, y: 0 } : clampPan(current.x * z / zoomRef.current, current.y * z / zoomRef.current, z));
  }, [clampPan]);



  // Prevent browser native page pinch-zoom / scroll inside map viewport
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const preventMultiTouch = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault();
      }
    };
    const preventGesture = (e: Event) => e.preventDefault();
    el.addEventListener('touchstart', preventMultiTouch, { passive: false });
    el.addEventListener('touchmove', preventMultiTouch, { passive: false });
    el.addEventListener('gesturestart', preventGesture, { passive: false });
    el.addEventListener('gesturechange', preventGesture, { passive: false });
    return () => {
      el.removeEventListener('touchstart', preventMultiTouch);
      el.removeEventListener('touchmove', preventMultiTouch);
      el.removeEventListener('gesturestart', preventGesture);
      el.removeEventListener('gesturechange', preventGesture);
    };
  }, []);

  const focusLocationOnMap = useCallback(
    (loc: LocationDef, allowSecondTapEnter = false) => {
      if (dragStateRef.current.moved) return;
      if (allowSecondTapEnter && selectedId === loc.id) {
        onSelectDestination(loc.id);
        return;
      }
      setSelectedId(loc.id);
      // Вибір локації не пересуває карту — вона завжди залишається зафіксованою по центру.
    },
    [onSelectDestination, selectedId]
  );

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer may already be captured by a marker */ }

    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.max(10, Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y));
      pinchRef.current = { startDist: dist, startZoom: zoomRef.current, startPanX: panRef.current.x, startPanY: panRef.current.y };
      dragStateRef.current.active = false;
      setIsInteracting(true);
      return;
    }

    if (pointersRef.current.size === 1) {
      dragStateRef.current = {
        active: true,
        moved: false,
        startX: e.clientX,
        startY: e.clientY,
        origPanX: panRef.current.x,
        origPanY: panRef.current.y,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // Two-finger pinch-to-zoom + midpoint panning
    if (pointersRef.current.size === 2 && pinchRef.current) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.max(10, Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y));
      const p = pinchRef.current;

      const nextZoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, p.startZoom * (dist / p.startDist))
      );
      // Зберігаємо оглянуту ділянку під час зміни масштабу.
      setZoom(Number(nextZoom.toFixed(3)));
      setPan(clampPan(p.startPanX * nextZoom / p.startZoom, p.startPanY * nextZoom / p.startZoom, nextZoom));
      return;
    }

    // Одним пальцем можна рухати карту лише після збільшення. На 100% вона зафіксована.
    if (pointersRef.current.size === 1 && dragStateRef.current.active && zoomRef.current > 1.001) {
      const point = pointersRef.current.get(e.pointerId);
      if (!point) return;
      const dx = point.x - dragStateRef.current.startX;
      const dy = point.y - dragStateRef.current.startY;
      if (Math.abs(dx) + Math.abs(dy) > 5) dragStateRef.current.moved = true;
      if (dragStateRef.current.moved) {
        setPan(clampPan(dragStateRef.current.origPanX + dx, dragStateRef.current.origPanY + dy, zoomRef.current));
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) {
      pinchRef.current = null;
    }
    if (pointersRef.current.size === 0) {
      dragStateRef.current.active = false;
      setIsInteracting(false);
      window.setTimeout(() => {
        dragStateRef.current.moved = false;
      }, 30);
    } else if (pointersRef.current.size === 1) {
      // Після жесту масштабування карта не переходить у режим перетягування.
      dragStateRef.current.active = false;
      dragStateRef.current.moved = false;
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const delta = e.deltaY < 0 ? 0.22 : -0.22;
    applyZoomAtPoint(zoomRef.current + delta);
  };

  const selectedLoc: LocationDef = LOCATIONS[selectedId];
  const allLocations = Object.values(LOCATIONS);
  const fishingLocations = allLocations.filter((l) => !l.isBunker && !l.isCity);
  const { clock, phaseLabel } = formatClock(timeOfDay);
  const radWarning = selectedLoc.radiationLevel > radSuitLevel;

  return (
    <div className={compact ? 'fixed inset-0 z-[90] w-screen h-[100dvh] bg-[#060a09] overflow-hidden' : 'fixed inset-0 z-[90] w-screen h-[100dvh] overflow-hidden bg-[#060a09] select-none'}>
      <div className="absolute inset-0 w-screen h-[100dvh] overflow-hidden bg-[#060a09]">
      {/* Компактний сталкерський HUD карти */}
      <header className="absolute top-0 left-0 right-0 z-40 p-2 sm:p-3 pointer-events-none">
        <div className="flex items-start justify-between gap-2">
          <div className="pointer-events-auto rounded-md border border-emerald-500/25 bg-[#080d0b]/80 px-3 py-2 shadow-lg shadow-black/30 backdrop-blur-md">
            <h1 className="font-display text-sm sm:text-base font-bold tracking-wider text-emerald-100 uppercase">
              Карта Полісся
            </h1>
            <p className="text-[10px] sm:text-xs text-emerald-200/65">
              ДЕНЬ {day} · {clock} · {phaseLabel} · {WEATHER_LABELS[weather]} · РІВ. {level}
            </p>
          </div>
          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleMute}
              className="btn-tactile min-h-10 inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-[#080d0b]/90 px-3 text-[11px] font-bold text-slate-100 backdrop-blur-md"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {muted ? 'Звук вимкнено' : 'Звук'}
            </button>
            {!compact && (
              <button
                type="button"
                onClick={() => onSelectDestination('rokitne_bunker')}
                className="btn-tactile btn-primary-emerald min-h-10 rounded-md border border-emerald-400/35 bg-[#082016]/90 px-3 text-[11px] font-bold text-emerald-100 backdrop-blur-md"
              >
                Бункер
              </button>
            )}
            {compact && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn-tactile min-h-10 rounded-md border border-white/20 bg-[#080d0b]/90 px-3 text-[11px] font-bold text-slate-100 backdrop-blur-md"
              >
                Закрити карту
              </button>
            )}
          </div>
        </div>

        <div className="pointer-events-auto mt-2 flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-2 rounded-md border border-amber-500/25 bg-[#080d0b]/80 px-2.5 py-1.5 text-[11px] sm:text-xs backdrop-blur-md">
            <span className="font-mono-num font-bold text-amber-300">₴ {credits}</span>
            <span className="font-mono-num font-bold text-yellow-300">◈ {goldCoins}</span>
            <span className="font-mono-num font-bold text-orange-300">◆ {amberShards}</span>
          </div>
          <div className="rounded-md border border-sky-500/20 bg-[#080d0b]/80 px-2.5 py-1.5 text-[11px] sm:text-xs text-slate-200 backdrop-blur-md">
            САДОК <span className="font-mono-num font-semibold text-sky-200">{keepnetWeightKg.toFixed(1)}/{keepnetCapacityKg} кг</span>
          </div>
          <div className="rounded-md border border-emerald-500/20 bg-[#080d0b]/80 px-2.5 py-1.5 text-[11px] sm:text-xs backdrop-blur-md">
            <span className="text-slate-400">ЗАХИСТ </span>
            <span className="font-mono-num font-semibold text-emerald-300">{radSuitLevel}</span>
          </div>
          <div className="rounded-md border border-violet-500/20 bg-[#080d0b]/80 px-2.5 py-1.5 text-[11px] sm:text-xs backdrop-blur-md">
            <span className="text-slate-400">СИТІСТЬ </span>
            <span className={`font-mono-num font-semibold ${hunger <= 30 ? 'text-rose-400' : hunger <= 60 ? 'text-amber-300' : 'text-amber-200'}`}>{Math.round(hunger)}%</span>
          </div>
        </div>
      </header>

      {/* Main Interactive Zoomable Map + Tactical Inspector */}
      <div className="absolute inset-0 bg-[#060a09]">
        {/* Zoomable & Pannable Map Viewport (2-finger pinch + drag) */}
        <div
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          style={{ touchAction: 'none' }}
          className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#040706] touch-none cursor-grab active:cursor-grabbing"
        >
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              perspective: 'none',
              transformStyle: 'flat',
            }}
            className={`relative h-full w-full rounded-none overflow-hidden border-0 shadow-none bg-[#050806] [perspective:none] [transform-style:flat] ${
              isInteracting ? '' : 'transition-transform duration-200 ease-out'
            }`}
          >
            {!mapImgErr ? (
              <img
                src={MAP_IMAGE_URL}
                alt="Інтерактивна карта Полісся: Рокитне, Томашгород, Блажове, Біловіж, Сновидовичі, Масевичі, Кисоричі, Карпилівка, Борове"
                referrerPolicy="no-referrer"
                onError={() => setMapImgErr(true)}
                className="absolute inset-0 block w-screen h-[100dvh] max-w-none object-fill object-center select-none pointer-events-none"
                style={{ width: "100vw", height: "100dvh", objectFit: "fill", objectPosition: "center" }}
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-[#0e1c16] flex items-center justify-center text-sm text-slate-400">
                Карта Полісся (інтерактивні маркери)
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/15" />

            <button
              type="button"
              onClick={() => { if (!mapEditMode && !dragStateRef.current.moved) onOpenHome(); }}
              onPointerDown={(e) => startMapPointDrag(e, 'home')}
              onPointerMove={(e) => moveMapPoint(e, 'home')}
              onPointerUp={endMapPointDrag}
              onPointerCancel={endMapPointDrag}
              style={{ left: `${getMapPosition('home', 48.7, 48.4).x}%`, top: `${getMapPosition('home', 48.7, 48.4).y}%`, transform: `translate(-50%, -50%) scale(${1 / Math.max(1, Math.pow(zoom, 0.52))})`, touchAction: 'none' }}
              className={`absolute min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-0.5 bg-transparent cursor-pointer group z-10 hover:z-20 ${mapEditMode ? 'cursor-move' : ''}`}
              aria-label="Відкрити дім"
              title="Мій дім"
            >
              <span className="relative flex items-center justify-center">
                <span className="w-3.5 h-3.5 rounded-full border-2 shadow-[0_0_8px_rgba(0,0,0,0.95)] transition-transform bg-amber-400 border-amber-100 group-hover:scale-115" />
              </span>
              <span className="text-[9px] font-medium lowercase leading-none text-amber-100/90 drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">дім</span>
            </button>

            {/* Cartographic Settlement Markers (no boxed windows — authentic map points + direct settlement text) */}
            {allLocations.map((loc) => {
              const isSelected = loc.id === selectedId;
              const isBunker = Boolean(loc.isBunker);
              const isCity = Boolean(loc.isCity);
              const isBaited = activeGroundbaitLocs.includes(loc.id);
              const isRadWarn = loc.radiationLevel > radSuitLevel;

              const dotColor = isCity
                ? 'bg-sky-400 border-sky-100'
                : isBunker
                ? 'bg-emerald-400 border-emerald-100'
                : loc.pinTheme === 'anomaly'
                  ? 'bg-cyan-400 border-cyan-100'
                  : loc.pinTheme === 'swamp'
                    ? 'bg-lime-400 border-lime-100'
                    : 'bg-amber-400 border-amber-100';

              const textColor = isSelected
                ? isCity
                  ? 'text-sky-300'
                  : isBunker
                  ? 'text-emerald-300'
                  : 'text-amber-300'
                : 'text-slate-100 group-hover:text-amber-200';

              const invScale = 1 / Math.max(1, Math.pow(zoom, 0.52));

              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => { if (!mapEditMode && !dragStateRef.current.moved) onSelectDestination(loc.id); }}
                  onPointerDown={(e) => startMapPointDrag(e, loc.id)}
                  onPointerMove={(e) => moveMapPoint(e, loc.id)}
                  onPointerUp={endMapPointDrag}
                  onPointerCancel={endMapPointDrag}
                  style={{
                    left: `${getMapPosition(loc.id, loc.mapX, loc.mapY).x}%`,
                    top: `${getMapPosition(loc.id, loc.mapX, loc.mapY).y}%`,
                    transform: `translate(-50%, -50%) scale(${invScale})`,
                    touchAction: 'none',
                  }}
                  className={`absolute min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-0.5 bg-transparent cursor-pointer group ${
                    isSelected ? 'z-30' : 'hover:z-20 z-10'
                  }`}
                  title={loc.name}
                >
                  {/* Cartographic Settlement Dot / Target Ring */}
                  <span className="relative flex items-center justify-center">
                    {isSelected && (
                      <span
                        className={`absolute w-7 h-7 rounded-full border-2 ${
                          isCity ? 'border-sky-300' : isBunker ? 'border-emerald-300' : 'border-amber-300'
                        }`}
                      />
                    )}
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 shadow-[0_0_8px_rgba(0,0,0,0.95)] transition-transform ${dotColor} ${
                        isSelected ? 'scale-125' : 'group-hover:scale-115'
                      }`}
                    />
                  </span>
                  {(isBunker || isCity || loc.id === 'rokitne') && (
                    <span className={`text-[9px] font-medium lowercase leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,1)] ${isCity ? 'text-sky-100/90' : isBunker ? 'text-emerald-100/90' : 'text-amber-100/90'}`}>
                      {isCity ? 'місто' : isBunker ? 'бункер' : 'осницьк'}
                    </span>
                  )}

                  {/* Show a readable callout only for the active pin.
                      The other pins stay as dots so their names never cover
                      settlement labels printed on the map artwork. */}
                  {isSelected && (
                    <span
                      className={`absolute bottom-[calc(100%+7px)] left-1/2 z-40 -translate-x-1/2 rounded-md border px-2 py-1 text-[10px] sm:text-[11px] font-bold tracking-wide leading-tight whitespace-nowrap shadow-xl backdrop-blur-sm ${
                        isCity
                          ? 'border-sky-300/60 bg-[#071923]/95 text-sky-100'
                          : isBunker
                          ? 'border-emerald-300/60 bg-[#061b12]/95 text-emerald-200'
                          : 'border-amber-300/60 bg-[#211607]/95 text-amber-100'
                      }`}
                    >
                      {loc.name.split('·').slice(1).join('·').trim() || loc.name}
                      {isRadWarn ? ' ☢' : ''}
                      {isBaited ? ' ★' : ''}
                    </span>
                  )}
                </button>
              );
            })}

          </div>

          <div className="absolute bottom-20 right-4 z-40 flex flex-col items-end gap-2">
            {!mapEditMode ? (
              <button type="button" onClick={beginMapEdit} className="btn-tactile min-h-11 rounded-lg border border-sky-400/40 bg-[#07131b]/95 px-4 text-xs font-bold text-sky-100 shadow-xl backdrop-blur-md">
                Редагувати карту
              </button>
            ) : (
              <div className="flex flex-col items-end gap-2 rounded-lg border border-sky-400/40 bg-[#07131b]/95 p-3 shadow-xl backdrop-blur-md">
                <span className="text-[11px] font-bold text-sky-100">Перетягуй точки пальцем</span>
                <div className="flex gap-2">
                  <button type="button" onClick={cancelMapEdit} className="min-h-10 rounded-md border border-white/20 px-3 text-xs font-semibold text-slate-200">Скасувати</button>
                  <button type="button" onClick={copyMapPositions} className="min-h-10 rounded-md border border-sky-400/50 bg-sky-950/80 px-3 text-xs font-bold text-sky-100">Копіювати координати</button>
                  <button type="button" onClick={saveMapEdit} className="min-h-10 rounded-md border border-emerald-400/50 bg-emerald-900/70 px-3 text-xs font-bold text-emerald-100">Зберегти</button>
                </div>
                {mapCopyStatus && <span className="max-w-56 text-right text-[10px] text-emerald-200">{mapCopyStatus}</span>}
              </div>
            )}
          </div>

          {/* Робочі кнопки масштабу */}
          <div className="absolute bottom-4 left-3 z-30 flex items-center gap-1 rounded-md border border-emerald-500/25 bg-[#080d0b]/85 p-1.5 backdrop-blur-md">
            <button
              type="button"
              onClick={() => applyZoomAtPoint(zoom - 0.35)}
              className="btn-tactile btn-field min-w-10 min-h-10 rounded-md text-lg font-bold text-slate-100"
              aria-label="Віддалити карту"
            >
              −
            </button>
            <span className="font-mono-num min-w-12 px-1 text-center text-[11px] font-semibold text-emerald-200">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => applyZoomAtPoint(zoom + 0.35)}
              className="btn-tactile btn-field min-w-10 min-h-10 rounded-md text-lg font-bold text-slate-100"
              aria-label="Наблизити карту"
            >
              +
            </button>
            <button
              type="button"
              onClick={resetView}
              className="btn-tactile btn-field min-h-10 rounded-md px-2 text-[10px] font-semibold text-emerald-200"
              aria-label="Скинути масштаб карти"
            >
              Центр
            </button>
          </div>

          {/* Floating Quick Enter Action on Mobile/Touch */}
          <div className="absolute bottom-4 right-4 z-30 lg:hidden">
            <button
              type="button"
              onClick={() => onSelectDestination(selectedLoc.id)}
              className={`btn-tactile min-h-[48px] inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs cursor-pointer ${
                selectedLoc.isCity ? 'border-sky-400/50 bg-sky-950/80 text-sky-100' : selectedLoc.isBunker ? 'btn-primary-emerald' : 'btn-primary-amber'
              }`}
            >
              {selectedLoc.isCity ? <House className="w-4 h-4" /> : selectedLoc.isBunker ? <Warehouse className="w-4 h-4" /> : <Navigation className="w-4 h-4" />}
              {selectedLoc.isCity ? 'Увійти в Рокитне' : selectedLoc.name.split('·').slice(1).join('·').trim() || selectedLoc.name} · Відкрити
            </button>
          </div>
        </div>

      </div>

      </div>
    </div>
  );
};
