import React, { useState } from 'react';
import {
  ArrowLeft, Coins, Gem, ShoppingBasket, Store, ArrowLeftRight,
  Hammer, Coffee, Warehouse, MapPin, X, ArrowUpRight,
} from 'lucide-react';

type PlaceId = 'market' | 'shop' | 'trade' | 'amber' | 'cafe' | 'warehouse';

const CITY_IMAGE_URL =
  'https://raw.githubusercontent.com/maister-online/hromada-social/main/' +
  encodeURIComponent('Зроби_мега_різкість_9392a4f5_2K.jpg');

const CITY_PLACES: Array<{
  id: PlaceId;
  title: string;
  subtitle: string;
  description: string;
  services: string[];
  x: number;
  y: number;
  Icon: React.ElementType;
}> = [
  { id: 'market', title: 'Центральний ринок', subtitle: 'Торгівля та продукти', description: 'Міський ринок Рокитного — місце зустрічі місцевих торговців і мандрівників.', services: ['Риба, гриби та ягоди', 'Їжа й припаси', 'Бурштин і знайдені речі'], x: 23, y: 48, Icon: ShoppingBasket },
  { id: 'shop', title: 'Універсальний магазин', subtitle: 'Спорядження та товари', description: 'Магазин повсякденних товарів і спорядження для подорожей Поліссям.', services: ['Продукти й одяг', 'Рибальські снасті', 'Інструменти'], x: 51, y: 36, Icon: Store },
  { id: 'trade', title: 'Обмінник і ломбард', subtitle: 'Валюта та цінні речі', description: 'Тут можна буде обмінювати ігрові валюти, оцінювати та продавати знайдені цінності.', services: ['Обмін гривень і золотих монет', 'Оцінка бурштину', 'Застава й викуп речей'], x: 76, y: 52, Icon: ArrowLeftRight },
  { id: 'amber', title: 'Бурштинова майстерня', subtitle: 'Обробка та оцінка', description: 'Майстерня поліських бурштинарів для роботи зі знайденим бурштином.', services: ['Сортування', 'Обробка бурштину', 'Оцінка знахідок'], x: 83, y: 25, Icon: Hammer },
  { id: 'cafe', title: 'Кафе', subtitle: 'Їжа, відпочинок і чутки', description: 'Місце, де можна перепочити, поїсти та почути новини від місцевих.', services: ['Їжа та напої', 'Відпочинок', 'Новини й зустрічі'], x: 39, y: 72, Icon: Coffee },
  { id: 'warehouse', title: 'Старий склад', subtitle: 'Схованки та таємні угоди', description: 'Покинутий склад на околиці міста. Тут можуть ховатися тайники та секретні персонажі.', services: ['Пошук схованок', 'Таємні угоди', 'Секретні маршрути'], x: 12, y: 27, Icon: Warehouse },
];

interface CityViewProps {
  credits: number;
  goldCoins: number;
  amberShards: number;
  onBack: () => void;
}

export const CityView: React.FC<CityViewProps> = ({ credits, goldCoins, amberShards, onBack }) => {
  const [activeId, setActiveId] = useState<PlaceId | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const activePlace = CITY_PLACES.find((place) => place.id === activeId);

  return (
    <main className="fixed inset-0 z-[95] isolate h-[100dvh] w-screen overflow-hidden bg-[#080d0b] text-white">
      <div className="absolute inset-0 z-0">
        {!imageFailed ? (
          <img
            key={CITY_IMAGE_URL}
            src={CITY_IMAGE_URL}
            alt="Міська локація Рокитне"
            draggable={false}
            fetchPriority="high"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="absolute inset-0 h-full w-full select-none object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#14231a] p-8 text-center">
            <div className="max-w-sm">
              <MapPin className="mx-auto mb-3 h-10 w-10 text-emerald-300" />
              <p className="text-lg font-bold">Фото міста не завантажилося</p>
              <p className="mt-2 text-xs text-white/60">Перевіряється оригінальний файл у репозиторії. Інтерактивні локації залишаються доступними.</p>
              <button onClick={() => { setImageFailed(false); }} className="mt-4 rounded-lg border border-white/20 bg-black/40 px-4 py-2 text-xs font-bold">Спробувати ще раз</button>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/10 to-black/65" />
        <div className="absolute inset-0 bg-[#07130c]/15" />
      </div>

      <header className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3 pt-[max(12px,env(safe-area-inset-top))] sm:p-5">
        <div className="rounded-xl border border-white/15 bg-black/60 px-3 py-2 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[.2em] text-emerald-200"><MapPin className="h-3.5 w-3.5" /> МІСЬКА ЛОКАЦІЯ</div>
          <h1 className="mt-0.5 text-2xl font-black tracking-wider sm:text-3xl">РОКИТНЕ</h1>
          <p className="text-[10px] text-white/70">Полісся · міський центр</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button onClick={onBack} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-black/65 px-3 text-xs font-bold shadow-lg backdrop-blur-md"><ArrowLeft className="h-4 w-4" /> На карту</button>
          <div className="flex gap-2 rounded-xl border border-white/15 bg-black/65 px-3 py-2 text-[11px] shadow-lg backdrop-blur-md">
            <span className="flex items-center gap-1 text-amber-200"><Coins className="h-3.5 w-3.5" />₴{credits}</span>
            <span className="flex items-center gap-1 text-yellow-200"><Gem className="h-3.5 w-3.5" />{goldCoins}</span>
            <span className="flex items-center gap-1 text-orange-200"><Gem className="h-3.5 w-3.5" />{amberShards}</span>
          </div>
        </div>
      </header>

      {!activePlace && (
        <section className="absolute inset-0 z-10" aria-label="Заклади Рокитного">
          {CITY_PLACES.map(({ id, title, Icon, x, y }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveId(id)}
              aria-label={title}
              title={title}
              style={{ left: x + '%', top: y + '%' }}
              className="city-location-marker absolute flex min-h-12 min-w-12 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full text-emerald-50 drop-shadow-[0_3px_8px_rgba(0,0,0,.95)]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-emerald-100 bg-[#10291d]/95 shadow-[0_0_0_4px_rgba(0,0,0,.28),0_0_18px_rgba(16,185,129,.4)] transition-transform active:scale-90">
                <Icon className="h-4 w-4" />
              </span>
              <span className="max-w-28 rounded-md border border-white/15 bg-black/75 px-2 py-1 text-center text-[9px] font-extrabold leading-tight text-white shadow-lg backdrop-blur-sm">{title}</span>
            </button>
          ))}
        </section>
      )}

      {!activePlace && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-[max(18px,env(safe-area-inset-bottom))]">
          <div className="rounded-full border border-white/15 bg-black/70 px-4 py-2 text-center text-[11px] font-semibold text-white/90 shadow-xl backdrop-blur-md">
            Натисни на позначку, щоб відкрити заклад
          </div>
        </div>
      )}

      {activePlace && (
        <section className="absolute inset-x-0 bottom-0 z-40 mx-auto max-h-[78dvh] w-full overflow-y-auto rounded-t-3xl border border-white/15 bg-[#09120d]/95 p-4 pb-[max(20px,env(safe-area-inset-bottom))] shadow-[0_-18px_60px_rgba(0,0,0,.65)] backdrop-blur-xl sm:max-w-2xl sm:rounded-3xl sm:bottom-5">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/25 sm:hidden" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200/25 bg-emerald-950/70 text-emerald-100"><activePlace.Icon className="h-6 w-6" /></div>
              <div>
                <p className="text-[9px] font-bold tracking-[.2em] text-emerald-300">ЗАКЛАД РОКИТНОГО</p>
                <h2 className="text-lg font-black leading-tight">{activePlace.title}</h2>
                <p className="mt-1 text-xs text-white/55">{activePlace.subtitle}</p>
              </div>
            </div>
            <button onClick={() => setActiveId(null)} aria-label="Закрити" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5"><X className="h-5 w-5" /></button>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/75">{activePlace.description}</p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {activePlace.services.map((service) => (
              <div key={service} className="rounded-lg border border-white/10 bg-white/[.045] px-3 py-2 text-xs text-white/75">{service}</div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-[10px] font-bold tracking-wider text-emerald-300">ЛОКАЦІЯ ГОТУЄТЬСЯ</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-white/45">Деталі закладу <ArrowUpRight className="h-3 w-3" /></span>
          </div>
        </section>
      )}
    </main>
  );
};
