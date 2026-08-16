import React, { useState } from 'react';
import { ProblemCategory, CommunityProblem } from '../../types';
import { AlertTriangle, Camera, MapPin, Send, X, CheckCircle2 } from 'lucide-react';

interface ReportProblemModalProps {
  onClose: () => void;
  onSubmit: (problem: Partial<CommunityProblem>) => void;
}

export const ReportProblemModal: React.FC<ReportProblemModalProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProblemCategory>('дороди');
  const [address, setAddress] = useState('смт Рокитне, вул. Незалежності');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80');

  const categoriesList: ProblemCategory[] = [
    'дороди', 'освітлення', 'вода', 'сміття', 'благоустрій', 'дерева', 'транспорт', 'жкг', 'медицина', 'освіта', 'безпека', 'інше'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onSubmit({
      title,
      category,
      address,
      description,
      imageUrl: photoUrl,
      settlement: 'смт Рокитне',
      coordinates: { lat: 51.2825, lng: 27.2091 }
    });
  };

  return (
    <div className="space-y-4 text-slate-100 p-1">
      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>Заявка буде автоматично класифікована AI та направлена у відповідний відділ.</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label className="block text-slate-300 font-bold mb-1">Назва проблеми *</label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Наприклад: Вибоїна біля зупинки, залиште заявку..."
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Категорія *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as ProblemCategory)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-500 uppercase font-mono text-[11px]"
            >
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Адреса / Локація *</label>
            <input
              type="text"
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-bold mb-1">Детальний опис *</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Опишіть ситуацію, небезпеку та орієнтири..."
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-bold mb-1">Фотокартка проблеми</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              placeholder="URL зображення..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none text-[11px]"
            />
            <button
              type="button"
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5 font-bold shrink-0"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Завантажити</span>
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold"
          >
            Скасувати
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Повідомити про проблему</span>
          </button>
        </div>
      </form>
    </div>
  );
};
