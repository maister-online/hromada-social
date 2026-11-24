import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AlertTriangle, BookMarked, BookOpen, List, MapPin, Maximize2,
  Music, Navigation, Package, Search, ScrollText, Volume2,
  VolumeX, Warehouse, X, ZoomIn, ZoomOut,
} from 'lucide-react';
import { LOCATIONS, formatClock } from '../game/data';
import { LocationId, WeatherType } from '../game/types';

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
interface OfficialSettlement {
  id: string;
  name: string;
  kind: SettlementKind;
  gameLocationId?: LocationId;
}
interface SettlementOnMap extends OfficialSettlement {
  lat: number | null;
  lon: number | null;
  osmPlace?: string;
}

const OFFICIAL_SETTLEMENTS: OfficialSettlement[] = [
  { id: 'rokytne-town', name: 'Рокитне', kind: 'селище', gameLocationId: 'rokitne' },
  { id: 'tomashhorod-town', name: 'Томашгород', kind: 'селище', gameLocationId: 'tomashgorod' },
  { id: 'yelne', name: 'Єльне', kind: 'село' },
  { id: 'blazhove', name: 'Блажове', kind: 'село', gameLocationId: 'blazhove' },
  { id: 'borove', name: 'Борове', kind: 'село', gameLocationId: 'borove' },
  { id: 'buda', name: 'Буда', kind: 'село' },
  { id: 'budky-snovydovytski', name: 'Будки-Сновидовицькі', kind: 'село' },
  { id: 'bilovizh', name: 'Біловіж', kind: 'село', gameLocationId: 'bilovizh' },
  { id: 'bilsk', name: 'Більськ', kind: 'село' },
  { id: 'dert', name: 'Дерть', kind: 'село' },
  { id: 'zalavya', name: "Залав'я", kind: 'село' },
  { id: 'karpylivka', name: 'Карпилівка', kind: 'село', gameLocationId: 'karpylivka' },
  { id: 'kysorychi', name: 'Кисоричі', kind: 'село', gameLocationId: 'kysorychi' },
  { id: 'kupel', name: 'Купель', kind: 'село' },
  { id: 'lisove', name: 'Лісове', kind: 'село' },
  { id: 'masevychi', name: 'Масевичі', kind: 'село', gameLocationId: 'masevychi' },
  { id: 'mushni', name: 'Мушні', kind: 'село' },
  { id: 'netreba', name: 'Нетреба', kind: 'село' },
  { id: 'oleksandrivka', name: 'Олександрівка', kind: 'село' },
  { id: 'osnytsk', name: 'Осницьк', kind: 'село' },
  { id: 'ostky', name: 'Остки', kind: 'село' },
  { id: 'rokytne-village', name: 'Рокитне', kind: 'село' },
  { id: 'snovydovychi', name: 'Сновидовичі', kind: 'село', gameLocationId: 'snovydovychi' },
  { id: 'staryky', name: 'Старики', kind: 'село' },
  { id: 'tomashhorod-village', name: 'Томашгород', kind: 'село' },
];

const REGION_CENTER: [number, number] = [51.2908, 27.2796];
const REGION_BOUNDS: L.LatLngBoundsExpression = [[50.90, 26.65], [51.75, 28.00]];
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const COMMUNITY_BOUNDS = '(50.90,26.65,51.75,28.00)';
const OVERPASS_QUERIES = [
  `[out:json][timeout:35];
  rel["boundary"="administrative"]["name"~"Рокитнівська|Rokytnivska"]${COMMUNITY_BOUNDS}->.community;
  .community map_to_area->.communityArea;
  (
    node(area.communityArea)["place"];
    way(area.communityArea)["place"];
    relation(area.communityArea)["place"];
  );
  out center tags;`,
  `[out:json][timeout:35];
  (
    node["place"]${COMMUNITY_BOUNDS};
    way["place"]${COMMUNITY_BOUNDS};
    relation["place"]${COMMUNITY_BOUNDS};
  );
  out center tags;`,
];

const normalizeName = (value: string) =>
  value.toLocaleLowerCase('uk-UA').replace(/[’'\u0060]/g, '').replace(/[‐‑–—]/g, '-').trim();

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const placeCoords = (item: any): [number, number] | null => {
  const lat = Number(item?.lat ?? item?.center?.lat);
  const lon = Number(item?.lon ?? item?.center?.lon);
  return Number.isFinite(lat) && Number.isFinite(lon) ? [lat, lon] : null;
};

async function loadOpenStreetMapSettlements(): Promise<SettlementOnMap[]> {
  let bestElements: any[] = [];
  let bestMatchCount = -1;
  let lastError: unknown = null;

  for (const query of OVERPASS_QUERIES) {
    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: new URLSearchParams({ data: query }).toString(),
        });
        if (!response.ok) throw new Error(`OpenStreetMap API: ${response.status}`);
        const payload = await response.json();
        const elements = Array.isArray(payload?.elements) ? payload.elements : [];
        const candidates = elements
          .map((element) => {
            const coords = placeCoords(element);
            const tags = element?.tags ?? {};
            const name = tags['name:uk'] || tags['official_name:uk'] || tags.name || tags.official_name;
            if (!coords || !name) return null;
            return {
              name: String(name),
              coords,
              place: String(tags.place || ''),
              id: String(element.id),
            };
          })
          .filter(Boolean) as Array<{ name: string; coords: [number, number]; place: string; id: string }>;

        const used = new Set<string>();
        let matched = 0;
        const resolved = OFFICIAL_SETTLEMENTS.map((settlement) => {
          const sameName = candidates.filter((candidate) =>
            normalizeName(candidate.name) === normalizeName(settlement.name) && !used.has(candidate.id)
          );
          const preferredPlaces = settlement.kind === 'селище'
            ? ['town', 'city']
            : ['village', 'hamlet'];
          const match = preferredPlaces
            .map((place) => sameName.find((candidate) => candidate.place === place))
            .find(Boolean) ?? (sameName.length === 1 ? sameName[0] : undefined);

          if (match) {
            used.add(match.id);
            matched += 1;
          }
          return {
            ...settlement,
            lat: match?.coords[0] ?? null,
            lon: match?.coords[1] ?? null,
            osmPlace: match?.place,
          };
        });

        if (matched > bestMatchCount) {
          bestElements = resolved;
          bestMatchCount = matched;
        }
        if (matched === OFFICIAL_SETTLEMENTS.length) return resolved;
      } catch (error) {
        lastError = error;
      }
    }
  }

  if (bestMatchCount >= 0) return bestElements;
  throw lastError ?? new Error('Не вдалося завантажити геодані OpenStreetMap');
}

const WEATHER_LABELS: Record<WeatherType, string> = {
  clear: 'Ясно',
  fog: 'Густий туман',
  rain: 'Мряка / Дощ',
  anomaly_surge: 'Аномальний викид',
};

export const PolissiaMapView: React.FC<PolissiaMapViewProps> = ({
  currentLocationId, day, timeOfDay, weather, credits, level, radSuitLevel,
  sanity, keepnetCount, keepnetWeightKg, keepnetCapacityKg, lootCount,
  readyQuestsCount, visitedLocationIds, activeGroundbaitLocs, muted,
  musicEnabled, onSelectDestination, onOpenInventory, onOpenQuests,
  onOpenBestiary, onOpenJournal, onToggleMute, onToggleMusic,
}) => {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const [settlements, setSettlements] = useState<SettlementOnMap[]>(
    OFFICIAL_SETTLEMENTS.map((item) => ({ ...item, lat: null, lon: null }))
  );
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null);
  const [showDirectory, setShowDirectory] = useState(false);
  const [search, setSearch] = useState('');
  const [mapError, setMapError] = useState<string | null>(null);
  const [loadingMap, setLoadingMap] = useState(true);

  const { clock, phaseLabel } = formatClock(timeOfDay);
  const selectedSettlement = settlements.find((item) => item.id === selectedSettlementId) ?? null;
  const selectedLocation = selectedSettlement?.gameLocationId
    ? LOCATIONS[selectedSettlement.gameLocationId]
    : null;
  const currentName = LOCATIONS[currentLocationId]?.name ?? 'Полісся';

  const openSettlement = useCallback((settlement: SettlementOnMap) => {
    setSelectedSettlementId(settlement.id);
    setShowDirectory(false);
    if (settlement.lat !== null && settlement.lon !== null) {
      const map = mapRef.current;
      if (map) map.flyTo([settlement.lat, settlement.lon], Math.max(map.getZoom(), 12), { duration: 0.55 });
    }
  }, []);

  const nearestGameLocation = useMemo(() => {
    if (!selectedSettlement) return null;
    if (selectedLocation) return selectedLocation;
    if (selectedSettlement.lat === null || selectedSettlement.lon === null) return null;

    const withCoords = settlements.filter(
      (item) => item.gameLocationId && item.lat !== null && item.lon !== null
    );
    if (!withCoords.length) return null;

    const distance = (aLat: number, aLon: number, bLat: number, bLon: number) => {
      const rad = Math.PI / 180;
      const dLat = (bLat - aLat) * rad;
      const dLon = (bLon - aLon) * rad;
      const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLon / 2) ** 2;
      return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    };
    const closest = withCoords.reduce((best, item) => {
      const d = distance(
        selectedSettlement.lat!, selectedSettlement.lon!, item.lat!, item.lon!
      );
      return !best || d < best.distance ? { item, distance: d } : best;
    }, null as { item: SettlementOnMap; distance: number } | null);

    return closest?.item.gameLocationId ? LOCATIONS[closest.item.gameLocationId] ?? null : null;
  }, [selectedLocation, selectedSettlement, settlements]);

  const radWarning = Boolean(nearestGameLocation && nearestGameLocation.radiationLevel > radSuitLevel);
  const hasVisitedTarget = Boolean(nearestGameLocation && visitedLocationIds.includes(nearestGameLocation.id));
  const isGroundbaited = Boolean(selectedSettlement?.gameLocationId && activeGroundbaitLocs.includes(selectedSettlement.gameLocationId));

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;
    const map = L.map(mapElementRef.current, {
      zoomControl: false,
      attributionControl: true,
      minZoom: 8,
      maxZoom: 18,
      maxBounds: REGION_BOUNDS,
      maxBoundsViscosity: 0.72,
      preferCanvas: true,
    }).setView(REGION_CENTER, 10);
    map.fitBounds(REGION_BOUNDS, { padding: [36, 36], animate: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 8,
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    const resize = () => map.invalidateSize({ pan: false });
    window.setTimeout(resize, 80);
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingMap(true);
    loadOpenStreetMapSettlements()
      .then((items) => {
        if (cancelled) return;
        setSettlements(items);
        const mappedPoints = items
          .filter((item) => item.lat !== null && item.lon !== null)
          .map((item) => [item.lat!, item.lon!] as [number, number]);
        if (mappedPoints.length > 0) {
          const map = mapRef.current;
          if (map) map.fitBounds(L.latLngBounds(mappedPoints).pad(0.14), { maxZoom: 10 });
        }
        const missing = items.filter((item) => item.lat === null || item.lon === null);
        setMapError(
          missing.length
            ? `OpenStreetMap не повернув координати для: ${missing.map((item) => item.name + (item.kind === 'село' ? ' (село)' : ' (селище)')).join(', ')}. Назви залишено у довіднику.`
            : null
        );
      })
      .catch(() => {
        if (!cancelled) setMapError('Не вдалося завантажити точки населених пунктів. Перевірте інтернет і перезавантажте карту.');
      })
      .finally(() => {
        if (!cancelled) setLoadingMap(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    settlements.forEach((settlement) => {
      if (settlement.lat === null || settlement.lon === null) return;
      const hasFishingSpot = Boolean(settlement.gameLocationId);
      const kindLabel = settlement.kind === 'селище' ? 'селище' : 'село';
      const markerHtml = `<div class="region-place-marker ${hasFishingSpot ? 'has-fishing' : ''}">
        <span class="region-place-dot">${hasFishingSpot ? '🎣' : ''}</span>
        <span class="region-place-label">${escapeHtml(settlement.name)}</span>
        <span class="region-place-kind">${kindLabel}</span>
      </div>`;
      const marker = L.marker([settlement.lat, settlement.lon], {
        icon: L.divIcon({
          className: 'region-place-icon',
          html: markerHtml,
          iconSize: [150, 42],
          iconAnchor: [75, 14],
        }),
        keyboard: true,
        title: `${kindLabel} ${settlement.name}`,
        alt: settlement.name,
      });
      marker.on('click', () => openSettlement(settlement));
      marker.addTo(layer);
    });
  }, [openSettlement, settlements]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedSettlementId(null);
        setShowDirectory(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filteredSettlements = useMemo(() => {
    const q = normalizeName(search);
    return settlements.filter((item) => !q || normalizeName(item.name).includes(q));
  }, [search, settlements]);

  const goToGameLocation = () => {
    if (nearestGameLocation) onSelectDestination(nearestGameLocation.id);
  };

  return (
    <div className="fixed inset-0 z-0 h-[100dvh] w-screen overflow-hidden bg-[#0b1714] text-slate-100">
      <div ref={mapElementRef} className="absolute inset-0 z-0 h-full w-full" />

      <header className="region-map-topbar absolute left-0 right-0 top-0 z-[500] flex flex-wrap items-center justify-between gap-2 border-b border-emerald-300/20 bg-[#07120eea] px-3 py-2 shadow-lg backdrop-blur-md sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <MapPin className="h-5 w-5 shrink-0 text-emerald-300" />
          <div className="min-w-0">
            <div className="truncate text-sm font-bold sm:text-base">Полісся · Рокитнівська громада</div>
            <div className="hidden text-[10px] text-slate-300 sm:block">
              День {day} · {clock} · {WEATHER_LABELS[weather]} · Рівень {level} · {currentName.split('·')[0].trim()} · Розсудок {Math.round(sanity)}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="hidden rounded-lg border border-white/10 bg-black/25 px-2 py-1.5 font-mono-num text-amber-200 md:inline">
            ₴ {credits}
          </span>
          <span className="hidden rounded-lg border border-white/10 bg-black/25 px-2 py-1.5 font-mono-num text-emerald-200 lg:inline">
            Садок {keepnetWeightKg.toFixed(1)}/{keepnetCapacityKg} кг ({keepnetCount})
          </span>
          <button type="button" onClick={onOpenInventory} className="map-toolbar-button" title="Рюкзак">
            <Package className="h-4 w-4" /><span className="hidden sm:inline">Рюкзак{lootCount ? ` (${lootCount})` : ''}</span>
          </button>
          <button type="button" onClick={onOpenQuests} className="map-toolbar-button" title="Завдання">
            <ScrollText className="h-4 w-4" /><span className="hidden sm:inline">Завдання{readyQuestsCount ? ` (!${readyQuestsCount})` : ''}</span>
          </button>
          <button type="button" onClick={onOpenBestiary} className="map-toolbar-button" title="Бестіарій">
            <BookOpen className="h-4 w-4" /><span className="hidden sm:inline">Бестіарій</span>
          </button>
          <button type="button" onClick={onOpenJournal} className="map-toolbar-button" title="Журнал">
            <BookMarked className="h-4 w-4" /><span className="hidden sm:inline">Журнал</span>
          </button>
          <button type="button" onClick={() => onSelectDestination('rokitne_bunker')} className="map-toolbar-button map-toolbar-primary" title="Бункер">
            <Warehouse className="h-4 w-4" /><span className="hidden sm:inline">Бункер</span>
          </button>
          <button type="button" onClick={onToggleMusic} className="map-toolbar-icon" aria-label={musicEnabled ? 'Вимкнути музику' : 'Увімкнути музику'}>
            <Music className="h-4 w-4" />
          </button>
          <button type="button" onClick={onToggleMute} className="map-toolbar-icon" aria-label={muted ? 'Увімкнути звук' : 'Вимкнути звук'}>
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <div className="region-map-bottom-controls absolute bottom-4 left-3 z-[500] flex items-center gap-1.5 rounded-xl border border-emerald-300/25 bg-[#07120ee8] p-1.5 shadow-xl backdrop-blur-md">
        <button type="button" onClick={() => mapRef.current?.zoomOut()} className="map-toolbar-icon" aria-label="Віддалити карту"><ZoomOut className="h-4 w-4" /></button>
        <button type="button" onClick={() => mapRef.current?.zoomIn()} className="map-toolbar-icon" aria-label="Наблизити карту"><ZoomIn className="h-4 w-4" /></button>
        <button type="button" onClick={() => mapRef.current?.fitBounds(REGION_BOUNDS, { padding: [24, 24] })} className="map-toolbar-icon" aria-label="Показати всю громаду"><Maximize2 className="h-4 w-4" /></button>
        <span className="px-2 text-[10px] font-semibold text-slate-300">{loadingMap ? 'Завантаження карти…' : `${settlements.filter((item) => item.lat !== null).length}/25 точок`}</span>
      </div>

      <button
        type="button"
        onClick={() => setShowDirectory(true)}
        className="region-map-bottom-controls absolute bottom-4 right-3 z-[500] inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-emerald-300/30 bg-[#07120eea] px-4 py-3 text-xs font-bold text-emerald-100 shadow-xl backdrop-blur-md"
      >
        <List className="h-4 w-4" /> Населені пункти (25)
      </button>

      {mapError && (
        <div className="absolute left-3 right-3 top-[72px] z-[510] mx-auto max-w-2xl rounded-xl border border-amber-300/30 bg-[#251b0b]/95 p-3 text-xs text-amber-100 shadow-xl">
          {mapError}
        </div>
      )}

      {selectedSettlement && (
        <div
          className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/55 p-3 backdrop-blur-[2px]"
          onClick={() => setSelectedSettlementId(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="settlement-dialog-title"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-emerald-300/30 bg-[#09150f] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                  {selectedSettlement.kind} · Рокитнівська громада
                </div>
                <h2 id="settlement-dialog-title" className="text-xl font-bold text-white">{selectedSettlement.name}</h2>
                <p className="mt-1 text-[11px] text-slate-400">Рівненська область · Сарненський район · Україна</p>
              </div>
              <button type="button" onClick={() => setSelectedSettlementId(null)} className="map-toolbar-icon" aria-label="Закрити вікно"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3 p-4">
              {selectedLocation ? (
                <>
                  <div className="rounded-xl border border-emerald-300/20 bg-emerald-950/35 p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300">Ігрова водойма поруч</div>
                    <div className="mt-1 font-semibold text-white">{selectedLocation.name}</div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">{selectedLocation.description}</p>
                  </div>
                  {hasVisitedTarget && <div className="text-[11px] text-emerald-300">Цю водойму вже відвідано</div>}
                  {isGroundbaited && <div className="text-[11px] text-amber-200">★ На цій водоймі активний закорм</div>}
                </>
              ) : (
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-relaxed text-slate-300">
                  Для цього населеного пункту немає окремої рибальської сцени.
                  {nearestGameLocation
                    ? <div className="mt-2">Найближча доступна водойма: <span className="font-semibold text-amber-200">{nearestGameLocation.name}</span></div>
                    : <div className="mt-2 text-amber-200">Координати населеного пункту не знайдені, тому неможливо точно визначити найближчу водойму.</div>}
                </div>
              )}
              {radWarning && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-950/40 p-3 text-xs text-rose-100">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                  <span>Небезпечно: для цієї водойми потрібен захисний костюм рівня {nearestGameLocation?.radiationLevel ?? 0}. Твій рівень захисту: {radSuitLevel}.</span>
                </div>
              )}
              {selectedSettlement.lat === null && (
                <p className="text-xs text-amber-200">Координати цієї точки ще не отримані з OpenStreetMap. Вона залишилась у повному офіційному списку.</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setSelectedSettlementId(null)} className="map-dialog-secondary">Закрити</button>
                <button type="button" disabled={!nearestGameLocation} onClick={goToGameLocation} className="map-dialog-primary disabled:cursor-not-allowed disabled:opacity-40">
                  <Navigation className="h-4 w-4" /> Перейти
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {showDirectory && (
        <div className="absolute inset-0 z-[1000] flex items-end justify-center bg-black/55 p-2 backdrop-blur-[2px] sm:items-center sm:p-4" onClick={() => setShowDirectory(false)}>
          <section className="flex max-h-[82dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-emerald-300/30 bg-[#09150f] shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div><h2 className="font-bold text-white">Населені пункти громади</h2><p className="text-[11px] text-slate-400">Офіційний перелік · 25 одиниць</p></div>
              <button type="button" onClick={() => setShowDirectory(false)} className="map-toolbar-icon" aria-label="Закрити список"><X className="h-5 w-5" /></button>
            </div>
            <div className="border-b border-white/10 p-3">
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Знайти село або селище…" className="min-h-[42px] w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
              </label>
            </div>
            <div className="custom-scroll flex-1 overflow-y-auto p-2">
              {filteredSettlements.map((settlement) => (
                <button key={settlement.id} type="button" onClick={() => openSettlement(settlement)} className="flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left hover:bg-emerald-950/40">
                  <span><span className="block text-sm font-semibold text-slate-100">{settlement.name}</span><span className="text-[10px] text-slate-400">{settlement.kind} · {settlement.lat === null ? 'геодані не завантажені' : 'точка на карті'}</span></span>
                  <MapPin className="h-4 w-4 shrink-0 text-emerald-300" />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
