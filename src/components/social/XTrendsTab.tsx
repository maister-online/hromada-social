import React, { useState } from 'react';
import {
  MessageSquare,
  Repeat2,
  Heart,
  Share2,
  Sparkles,
  TrendingUp,
  Hash,
  Send,
  UserCheck,
  Zap,
  Flame,
  MessageCircle
} from 'lucide-react';

interface XPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  settlement: string;
  isVerified: boolean;
  content: string;
  timestamp: string;
  repostsCount: number;
  likesCount: number;
  repliesCount: number;
  isLiked: boolean;
  isReposted: boolean;
}

const INITIAL_X_POSTS: XPost[] = [
  {
    id: 'x-1',
    authorName: 'Рокитне Рада',
    authorHandle: '@rokytne_rada',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    settlement: 'смт Рокитне',
    isVerified: true,
    content: '⚡ ТЕРМІНОВО: Завтра з 09:00 до 14:00 буде тимчасово призупинено водопостачання по вул. Незалежності через ремонт насосної станції. Просимо зробити запас води!',
    timestamp: '15 хв тому',
    repostsCount: 42,
    likesCount: 89,
    repliesCount: 12,
    isLiked: false,
    isReposted: false
  },
  {
    id: 'x-2',
    authorName: 'Тарас Поліщук',
    authorHandle: '@taras_rokytne',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    settlement: 'с. Блажове',
    isVerified: true,
    content: 'Зібрали 45 000 грн на благодійному ярмарку у Блажовому! Усі кошти передані на автомобіль для 104 ОБр ТрО! Дякуємо громаді! 🇺🇦💪 #ТолокаБлажове #ЗСУ',
    timestamp: '1 годину тому',
    repostsCount: 29,
    likesCount: 154,
    repliesCount: 8,
    isLiked: true,
    isReposted: true
  },
  {
    id: 'x-3',
    authorName: 'Еко-Варта Полісся',
    authorHandle: '@eco_rokytne',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    settlement: 'с. Сновидовичі',
    isVerified: true,
    content: 'Нагадуємо про сувору заборону спалювання сухостою! Штрафи від 3060 грн. Бережіть поліські ліси від пожеж! 🔥🌳 #БезПожеж #ЕкоРокитне',
    timestamp: '3 години тому',
    repostsCount: 18,
    likesCount: 76,
    repliesCount: 4,
    isLiked: false,
    isReposted: false
  }
];

const TRENDING_TOPICS = [
  { tag: '#БлагодійнийЯрмарок', category: 'Волонтерство', postsCount: '142 дописи' },
  { tag: '#РемонтДорогиТомашгород', category: 'Інфраструктура', postsCount: '98 дописів' },
  { tag: '#ЦНАППослуги2026', category: 'Сервіси', postsCount: '76 дописів' },
  { tag: '#ОзероЗалавське', category: 'Туризм', postsCount: '54 дописи' },
  { tag: '#ШколаБлажове', category: 'Освіта', postsCount: '31 допис' }
];

export const XTrendsTab: React.FC = () => {
  const [posts, setPosts] = useState<XPost[]>(INITIAL_X_POSTS);
  const [newText, setNewText] = useState('');

  const MAX_CHARS = 280;

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newP: XPost = {
      id: `x-${Date.now()}`,
      authorName: 'Я (Житель Громади)',
      authorHandle: '@my_rokytne',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      settlement: 'смт Рокитне',
      isVerified: true,
      content: newText,
      timestamp: 'Щойно',
      repostsCount: 0,
      likesCount: 1,
      repliesCount: 0,
      isLiked: true,
      isReposted: false
    };

    setPosts(prev => [newP, ...prev]);
    setNewText('');
  };

  const toggleLike = (id: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            isLiked: !p.isLiked,
            likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1
          };
        }
        return p;
      })
    );
  };

  const toggleRepost = (id: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            isReposted: !p.isReposted,
            repostsCount: p.isReposted ? p.repostsCount - 1 : p.repostsCount + 1
          };
        }
        return p;
      })
    );
  };

  return (
    <div className="space-y-6 text-slate-100 animate-fadeIn">
      {/* Banner Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-cyan-950/90 via-slate-900 to-sky-950/90 border border-cyan-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold uppercase">
            <Zap className="w-3.5 h-3.5" />
            <span>X-Формат & Швидкі Тренди</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Що зараз обговорює Рокитнівщина
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Короткі блискавичні новини, оперативні оголошення та дискусії мешканців у режимі реального часу.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Posts Stream */}
        <div className="lg:col-span-2 space-y-4">
          {/* Create Short Post Box */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex gap-3">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                alt="Avatar"
                className="w-10 h-10 rounded-2xl object-cover ring-2 ring-cyan-500/40 shrink-0"
              />
              <textarea
                value={newText}
                onChange={e => setNewText(e.target.value.slice(0, MAX_CHARS))}
                placeholder="Що відбувається в громаді прямо зараз? (макс 280 символів)"
                rows={3}
                className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-900 pt-3">
              <div className="text-[11px] font-mono font-bold text-slate-400">
                <span className={newText.length > 250 ? 'text-amber-400 font-bold' : ''}>
                  {newText.length}
                </span>{' '}
                / {MAX_CHARS}
              </div>

              <button
                onClick={handlePostSubmit}
                disabled={!newText.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white font-bold text-xs shadow-md disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Опублікувати</span>
              </button>
            </div>
          </div>

          {/* Short Posts Stream */}
          <div className="space-y-3">
            {posts.map(post => (
              <div
                key={post.id}
                className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/30 transition-all shadow-xl space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-10 h-10 rounded-2xl object-cover ring-1 ring-cyan-500/30"
                    />
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-1">
                        <span>{post.authorName}</span>
                        {post.isVerified && <UserCheck className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {post.authorHandle} • {post.settlement}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">{post.timestamp}</span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                  {post.content}
                </p>

                {/* Actions bar */}
                <div className="pt-2 border-t border-slate-900/80 flex items-center justify-between text-slate-400 text-xs font-mono font-bold">
                  <button
                    onClick={() => alert(`Коментарі до допису ${post.authorHandle}`)}
                    className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.repliesCount}</span>
                  </button>

                  <button
                    onClick={() => toggleRepost(post.id)}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                      post.isReposted ? 'text-emerald-400 font-bold' : 'hover:text-emerald-300'
                    }`}
                  >
                    <Repeat2 className="w-4 h-4" />
                    <span>{post.repostsCount}</span>
                  </button>

                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                      post.isLiked ? 'text-rose-400 font-bold' : 'hover:text-rose-300'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span>{post.likesCount}</span>
                  </button>

                  <button
                    onClick={() => alert('Поширено у соцмережі Рокитне!')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Trends in Community */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase font-mono">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Тренди Громади</span>
            </div>

            <div className="space-y-3">
              {TRENDING_TOPICS.map((topic, i) => (
                <div
                  key={i}
                  onClick={() => alert(`Пошук за тегом ${topic.tag}`)}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer space-y-1 group"
                >
                  <div className="text-[10px] text-slate-400 font-mono font-bold">{topic.category}</div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {topic.tag}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono">{topic.postsCount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
