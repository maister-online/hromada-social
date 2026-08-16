import React, { useState } from 'react';
import {
  Filter,
  DollarSign,
  MapPin,
  CheckCircle2,
  X,
  RotateCcw,
  Tag,
  SlidersHorizontal,
  ShieldCheck,
  Building2,
  User,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  Archive,
  Sparkles
} from 'lucide-react';
import { ROKYTNE_SETTLEMENTS } from '../../data/rokytneData';
import { CATEGORIES_WITH_SUBCATEGORIES, MarketplaceCategoryDef } from '../../data/marketplaceData';

export interface MarketplaceFilterState {
  category: string;
  subcategory: string;
  minPrice: string;
  maxPrice: string;
  settlement: string;
  sellerType: 'all' | 'business' | 'private';
  condition: 'all' | 'new' | 'used' | 'craft';
  olxMode: 'all' | 'olx_only' | 'local_only';
}

interface MarketplaceFilterSidebarProps {
  filters: MarketplaceFilterState;
  onChangeFilters: (newFilters: MarketplaceFilterState) => void;
  onResetFilters: () => void;
  totalResultsCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const CATEGORIES_LIST = CATEGORIES_WITH_SUBCATEGORIES;

export const MarketplaceFilterSidebar: React.FC<MarketplaceFilterSidebarProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
  totalResultsCount,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    [filters.category]: true
  });

  const toggleCategoryExpand = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const handleCategoryChange = (catId: string) => {
    onChangeFilters({ ...filters, category: catId, subcategory: 'all' });
    setExpandedCategories(prev => ({ ...prev, [catId]: true }));
  };

  const handleSubcategoryChange = (subcatId: string) => {
    onChangeFilters({ ...filters, subcategory: subcatId });
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFilters({ ...filters, minPrice: e.target.value });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFilters({ ...filters, maxPrice: e.target.value });
  };

  const handleSettlementChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeFilters({ ...filters, settlement: e.target.value });
  };

  const handleSellerTypeChange = (type: 'all' | 'business' | 'private') => {
    onChangeFilters({ ...filters, sellerType: type });
  };

  const handleOlxModeChange = (mode: 'all' | 'olx_only' | 'local_only') => {
    onChangeFilters({ ...filters, olxMode: mode });
  };

  const content = (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">Фільтри та Категорії</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetFilters}
            className="text-[11px] text-slate-400 hover:text-emerald-400 font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="Скинути фільтри"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Скинути</span>
          </button>
          {isOpenMobile && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* OLX Archive Filter Mode Switcher */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-teal-500/30 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-teal-300 uppercase">
          <Archive className="w-4 h-4 text-amber-400" />
          <span>Джерело оголошень</span>
        </div>

        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
          <button
            onClick={() => handleOlxModeChange('all')}
            className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filters.olxMode === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Усі
          </button>
          <button
            onClick={() => handleOlxModeChange('olx_only')}
            className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              filters.olxMode === 'olx_only' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Оголошення з архіву OLX Рокитне"
          >
            <Archive className="w-3 h-3" />
            <span>OLX Архів</span>
          </button>
          <button
            onClick={() => handleOlxModeChange('local_only')}
            className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filters.olxMode === 'local_only' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Місцеві
          </button>
        </div>
      </div>

      {/* Category & Subcategory Tree */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Категорії та Підкатегорії
        </label>
        <div className="space-y-1.5">
          {CATEGORIES_WITH_SUBCATEGORIES.map((cat: MarketplaceCategoryDef) => {
            const Icon = cat.icon;
            const isCategorySelected = filters.category === cat.id;
            const hasSubcategories = cat.subcategories.length > 0;
            const isExpanded = expandedCategories[cat.id] || isCategorySelected;

            return (
              <div key={cat.id} className="space-y-1">
                {/* Main Category Row */}
                <div
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    isCategorySelected
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${isCategorySelected ? 'text-white' : 'text-emerald-400'}`} />
                    <span>{cat.label}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {isCategorySelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    {hasSubcategories && (
                      <button
                        onClick={(e) => toggleCategoryExpand(cat.id, e)}
                        className="p-1 hover:bg-slate-800/80 rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Subcategories Chips / List */}
                {hasSubcategories && isExpanded && (
                  <div className="pl-3 pr-1 py-1 space-y-1 border-l-2 border-emerald-500/30 ml-2 animate-fadeIn">
                    <button
                      onClick={() => handleSubcategoryChange('all')}
                      className={`w-full text-left px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                        filters.subcategory === 'all' && isCategorySelected
                          ? 'bg-teal-950 text-teal-300 font-bold border border-teal-500/40'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      • Усі підкатегорії
                    </button>

                    {cat.subcategories.map(sub => {
                      const isSubSelected = filters.subcategory === sub.id && isCategorySelected;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            if (!isCategorySelected) handleCategoryChange(cat.id);
                            handleSubcategoryChange(sub.id);
                          }}
                          className={`w-full text-left px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center justify-between ${
                            isSubSelected
                              ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40'
                              : 'text-slate-300 hover:text-white hover:bg-slate-900'
                          }`}
                        >
                          <span className="truncate">{sub.label}</span>
                          {isSubSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ціновий діапазон (₴)</span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-500 font-mono">Від:</span>
            <input
              type="number"
              value={filters.minPrice}
              onChange={handleMinPriceChange}
              placeholder="0"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <span className="text-[10px] text-slate-500 font-mono">До:</span>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={handleMaxPriceChange}
              placeholder="1000000"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Settlement Filter */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span>Населений пункт Рокитнівщини</span>
        </label>

        <select
          value={filters.settlement}
          onChange={handleSettlementChange}
          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">Усі 25 населених пунктів</option>
          {ROKYTNE_SETTLEMENTS.map(s => (
            <option key={s.id} value={s.name}>
              {s.name} ({s.districtName} округ)
            </option>
          ))}
        </select>
      </div>

      {/* Seller Type Filter */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Тип продавця</span>
        </label>

        <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => handleSellerTypeChange('all')}
            className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filters.sellerType === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Усі
          </button>
          <button
            onClick={() => handleSellerTypeChange('business')}
            className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              filters.sellerType === 'business' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>Бізнес</span>
          </button>
          <button
            onClick={() => handleSellerTypeChange('private')}
            className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              filters.sellerType === 'private' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Приватні</span>
          </button>
        </div>
      </div>

      {/* Results Counter Badge */}
      <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center">
        <span className="text-xs font-mono text-slate-300">
          Знайдено оголошень: <strong className="text-emerald-400 text-sm font-bold">{totalResultsCount}</strong>
        </span>
      </div>
    </div>
  );

  if (isOpenMobile) {
    return (
      <div className="fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-md p-5 overflow-y-auto animate-fadeIn">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-xl hidden lg:block sticky top-20">
      {content}
    </div>
  );
};
