import React, { useRef, useState } from 'react';
import { X, Plus, Camera, ImageIcon, CheckCircle2, Loader2 } from 'lucide-react';
import { BusinessListing } from '../../types';
import { uploadImage } from '../../services/uploadService';

interface CreateListingModalProps { onClose: () => void; onCreate: (newListing: BusinessListing) => void; }

export const CreateListingModal: React.FC<CreateListingModalProps> = ({ onClose, onCreate }) => {
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const choosePhoto = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadImage(file);
      setImageUrl(uploaded.url); setPreviewUrl(uploaded.url);
    } catch (e) { alert(e instanceof Error ? e.message : 'Не вдалося завантажити фото'); }
    finally { setUploading(false); }
  };

  const clearPhoto = () => { setImageUrl(''); setPreviewUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const titleExtract = description.trim() ? description.slice(0, 40) + (description.length > 40 ? '...' : '') : 'Нове оголошення Рокитне';
    const newListing: BusinessListing = {
      id: `biz-${Date.now()}`, title: titleExtract, priceUah: 0, category: 'будматеріали', sellerName: 'Мешканець громади',
      sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', sellerPhone: '+380 (97) 000-0000',
      settlement: 'смт Рокитне', location: 'смт Рокитне', address: 'смт Рокитне', imageUrl, imageUrls: imageUrl ? [imageUrl] : [],
      description: description || 'Без опису', dateAdded: 'Сьогодні', viewsCount: 1, favoritesCount: 0, isVerifiedSeller: true,
      specs: { 'Локація': 'смт Рокитне' }
    };
    onCreate(newListing);
  };

  return <div className="fixed inset-0 z-[140] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"><div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 relative text-slate-100 shadow-2xl space-y-5">
    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
    <div className="space-y-1"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold uppercase"><Plus className="w-3.5 h-3.5" />Нове оголошення</div><h2 className="text-xl sm:text-2xl font-black text-white">Опублікувати оголошення</h2></div>
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="space-y-2"><label className="font-mono font-bold text-slate-300 uppercase text-[11px] flex items-center gap-1.5"><Camera className="w-4 h-4 text-emerald-400" />Фото товару</label><div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        {previewUrl ? <div className="relative"><img src={previewUrl} alt="Прев'ю фото" className="w-full h-48 rounded-xl object-cover" /><button type="button" onClick={clearPhoto} className="absolute top-2 right-2 p-2 rounded-full bg-slate-950/80 text-white"><X className="w-4 h-4" /></button></div> : <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full min-h-32 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500/60 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-emerald-400"><input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={e => void choosePhoto(e.target.files?.[0])} />{uploading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Camera className="w-7 h-7" />}<span className="font-bold">{uploading ? 'Завантаження…' : 'Додати фото з телефону'}</span><span className="text-[10px] text-slate-600">JPG, PNG, WEBP • до 8 МБ</span></button>}
      </div></div>
      <div className="space-y-2"><label className="font-mono font-bold text-slate-300 uppercase text-[11px] flex items-center gap-1.5"><ImageIcon className="w-4 h-4 text-teal-400" />Опис оголошення</label><textarea rows={5} required value={description} onChange={e => setDescription(e.target.value)} placeholder="Напишіть опис вашого товару чи оголошення..." className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-emerald-500 resize-none text-xs leading-relaxed" /></div>
      <button type="submit" disabled={uploading} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"><CheckCircle2 className="w-4 h-4" />Опублікувати</button>
    </form>
  </div></div>;
};
