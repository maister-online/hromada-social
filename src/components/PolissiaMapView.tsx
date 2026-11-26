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
  musicEnabled: boolean;
  onSelectDestination: (locId: LocationId) => void;
  onOpenHome: () => void;
  compact?: boolean;
  onClose?: () => void;
  onOpenInventory: () => void;
  onOpenQuests: () => void;
  onOpenBestiary: () => void;
  onOpenJournal: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
}


const WEATHER_LABELS: Record<WeatherType, string> = {
  clear: 'Ясно',
  fog: 'Густий туман',
  rain: 'Мряка / Дощ',
  anomaly_surge: 'Аномальний викид',
};

const MIN_ZOOM = 0.85;
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
  musicEnabled,
  onSelectDestination,
  onOpenHome,
  compact = false,
  onClose,
  onOpenInventory,
  onOpenQuests,
  onOpenBestiary,
  onOpenJournal,
  onToggleMute,
  onToggleMusic,
}) => {
  const [selectedId, setSelectedId] = useState<LocationId>(
    currentLocationId === 'rokitne_bunker' ? 'tomashgorod' : currentLocationId
  );
  const [mapImgErr, setMapImgErr] = useState(false);

  // Zoom & Pan Engine State
  const [zoom, setZoom] = useState(1);
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
  const pinchRef = useRef<{
    startDist: number;
    startZoom: number;
    startPanX: number;
    startPanY: number;
    startMidX: number;
    startMidY: number;
  } | null>(null);

  const clampPan = useCallback((nextX: number, nextY: number, z: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    const maxW = rect ? rect.width * 0.48 * Math.max(0.28, z - 0.35) : 520;
    const maxH = rect ? rect.height * 0.48 * Math.max(0.28, z - 0.35) : 340;
    return {
      x: Math.max(-maxW, Math.min(maxW, nextX)),
      y: Math.max(-maxH, Math.min(maxH, nextY)),
    };
  }, []);

  const applyZoomAtPoint = useCallback(
    (nextZoom: number, clientX?: number, clientY?: number) => {
      const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number(nextZoom.toFixed(3))));
      const prevZ = zoomRef.current;
      const curPan = panRef.current;
      const rect = stageRef.current?.getBoundingClientRect();

      if (rect && clientX !== undefined && clientY !== undefined && prevZ > 0) {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const relX = clientX - cx;
        const relY = clientY - cy;
        const ratio = z / prevZ;
        const nextX = curPan.x * ratio + relX * (1 - ratio);
        const nextY = curPan.y * ratio + relY * (1 - ratio);
        setZoom(z);
        setPan(clampPan(nextX, nextY, z));
      } else {
        setZoom(z);
        setPan(clampPan(curPan.x, curPan.y, z));
      }
    },
    [clampPan]
  );



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
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) return;
      const targetZ = zoomRef.current < 1.35 ? 1.45 : zoomRef.current;
      const offsetX = ((50 - loc.mapX) / 100) * rect.width * 0.65 * targetZ;
      const offsetY = ((50 - loc.mapY) / 100) * rect.height * 0.65 * targetZ;
      setZoom(targetZ);
      setPan(clampPan(offsetX, offsetY, targetZ));
    },
    [clampPan, onSelectDestination, selectedId]
  );

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.max(10, Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y));
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      pinchRef.current = {
        startDist: dist,
        startZoom: zoomRef.current,
        startPanX: panRef.current.x,
        startPanY: panRef.current.y,
        startMidX: midX,
        startMidY: midY,
      };
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
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      const p = pinchRef.current;

      const nextZoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, p.startZoom * (dist / p.startDist))
      );
      const ratio = nextZoom / p.startZoom;

      const rect = stageRef.current?.getBoundingClientRect();
      const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
      const relMidX = p.startMidX - cx;
      const relMidY = p.startMidY - cy;

      const nextPanX = p.startPanX * ratio + relMidX * (1 - ratio) + (midX - p.startMidX);
      const nextPanY = p.startPanY * ratio + relMidY * (1 - ratio) + (midY - p.startMidY);

      setZoom(Number(nextZoom.toFixed(3)));
      setPan(clampPan(nextPanX, nextPanY, nextZoom));
      return;
    }

    if (!dragStateRef.current.active) return;
    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;
    if (Math.hypot(dx, dy) > 6) {
      dragStateRef.current.moved = true;
      setIsInteracting(true);
    }
    if (dragStateRef.current.moved) {
      setPan(
        clampPan(
          dragStateRef.current.origPanX + dx,
          dragStateRef.current.origPanY + dy,
          zoomRef.current
        )
      );
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
      // Seamlessly transition remaining finger to pan
      const [rem] = Array.from(pointersRef.current.values());
      dragStateRef.current = {
        active: true,
        moved: true,
        startX: rem.x,
        startY: rem.y,
        origPanX: panRef.current.x,
        origPanY: panRef.current.y,
      };
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const delta = e.deltaY < 0 ? 0.22 : -0.22;
    applyZoomAtPoint(zoomRef.current + delta, e.clientX, e.clientY);
  };

  const selectedLoc: LocationDef = LOCATIONS[selectedId];
  const allLocations = Object.values(LOCATIONS);
  const fishingLocations = allLocations.filter((l) => !l.isBunker);
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
            <span className="text-slate-400">ПСИХІКА </span>
            <span className={`font-mono-num font-semibold ${hunger <= 30 ? 'text-rose-400' : hunger <= 60 ? 'text-amber-300' : 'text-violet-300'}`}>{Math.round(hunger)}%</span>
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
              onClick={() => { if (!dragStateRef.current.moved) onOpenHome(); }}
              style={{ left: '48.7%', top: '48.4%', transform: `translate(-50%, -50%) scale(${1 / Math.max(1, Math.pow(zoom, 0.52))})`, touchAction: 'none' }}
              className="absolute min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-0.5 bg-transparent cursor-pointer group z-10 hover:z-20"
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
              const isBaited = activeGroundbaitLocs.includes(loc.id);
              const isRadWarn = loc.radiationLevel > radSuitLevel;

              const dotColor = isBunker
                ? 'bg-emerald-400 border-emerald-100'
                : loc.pinTheme === 'anomaly'
                  ? 'bg-cyan-400 border-cyan-100'
                  : loc.pinTheme === 'swamp'
                    ? 'bg-lime-400 border-lime-100'
                    : 'bg-amber-400 border-amber-100';

              const textColor = isSelected
                ? isBunker
                  ? 'text-emerald-300'
                  : 'text-amber-300'
                : 'text-slate-100 group-hover:text-amber-200';

              const invScale = 1 / Math.max(1, Math.pow(zoom, 0.52));

              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => { if (!dragStateRef.current.moved) onSelectDestination(loc.id); }}
                  style={{
                    left: `${loc.mapX}%`,
                    top: `${loc.mapY}%`,
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
                          isBunker ? 'border-emerald-300' : 'border-amber-300'
                        }`}
                      />
                    )}
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 shadow-[0_0_8px_rgba(0,0,0,0.95)] transition-transform ${dotColor} ${
                        isSelected ? 'scale-125' : 'group-hover:scale-115'
                      }`}
                    />
                  </span>
                  {isBunker && (
                    <span className="text-[9px] font-medium lowercase leading-none text-emerald-100/90 drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                      бункер
                    </span>
                  )}

                  {/* Show a readable callout only for the active pin.
                      The other pins stay as dots so their names never cover
                      settlement labels printed on the map artwork. */}
                  {isSelected && (
                    <span
                      className={`absolute bottom-[calc(100%+7px)] left-1/2 z-40 -translate-x-1/2 rounded-md border px-2 py-1 text-[10px] sm:text-[11px] font-bold tracking-wide leading-tight whitespace-nowrap shadow-xl backdrop-blur-sm ${
                        isBunker
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
                selectedLoc.isBunker ? 'btn-primary-emerald' : 'btn-primary-amber'
              }`}
            >
              {selectedLoc.isBunker ? <Warehouse className="w-4 h-4" /> : <Navigation className="w-4 h-4" />}
              {selectedLoc.name.split('·').slice(1).join('·').trim() || selectedLoc.name} · Відкрити
            </button>
          </div>
        </div>

        {/* Right Side Tactical Inspector + Location Directory */}
        <aside className="hidden">
          <div className="p-4 sm:p-5 border-b border-white/10 space-y-3 overflow-y-auto custom-scroll">
            {selectedLoc.backdropPhotoUrl && (
              <div className="relative w-full h-36 rounded-md overflow-hidden border border-white/15 bg-[#060a08]">
                <img
                  src={selectedLoc.backdropPhotoUrl}
                  alt={selectedLoc.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-200">
                  <span>Живий вигляд з пірсу</span>
                  <span className="font-mono-num text-amber-300">
                    Глиб. {selectedLoc.depthRangeM[0]}–{selectedLoc.depthRangeM[1]} м
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] font-medium text-emerald-400">
                  {selectedLoc.waterLabel}
                </div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-slate-100 leading-snug">
                  {selectedLoc.name}
                </h2>
              </div>
              {visitedLocationIds.includes(selectedLoc.id) && (
                <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                  Відвідано
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedLoc.description}</p>

            <div className="grid grid-cols-2 gap-2 text-xs bg-[#060c09] border border-white/10 rounded p-3">
              <div>
                <span className="text-slate-400 block">Аномальність</span>
                <span className="font-mono-num font-semibold text-cyan-300">
                  {selectedLoc.anomalyActivity}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Небезпека</span>
                <span
                  className={`font-semibold ${radWarning ? 'text-rose-400' : 'text-emerald-300'}`}
                >
                  {selectedLoc.dangerRating}
                </span>
              </div>
              <div className="col-span-2 pt-1 border-t border-white/10">
                <span className="text-slate-400 block">Порада єгеря</span>
                <span className="text-amber-200">{selectedLoc.bestTimeHint}</span>
              </div>
            </div>

            {radWarning && (
              <div className="flex items-start gap-2 text-xs text-rose-200 bg-rose-950/60 border border-rose-500/35 rounded p-2.5">
                <Shield className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  Потрібен захисний костюм рівня {selectedLoc.radiationLevel} (у майстра Олега в Бункері), інакше накопичуватиметься радіація!
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => onSelectDestination(selectedLoc.id)}
              className={`btn-tactile w-full min-h-[48px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold cursor-pointer ${
                selectedLoc.isBunker ? 'btn-primary-emerald' : 'btn-primary-amber'
              }`}
            >
              {selectedLoc.isBunker ? (
                <>
                  <Warehouse className="w-4 h-4" />
                  Увійти в Бункер Рокитне
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Вийти на локацію (Риболовля)
                </>
              )}
            </button>
          </div>

          {/* Directory List */}
          <div className="flex-1 overflow-y-auto custom-scroll p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-semibold text-slate-200">Швидкий вибір на карті</span>
              <span className="font-mono-num">{fishingLocations.length} водойм</span>
            </div>

            <button
              type="button"
              onClick={() => focusLocationOnMap(LOCATIONS.rokitne_bunker)}
              className={`w-full min-h-[44px] text-left px-3 py-2 rounded border text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                selectedId === 'rokitne_bunker'
                  ? 'bg-emerald-950/60 border-emerald-400/50 text-emerald-100'
                  : 'bg-[#060c09] border-white/10 text-slate-300 hover:border-emerald-400/35'
              }`}
            >
              <div className="min-w-0">
                <div className="font-semibold text-emerald-300 truncate">
                  {LOCATIONS.rokitne_bunker.name}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Продаж улову, снасті, витратники й квести
                </div>
              </div>
              <Warehouse className="w-4 h-4 text-emerald-400 shrink-0" />
            </button>

            {fishingLocations.map((loc) => {
              const active = selectedId === loc.id;
              const isRad = loc.radiationLevel > radSuitLevel;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => focusLocationOnMap(loc)}
                  className={`w-full min-h-[44px] text-left px-3 py-2 rounded border text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                    active
                      ? 'bg-[#111e18] border-amber-400/50 text-slate-100'
                      : 'bg-[#060c09] border-white/10 text-slate-300 hover:border-white/25'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{loc.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {loc.waterLabel} · Глиб. {loc.depthRangeM[0]}–{loc.depthRangeM[1]} м
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isRad && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                    <Compass className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      </div>
    </div>
  );
};
