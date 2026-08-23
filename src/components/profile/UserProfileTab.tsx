import React, { useRef, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { User, FileText, FileSpreadsheet, Bookmark, CheckCircle2, ShieldCheck, Phone, Mail, Camera, Settings, LogOut, Loader2 } from 'lucide-react';

export const UserProfileTab: React.FC = () => {
  const { user, bookmarks, updateAvatar } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const uploadAvatar = async (file: File) => {
    if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.type)) { setMessage('Підтримуються JPG, PNG, WEBP та GIF.'); return; }
    if (file.size > 8 * 1024 * 1024) { setMessage('Фото має бути не більше 8 МБ.'); return; }
    setUploading(true); setMessage('Завантаження фото…');
    try {
      const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      const response = await fetch('/api/upload/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data, mimeType: file.type, name: file.name }) });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error || 'Не вдалося завантажити фото.');
      updateAvatar(result.url); setMessage('Фото профілю оновлено.');
    } catch (error: any) { setMessage(error?.message || 'Помилка завантаження.'); }
    finally { setUploading(false); }
  };

  return <div className="space-y-6 text-slate-100 animate-fadeIn">
    <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-purple-950/80 border border-cyan-500/30 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="relative shrink-0">
          <img src={user.avatar} alt={user.name} className="w-28 h-28 rounded-3xl object-cover ring-2 ring-cyan-500 shadow-xl" />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="absolute -right-2 -bottom-2 w-11 h-11 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-4 border-slate-950 flex items-center justify-center shadow-lg" title="Завантажити фото профілю">{uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}</button>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) uploadAvatar(file); e.currentTarget.value = ''; }} />
        </div>
        <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2"><h2 className="text-2xl font-black text-white">{user.name}</h2>{user.isVerified && <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> ВЕРИФІКОВАНИЙ</span>}</div>
          <div className="text-xs text-cyan-300 font-mono">{user.role} • {user.settlement}</div>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 pt-1"><span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-cyan-400" />{user.email}</span><span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-emerald-400" />{user.phone}</span></div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2"><button onClick={() => inputRef.current?.click()} className="px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-200 text-xs font-bold flex items-center gap-2 hover:bg-cyan-500/25"><Camera className="w-4 h-4" /> Змінити фото</button><button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold flex items-center gap-2 hover:bg-white/10"><Settings className="w-4 h-4" /> Налаштування</button></div>
          {message && <div className="text-[11px] text-slate-400 pt-1">{message}</div>}
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800"><FileText className="w-4 h-4 text-sky-400 mb-2" /><div className="text-[11px] text-slate-400">Мої звернення</div><div className="text-2xl font-black text-white">2</div></div>
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800"><FileSpreadsheet className="w-4 h-4 text-purple-400 mb-2" /><div className="text-[11px] text-slate-400">Підписані петиції</div><div className="text-2xl font-black text-white">5</div></div>
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 col-span-2 sm:col-span-1"><Bookmark className="w-4 h-4 text-amber-400 mb-2" /><div className="text-[11px] text-slate-400">Збережені</div><div className="text-2xl font-black text-white">{bookmarks.length}</div></div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[[User,'Особисті дані','Ім’я, населений пункт, контакти'],[Settings,'Налаштування','Приватність, сповіщення, вигляд'],[ShieldCheck,'Безпека','Захист облікового запису'],[LogOut,'Вийти','Завершити сеанс на цьому пристрої']].map(([Icon,title,subtitle]: any) => <button key={title} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-400/30 text-left flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><Icon className="w-4 h-4 text-cyan-300" /></span><span><span className="block text-sm font-bold text-white">{title}</span><span className="block text-xs text-slate-500 mt-1">{subtitle}</span></span></button>)}
    </div>
  </div>;
};
