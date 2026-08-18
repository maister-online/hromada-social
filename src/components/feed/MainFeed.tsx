import React, { useState } from 'react';
import { PostCard } from './PostCard';
import { INITIAL_SOCIAL_POSTS, INITIAL_STORIES } from '../../data/mockData';
import { SocialPost, StoryItem } from '../../types';
import { useUser } from '../../context/UserContext';
import {
  Image,
  Send,
  Plus,
  Sparkles,
  X,
  MapPin,
  Megaphone,
  Users,
  Newspaper,
  Heart,
  BadgeCheck,
  Camera
} from 'lucide-react';

const EXTRA_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post-502', author: 'Валентина Коваль', authorName: 'Валентина Коваль',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    authorRole: 'Вчителька / Верифікований житель', isOfficialAccount: false, isVerified: true,
    settlement: 'смт Рокитне', timestamp: '2 години тому', createdAt: '2 години тому', privacy: 'public',
    category: 'Ініціатива громади',
    content: 'Сьогодні разом із учнями провели толоку біля дитячого майданчика у парку. Посаджено 15 нових туй та пофарбовано лавочки! Дякуємо комунальній службі за допомогу. 🌳',
    mediaUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80'],
    reactions: { like: 84, love: 52, wow: 12, bravo: 44, helpful: 31 }, likesCount: 84,
    userLiked: false, commentsCount: 14, sharesCount: 6,
    comments: [{ id: 'c502-1', authorName: 'Сергій Боловець', authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', text: 'Молодці! Чудовий приклад для громади.', createdAt: '1 годину тому' }]
  },
  {
    id: 'post-503', author: 'Олена Семенюк', authorName: 'Олена Семенюк',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    authorRole: 'Волонтерка ЗСУ', isOfficialAccount: false, isVerified: true, settlement: 'с. Сновидовичі',
    timestamp: '4 години тому', createdAt: '4 години тому', privacy: 'public', category: 'Волонтерство & ЗСУ',
    content: '🚨 ТЕРМІНОВИЙ ЗБІР ДЛЯ ЗАХИСНИКІВ З РОКИТНІВЩИНИ!\n\nХлопцям потрібні портативні станції та маскувальні сітки. Дякуємо кожному, хто підтримує волонтерський штаб!',
    reactions: { like: 195, love: 140, wow: 20, bravo: 98, helpful: 110 }, likesCount: 195,
    userLiked: true, commentsCount: 22, sharesCount: 35
  }
];

export const MainFeed: React.FC = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState<SocialPost[]>([...INITIAL_SOCIAL_POSTS, ...EXTRA_SOCIAL_POSTS]);
  const [stories, setStories] = useState<StoryItem[]>(INITIAL_STORIES);
  const [activeTab, setActiveTab] = useState('all');
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Оголошення мешканця');
  const [newPostLocation, setNewPostLocation] = useState('смт Рокитне');
  const [showImageInput, setShowImageInput] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryUrl, setNewStoryUrl] = useState('');

  const createPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    const post: SocialPost = {
      id: `post-${Date.now()}`, authorName: user.name, authorAvatar: user.avatar, authorRole: user.role,
      isOfficialAccount: false, isVerified: true, createdAt: 'Щойно', settlement: newPostLocation,
      category: newPostCategory, content: newPostText, imageUrls: newPostImage ? [newPostImage] : undefined,
      likesCount: 0, userLiked: false, reactions: { like: 0, love: 0, wow: 0, bravo: 0, helpful: 0 },
      commentsCount: 0, sharesCount: 0
    };
    setPosts(p => [post, ...p]); setNewPostText(''); setNewPostImage(''); setShowImageInput(false);
  };

  const addStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryTitle.trim()) return;
    const story: StoryItem = {
      id: `story-${Date.now()}`, title: newStoryTitle,
      mediaUrl: newStoryUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      authorName: user.name, authorAvatar: user.avatar, authorRole: user.role, isVerified: true
    };
    setStories(s => [story, ...s]); setNewStoryTitle(''); setNewStoryUrl(''); setShowAddStoryModal(false);
  };

  const filteredPosts = posts.filter(p => {
    if (activeTab === 'official') return p.isOfficialAccount;
    if (activeTab === 'volunteers') return p.category.includes('Волонтерство') || p.content.includes('ЗСУ');
    if (activeTab === 'initiatives') return p.category.includes('Ініціатива') || p.category.includes('Толока');
    return true;
  });

  return (
    <main className="max-w-2xl mx-auto w-full pb-10 animate-fadeIn">
      {/* Social network identity */}
      <section className="mb-4 rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
        <div className="h-24 sm:h-32 bg-gradient-to-r from-cyan-950 via-slate-900 to-emerald-950 relative">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,.7),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,.5),transparent_35%)]" />
        </div>
        <div className="px-4 sm:px-6 pb-4 relative">
          <div className="flex items-end gap-3 -mt-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-950 p-1 border border-cyan-500/40 shadow-xl">
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl object-cover" />
            </div>
            <div className="pb-1 min-w-0">
              <div className="flex items-center gap-1.5 font-black text-white">Рокитне Live <BadgeCheck className="w-4 h-4 text-cyan-400" /></div>
              <div className="text-[11px] text-slate-400">Соціальна мережа Рокитнівської громади</div>
            </div>
          </div>
          <div className="flex gap-2 mt-4 text-[11px] overflow-x-auto scrollbar-none">
            <span className="px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 whitespace-nowrap">Мешканці громади</span>
            <span className="px-3 py-1.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 whitespace-nowrap">Новини</span>
            <span className="px-3 py-1.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 whitespace-nowrap">Події</span>
            <span className="px-3 py-1.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 whitespace-nowrap">Допомога</span>
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="mb-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-sm font-black text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-cyan-400" /> Історії</h2>
          <span className="text-[10px] text-emerald-400">● LIVE</span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
          <button onClick={() => setShowAddStoryModal(true)} className="w-24 h-32 shrink-0 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 flex flex-col items-center justify-center gap-2 transition-all">
            <span className="w-9 h-9 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center"><Plus className="w-5 h-5" /></span>
            <span className="text-[10px] font-bold text-slate-300">Додати історію</span>
          </button>
          {stories.map(s => (
            <button key={s.id} onClick={() => setSelectedStory(s)} className="w-24 h-32 shrink-0 rounded-2xl overflow-hidden relative border border-slate-800 hover:border-cyan-400 transition-all text-left">
              <img src={s.mediaUrl} alt={s.title || ''} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
              <img src={s.authorAvatar} alt={s.authorName} className="absolute top-2 left-2 w-7 h-7 rounded-full object-cover ring-2 ring-cyan-400" />
              <span className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-white line-clamp-2">{s.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Composer */}
      <section className="rounded-3xl bg-slate-950 border border-slate-800 shadow-xl p-4 mb-4">
        <form onSubmit={createPost}>
          <div className="flex gap-3">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800 shrink-0" />
            <textarea value={newPostText} onChange={e => setNewPostText(e.target.value)} rows={2}
              placeholder={`Що нового у громаді, ${user.name.split(' ')[0]}?`}
              className="flex-1 resize-none rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500/60 transition-colors" />
          </div>
          {showImageInput && <input value={newPostImage} onChange={e => setNewPostImage(e.target.value)} placeholder="URL фотографії" className="mt-3 w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500" />}
          <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-900">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              <button type="button" onClick={() => setShowImageInput(v => !v)} className="px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"><Camera className="w-4 h-4 text-emerald-400" /> Фото</button>
              <select value={newPostCategory} onChange={e => setNewPostCategory(e.target.value)} className="px-2 rounded-xl bg-transparent text-xs text-slate-400 outline-none">
                <option>Оголошення мешканця</option><option>Ініціатива громади</option><option>Волонтерство & ЗСУ</option><option>Питання / Порада</option>
              </select>
              <select value={newPostLocation} onChange={e => setNewPostLocation(e.target.value)} className="hidden sm:block px-2 rounded-xl bg-transparent text-xs text-slate-400 outline-none">
                <option>смт Рокитне</option><option>с. Блажове</option><option>смт Томашгород</option><option>с. Сновидовичі</option>
              </select>
            </div>
            <button type="submit" disabled={!newPostText.trim()} className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"><Send className="w-3.5 h-3.5" /> Опублікувати</button>
          </div>
        </form>
      </section>

      {/* Feed navigation */}
      <nav className="flex bg-slate-950 border border-slate-800 rounded-2xl p-1 mb-4 overflow-x-auto scrollbar-none">
        {[['all','Для вас',Newspaper],['official','Офіційні',Megaphone],['volunteers','Волонтери',Heart],['initiatives','Громада',Users]].map(([id,label,Icon]) => (
          <button key={id as string} onClick={() => setActiveTab(id as string)} className={`flex-1 min-w-fit px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === id ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
            {React.createElement(Icon as React.ElementType, { className: 'w-3.5 h-3.5' })}{label}
          </button>
        ))}
      </nav>

      {/* Posts */}
      <section className="space-y-4">
        {filteredPosts.length ? filteredPosts.map(post => <PostCard key={post.id} post={post} />) : (
          <div className="rounded-3xl bg-slate-950 border border-slate-800 p-10 text-center text-slate-500">У цій категорії поки немає дописів.</div>
        )}
      </section>

      {/* Story viewer */}
      {selectedStory && <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedStory(null)}>
        <div className="relative w-full max-w-md h-[min(720px,90vh)] rounded-3xl overflow-hidden border border-cyan-500/30" onClick={e => e.stopPropagation()}>
          <img src={selectedStory.mediaUrl} alt={selectedStory.title || ''} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
          <button onClick={() => setSelectedStory(null)} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white"><X className="w-5 h-5" /></button>
          <div className="absolute top-4 left-4 flex items-center gap-2"><img src={selectedStory.authorAvatar} alt={selectedStory.authorName} className="w-9 h-9 rounded-full ring-2 ring-cyan-400" /><div><div className="text-xs font-bold text-white">{selectedStory.authorName}</div><div className="text-[10px] text-cyan-300">{selectedStory.authorRole}</div></div></div>
          <div className="absolute bottom-5 left-5 right-5"><h3 className="text-xl font-black text-white">{selectedStory.title}</h3><p className="text-xs text-slate-300 mt-1">Рокитне Live · Історії громади</p></div>
        </div>
      </div>}

      {/* Add story */}
      {showAddStoryModal && <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <form onSubmit={addStory} className="w-full max-w-md rounded-3xl bg-slate-950 border border-slate-800 p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-5"><h3 className="font-black text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-cyan-400" /> Нова історія</h3><button type="button" onClick={() => setShowAddStoryModal(false)} className="text-slate-400"><X /></button></div>
          <input required value={newStoryTitle} onChange={e => setNewStoryTitle(e.target.value)} placeholder="Про що ваша історія?" className="w-full mb-3 rounded-xl bg-slate-900 border border-slate-800 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500" />
          <input value={newStoryUrl} onChange={e => setNewStoryUrl(e.target.value)} placeholder="URL фото (необов'язково)" className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-3 text-xs text-white outline-none focus:border-cyan-500" />
          <button type="submit" className="w-full mt-4 py-3 rounded-xl bg-cyan-500 text-slate-950 font-black text-sm">Опублікувати історію</button>
        </form>
      </div>}
    </main>
  );
};