import React, { useState } from 'react';
import { BusinessListing } from '../../types';
import { useUser } from '../../context/UserContext';
import {
  Briefcase,
  Tag,
  Phone,
  MessageSquare,
  Bookmark,
  MapPin,
  CheckCircle2,
  Calendar,
  Eye,
  Car,
  Home,
  Wrench,
  ShoppingBag,
  Tractor
} from 'lucide-react';

interface BusinessCardProps {
  item: BusinessListing;
  onContactSeller?: (phone: string, title: string) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ item, onContactSeller }) => {
  const { bookmarks, toggleBookmark } = useUser();
  const isBookmarked = bookmarks.includes(item.id);
  const [showPhone, setShowPhone] = useState(false);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'auto': return <Car className="w-3.5 h-3.5 text-sky-400" />;
      case 'realty': return <Home className="w-3.5 h-3.5 text-emerald-400" />;
      case 'services': return <Wrench className="w-3.5 h-3.5 text-amber-400" />;
      case 'jobs': return <Briefcase className="w-3.5 h-3.5 text-purple-400" />;
      case 'agro': return <Tractor className="w-3.5 h-3.5 text-teal-400" />;
      default: return <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all shadow-xl space-y-3.5 text-slate-100 group">
      {/* Photo Carousel or Image */}
      {item.imageUrls && item.imageUrls.length > 0 && (
        <div className="relative rounded-xl overflow-hidden h-48 bg-slate-900 border border-slate-800">
          <img
            src={item.imageUrls[0]}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-slate-950/80 border border-slate-700 text-[10px] font-mono font-bold text-white flex items-center gap-1.5 backdrop-blur-md">
            {getCategoryIcon(item.category)}
            <span className="uppercase">{item.category}</span>
          </div>

          <button
            onClick={() => toggleBookmark(item.id)}
            className={`absolute top-2 right-2 p-1.5 rounded-xl backdrop-blur-md transition-colors ${
              isBookmarked
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-950/80 text-slate-300 hover:text-amber-400 border border-slate-700'
            }`}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>

          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-emerald-950/90 text-emerald-300 font-black font-mono text-sm border border-emerald-500/40 backdrop-blur-md">
            {item.priceUah ? `${item.priceUah.toLocaleString('uk-UA')} грн` : 'Договірна'}
          </div>
        </div>
      )}

      {/* Title & Desc */}
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-white leading-snug group-hover:text-emerald-300 transition-colors">
          {item.title}
        </h3>
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{item.description}</p>
      </div>

      {/* Specifications Badges */}
      {item.specs && Object.keys(item.specs).length > 0 && (
        <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
          {Object.entries(item.specs).map(([key, val]) => (
            <span key={key} className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
              {key}: <strong className="text-cyan-300">{val}</strong>
            </span>
          ))}
        </div>
      )}

      {/* Seller Meta */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300">{item.sellerName}</span>
          {item.isVerifiedSeller && (
            <span className="text-emerald-400 text-[10px] flex items-center gap-0.5" title="Перевірений продавець Рокитного">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          {item.location}
        </span>
      </div>

      {/* Contact Options */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
        <button
          onClick={() => setShowPhone(!showPhone)}
          className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>{showPhone ? item.sellerPhone : 'Показати телефон'}</span>
        </button>

        <button
          onClick={() => onContactSeller && onContactSeller(item.sellerPhone, item.title)}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Написати</span>
        </button>
      </div>
    </div>
  );
};
