import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Phone,
  MessageSquare,
  MapPin,
  ShieldCheck,
  Building2,
  Sparkles,
  Truck,
  Eye,
  Heart,
  Calendar,
  Share2,
  CheckCircle2,
  Navigation,
  FileCheck
} from 'lucide-react';
import { BusinessListing } from '../../types';

interface ProductDetailModalProps {
  item: BusinessListing | null;
  onClose: () => void;
  onBuyNow: (item: BusinessListing) => void;
  onNavigateToMap?: (item: BusinessListing) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  onClose,
  onBuyNow,
  onNavigateToMap
}) => {
  const [showPhone, setShowPhone] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!item) return null;

  const images = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls : [item.imageUrl || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80'];
  const formattedPrice = new Intl.NumberFormat('uk-UA').format(item.priceUah);

  const handleAiAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAiAnalysis(
        `🤖 **Аналіз пропозиції від Машуні (AI Спільноти):**\n\n` +
        `• **Оцінка ціни:** Середня ринкова вартість у Рокитнівському районі — ${item.priceUah} ₴ відповідає нормам якості та сезонного попиту.\n` +
        `• **Надійність продавця:** ${item.isVerifiedSeller ? '🟢 Верифікований місцевий продавець.' : '🟡 Звичайний користувач громади.'}\n` +
        `• **Локація:** ${item.settlement} — пряма доставка або самовивіз у межах громади.\n` +
        `• **Порада:** Рекомендуємо узгодити огляд перед розрахунком.`
      );
      setIsAnalyzing(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-6 p-5 sm:p-7 relative text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Section */}
        <div className="space-y-3">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
            <img
              src={images[activeImageIndex]}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
              {item.category}
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === idx ? 'border-emerald-400 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price & Primary Actions Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-950 to-teal-950/90 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {formattedPrice} <span className="text-emerald-400 text-base">₴</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>{item.settlement}</span>
              </span>
              <span>•</span>
              <span className="text-slate-400">{item.dateAdded || 'Сьогодні'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onBuyNow(item)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0 transition-transform active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Купити зараз</span>
            </button>

            {onNavigateToMap && (
              <button
                onClick={() => onNavigateToMap(item)}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Показати на інтерактивній карті громади"
              >
                <Navigation className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          {item.isOlxArchive && (
            <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs font-mono space-y-1">
              <div className="font-bold flex items-center justify-between">
                <span>📦 Оголошення збережено з Архіву OLX Рокитне</span>
                <span className="px-2 py-0.5 rounded bg-amber-900 text-amber-300 text-[10px]">
                  {item.olxStatus === 'sold' ? 'ПРОДАНО В OLX' : item.olxStatus === 'archived' ? 'АРХІВ OLX' : 'АКТИВНЕ В OLX'}
                </span>
              </div>
              <div className="text-[11px] text-amber-300/80">
                Код оголошення OLX: <strong>{item.olxId || 'OLX-UA-ROKYTNE'}</strong> • Дата оригінальної публікації: {item.olxOriginalDate || '2025-2026'}
              </div>
            </div>
          )}

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            {item.title}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            {item.description}
          </p>
        </div>

        {/* Technical Specs Table */}
        {item.specs && Object.keys(item.specs).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
              Характеристики товару
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {Object.entries(item.specs).map(([key, val]) => (
                <div key={key} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                  <span className="text-slate-400 font-mono">{key}:</span>
                  <span className="font-bold text-white">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seller Info Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={item.sellerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt={item.sellerName}
                className="w-10 h-10 rounded-full object-cover border border-emerald-500/40"
              />
              <div>
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span>{item.companyName || item.sellerName}</span>
                  {item.isVerifiedSeller && (
                    <ShieldCheck className="w-4 h-4 text-cyan-400" title="Верифіковано в громаді" />
                  )}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {item.settlement} • На платформі 2 роки
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                🟢 В мережі
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => setShowPhone(!showPhone)}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{showPhone ? item.sellerPhone : 'Показати номер телефону'}</span>
            </button>

            <button
              onClick={() => alert(`Чат з продавцем ${item.sellerName} відкрито.`)}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Написати продавцю</span>
            </button>
          </div>
        </div>

        {/* AI Analysis Tool */}
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs font-mono uppercase">
              <Sparkles className="w-4 h-4" />
              <span>AI Оцінка від Машуні</span>
            </div>

            {!aiAnalysis && (
              <button
                onClick={handleAiAnalysis}
                disabled={isAnalyzing}
                className="px-3 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? 'Аналізую...' : 'Проаналізувати пропозицію'}
              </button>
            )}
          </div>

          {aiAnalysis && (
            <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-mono bg-slate-950/80 p-3 rounded-xl border border-cyan-500/20">
              {aiAnalysis}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
