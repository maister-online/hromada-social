import React, { useState } from 'react';
import {
  MapPin,
  ShieldCheck,
  Heart,
  Eye,
  ShoppingBag,
  MessageSquare,
  Phone,
  Building2,
  Sparkles,
  ArrowRight,
  Truck,
  CheckCircle2
} from 'lucide-react';
import { BusinessListing } from '../../types';

interface MarketplaceProductCardProps {
  item: BusinessListing;
  onOpenDetail: (item: BusinessListing) => void;
  onBuyNow: (item: BusinessListing) => void;
  onToggleFavorite?: (id: string) => void;
}

export const MarketplaceProductCard: React.FC<MarketplaceProductCardProps> = ({
  item,
  onOpenDetail,
  onBuyNow,
  onToggleFavorite
}) => {
  const [isFav, setIsFav] = useState(item.isFavorite || false);

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFav(!isFav);
    if (onToggleFavorite) onToggleFavorite(item.id);
  };

  const formattedPrice = new Intl.NumberFormat('uk-UA').format(item.priceUah);

  return (
    <div
      onClick={() => onOpenDetail(item)}
      className="group rounded-3xl bg-slate-950/90 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-950/30 overflow-hidden flex flex-col cursor-pointer relative"
    >
      {/* Product Image & Badges Overlay */}
      <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
        <img
          src={item.imageUrl || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80'}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-slate-200 font-mono text-[10px] font-bold uppercase">
              {item.category}
            </span>

            {item.isOlxArchive && (
              <span className="px-2.5 py-1 rounded-full bg-amber-950/90 backdrop-blur-md border border-amber-500/50 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>OLX Архів</span>
              </span>
            )}

            {item.isVerifiedBusiness && !item.isOlxArchive && (
              <span className="px-2 py-1 rounded-full bg-cyan-950/90 backdrop-blur-md border border-cyan-400/40 text-cyan-300 font-mono text-[10px] font-bold flex items-center gap-1">
                <Building2 className="w-3 h-3 text-cyan-400" />
                <span>Бізнес громади</span>
              </span>
            )}
          </div>

          <button
            onClick={handleFavClick}
            className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
              isFav
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40'
                : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
            title="Зберегти в обране"
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Location Badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 font-mono">
          <span className="px-2.5 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>{item.settlement || 'Рокитне'}</span>
          </span>

          {item.viewsCount !== undefined && (
            <span className="px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-slate-400 text-[10px] flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{item.viewsCount}</span>
            </span>
          )}
        </div>
      </div>

      {/* Product Information Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight group-hover:text-emerald-300 transition-colors">
              {formattedPrice} <span className="text-sm font-bold text-emerald-400">₴</span>
            </div>
            {item.specs?.['Доставка'] === 'Так' && (
              <span className="text-[10px] text-teal-400 font-mono flex items-center gap-1 bg-teal-950/50 px-2 py-0.5 rounded-md border border-teal-500/30">
                <Truck className="w-3 h-3" />
                <span>Доставка по громаді</span>
              </span>
            )}
          </div>

          <h3 className="text-sm font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-white">
            {item.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Seller Info & Specs Preview */}
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={item.sellerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt={item.sellerName}
                className="w-6 h-6 rounded-full object-cover border border-slate-700 shrink-0"
              />
              <span className="font-semibold text-slate-300 truncate text-[11px]">
                {item.companyName || item.sellerName}
              </span>
              {item.isVerifiedSeller && (
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" title="Верифікований продавець Рокитнівщини" />
              )}
            </div>

            <span className="text-[10px] font-mono text-slate-500 shrink-0">
              {item.dateAdded || 'Сьогодні'}
            </span>
          </div>

          {/* Action Buttons: Buy Now & Details */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={e => {
                e.stopPropagation();
                onBuyNow(item);
              }}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Купити зараз</span>
            </button>

            <button
              onClick={e => {
                e.stopPropagation();
                onOpenDetail(item);
              }}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Детальніше</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
