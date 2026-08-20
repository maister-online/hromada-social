import React, { useEffect, useState } from 'react';
import { Send, Heart, MessageCircle, Share2, Camera, RefreshCw } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { dataApi } from '../../services/dataApi';
import { SocialPost } from '../../types';

export const MainFeed: React.FC = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const data = await dataApi.list<SocialPost>('posts');
      setPosts(data.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))));
    } catch (e) { setError(e instanceof Error ? e.message : 'Не вдалося завантажити стрічку'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const publish = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    try {
      const post = await dataApi.create<SocialPost>('posts', {
        author: user.name, authorName: user.name, authorAvatar: user.avatar, authorRole: user.role,
        isOfficialAccount: false, isVerified: true, settlement: 'Рокитнівська громада',
        timestamp: new Date().toISOString(), createdAt: new Date().toISOString(), privacy: 'public',
        category: 'Оголошення мешканця', content: text.trim(), imageUrls: imageUrl ? [imageUrl.trim()] : undefined,
        reactions: { like: 0, love: 0, wow: 0, bravo: 0, helpful: 0 }, likesCount: 0, userLiked: false, commentsCount: 0, sharesCount: 0
      } as Omit<SocialPost, 'id'>);
      setPosts(current => [post, ...current]); setText(''); setImageUrl('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Не вдалося опублікувати допис'); }
  };

  const like = async (post: SocialPost) => {
    try {
      const updated = await dataApi.update<SocialPost>('posts', post.id, { likesCount: (post.likesCount || 0) + 1, userLiked: true });
      setPosts(current => current.map(item => item.id === updated.id ? updated : item));
    } catch (e) { setError(e instanceof Error ? e.message : 'Не вдалося поставити реакцію'); }
  };

  return <main className="max-w-2xl mx-auto w-full pb-10 space-y-4 animate-fadeIn">
    <section className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl p-5">
      <div className="text-xs uppercase tracking-[0.2em] text-cyan-300 font-bold">Рокитне Live</div>
      <h1 className="text-2xl font-black text-white mt-1">Стрічка громади</h1>
      <p className="text-xs text-slate-500 mt-1">Дописи зберігаються на сервері, а не в демонстраційних масивах.</p>
    </section>

    <section className="rounded-3xl bg-slate-950 border border-slate-800 p-4">
      <form onSubmit={publish} className="space-y-3">
        <div className="flex gap-3"><img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" /><textarea value={text} onChange={e => setText(e.target.value)} rows={3} placeholder={`Що нового, ${user.name.split(' ')[0]}?`} className="flex-1 resize-none rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500" /></div>
        <div className="flex gap-2"><div className="flex-1 flex items-center gap-2"><Camera className="w-4 h-4 text-emerald-400" /><input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="URL фото (необов'язково)" className="w-full bg-transparent text-xs text-slate-300 outline-none" /></div><button disabled={!text.trim()} className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs flex items-center gap-2 disabled:opacity-40"><Send className="w-3.5 h-3.5" />Опублікувати</button></div>
      </form>
    </section>

    {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300">{error}</div>}
    <div className="flex justify-end"><button onClick={() => void load()} className="text-xs text-cyan-300 flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" />Оновити</button></div>
    {loading ? <div className="rounded-3xl bg-slate-950 border border-slate-800 p-10 text-center text-sm text-slate-500">Завантаження стрічки…</div> : posts.length === 0 ? <div className="rounded-3xl bg-slate-950 border border-slate-800 p-10 text-center text-sm text-slate-500">Поки немає дописів. Створи перший.</div> : posts.map(post => <article key={post.id} className="rounded-3xl bg-slate-950 border border-slate-800 p-4 shadow-xl">
      <div className="flex gap-3"><img src={post.authorAvatar || user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" /><div><div className="font-bold text-white text-sm">{post.authorName || post.author || 'Мешканець громади'}</div><div className="text-[10px] text-slate-500">{post.settlement || 'Рокитнівська громада'} · {post.createdAt || post.timestamp || ''}</div></div></div>
      <p className="mt-4 text-sm text-slate-200 whitespace-pre-wrap leading-6">{post.content}</p>
      {post.imageUrls?.[0] && <img src={post.imageUrls[0]} alt="" className="mt-3 w-full max-h-[420px] object-cover rounded-2xl" />}
      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-slate-900 text-xs text-slate-500"><button onClick={() => void like(post)} className={`flex items-center gap-1.5 ${post.userLiked ? 'text-pink-400' : 'hover:text-pink-400'}`}><Heart className="w-4 h-4" />{post.likesCount || 0}</button><span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" />{post.commentsCount || 0}</span><span className="flex items-center gap-1.5"><Share2 className="w-4 h-4" />{post.sharesCount || 0}</span></div>
    </article>)}
  </main>;
};
