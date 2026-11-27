import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, ArrowUpRight, Coins, Gem, ShoppingBasket, Store,
  ArrowLeftRight, Hammer, Coffee, Warehouse, MapPin, Move, Check, RotateCcw,
} from 'lucide-react';

type BusinessId = 'market' | 'shop' | 'trade' | 'amber' | 'cafe' | 'warehouse';
type PointPosition = { left: number; top: number };

const CITY_PLACES: Array<{
  id: BusinessId; title: string; subtitle: string; description: string;
  services: string[]; position: PointPosition; Icon: React.ElementType;
}> = [
  { id: 'market', title: 'Центральний ринок', subtitle: 'Торгівля та продукти', description: 'Міський ринок Рокитного. Тут збираються місцеві торговці та мандрівники.', services: ['Риба, гриби та ягоди', 'Їжа й корисні припаси', 'Бурштин та знайдені речі'], position: { left: 23, top: 48 }, Icon: ShoppingBasket },
  { id: 'shop', title: 'Універсальний магазин', subtitle: 'Спорядження та товари', description: 'Магазин повсякденних товарів і спорядження для виходу в Полісся.', services: ['Продукти й одяг', 'Рибальські снасті', 'Інструменти та спорядження'], position: { left: 51, top: 36 }, Icon: Store },
  { id: 'trade', title: 'Обмінник і ломбард', subtitle: 'Валюта та цінні речі', description: 'Можна буде обмінювати ігрові валюти, оцінювати, здавати під заставу та викуповувати знайдені цінності.', services: ['Обмін гривень і золотих монет', 'Оцінка бурштину та артефактів', 'Застава й викуп речей'], position: { left: 76, top: 52 }, Icon: ArrowLeftRight },
  { id: 'amber', title: 'Бурштинова майстерня', subtitle: 'Обробка та оцінка', description: 'Майстерня поліських бурштинарів для роботи зі знайденим бурштином.', services: ['Промивання та сортування', 'Обробка бурштину', 'Оцінка знахідок'], position: { left: 83, top: 25 }, Icon: Hammer },
  { id: 'cafe', title: 'Кафе', subtitle: 'Їжа, відпочинок і чутки', description: 'Місце, де можна перепочити, поїсти та почути новини від місцевих.', services: ['Їжа та напої', 'Відпочинок', 'Чутки й зустрічі з персонажами'], position: { left: 39, top: 72 }, Icon: Coffee },
  { id: 'warehouse', title: 'Старий склад', subtitle: 'Схованки та таємні угоди', description: 'Покинутий склад на околиці міста. Тут можуть ховатися тайники, контрабандисти та секретний провідник до Чорнобиля.', services: ['Пошук схованок', 'Таємні угоди', 'Секретний провідник до Чорнобиля'], position: { left: 12, top: 27 }, Icon: Warehouse },
];

const POSITION_STORAGE_KEY = 'rokytne-city-marker-positions-v1';
const DEFAULT_POSITIONS = Object.fromEntries(CITY_PLACES.map((place) => [place.id, place.position])) as Record<BusinessId, PointPosition>;

interface CityViewProps { credits: number; goldCoins: number; amberShards: number; onBack: () => void; }

export const CityView: React.FC<CityViewProps> = ({ credits, goldCoins, amberShards, onBack }) => {
  const [activeId, setActiveId] = useState<BusinessId | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const cityImageSrc = `${import.meta.env.BASE_URL}assets/rokytne-city.jpg`;
  const [cityImageFailed, setCityImageFailed] = useState(false);
  const [positions, setPositions] = useState<Record<BusinessId, PointPosition>>(() => {
    try {
      const saved = localStorage.getItem(POSITION_STORAGE_KEY);
      return saved ? { ...DEFAULT_POSITIONS, ...JSON.parse(saved) } : DEFAULT_POSITIONS;
    } catch { return DEFAULT_POSITIONS; }
  });
  const activePlace = CITY_PLACES.find((place) => place.id === activeId);

  useEffect(() => {
    try { localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(positions)); } catch { /* session-only fallback */ }
  }, [positions]);

  const copyPositions = async () => {
    const config = JSON.stringify({ version: 1, map: 'rokytne-city', positions }, null, 2);
    try {
      await navigator.clipboard.writeText(config);
      setCopyStatus('Координати скопійовано — надішли їх сюди');
    } catch {
      setCopyStatus('Не вдалося скопіювати. Перевір дозвіл браузера на буфер обміну');
    }
  };

  const moveMarker = (id: BusinessId, event: React.PointerEvent<HTMLButtonElement>) => {
    if (!editMode) return;
    const area = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!area) return;
    const left = Math.max(2, Math.min(98, ((event.clientX - area.left) / area.width) * 100));
    const top = Math.max(3, Math.min(97, ((event.clientY - area.top) / area.height) * 100));
    setPositions((current) => ({ ...current, [id]: { left, top } }));
  };

  return (
    <main className="fixed inset-0 z-[95] isolate overflow-hidden bg-[#080d0b] text-white" style={{ position: 'fixed', inset: 0, width: '100vw', height: '100dvh', zIndex: 95 }}>
      <div className="pointer-events-none absolute inset-0 z-0" style={{ width: '100%', height: '100%', backgroundColor: '#080d0b' }}>
        <img
          src={cityImageSrc}
          alt="Міська локація Рокитне"
          draggable={false}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={() => setCityImageFailed(false)}
          onError={() => setCityImageFailed(true)}
          style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', maxWidth: 'none', objectFit: 'cover', objectPosition: 'center' }}
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/45 via-transparent to-black/45" />
        <div className="absolute inset-0 z-[2] bg-[#11190f]/10" />
        {cityImageFailed && <div className="pointer-events-none fixed inset-x-4 bottom-20 z-[120] rounded-lg border border-red-300/40 bg-black/95 p-4 text-center text-sm font-semibold text-white shadow-2xl">Не вдалося завантажити фото міста. Перевіряється доступ до оригінального файлу.</div>}
      </div>

      <header className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3 pt-[max(12px,env(safe-area-inset-top))] sm:p-5">
        <div className="rounded-xl border border-white/15 bg-black/55 px-3 py-2 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[.22em] text-emerald-200"><MapPin className="h-3.5 w-3.5" /> МІСЬКА ЛОКАЦІЯ</div>
          <h1 className="mt-0.5 text-2xl font-black tracking-wider sm:text-3xl">РОКИТНЕ</h1>
          <p className="text-[10px] text-white/65">Полісся · міська територія</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button onClick={onBack} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-black/60 px-3 text-xs font-bold shadow-lg backdrop-blur-md hover:bg-black/80"><ArrowLeft className="h-4 w-4" /> На карту</button>
          <button onClick={() => setEditMode((value) => !value)} className={'inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-xs font-bold shadow-lg backdrop-blur-md ' + (editMode ? 'border-emerald-300 bg-emerald-950/90 text-emerald-100' : 'border-white/20 bg-black/65 text-white')}>
            {editMode ? <Check className="h-4 w-4" /> : <Move className="h-4 w-4" />}{editMode ? 'Готово' : 'Редагувати точки'}
          </button>
          {editMode && <button onClick={copyPositions} className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-emerald-200/30 bg-emerald-950/85 px-3 text-[11px] font-bold text-emerald-100"><Check className="h-3.5 w-3.5" /> Зберегти координати</button>}
          {editMode && <button onClick={() => setPositions(DEFAULT_POSITIONS)} className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-white/20 bg-black/65 px-3 text-[11px] font-bold text-white/85"><RotateCcw className="h-3.5 w-3.5" /> Скинути позиції</button>}
          {editMode && copyStatus && <div className="max-w-48 rounded-lg bg-black/80 px-2 py-1 text-right text-[10px] text-emerald-200">{copyStatus}</div>}
          <div className="flex gap-2 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-[11px] shadow-lg backdrop-blur-md">
            <span className="flex items-center gap-1 text-amber-200"><Coins className="h-3.5 w-3.5" />₴{credits}</span>
            <span className="flex items-center gap-1 text-yellow-200"><Gem className="h-3.5 w-3.5" />{goldCoins}</span>
            <span className="flex items-center gap-1 text-orange-200"><Gem className="h-3.5 w-3.5" />{amberShards}</span>
          </div>
        </div>
      </header>

      {!activePlace && <section className="absolute inset-0 z-10" aria-label="Інтерактивні міські об'єкти">
        {CITY_PLACES.map(({ id, title, Icon }) => (
          <button key={id} type="button" onClick={() => { if (!editMode) setActiveId(id); }}
            onPointerDown={(event) => { if (!editMode) return; event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); }}
            onPointerMove={(event) => moveMarker(id, event)}
            onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
            onPointerCancel={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
            style={{ left: String(positions[id].left) + '%', top: String(positions[id].top) + '%', touchAction: editMode ? 'none' : 'manipulation' }}
            className={'city-location-marker absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-[0_3px_12px_rgba(0,0,0,.8)] backdrop-blur-sm transition-colors sm:h-8 sm:w-8 ' + (editMode ? 'z-30 cursor-grab border-amber-200 bg-amber-950/90 text-amber-100 ring-2 ring-amber-300/60 active:cursor-grabbing' : 'cursor-pointer border-emerald-200/80 bg-[#102219]/90 text-emerald-100 hover:scale-110 hover:bg-emerald-900')}>
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {editMode && <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-black/90 px-1.5 py-1 text-[9px] font-bold text-amber-100">{title}</span>}
          </button>
        ))}
      </section>}

      {!activePlace && <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 pb-[max(16px,env(safe-area-inset-bottom))]">
        <div className="mx-auto mb-3 w-fit rounded-full border border-white/15 bg-black/65 px-4 py-2 text-center text-xs font-semibold text-white/90 shadow-lg backdrop-blur-md">
          {editMode ? 'Перетягуй точки пальцем на потрібні будівлі · позиції зберігаються автоматично' : 'Натисни маленьку точку на будівлі, щоб перейти до локації'}
        </div>
      </div>}

      {activePlace && <section className="absolute inset-0 z-40 flex flex-col bg-[#080d0b]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(31,65,45,0.28),_transparent_65%)]" />
        <header className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-black/45 p-3 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-md sm:p-5">
          <button onClick={() => setActiveId(null)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-black/60 px-3 text-xs font-bold"><ArrowLeft className="h-4 w-4" /> До міста</button>
          <div className="text-right"><p className="text-[9px] font-bold tracking-[.2em] text-emerald-300">ЛОКАЦІЯ РОКИТНОГО</p><h2 className="text-lg font-black">{activePlace.title}</h2></div>
        </header>
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-y-auto p-6 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-200/25 bg-emerald-950/50 text-emerald-100 shadow-2xl"><activePlace.Icon className="h-10 w-10" /></div>
          <h3 className="text-2xl font-black">{activePlace.title}</h3>
          <p className="mt-2 max-w-sm text-sm text-white/60">{activePlace.subtitle}</p>
          <div className="mt-7 max-w-sm rounded-xl border border-dashed border-white/20 bg-black/30 px-5 py-4">
            <p className="text-sm font-bold text-emerald-200">Фото цієї локації ще не додано</p>
            <p className="mt-2 text-xs leading-relaxed text-white/55">Коли завантажиш фото будівлі, підключимо його сюди. Це буде окрема локація, а не картка поверх міської мапи.</p>
          </div>
          <p className="mt-5 max-w-sm text-xs leading-relaxed text-white/45">{activePlace.description}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">{activePlace.services.map((service) => <span key={service} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/65">{service}</span>)}</div>
          <span className="mt-6 flex items-center gap-1 text-[10px] font-bold tracking-wider text-emerald-300">ЛОКАЦІЯ ГОТУЄТЬСЯ <ArrowUpRight className="h-3 w-3" /></span>
        </div>
      </section>}
    </main>
  );
};
