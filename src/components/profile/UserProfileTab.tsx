import React, { useRef, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { User, FileText, FileSpreadsheet, Bookmark, CheckCircle2, ShieldCheck, Camera, Settings, LogOut, Loader2, Image as ImageIcon, MapPin, MoreHorizontal, Heart, MessageCircle, Share2, Pencil, Users, Grid3X3, Mail } from 'lucide-react';

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

  return <div className="space-y-4 sm:space-y-6 text-slate-100 animate-fadeIn">
    <section className="overflow-hidden rounded-3xl bg-slate-950 border border-white/10 shadow-2xl">
      <div className="relative h-32 sm:h-52 bg-gradient-to-br from-cyan-950 via-slate-900 to-violet-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,.28),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,.25),transparent_40%)]" />
        <div className="absolute inset-0 opacity-30" style={{backgroundImage:'linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)',backgroundSize:'28px 28px'}} />
        <button className="absolute right-3 bottom-3 px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-bold flex items-center gap-2"><Camera className="w-4 h-4" /> Змінити обкладинку</button>
      </div>
      <div className="px-4 sm:px-7 pb-5">
        <div className="relative -mt-14 sm:-mt-20 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="relative shrink-0 self-center sm:self-auto">
            <img src={user.avatar} alt={user.name} className="w-28 h-28 sm:w-40 sm:h-40 rounded-full object-cover ring-4 ring-slate-950 shadow-2xl bg-slate-900" />
            <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="absolute right-1 bottom-1 w-11 h-11 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-4 border-slate-950 flex items-center justify-center shadow-lg" title="Завантажити фото профілю">{uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}</button>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) uploadAvatar(file); e.currentTarget.value = ''; }} />
          </div>
          <div className="min-w-0 flex-1 pb-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2"><h1 className="text-2xl sm:text-3xl font-black text-white">{user.name}</h1>{user.isVerified && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}</div>
            <p className="text-sm text-cyan-300 mt-1">{user.role}</p>
            <p className="text-xs text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-1"><MapPin className="w-3.5 h-3.5" /> {user.settlement}</p>
          </div>
          <div className="flex justify-center sm:justify-end gap-2 pb-1"><button onClick={() => inputRef.current?.click()} className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black flex items-center gap-2 hover:bg-cyan-400"><Camera className="w-4 h-4" /> Фото</button><button className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold flex items-center gap-2"><Pencil className="w-4 h-4" /> Редагувати</button><button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300"><MoreHorizontal className="w-4 h-4" /></button></div>
        </div>
        {message && <div className="mt-3 text-center sm:text-left text-[11px] text-slate-400">{message}</div>}
        <div className="mt-5 pt-3 border-t border-white/10 flex gap-5 overflow-x-auto"><button className="shrink-0 px-2 py-2 text-sm font-bold text-cyan-300 border-b-2 border-cyan-400 flex items-center gap-2"><Grid3X3 className="w-4 h-4" /> Публікації</button><button className="shrink-0 px-2 py-2 text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Фото</button><button className="shrink-0 px-2 py-2 text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2"><Users className="w-4 h-4" /> Друзі</button><button className="shrink-0 px-2 py-2 text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2"><User className="w-4 h-4" /> Про себе</button></div>
      </div>
    </section>

    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4 sm:gap-6">
      <div className="space-y-4">
        <section className="rounded-3xl bg-slate-950 border border-white/10 p-4 sm:p-5"><div className="flex items-center gap-3"><img src={user.avatar} className="w-10 h-10 rounded-full object-cover" /><div className="flex-1 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-slate-500">Що у вас нового, {user.name.split(' ')[0]}?</div></div><div className="mt-3 pt-3 border-t border-white/10 flex justify-around"><button className="text-xs font-bold text-slate-300 flex items-center gap-2"><Camera className="w-4 h-4 text-emerald-400" /> Фото/відео</button><button className="text-xs font-bold text-slate-300 flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-400" /> Місце</button></div></section>
        <article className="rounded-3xl bg-slate-950 border border-white/10 p-4 sm:p-5"><div className="flex items-center gap-3"><img src={user.avatar} className="w-10 h-10 rounded-full object-cover" /><div className="flex-1"><div className="font-bold text-sm text-white">{user.name}</div><div className="text-[10px] text-slate-500">Ваша публікація • щойно</div></div><MoreHorizontal className="w-4 h-4 text-slate-500" /></div><p className="mt-4 text-sm text-slate-300">Тут відображатимуться ваші публікації, фото та активність у Hromada Social.</p><div className="mt-4 pt-3 border-t border-white/10 flex justify-around"><button className="text-xs text-slate-400 flex items-center gap-2"><Heart className="w-4 h-4" /> Подобається</button><button className="text-xs text-slate-400 flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Коментар</button><button className="text-xs text-slate-400 flex items-center gap-2"><Share2 className="w-4 h-4" /> Поширити</button></div></article>
      </div>
      <aside className="space-y-4"><section className="rounded-3xl bg-slate-950 border border-white/10 p-5"><h2 className="font-black text-white mb-4">Інформація</h2><div className="space-y-3 text-xs text-slate-300"><div className="flex gap-3"><MapPin className="w-4 h-4 text-cyan-400 shrink-0" /><span>Живе в <b className="text-white">{user.settlement}</b></span></div><div className="flex gap-3"><Users className="w-4 h-4 text-cyan-400 shrink-0" /><span>Мешканець громади</span></div><div className="flex gap-3"><Mail className="w-4 h-4 text-cyan-400 shrink-0" /><span>{user.email}</span></div></div></section><section className="rounded-3xl bg-slate-950 border border-white/10 p-5"><h2 className="font-black text-white mb-4">Ваша активність</h2><div className="grid grid-cols-3 gap-2 text-center"><div><div className="text-xl font-black text-white">2</div><div className="text-[10px] text-slate-500">Звернення</div></div><div><div className="text-xl font-black text-white">5</div><div className="text-[10px] text-slate-500">Петиції</div></div><div><div className="text-xl font-black text-white">{bookmarks.length}</div><div className="text-[10px] text-slate-500">Збережені</div></div></div></section></aside>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[[Settings,'Налаштування','Приватність, сповіщення, вигляд'],[ShieldCheck,'Безпека','Захист облікового запису'],[LogOut,'Вийти','Завершити сеанс на цьому пристрої']].map(([Icon,title,subtitle]: any) => <button key={title} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-400/30 text-left flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><Icon className="w-4 h-4 text-cyan-300" /></span><span><span className="block text-sm font-bold text-white">{title}</span><span className="block text-xs text-slate-500 mt-1">{subtitle}</span></span></button>)}</div>
  </div>;
};
