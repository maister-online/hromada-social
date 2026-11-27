import React, { useState } from 'react';
import CITY_IMAGE_URL from '../../Зроби_мега_різкість_9392a4f5_2K.jpg';
import {
  ArrowLeft, ArrowUpRight, Coins, Gem, ShoppingBasket, Store,
  ArrowLeftRight, Hammer, Coffee, Warehouse, MapPin, X,
} from 'lucide-react';

type BusinessId = 'market' | 'shop' | 'trade' | 'amber' | 'cafe' | 'warehouse';

const CITY_PLACES: Array<{
  id: BusinessId;
  title: string;
  subtitle: string;
  description: string;
  services: string[];
  position: { left: string; top: string };
  Icon: React.ElementType;
}> = [
  {
    id: 'market', title: 'Центральний ринок', subtitle: 'Торгівля та продукти',
    description: 'Міський ринок Рокитного. Тут збираються місцеві торговці та мандрівники.',
    services: ['Риба, гриби та ягоди', 'Їжа й корисні припаси', 'Бурштин та знайдені речі'],
    position: { left: '23%', top: '48%' }, Icon: ShoppingBasket,
  },
  {
    id: 'shop', title: 'Універсальний магазин', subtitle: 'Спорядження та товари',
    description: 'Магазин повсякденних товарів і спорядження для виходу в Полісся.',
    services: ['Продукти й одяг', 'Рибальські снасті', 'Інструменти та спорядження'],
    position: { left: '51%', top: '36%' }, Icon: Store,
  },
  {
    id: 'trade', title: 'Обмінник і ломбард', subtitle: 'Валюта та цінні речі',
    description: 'Можна буде обмінювати ігрові валюти, оцінювати, здавати під заставу та викуповувати знайдені цінності.',
    services: ['Обмін гривень і золотих монет', 'Оцінка бурштину та артефактів', 'Застава й викуп речей'],
    position: { left: '76%', top: '52%' }, Icon: ArrowLeftRight,
  },
  {
    id: 'amber', title: 'Бурштинова майстерня', subtitle: 'Обробка та оцінка',
    description: 'Майстерня поліських бурштинарів для роботи зі знайденим бурштином.',
    services: ['Промивання та сортування', 'Обробка бурштину', 'Оцінка знахідок'],
    position: { left: '83%', top: '25%' }, Icon: Hammer,
  },
  {
    id: 'cafe', title: 'Кафе', subtitle: 'Їжа, відпочинок і чутки',
    description: 'Місце, де можна перепочити, поїсти та почути новини від місцевих.',
    services: ['Їжа та напої', 'Відпочинок', 'Чутки й зустрічі з персонажами'],
    position: { left: '39%', top: '72%' }, Icon: Coffee,
  },
  {
    id: 'warehouse', title: 'Старий склад', subtitle: 'Схованки та таємні угоди',
    description: 'Покинутий склад на околиці міста. Тут можуть ховатися тайники, контрабандисти та секретний провідник до Чорнобиля.',
    services: ['Пошук схованок', 'Таємні угоди', 'Секретний провідник до Чорнобиля'],
    position: { left: '12%', top: '27%' }, Icon: Warehouse,
  },
];


interface CityViewProps {
  credits: number;
  goldCoins: number;
  amberShards: number;
  onBack: () => void;
}

export const CityView: React.FC<CityViewProps> = ({ credits, goldCoins, amberShards, onBack }) => {
  const [activeId, setActiveId] = useState<BusinessId | null>(null);
  const activePlace = CITY_PLACES.find((place) => place.id === activeId);

  return (
    <main className="fixed inset-0 z-[95] isolate overflow-hidden bg-[#080d0b] text-white">
      <div className="absolute inset-0">
        <img
          src={CITY_IMAGE_URL}
          alt="Міська локація Рокитне"
          className="h-full w-full object-cover object-center"
          draggable={false}
          onError={(event) => { event.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/10 to-black/65" />
        <div className="absolute inset-0 bg-[#11190f]/15" />
      </div>

      <header className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3 pt-[max(12px,env(safe-area-inset-top))] sm:p-5">
        <div className="rounded-xl border border-white/15 bg-black/55 px-3 py-2 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[.22em] text-emerald-200">
            <MapPin className="h-3.5 w-3.5" /> МІСЬКА ЛОКАЦІЯ
          </div>
          <h1 className="mt-0.5 text-2xl font-black tracking-wider sm:text-3xl">РОКИТНЕ</h1>
          <p className="text-[10px] text-white/65">Полісся · міська територія</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button onClick={onBack} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-black/60 px-3 text-xs font-bold shadow-lg backdrop-blur-md hover:bg-black/80">
            <ArrowLeft className="h-4 w-4" /> На карту
          </button>
          <div className="flex gap-2 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-[11px] shadow-lg backdrop-blur-md">
            <span className="flex items-center gap-1 text-amber-200"><Coins className="h-3.5 w-3.5" />₴{credits}</span>
            <span className="flex items-center gap-1 text-yellow-200"><Gem className="h-3.5 w-3.5" />{goldCoins}</span>
            <span className="flex items-center gap-1 text-orange-200"><Gem className="h-3.5 w-3.5" />{amberShards}</span>
          </div>
        </div>
      </header>

      <section className="absolute inset-0 z-10" aria-label="Інтерактивні міські об'єкти">
        {CITY_PLACES.map(({ id, title, position, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveId(id)}
            style={{ left: position.left, top: position.top }}
            className={`city-location-marker absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-all active:scale-95 ${activeId === id ? 'z-20 scale-110 bg-emerald-950/90 ring-2 ring-emerald-300' : 'bg-black/65 hover:bg-black/85'} border border-white/35 shadow-[0_4px_18px_rgba(0,0,0,.7)] backdrop-blur-sm`}
            aria-label={`Відкрити: ${title}`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200/60 bg-[#15251b]/95 text-emerald-100 shadow-lg sm:h-11 sm:w-11">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
            <span className="max-w-[112px] whitespace-nowrap text-[10px] font-extrabold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,1)] sm:text-xs">{title}</span>
          </button>
        ))}
      </section>

      {!activePlace && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 pb-[max(16px,env(safe-area-inset-bottom))]">
          <div className="mx-auto mb-3 w-fit rounded-full border border-white/15 bg-black/60 px-4 py-2 text-center text-xs font-semibold text-white/85 shadow-lg backdrop-blur-md">
            Обери будівлю на міській локації
          </div>
        </div>
      )}

      {activePlace && (
        <div className="absolute inset-x-0 bottom-0 z-30 p-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:p-5">
          <section className="mx-auto max-w-xl rounded-2xl border border-emerald-200/25 bg-[#0b120e]/95 p-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200/25 bg-emerald-900/40 text-emerald-100">
                <activePlace.Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold tracking-[.18em] text-emerald-300">МІСЬКИЙ ОБ'ЄКТ</p>
                <h2 className="text-lg font-black">{activePlace.title}</h2>
                <p className="text-xs text-white/55">{activePlace.subtitle}</p>
              </div>
              <button onClick={() => setActiveId(null)} aria-label="Закрити" className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/85">{activePlace.description}</p>
            <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
              {activePlace.services.map((service) => (
                <div key={service} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white/75">{service}</div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
              <p className="text-[10px] text-white/45">Інтерактивні послуги цього об'єкта ще розробляються</p>
              <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold text-emerald-200">РОЗДІЛ МІСТА <ArrowUpRight className="h-3 w-3" /></span>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
