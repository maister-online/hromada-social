import React, { useRef, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { uploadImageToFirebase, firebaseConfigured } from '../../lib/firebase';
import { Camera, CheckCircle2, ShieldCheck, Settings, LogOut, Loader2, Image as ImageIcon, MapPin, MoreHorizontal, Heart, MessageCircle, Share2, Pencil, Users, Grid3X3, Mail, X } from 'lucide-react';

export const UserProfileTab: React.FC = () => {
  const { user, bookmarks, updateAvatar } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState<'posts' | 'photos' | 'friends'>('posts');
  const [panel, setPanel] = useState<'edit' | 'settings' | 'security' | 'more' | null>(null);
  const [liked, setLiked] = useState(false);

  const uploadPhoto = async (file: File, type: 'avatar' | 'cover' = 'avatar') => {
    if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.type)) { setMessage('Підтримуються JPG, PNG, WEBP та GIF.'); return; }
    if (file.size > 8 * 1024 * 1024) { setMessage('Фото має бути не більше 8 МБ.'); return; }
    if (!firebaseConfigured) { setMessage('Firebase не налаштований у production. Перевірте VITE_FIREBASE_* у Railway.'); return; }
    setUploading(true); setMessage('Завантаження у Firebase Storage…');
    try {
      const result = await uploadImageToFirebase(file, type === 'avatar' ? 'users' : 'covers');
      if (type === 'avatar') updateAvatar(result.url);
      setMessage(type === 'avatar' ? 'Фото профілю збережено.' : 'Обкладинку збережено.');
    } catch (e: any) {
      const code = e?.code ? ` (${e.code})` : '';
      setMessage(`Не вдалося завантажити фото${code}: ${e?.message || 'невідома помилка'}`);
    } finally { setUploading(false); }
  };

  const chooseAvatar = () => { setMessage(''); inputRef.current?.click(); };
  const chooseCover = () => { setMessage(''); coverInputRef.current?.click(); };
  const logout = () => { try { localStorage.removeItem('hromada-user-profile'); } catch {} window.location.reload(); };

  return <div className="space-y-4 sm:space-y-6 text-slate-100 animate-fadeIn">
    <section className="overflow-hidden rounded-3xl bg-slate-950 border border-white/10 shadow-2xl">
      <div className="relative h-32 sm:h-52 bg-gradient-to-br from-cyan-950 via-slate-900 to-violet-950">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,.28),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,.25),transparent_40%)]" />
        <button type="button" onClick={chooseCover} disabled={uploading} className="absolute right-3 bottom-3 z-10 px-3 py-2 rounded-xl bg-black/70 border border-white/15 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50"><Camera className="w-4 h-4" /> Змінити обкладинку</button>
        <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={e => { const f=e.target.files?.[0]; if(f) void uploadPhoto(f,'cover'); e.currentTarget.value=''; }} />
      </div>
      <div className="px-4 sm:px-7 pb-5">
        <div className="relative -mt-14 sm:-mt-20 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="relative shrink-0 self-center sm:self-auto">
            <img src={user.avatar} alt={user.name} className="w-28 h-28 sm:w-40 sm:h-40 rounded-full object-cover ring-4 ring-slate-950 shadow-2xl bg-slate-900" />
            <button type="button" onClick={chooseAvatar} disabled={uploading} className="absolute right-1 bottom-1 z-10 w-11 h-11 rounded-full bg-cyan-500 text-slate-950 border-4 border-slate-950 flex items-center justify-center disabled:opacity-50">{uploading?<Loader2 className="w-5 h-5 animate-spin"/>:<Camera className="w-5 h-5"/>}</button>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f) void uploadPhoto(f);e.currentTarget.value='';}} />
          </div>
          <div className="min-w-0 flex-1 pb-1 text-center sm:text-left"><div className="flex flex-wrap items-center justify-center sm:justify-start gap-2"><h1 className="text-2xl sm:text-3xl font-black text-white">{user.name}</h1>{user.isVerified&&<CheckCircle2 className="w-5 h-5 text-emerald-400"/>}</div><p className="text-sm text-cyan-300 mt-1">{user.role}</p><p className="text-xs text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-1"><MapPin className="w-3.5 h-3.5"/>{user.settlement}</p></div>
          <div className="flex justify-center gap-2 pb-1">
            <button type="button" onClick={chooseAvatar} disabled={uploading} className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black flex items-center gap-2 disabled:opacity-50"><Camera className="w-4 h-4"/> Фото</button>
            <button type="button" onClick={()=>setPanel('edit')} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold flex items-center gap-2"><Pencil className="w-4 h-4"/> Редагувати</button>
            <button type="button" onClick={()=>setPanel('more')} className="p-2.5 rounded-xl bg-white/5 border border-white/10" aria-label="Додаткові дії"><MoreHorizontal className="w-4 h-4"/></button>
          </div>
        </div>
        {message&&<div className="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-[11px] text-slate-300 break-words">{message}</div>}
        <div className="mt-5 pt-3 border-t border-white/10 flex gap-5 overflow-x-auto">
          {([['posts','Публікації',Grid3X3],['photos','Фото',ImageIcon],['friends','Друзі',Users]] as const).map(([id,label,Icon]) => <button key={id} type="button" onClick={()=>setActiveSection(id)} className={`px-2 py-2 text-sm font-bold flex items-center gap-2 whitespace-nowrap ${activeSection===id?'text-cyan-300 border-b-2 border-cyan-400':'text-slate-400'}`}><Icon className="w-4 h-4"/>{label}</button>)}
        </div>
      </div>
    </section>

    {panel && <section className="rounded-3xl bg-slate-950 border border-cyan-400/20 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4"><h2 className="font-black text-white">{panel==='edit'?'Редагування профілю':panel==='settings'?'Налаштування':panel==='security'?'Безпека':'Додаткові дії'}</h2><button type="button" onClick={()=>setPanel(null)} className="p-2 rounded-xl bg-white/5 text-slate-400"><X className="w-4 h-4"/></button></div>
      {panel==='edit' && <div className="space-y-3 text-sm text-slate-300"><p>Ім’я: <b className="text-white">{user.name}</b></p><p>Email: <b className="text-white">{user.email}</b></p><button type="button" onClick={chooseAvatar} className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold">Змінити фото профілю</button></div>}
      {panel==='settings' && <div className="space-y-2 text-sm text-slate-300"><div className="p-3 rounded-xl bg-white/5">Сповіщення: увімкнені</div><div className="p-3 rounded-xl bg-white/5">Профіль: локальне збереження увімкнено</div></div>}
      {panel==='security' && <div className="space-y-2 text-sm text-slate-300"><div className="p-3 rounded-xl bg-white/5">Firebase Authentication використовується для доступу до Storage.</div><div className="p-3 rounded-xl bg-white/5">Не передавайте API-ключі або паролі іншим користувачам.</div></div>}
      {panel==='more' && <div className="space-y-2"><button type="button" onClick={chooseCover} className="w-full text-left p-3 rounded-xl bg-white/5 text-white">Змінити обкладинку</button><button type="button" onClick={()=>setMessage('Посилання на профіль готове для копіювання.') } className="w-full text-left p-3 rounded-xl bg-white/5 text-white">Поділитися профілем</button></div>}
    </section>}

    {activeSection==='posts' && <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4 sm:gap-6"><div className="space-y-4"><section className="rounded-3xl bg-slate-950 border border-white/10 p-4 sm:p-5"><div className="flex items-center gap-3"><img src={user.avatar} className="w-10 h-10 rounded-full object-cover"/><div className="flex-1 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-slate-500">Що у вас нового, {user.name.split(' ')[0]}?</div></div><div className="mt-3 pt-3 border-t border-white/10"><button type="button" onClick={chooseAvatar} className="text-xs font-bold text-slate-300 flex items-center gap-2"><Camera className="w-4 h-4 text-emerald-400"/> Фото/відео</button></div></section><article className="rounded-3xl bg-slate-950 border border-white/10 p-4 sm:p-5"><div className="flex items-center gap-3"><img src={user.avatar} className="w-10 h-10 rounded-full object-cover"/><div><div className="font-bold text-sm text-white">{user.name}</div><div className="text-[10px] text-slate-500">Ваша публікація • щойно</div></div></div><p className="mt-4 text-sm text-slate-300">Тут відображатимуться ваші публікації, фото та активність у Hromada Social.</p><div className="mt-4 pt-3 border-t border-white/10 flex justify-around"><button type="button" onClick={()=>setLiked(v=>!v)} className={`text-xs flex gap-2 ${liked?'text-rose-400':'text-slate-400'}`}><Heart className="w-4 h-4"/> {liked?'Подобається':'Подобається'}</button><button type="button" onClick={()=>setMessage('Коментарі будуть доступні після підключення публікацій.') } className="text-xs text-slate-400 flex gap-2"><MessageCircle className="w-4 h-4"/> Коментар</button><button type="button" onClick={()=>setMessage('Публікацію можна поширити після підключення публікацій.') } className="text-xs text-slate-400 flex gap-2"><Share2 className="w-4 h-4"/> Поширити</button></div></article></div><aside className="space-y-4"><section className="rounded-3xl bg-slate-950 border border-white/10 p-5"><h2 className="font-black text-white mb-4">Інформація</h2><div className="space-y-3 text-xs text-slate-300"><div className="flex gap-3"><MapPin className="w-4 h-4 text-cyan-400"/>Живе в <b className="text-white">{user.settlement}</b></div><div className="flex gap-3"><Users className="w-4 h-4 text-cyan-400"/>Мешканець громади</div><div className="flex gap-3"><Mail className="w-4 h-4 text-cyan-400"/>{user.email}</div></div></section><section className="rounded-3xl bg-slate-950 border border-white/10 p-5"><h2 className="font-black text-white mb-4">Ваша активність</h2><div className="grid grid-cols-3 gap-2 text-center"><div><div className="text-xl font-black">2</div><div className="text-[10px] text-slate-500">Звернення</div></div><div><div className="text-xl font-black">5</div><div className="text-[10px] text-slate-500">Петиції</div></div><div><div className="text-xl font-black">{bookmarks.length}</div><div className="text-[10px] text-slate-500">Збережені</div></div></div></section></aside></div>}
    {activeSection==='photos' && <section className="rounded-3xl bg-slate-950 border border-white/10 p-6 text-center"><ImageIcon className="w-8 h-8 mx-auto text-cyan-300"/><h2 className="mt-3 font-black text-white">Фото</h2><p className="mt-1 text-sm text-slate-500">Ваші завантажені фото з’являться тут.</p><button type="button" onClick={chooseAvatar} className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold">Додати фото</button></section>}
    {activeSection==='friends' && <section className="rounded-3xl bg-slate-950 border border-white/10 p-6 text-center"><Users className="w-8 h-8 mx-auto text-cyan-300"/><h2 className="mt-3 font-black text-white">Друзі</h2><p className="mt-1 text-sm text-slate-500">Список друзів буде доступний після підключення соціального графа.</p></section>}

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <button type="button" onClick={()=>setPanel('settings')} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><Settings className="w-4 h-4 text-cyan-300"/></span><span><span className="block text-sm font-bold text-white">Налаштування</span><span className="block text-xs text-slate-500 mt-1">Приватність, сповіщення, вигляд</span></span></button>
      <button type="button" onClick={()=>setPanel('security')} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-cyan-300"/></span><span><span className="block text-sm font-bold text-white">Безпека</span><span className="block text-xs text-slate-500 mt-1">Захист облікового запису</span></span></button>
      <button type="button" onClick={logout} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><LogOut className="w-4 h-4 text-cyan-300"/></span><span><span className="block text-sm font-bold text-white">Вийти</span><span className="block text-xs text-slate-500 mt-1">Завершити сеанс на цьому пристрої</span></span></button>
    </div>
  </div>;
};
