import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  SlidersHorizontal,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  X,
  Building2,
  Trees,
  Apple,
  Car,
  Home,
  Wrench,
  Tractor,
  RotateCcw,
  Tag,
  Filter,
  Archive,
  CheckSquare
} from 'lucide-react';
import { BusinessListing } from '../../types';
import { MarketplaceProductCard } from './MarketplaceProductCard';
import { MarketplaceFilterSidebar, MarketplaceFilterState, CATEGORIES_LIST } from './MarketplaceFilterSidebar';
import { ProductDetailModal } from './ProductDetailModal';
import { BuyNowModal } from './BuyNowModal';
import { CreateListingModal } from './CreateListingModal';
import { INITIAL_BUSINESS_LISTINGS } from '../../data/mockData';
import { OLX_ROKYTNE_ARCHIVE_LISTINGS } from '../../data/marketplaceData';

interface BusinessMarketplaceTabProps {
  initialCategoryFilter?: string;
  initialSearchQuery?: string;
  onNavigateToMap?: (item: BusinessListing) => void;
}

const POPULAR_SEARCH_TAGS = [
  { label: '📦 Архів OLX Рокитне', query: 'OLX' },
  { label: '🪵 Дрова & Сосна', query: 'дрова' },
  { label: '🍯 Мед Кисоричі', query: 'мед' },
  { label: '🚜 Трактор Т-25', query: 'трактор' },
  { label: '🫐 Чорниця & Ягоди', query: 'чорниця' },
  { label: '🏡 Будинок Рокитне', query: 'будинок' },
  { label: '🛠️ Послуги JCB', query: 'послуги' },
];

const EXPANDED_MARKETPLACE_ITEMS: BusinessListing[] = [
  {
    ...INITIAL_BUSINESS_LISTINGS[0],
    subcategory: 'sub_lumber'
  },
  {
    ...INITIAL_BUSINESS_LISTINGS[1],
    subcategory: 'sub_cars'
  },
  {
    id: 'biz-303',
    title: 'Мед акацієвий та різнотрав\'я з пасіки у с. Залав\'я (3л)',
    priceUah: 450,
    category: 'фермерство',
    subcategory: 'sub_honey',
    sellerName: 'Пасіка родини Ковальчуків',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    sellerPhone: '(097) 554-12-34',
    settlement: 'село Залав\'я',
    location: 'с. Залав\'я',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80'],
    description: 'Натуральний качаний мед 2026 року з чистої екологічної зони Полісся. Можлива доставка у селище Рокитне.',
    dateAdded: 'Сьогодні о 08:30',
    viewsCount: 180,
    favoritesCount: 24,
    isFavorite: false,
    isVerifiedSeller: true,
    isVerifiedBusiness: false,
    specs: { 'Об\'єм': '3 літри', 'Урожай': '2026', 'Доставка': 'Так' }
  },
  {
    id: 'biz-304',
    title: 'Трактор МТЗ-82 з плугом у відмінному стані',
    priceUah: 280000,
    category: 'agro',
    subcategory: 'sub_tractors',
    sellerName: 'Сергій Боровець',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    sellerPhone: '(098) 234-56-78',
    settlement: 'село Блажове',
    location: 'с. Блажове',
    imageUrl: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=800&q=80'],
    description: 'Повністю робочий трактор, кап-ремонт двигуна виконано навесні. У комплекті плуг 3-корпусний.',
    dateAdded: 'Учора',
    viewsCount: 310,
    favoritesCount: 35,
    isVerifiedSeller: true,
    specs: { 'Рік': '2012', 'Стан': 'Відмінний', 'Комплект': 'Плуг' }
  },
  {
    id: 'biz-305',
    title: 'Оренда комерційного приміщення під магазин у смт Рокитне',
    priceUah: 12000,
    category: 'realty',
    subcategory: 'sub_commercial',
    sellerName: 'ТОВ "Рокитне Інвест"',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    sellerPhone: '(03635) 2-20-10',
    settlement: 'селище Рокитне',
    location: 'смт Рокитне',
    address: 'вул. Незалежності, 24',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'],
    description: 'Приміщення площею 65 кв.м на 1 поверсі в центрі смт Рокитне. Усі комунікації, автономне опалення, євроремонт.',
    dateAdded: '2 дні тому',
    viewsCount: 420,
    favoritesCount: 19,
    isVerifiedBusiness: true,
    isVerifiedSeller: true,
    companyName: 'ТОВ Рокитне Інвест',
    specs: { 'Площа': '65 кв.м', 'Поверх': '1/2', 'Опалення': 'Автономне' }
  },
  {
    id: 'biz-306',
    title: 'Дрова соснові та колоті твердих порід (дуб, граб) з доставкою',
    priceUah: 1800,
    category: 'будматеріали',
    subcategory: 'sub_lumber',
    sellerName: 'Лісопильня смт Томашгород',
    sellerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    sellerPhone: '(097) 890-12-34',
    settlement: 'селище Томашгород',
    location: 'смт Томашгород',
    imageUrl: 'https://images.unsplash.com/photo-1520114878144-6123749968dd?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1520114878144-6123749968dd?auto=format&fit=crop&w=800&q=80'],
    description: 'Колоті дрова сухі готові до паління. Ціна вказана за 1 складометр. Доставка самоскидом по Томашгороду, Єльному, Рокитному.',
    dateAdded: 'Сьогодні',
    viewsCount: 290,
    favoritesCount: 41,
    isVerifiedSeller: true,
    isVerifiedBusiness: true,
    specs: { 'Порода': 'Дуб / Граб / Сосна', 'Доставка': 'Так' }
  },
  ...OLX_ROKYTNE_ARCHIVE_LISTINGS
];

export const BusinessMarketplaceTab: React.FC<BusinessMarketplaceTabProps> = ({
  initialCategoryFilter = 'all',
  initialSearchQuery = '',
  onNavigateToMap
}) => {
  const [items, setItems] = useState<BusinessListing[]>(EXPANDED_MARKETPLACE_ITEMS);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<BusinessListing | null>(null);
  const [selectedItemForBuy, setSelectedItemForBuy] = useState<BusinessListing | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);

  const [filters, setFilters] = useState<MarketplaceFilterState>({
    category: initialCategoryFilter,
    subcategory: 'all',
    minPrice: '',
    maxPrice: '',
    settlement: 'all',
    sellerType: 'all',
    condition: 'all',
    olxMode: 'all'
  });

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      subcategory: 'all',
      minPrice: '',
      maxPrice: '',
      settlement: 'all',
      sellerType: 'all',
      condition: 'all',
      olxMode: 'all'
    });
    setSearchQuery('');
  };

  const filteredItems = items.filter(item => {
    // Category match from sidebar
    if (filters.category !== 'all' && item.category !== filters.category) {
      return false;
    }

    // Subcategory match
    if (filters.subcategory !== 'all' && item.subcategory !== filters.subcategory) {
      return false;
    }

    // OLX Archive Mode Filter
    if (filters.olxMode === 'olx_only' && !item.isOlxArchive) {
      return false;
    }
    if (filters.olxMode === 'local_only' && item.isOlxArchive) {
      return false;
    }

    // Settlement match
    if (filters.settlement !== 'all' && item.settlement !== filters.settlement) {
      return false;
    }

    // Min price match
    if (filters.minPrice && item.priceUah < Number(filters.minPrice)) {
      return false;
    }

    // Max price match
    if (filters.maxPrice && item.priceUah > Number(filters.maxPrice)) {
      return false;
    }

    // Seller type match
    if (filters.sellerType === 'business' && !item.isVerifiedBusiness) {
      return false;
    }
    if (filters.sellerType === 'private' && item.isVerifiedBusiness) {
      return false;
    }

    // Real-time Global Search query match (by name/title, category, description, seller, settlement, specs, olxId)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesTitle = item.title.toLowerCase().includes(q);
      const matchesDesc = item.description.toLowerCase().includes(q);
      const matchesOlxId = item.olxId ? item.olxId.toLowerCase().includes(q) : false;
      
      const catObj = CATEGORIES_LIST.find(c => c.id === item.category);
      const categoryLabel = catObj ? catObj.label.toLowerCase() : '';
      const matchesCategory = item.category.toLowerCase().includes(q) || categoryLabel.includes(q);

      const matchesSeller = item.sellerName.toLowerCase().includes(q);
      const matchesSettlement = item.settlement.toLowerCase().includes(q);
      const matchesSpecs = item.specs ? Object.values(item.specs).some(val => String(val).toLowerCase().includes(q)) : false;

      if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesSeller && !matchesSettlement && !matchesSpecs && !matchesOlxId) {
        return false;
      }
    }

    return true;
  });

  const olxListingsCount = items.filter(i => i.isOlxArchive).length;
  const localListingsCount = items.filter(i => !i.isOlxArchive).length;

  const handleAiNaturalSearch = () => {
    if (!searchQuery) {
      setSearchQuery('дрова');
    }
  };

  return (
    <div className="space-y-6 text-slate-100 animate-fadeIn">
      {/* Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950/90 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">
            <Briefcase className="w-4 h-4" />
            <span>Цифровий Маркетплейс Рокитнівщини</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Товари, Послуги & Продукція Громади
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Офіційний локальний бізнес-майданчик з інтегрованим архівуванням OLX оголошень Рокитнівщини.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 shrink-0 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Подати оголошення</span>
        </button>
      </div>

      {/* Quick Source Switcher Bar */}
      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilters({ ...filters, olxMode: 'all' })}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filters.olxMode === 'all'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>Всі оголошення</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900/80 text-[10px] font-mono">{items.length}</span>
          </button>

          <button
            onClick={() => setFilters({ ...filters, olxMode: 'olx_only' })}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filters.olxMode === 'olx_only'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-amber-300 border border-slate-800'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-amber-400" />
            <span>Архів OLX Рокитне</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 text-[10px] font-mono border border-amber-500/30">{olxListingsCount}</span>
          </button>

          <button
            onClick={() => setFilters({ ...filters, olxMode: 'local_only' })}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filters.olxMode === 'local_only'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Місцевий бізнес</span>
            <span className="px-1.5 py-0.2 rounded-full bg-teal-950 text-teal-300 text-[10px] font-mono border border-teal-500/30">{localListingsCount}</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Синхронізація OLX оголошень Рокитнівщини активна</span>
        </div>
      </div>

      {/* Order Success Toast Banner */}
      {orderSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-xs font-mono font-bold flex items-center justify-between shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Замовлення успішно оформлено! Номер: <strong>{orderSuccessMessage}</strong>. Продавець зв'яжеться з вами.</span>
          </div>
          <button onClick={() => setOrderSuccessMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dedicated Global Search Field & Quick Category Chips */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/90 border border-emerald-500/30 shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Шукати в Маркетплейсі за назвою, категорією, описом чи характеристиками..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Очистити пошук"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Live Search Results Counter */}
            <div className="px-3 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Знайдено: {filteredItems.length}</span>
            </div>

            <button
              onClick={handleAiNaturalSearch}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono hover:bg-cyan-900 transition-colors cursor-pointer"
              title="Швидка підказка для пошуку"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Пошук</span>
            </button>

            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              title="Фільтри"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Quick Search Tag Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 shrink-0 flex items-center gap-1">
            <Tag className="w-3 h-3 text-emerald-400" />
            <span>Швидкий пошук:</span>
          </span>
          {POPULAR_SEARCH_TAGS.map(tag => (
            <button
              key={tag.label}
              onClick={() => setSearchQuery(tag.query)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                searchQuery.toLowerCase().includes(tag.query)
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Sidebar + Product Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <MarketplaceFilterSidebar
          filters={filters}
          onChangeFilters={setFilters}
          onResetFilters={handleResetFilters}
          totalResultsCount={filteredItems.length}
        />

        {/* Mobile Filter Modal */}
        <MarketplaceFilterSidebar
          filters={filters}
          onChangeFilters={setFilters}
          onResetFilters={handleResetFilters}
          totalResultsCount={filteredItems.length}
          isOpenMobile={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
        />

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-4">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-950/80 border border-slate-800 space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Оголошень за даними фільтрами не знайдено</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Спробуйте змінити ціновий діапазон, категорію чи обраний населений пункт.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Скинути всі фільтри</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <MarketplaceProductCard
                  key={item.id}
                  item={item}
                  onOpenDetail={setSelectedItemForDetail}
                  onBuyNow={setSelectedItemForBuy}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedItemForDetail && (
        <ProductDetailModal
          item={selectedItemForDetail}
          onClose={() => setSelectedItemForDetail(null)}
          onBuyNow={item => {
            setSelectedItemForDetail(null);
            setSelectedItemForBuy(item);
          }}
          onNavigateToMap={item => {
            setSelectedItemForDetail(null);
            if (onNavigateToMap) onNavigateToMap(item);
          }}
        />
      )}

      {selectedItemForBuy && (
        <BuyNowModal
          item={selectedItemForBuy}
          onClose={() => setSelectedItemForBuy(null)}
          onSuccess={orderId => {
            setSelectedItemForBuy(null);
            setOrderSuccessMessage(orderId);
          }}
        />
      )}

      {isCreateOpen && (
        <CreateListingModal
          onClose={() => setIsCreateOpen(false)}
          onCreate={newListing => {
            setItems([newListing, ...items]);
            setIsCreateOpen(false);
          }}
        />
      )}
    </div>
  );
};
