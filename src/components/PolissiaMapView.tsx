import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookMarked,
  BookOpen,
  Compass,
  Maximize2,
  Music,
  Navigation,
  Package,
  ScrollText,
  Shield,
  Volume2,
  VolumeX,
  Warehouse,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { LOCATIONS, MAP_IMAGE_URL, formatClock } from '../game/data';
import { LocationDef, LocationId, WeatherType } from '../game/types';

interface PolissiaMapViewProps {
  currentLocationId: LocationId;
  day: number;
  timeOfDay: number;
  weather: WeatherType;
  credits: number;
  level: number;
  radSuitLevel: number;
  sanity: number;
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
  onOpenInventory: () => void;
  onOpenQuests: () => void;
  onOpenBestiary: () => void;
  onOpenJournal: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
}


type SettlementKind = 'селище' | 'село';
interface SettlementPoint { id: string; name: string; kind: SettlementKind; lat: number; lon: number; mapX: number; mapY: number; nearestLocationId: LocationId; }
interface OSMPlace { name: string; lat: number; lon: number; place: string; }
const COMMUNITY_SETTLEMENTS: Array<{ id: string; name: string; kind: SettlementKind; gameId?: LocationId }> = [
 {id:'rokytne-town',name:'Рокитне',kind:'селище',gameId:'rokitne'},{id:'tomashhorod-town',name:'Томашгород',kind:'селище',gameId:'tomashgorod'},
 {id:'yelne',name:'Єльне',kind:'село'},{id:'blazhove',name:'Блажове',kind:'село',gameId:'blazhove'},{id:'borove',name:'Борове',kind:'село',gameId:'borove'},
 {id:'buda',name:'Буда',kind:'село'},{id:'budky-snovydovytski',name:'Будки-Сновидовицькі',kind:'село'},{id:'bilovizh',name:'Біловіж',kind:'село',gameId:'bilovizh'},
 {id:'bilsk',name:'Більськ',kind:'село'},{id:'dert',name:'Дерть',kind:'село'},{id:'zalavya',name:"Залав'я",kind:'село'},
 {id:'karpylivka',name:'Карпилівка',kind:'село',gameId:'karpylivka'},{id:'kysorychi',name:'Кисоричі',kind:'село',gameId:'kysorychi'},
 {id:'kupel',name:'Купель',kind:'село'},{id:'lisove',name:'Лісове',kind:'село'},{id:'masevychi',name:'Масевичі',kind:'село',gameId:'masevychi'},
 {id:'mushni',name:'Мушні',kind:'село'},{id:'netreba',name:'Нетреба',kind:'село'},{id:'oleksandrivka',name:'Олександрівка',kind:'село'},
 {id:'osnytsk',name:'Осницьк',kind:'село'},{id:'ostky',name:'Остки',kind:'село'},{id:'rokytne-village',name:'Рокитне',kind:'село'},
 {id:'snovydovychi',name:'Сновидовичі',kind:'село',gameId:'snovydovychi'},{id:'staryky',name:'Старики',kind:'село'},
 {id:'tomashhorod-village',name:'Томашгород',kind:'село'}
];
const MAP_ANCHORS: Array<{gameId:LocationId;name:string;kind:SettlementKind}> = [
 {gameId:'rokitne',name:'Рокитне',kind:'селище'},{gameId:'tomashgorod',name:'Томашгород',kind:'селище'},
 {gameId:'masevychi',name:'Масевичі',kind:'село'},{gameId:'karpylivka',name:'Карпилівка',kind:'село'},
 {gameId:'snovydovychi',name:'Сновидовичі',kind:'село'},{gameId:'kysorychi',name:'Кисоричі',kind:'село'},
 {gameId:'bilovizh',name:'Біловіж',kind:'село'},{gameId:'borove',name:'Борове',kind:'село'},{gameId:'blazhove',name:'Блажове',kind:'село'}
];
const OSM_SETTLEMENT_QUERY = `[out:json][timeout:35];(node["place"](50.90,26.65,51.75,28.00);way["place"](50.90,26.65,51.75,28.00);relation["place"](50.90,26.65,51.75,28.00););out center tags;`;
const OSM_ENDPOINTS=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter'];
const normalizeSettlementName=(n:string)=>n.toLocaleLowerCase('uk-UA').replace(/[’'\u0060]/g,'').replace(/[‐‑–—]/g,'-').trim();
function solveMapProjection(points:Array<{lat:number;lon:number;x:number;y:number}>) {
 const s=points.reduce((a,p)=>({n:a.n+1,lat:a.lat+p.lat,lon:a.lon+p.lon,lat2:a.lat2+p.lat*p.lat,lon2:a.lon2+p.lon*p.lon,ll:a.ll+p.lat*p.lon,x:a.x+p.x,y:a.y+p.y,lx:a.lx+p.lat*p.x,ox:a.ox+p.lon*p.x,ly:a.ly+p.lat*p.y,oy:a.oy+p.lon*p.y}),{n:0,lat:0,lon:0,lat2:0,lon2:0,ll:0,x:0,y:0,lx:0,ox:0,ly:0,oy:0});
 const m=[[s.lat2,s.ll,s.lat],[s.ll,s.lon2,s.lon],[s.lat,s.lon,s.n]];
 const solve=(v:number[])=>{const a=m.map((r,i)=>[...r,v[i]]);for(let k=0;k<3;k++){let p=k;for(let i=k+1;i<3;i++)if(Math.abs(a[i][k])>Math.abs(a[p][k]))p=i;if(Math.abs(a[p][k])<1e-12)throw new Error('Недостатньо опорних точок');[a[k],a[p]]=[a[p],a[k]];const d=a[k][k];for(let j=k;j<4;j++)a[k][j]/=d;for(let i=0;i<3;i++)if(i!==k){const f=a[i][k];for(let j=k;j<4;j++)a[i][j]-=f*a[k][j];}}return [a[0][3],a[1][3],a[2][3]];};
 return {x:solve([s.lx,s.ox,s.x]),y:solve([s.ly,s.oy,s.y])};
}
async function loadCommunityMapPoints():Promise<SettlementPoint[]> {
 let elements:any[]=[];let lastError:unknown=null;
 for(const endpoint of OSM_ENDPOINTS){try{const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams({data:OSM_SETTLEMENT_QUERY}).toString()});if(!r.ok)throw new Error(`OpenStreetMap: ${r.status}`);const j=await r.json();elements=Array.isArray(j?.elements)?j.elements:[];if(elements.length)break;}catch(e){lastError=e;}}
 if(!elements.length)throw lastError??new Error('Немає геоданих');
 const places:OSMPlace[]=elements.map((e:any)=>({name:String(e.tags?.['name:uk']||e.tags?.['official_name:uk']||e.tags?.name||e.tags?.official_name||''),lat:Number(e.lat??e.center?.lat),lon:Number(e.lon??e.center?.lon),place:String(e.tags?.place||'')})).filter(p=>p.name&&Number.isFinite(p.lat)&&Number.isFinite(p.lon));
 const find=(name:string,kind:SettlementKind)=>{const a=places.filter(p=>normalizeSettlementName(p.name)===normalizeSettlementName(name));const types=kind==='селище'?['town','city']:['village','hamlet'];return types.map(t=>a.find(p=>p.place===t)).find(Boolean)??(a.length===1?a[0]:undefined);};
 const anchors=MAP_ANCHORS.map(a=>{const p=find(a.name,a.kind),l=LOCATIONS[a.gameId];return p&&l?{lat:p.lat,lon:p.lon,x:l.mapX,y:l.mapY}:null;}).filter(Boolean) as Array<{lat:number;lon:number;x:number;y:number}>;
 if(anchors.length<3)throw new Error('Не вдалося прив’язати географію до ігрової карти');
 const projection=solveMapProjection(anchors);
 const anchorPlaces=MAP_ANCHORS.map(a=>({id:a.gameId,place:find(a.name,a.kind)})).filter(a=>a.place);
 return COMMUNITY_SETTLEMENTS.map(s=>{const p=find(s.name,s.kind);if(!p)return null;const x=projection.x[0]*p.lat+projection.x[1]*p.lon+projection.x[2],y=projection.y[0]*p.lat+projection.y[1]*p.lon+projection.y[2];const nearest=anchorPlaces.reduce((best,a)=>{const d=Math.hypot((p.lat-a.place!.lat)*111,(p.lon-a.place!.lon)*70);return !best||d<best.d?{id:a.id,d}:best;},null as {id:LocationId;d:number}|null);return nearest?{...s,lat:p.lat,lon:p.lon,mapX:x,mapY:y,nearestLocationId:s.gameId??nearest.id}:null;}).filter((p):p is SettlementPoint=>Boolean(p)&&p.mapX>=0&&p.mapX<=100&&p.mapY>=0&&p.mapY<=100);
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
  level,
  radSuitLevel,
  sanity,
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
  const [communityPoints, setCommunityPoints] = useState<SettlementPoint[]>([]);
  const [selectedCommunityPoint, setSelectedCommunityPoint] = useState<SettlementPoint | null>(null);
  const [communityMapError, setCommunityMapError] = useState<string | null>(null);

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

  useEffect(() => {
    let cancelled = false;
    loadCommunityMapPoints().then((points) => {
      if (cancelled) return;
      setCommunityPoints(points);
      setCommunityMapError(points.length < COMMUNITY_SETTLEMENTS.length
        ? `На карту нанесено ${points.length} із ${COMMUNITY_SETTLEMENTS.length} населених пунктів: для решти не знайдено точних координат.`
        : null);
    }).catch(() => {
      if (!cancelled) setCommunityMapError('Не вдалося завантажити географічні координати населених пунктів.');
    });
    return () => { cancelled = true; };
  }, []);

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
    <div className="relative w-screen h-screen overflow-hidden bg-[#060a09] flex flex-col select-none">
      {/* Top Game Menu Bar */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#09110d] border-b border-emerald-500/20">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-lg sm:text-xl font-bold text-slate-100 whitespace-nowrap">
            Полісся: Карта регіону
          </h1>
          <div className="hidden xl:flex items-center gap-2.5 text-xs text-slate-300">
            <span className="font-mono-num text-amber-300 font-semibold">
              День {day} · {clock} ({phaseLabel})
            </span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span>{WEATHER_LABELS[weather]}</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span>Рівень {level}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-2.5 bg-[#0d1813] border border-white/10 rounded px-3 py-1.5">
            <span className="font-mono-num font-semibold text-amber-300">₴ {credits}</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="font-mono-num text-slate-200 hidden sm:inline">
              Садок: {keepnetWeightKg.toFixed(1)}/{keepnetCapacityKg} кг ({keepnetCount})
            </span>
            <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
            <span className="font-mono-num text-emerald-300">Захист {radSuitLevel}</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span
              className={`font-mono-num ${
                sanity <= 30
                  ? 'text-rose-400 font-semibold'
                  : sanity <= 60
                    ? 'text-amber-300'
                    : 'text-indigo-300'
              }`}
            >
              Розсудл. {Math.round(sanity)}%
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenInventory}
            className="btn-tactile btn-field min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer font-semibold"
          >
            <Package className="w-4 h-4 text-amber-300" />
            Рюкзак{lootCount > 0 ? ` (${lootCount})` : ''}
          </button>

          <button
            type="button"
            onClick={onOpenQuests}
            className="btn-tactile btn-field min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer font-semibold"
          >
            <ScrollText className="w-4 h-4 text-emerald-300" />
            Завдання{readyQuestsCount > 0 ? ` (!${readyQuestsCount})` : ''}
          </button>

          <button
            type="button"
            onClick={onOpenBestiary}
            className="btn-tactile btn-field min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer font-semibold"
          >
            <BookOpen className="w-4 h-4 text-teal-400" />
            Бестіарій
          </button>

          <button
            type="button"
            onClick={onOpenJournal}
            className="btn-tactile btn-field min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer font-semibold"
          >
            <BookMarked className="w-4 h-4 text-amber-300" />
            Журнал
          </button>

          <button
            type="button"
            onClick={() => onSelectDestination('rokitne_bunker')}
            className="btn-tactile btn-primary-emerald min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Warehouse className="w-4 h-4" />
            Бункер
          </button>

          <button
            type="button"
            onClick={onToggleMusic}
            className={`btn-tactile min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg cursor-pointer border ${
              musicEnabled && !muted
                ? 'bg-emerald-950/75 border-emerald-400/50 text-emerald-300'
                : 'btn-field text-slate-400'
            }`}
            aria-label={musicEnabled ? 'Вимкнути музику' : 'Увімкнути музику'}
            title={musicEnabled ? 'Вимкнути музику' : 'Увімкнути музику'}
          >
            <Music className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="btn-tactile btn-field min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg cursor-pointer"
            aria-label={muted ? 'Увімкнути звук' : 'Вимкнути звук'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Interactive Zoomable Map + Tactical Inspector */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_380px] bg-[#060a09]">
        {/* Zoomable & Pannable Map Viewport (2-finger pinch + drag) */}
        <div
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          style={{ touchAction: 'none' }}
          className="relative flex items-center justify-center overflow-hidden bg-[#040706] touch-none cursor-grab active:cursor-grabbing"
        >
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
            className={`relative w-full max-w-[1220px] aspect-video rounded-md overflow-hidden border border-emerald-500/25 shadow-2xl bg-[#0a130f] ${
              isInteracting ? '' : 'transition-transform duration-200 ease-out'
            }`}
          >
            {!mapImgErr ? (
              <img
                src={MAP_IMAGE_URL}
                alt="Інтерактивна карта Полісся: Рокитне, Томашгород, Блажове, Біловіж, Сновидовичі, Масевичі, Кисоричі, Карпилівка, Борове"
                referrerPolicy="no-referrer"
                onError={() => setMapImgErr(true)}
                className="w-full h-full object-cover select-none pointer-events-none"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-[#0e1c16] flex items-center justify-center text-sm text-slate-400">
                Карта Полісся (інтерактивні маркери)
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/15" />

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
                  onClick={() => focusLocationOnMap(loc, true)}
                  onDoubleClick={() => onSelectDestination(loc.id)}
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

                  {/* Direct Map Settlement Name (no window box) */}
                  <span
                    className={`text-[11px] sm:text-xs font-bold tracking-wide whitespace-nowrap leading-none pt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,1)] [text-shadow:0_1px_4px_#000,0_0_8px_#000] ${textColor}`}
                  >
                    {loc.name.split('·')[0].trim()}
                    {isRadWarn ? ' ☢' : ''}
                    {isBaited ? ' ★' : ''}
                  </span>
                </button>
              );
            })}
          </div>

          {            {/* Населені пункти громади — позначки поверх тієї самої аномальної карти */}
            {communityPoints.map((point) => {
              const invScale = 1 / Math.max(1, Math.pow(zoom, 0.52));
              return (
                <button key={point.id} type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => { event.stopPropagation(); setSelectedCommunityPoint(point); }}
                  style={{ left: `${point.mapX}%`, top: `${point.mapY}%`, transform: `translate(-50%, -50%) scale(${invScale})`, touchAction: 'none' }}
                  className="absolute z-20 group flex min-h-[38px] flex-col items-center justify-center gap-0.5 cursor-pointer"
                  title={`${point.name} — ${point.kind}`}>
                  <span className="relative flex items-center justify-center">
                    <span className="absolute h-6 w-6 rounded-full border border-cyan-200/80 bg-cyan-400/15 shadow-[0_0_12px_rgba(34,211,238,0.75)] group-hover:scale-125 transition-transform" />
                    <span className="relative h-2.5 w-2.5 rounded-full border-2 border-cyan-100 bg-fuchsia-500 shadow-[0_0_8px_rgba(0,0,0,1)]" />
                  </span>
                  <span className="whitespace-nowrap rounded-sm bg-[#06110f]/85 px-1 py-0.5 text-[10px] font-bold leading-none text-cyan-100 drop-shadow-[0_1px_3px_#000] [text-shadow:0_1px_4px_#000]">{point.name}</span>
                </button>
              );
            })}
/* Touch Zoom Controls Overlay */}
          <div className="absolute bottom-4 left-4 z-30 flex items-center gap-1.5 panel-field rounded-xl p-1.5">
            <button
              type="button"
              onClick={() => applyZoomAtPoint(zoom - 0.35)}
              className="btn-tactile btn-field min-w-[46px] min-h-[46px] inline-flex items-center justify-center rounded-lg cursor-pointer"
              aria-label="Віддалити карту"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono-num text-xs text-slate-200 px-2 min-w-[48px] text-center font-semibold">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => applyZoomAtPoint(zoom + 0.35)}
              className="btn-tactile btn-field min-w-[46px] min-h-[46px] inline-flex items-center justify-center rounded-lg cursor-pointer"
              aria-label="Наблизити карту"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={resetView}
              className="btn-tactile btn-field min-w-[46px] min-h-[46px] inline-flex items-center justify-center rounded-lg cursor-pointer"
              aria-label="Скинути масштаб карти"
            >
              <Maximize2 className="w-4 h-4" />
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
              {selectedLoc.name.split('·')[0].trim()} · Відкрити
            </button>
          </div>
        </div>

        {/* Right Side Tactical Inspector + Location Directory */}
        <aside className="bg-[#09110d] border-t lg:border-t-0 lg:border-l border-emerald-500/20 flex flex-col min-h-0 max-h-[42vh] lg:max-h-none">
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
                  Увійти в Бункер «Щит-04»
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
        {selectedCommunityPoint && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setSelectedCommunityPoint(null)}>
            <div className="w-full max-w-sm rounded-2xl border border-cyan-400/35 bg-[#091510] p-5 shadow-[0_0_45px_rgba(8,145,178,0.2)]" onClick={(event) => event.stopPropagation()}>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">Населений пункт · Рокитнівська громада</div>
              <h2 className="font-display text-2xl font-bold text-white">{selectedCommunityPoint.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{selectedCommunityPoint.kind} · Рівненська область</p>
              <p className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3 text-xs leading-relaxed text-slate-300">Найближча доступна ігрова водойма: <span className="font-semibold text-cyan-200">{LOCATIONS[selectedCommunityPoint.nearestLocationId]?.name}</span>.</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setSelectedCommunityPoint(null)} className="min-h-[46px] rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-semibold text-slate-200 hover:bg-white/10">Закрити</button>
                <button type="button" onClick={() => { const destination = selectedCommunityPoint.nearestLocationId; setSelectedCommunityPoint(null); onSelectDestination(destination); }} className="btn-tactile btn-primary-amber min-h-[46px] rounded-xl px-3 text-sm font-bold">Перейти</button>
              </div>
            </div>
          </div>
        )}
        {communityMapError && <div className="pointer-events-none fixed bottom-3 left-1/2 z-40 -translate-x-1/2 rounded-lg border border-amber-400/30 bg-black/80 px-3 py-2 text-center text-[10px] text-amber-200">{communityMapError}</div>}
    </div>
  );
};
