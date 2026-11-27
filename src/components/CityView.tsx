import React, { useState } from 'react';
import { ArrowLeft, ArrowLeftRight, Building2, Coins, Coffee, Gem, Hammer, ShoppingBasket, Store, Warehouse } from 'lucide-react';

type BusinessId = 'market' | 'shop' | 'exchange' | 'pawnshop';
const BUSINESSES: Array<{ id: BusinessId; title: string; subtitle: string; description: string; Icon: React.ElementType }> = [
  { id: 'market', title: 'Ринок', subtitle: 'Торгівля між мандрівниками', description: 'Міський ринок для купівлі та продажу речей. Тут згодом з’являться торгові пропозиції та товари інших гравців.', Icon: ShoppingBasket },
  { id: 'shop', title: 'Магазин', subtitle: 'Спорядження та товари', description: 'Магазин міських товарів. Каталог і купівля товарів будуть підключені окремо.', Icon: Store },
  { id: 'exchange', title: 'Обмінник', subtitle: 'Обмін ігрових валют', description: 'Місце для обміну гривень, золотих монет та уламків бурштину. Курси й операції ще не активовані.', Icon: ArrowLeftRight },
  { id: 'pawnshop', title: 'Ломбард', subtitle: 'Застава та викуп речей', description: 'Тут планується застава та викуп спорядження й знайдених предметів. Операції поки не підключені.', Icon: Gem },
  { id: 'amber', title: 'Бурштинова майстерня', subtitle: 'Обробка та оцінка бурштину', description: 'Майстерня для промивання, сортування, обробки та оцінки знайденого бурштину.', Icon: Hammer },
  { id: 'cafe', title: 'Кафе', subtitle: 'Їжа, відпочинок і чутки', description: 'Тут можна буде поїсти, відпочити, почути місцеві чутки та зустріти інших персонажів.', Icon: Coffee },
  { id: 'warehouse', title: 'Старий склад', subtitle: 'Схованки та таємні угоди', description: 'Покинутий склад зі схованками, таємними угодами та секретним провідником до Чорнобиля.', Icon: Warehouse },
];

const CITY_IMAGE_URL = `${import.meta.env.BASE_URL}${encodeURIComponent('Зроби_мега_різкість_9392a4f5_2K.jpg')}`;
interface CityViewProps { credits: number; goldCoins: number; amberShards: number; onBack: () => void; }

export const CityView: React.FC<CityViewProps> = ({ credits, goldCoins, amberShards, onBack }) => {
  const [active, setActive] = useState<BusinessId | null>(null);
  const selected = BUSINESSES.find((item) => item.id === active);
  return (
    <main className="fixed inset-0 z-[95] overflow-y-auto bg-[#081117] text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(34,91,112,.42), transparent 58%), linear-gradient(180deg,#0b1b22 0%,#081117 60%,#05090d 100%)' }} />
      <div className="relative mx-auto flex min-h-full w-full max-w-5xl flex-col p-4 sm:p-7">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-300/20 pb-4">
          <div><p className="text-[10px] font-bold tracking-[.28em] text-emerald-300">МІСЬКИЙ ХАБ</p><h1 className="mt-1 text-3xl font-black tracking-wide sm:text-4xl">РОКИТНЕ</h1><p className="mt-1 text-xs text-slate-400">Місто · торгівля · послуги</p></div>
          <button onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 bg-black/25 px-4 text-sm font-semibold hover:bg-white/10"><ArrowLeft className="h-4 w-4" /> На карту</button>
        </header>
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-black/25 p-3 text-center">
          <div><Coins className="mx-auto mb-1 h-4 w-4 text-amber-300" /><p className="text-[10px] text-slate-400">Гривні</p><p className="font-mono font-bold text-amber-200">₴ {credits}</p></div>
          <div><Gem className="mx-auto mb-1 h-4 w-4 text-yellow-300" /><p className="text-[10px] text-slate-400">Золоті монети</p><p className="font-mono font-bold text-yellow-200">{goldCoins}</p></div>
          <div><Gem className="mx-auto mb-1 h-4 w-4 text-orange-300" /><p className="text-[10px] text-slate-400">Бурштин</p><p className="font-mono font-bold text-orange-200">{amberShards}</p></div>
        </div>
        <section className="mt-7">
          <div className="mb-3 flex items-center gap-2"><Building2 className="h-5 w-5 text-sky-300" /><h2 className="text-lg font-bold">Міські заклади</h2></div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BUSINESSES.map(({ id, title, subtitle, Icon }) => (
              <button key={id} onClick={() => setActive(id)} className={`group min-h-32 rounded-xl border p-4 text-left transition-colors ${active === id ? 'border-emerald-300/60 bg-[#10251a]/90' : 'border-white/15 bg-[#101915]/80 backdrop-blur-md hover:border-emerald-300/40 hover:bg-[#14231b]/90'}`}>
                <div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-300/20 bg-sky-400/10 text-emerald-200"><Icon className="h-5 w-5" /></span><span className="text-[10px] font-bold tracking-wider text-slate-500">МІСТО</span></div>
                <h3 className="mt-3 text-lg font-bold">{title}</h3><p className="mt-1 text-xs text-slate-400">{subtitle}</p>
              </button>
            ))}
          </div>
        </section>
        {selected && <section className="mt-5 rounded-xl border border-sky-300/25 bg-[#0c1c24] p-4 sm:p-5"><div className="flex items-center gap-2 text-sky-200"><selected.Icon className="h-5 w-5" /><h3 className="font-bold">{selected.title}</h3></div><p className="mt-3 text-sm leading-relaxed text-slate-300">{selected.description}</p><p className="mt-3 rounded-lg border border-amber-300/15 bg-amber-300/5 px-3 py-2 text-xs text-amber-100/80">Розділ створений. Торгові операції ще не підключені — баланс гравця не змінюється.</p></section>}
        <p className="mt-auto pt-8 text-center text-[10px] tracking-wider text-slate-600">АНОМАЛЬНА РИБОЛОВЛЯ ПОЛІССЯ</p>
      </div>
    </main>
  );
};
