import React, { useState } from 'react';
import {
  X,
  Plus,
  Camera,
  ImageIcon,
  Upload,
  CheckCircle2
} from 'lucide-react';
import { BusinessListing } from '../../types';

interface CreateListingModalProps {
  onClose: () => void;
  onCreate: (newListing: BusinessListing) => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  onClose,
  onCreate
}) => {
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const titleExtract = description.trim() 
      ? description.slice(0, 40) + (description.length > 40 ? '...' : '') 
      : 'Нове оголошення Рокитне';

    const newListing: BusinessListing = {
      id: `biz-${Date.now()}`,
      title: titleExtract,
      priceUah: 0,
      category: 'будматеріали',
      sellerName: 'Мешканець громади',
      sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      sellerPhone: '+380 (97) 000-0000',
      settlement: 'смт Рокитне',
      location: 'смт Рокитне',
      address: 'смт Рокитне',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
      imageUrls: [imageUrl],
      description: description || 'Без опису',
      dateAdded: 'Сьогодні',
      viewsCount: 1,
      favoritesCount: 0,
      isVerifiedSeller: true,
      specs: { 'Локація': 'смт Рокитне' }
    };

    onCreate(newListing);
  };

  return (
    <div className="fixed inset-0 z-[140] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 relative text-slate-100 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold uppercase">
            <Plus className="w-3.5 h-3.5" />
            <span>Нове оголошення</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Опублікувати допис
          </h2>
        </div>

        {/* Simplified Form: Photo + Description Only */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Photo Section */}
          <div className="space-y-2">
            <label className="font-mono font-bold text-slate-300 uppercase text-[11px] flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Додати фотографія (URL чи завантаження)</span>
            </label>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={imageUrl}
                  alt="Прев'ю фото"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0 bg-slate-900"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="Вставте посилання на фотографію..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-[11px] outline-none focus:border-emerald-500"
                  />
                  <div className="text-[10px] text-slate-500 font-mono">
                    Підтримуються JPG, PNG, Unsplash URL
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <label className="font-mono font-bold text-slate-300 uppercase text-[11px] flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-teal-400" />
              <span>Опис оголошення</span>
            </label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Напишіть опис вашого товару чи оголошення..."
              className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-emerald-500 resize-none text-xs leading-relaxed"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Опублікувати</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
