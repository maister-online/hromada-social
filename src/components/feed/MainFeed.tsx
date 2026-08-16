import React, { useState } from 'react';
import { PostCard } from './PostCard';
import { INITIAL_SOCIAL_POSTS, INITIAL_STORIES } from '../../data/mockData';
import { SocialPost, StoryItem } from '../../types';
import { useUser } from '../../context/UserContext';
import {
  Sparkles,
  Image,
  Send,
  Plus,
  Compass,
  TrendingUp,
  MessageCircle,
  Megaphone,
  Calendar,
  MapPin,
  X,
  Smile,
  Globe,
  Tag
} from 'lucide-react';

const EXTRA_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post-502',
    author: 'Валентина Коваль',
    authorName: 'Валентина Коваль',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    authorRole: 'Вчителька / Верифікований житель',
    isOfficialAccount: false,
    isVerified: true,
    settlement: 'смт Рокитне',
    timestamp: '2 години тому',
    createdAt: '2 години тому',
    privacy: 'public',
    category: 'Ініціатива громади',
    content: 'Сьогодні разом із учнями провели толоку біля дитячого майданчика у парку. Посаджено 15 нових туй та пофарбовано лавочки! Дякуємо комунальній службі за вивіз сміття та надання саджанців. 🌸🌳',
    mediaUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80'],
    reactions: { like: 84, love: 52, wow: 12, bravo: 44, helpful: 31 },
    likesCount: 84,
    userLiked: false,
    commentsCount: 14,
    sharesCount: 6,
    comments: [
      {
        id: 'c502-1',
        authorName: 'Сергій Боловець',
        authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        text: 'Молодці! Чудовий приклад для всіх старостинських округів.',
        createdAt: '1 годину тому'
      }
    ]
  },
  {
    id: 'post-503',
    author: 'Олена Семенюк',
    authorName: 'Олена Семенюк',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    authorRole: 'Волонтерка ЗСУ',
    isOfficialAccount: false,
    isVerified: true,
    settlement: 'с. Сновидовичі',
    timestamp: '4 години тому',
    createdAt: '4 години тому',
    privacy: 'public',
    category: 'Волонтерство & ЗСУ',
    content: '🚨 ТЕРМІНОВИЙ ЗБІР ДЛЯ ЗАХИСНИКІВ З РОКИТНІВЩИНИ!\n\nХлопцям на покровський напрямок потрібні 2 портативні станції EcoFlow та маскувальні сітки. Будь-які 20, 50 чи 100 грн наближають нас до мети. Дякуємо кожному, хто підтримує наш волонтерський штаб!',
    reactions: { like: 195, love: 140, wow: 20, bravo: 98, helpful: 110 },
    likesCount: 195,
    userLiked: true,
    commentsCount: 22,
    sharesCount: 35
  }
];

export const MainFeed: React.FC = () => {
  const [posts, setPosts] = useState<SocialPost[]>([...INITIAL_SOCIAL_POSTS, ...EXTRA_SOCIAL_POSTS]);
  const [stories, setStories] = useState<StoryItem[]>(INITIAL_STORIES);
  const [activeTab, setActiveTab] = useState<string>('all');

  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Оголошення мешканця');
  const [newPostLocation, setNewPostLocation] = useState('смт Рокитне');
  const [showImageInput, setShowImageInput] = useState(false);

  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryUrl, setNewStoryUrl] = useState('');

  const { user } = useUser();

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newP: SocialPost = {
      id: `post-${Date.now()}`,
      authorName: user.name,
      authorAvatar: user.avatar,
      authorRole: user.role,
      isOfficialAccount: false,
      isVerified: true,
      createdAt: 'Щойно',
      settlement: newPostLocation,
      category: newPostCategory,
      content: newPostText,
      imageUrls: newPostImage ? [newPostImage] : undefined,
      likesCount: 1,
      userLiked: true,
      reactions: { like: 1, love: 0, wow: 0, bravo: 0, helpful: 0 },
      commentsCount: 0,
      sharesCount: 0
    };

    setPosts(prev => [newP, ...prev]);
    setNewPostText('');
    setNewPostImage('');
    setShowImageInput(false);
  };

  const handleAddStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryTitle.trim()) return;

    const newS: StoryItem = {
      id: `story-${Date.now()}`,
      title: newStoryTitle,
      mediaUrl: newStoryUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      authorName: user.name,
      authorAvatar: user.avatar,
      authorRole: user.role,
      isVerified: true
    };

    setStories(prev => [newS, ...prev]);
    setNewStoryTitle('');
    setNewStoryUrl('');
    setShowAddStoryModal(false);
  };

  const filteredPosts = posts.filter(p => {
    if (activeTab === 'all') return true;
    if (activeTab === 'official') return p.isOfficialAccount;
    if (activeTab === 'volunteers') return p.category.includes('Волонтерство') || p.content.includes('ЗСУ');
    if (activeTab === 'initiatives') return p.category.includes('Ініціатива') || p.category.includes('Толока');
    return true;
  });

  return (
    <div className="space-y-6 text-slate-100 animate-fadeIn">
      {/* Community Stories Horizontal Carousel */}
      <div className="space-y-2">
        <div className="text-xs font-mono uppercase tracking-wider font-bold text-slate-400 flex items-center justify-between px-1">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Історії та Моменти Рокитного</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Рокитне Live
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1">
          {/* Add story button */}
          <div
            onClick={() => setShowAddStoryModal(true)}
            className="w-24 h-36 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-cyan-950/40 border border-cyan-500/30 flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:border-cyan-400 transition-all shrink-0 group shadow-xl"
          >
            <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-2 border border-cyan-500/40 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-white leading-tight">Додати історію</span>
          </div>

          {/* Stories list */}
          {stories.map(s => (
            <div
              key={s.id}
              onClick={() => setSelectedStory(s)}
              className="w-24 h-36 rounded-2xl overflow-hidden relative border border-slate-800 hover:border-cyan-500/80 transition-all cursor-pointer group shrink-0 shadow-xl"
            >
              <img src={s.mediaUrl} alt={s.title || ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute top-2 left-2 ring-2 ring-cyan-400 rounded-full overflow-hidden w-7 h-7 shadow-md">
                <img src={s.authorAvatar} alt={s.authorName} className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-white line-clamp-2 leading-tight">
                {s.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Post Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl space-y-3.5">
        <div className="flex items-center gap-3">
          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-2xl object-cover ring-2 ring-cyan-500/40 shrink-0" />
          <input
            type="text"
            value={newPostText}
            onChange={e => setNewPostText(e.target.value)}
            placeholder={`Що нового у Рокитному, ${user.name.split(' ')[0]}?`}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Options Row */}
        <div className="flex items-center justify-between border-t border-slate-900 pt-2.5 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors ${
                showImageInput ? 'bg-cyan-950 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Image className="w-4 h-4 text-cyan-400" />
              <span>Фото</span>
            </button>

            <select
              value={newPostCategory}
              onChange={e => setNewPostCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none focus:border-cyan-500 font-medium"
            >
              <option value="Оголошення мешканця">Оголошення</option>
              <option value="Ініціатива громади">Ініціатива</option>
              <option value="Волонтерство & ЗСУ">Волонтерство</option>
              <option value="Питання / Порада">Питання</option>
            </select>

            <select
              value={newPostLocation}
              onChange={e => setNewPostLocation(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none focus:border-cyan-500 font-medium hidden sm:block"
            >
              <option value="смт Рокитне">смт Рокитне</option>
              <option value="с. Блажове">с. Блажове</option>
              <option value="смт Томашгород">смт Томашгород</option>
              <option value="с. Сновидовичі">с. Сновидовичі</option>
            </select>
          </div>

          <button
            onClick={handleCreatePost}
            disabled={!newPostText.trim()}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Опублікувати</span>
          </button>
        </div>

        {/* Optional Image Input URL */}
        {showImageInput && (
          <div className="pt-2 animate-fadeIn">
            <input
              type="text"
              value={newPostImage}
              onChange={e => setNewPostImage(e.target.value)}
              placeholder="Вставте URL-адресу фотографія або фото (https://...)..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-cyan-500"
            />
          </div>
        )}
      </div>

      {/* Feed Filters Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-slate-900 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'all' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          📰 Усі дописи ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('official')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'official' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🏛️ Офіційні новини рада
        </button>
        <button
          onClick={() => setActiveTab('volunteers')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'volunteers' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🇺🇦 Волонтерство & ЗСУ
        </button>
        <button
          onClick={() => setActiveTab('initiatives')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'initiatives' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🌳 Ініціативи мешканців
        </button>
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.map(p => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>

      {/* Story View Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm h-[520px] rounded-3xl overflow-hidden border border-cyan-500/40 shadow-2xl flex flex-col justify-between animate-fadeIn">
            <img src={selectedStory.mediaUrl} alt={selectedStory.title || ''} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

            {/* Modal Header */}
            <div className="relative z-10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={selectedStory.authorAvatar} alt={selectedStory.authorName} className="w-8 h-8 rounded-full ring-2 ring-cyan-400 object-cover" />
                <div>
                  <div className="font-bold text-xs text-white">{selectedStory.authorName}</div>
                  <div className="text-[10px] text-cyan-300 font-mono">{selectedStory.authorRole}</div>
                </div>
              </div>

              <button
                onClick={() => setSelectedStory(null)}
                className="p-1.5 rounded-full bg-slate-950/60 text-white hover:bg-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Bottom */}
            <div className="relative z-10 p-4 space-y-2">
              <h3 className="text-lg font-black text-white leading-tight">{selectedStory.title}</h3>
              <p className="text-xs text-slate-200">Опубліковано у соціальній мережі Рокитне Live.</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Story Modal */}
      {showAddStoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-950 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <span>Додати Історію Громади</span>
              </h3>
              <button
                onClick={() => setShowAddStoryModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStory} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Заголовок історії:</label>
                <input
                  type="text"
                  required
                  value={newStoryTitle}
                  onChange={e => setNewStoryTitle(e.target.value)}
                  placeholder="напр. Ярмарок на площі..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">URL фото або банера:</label>
                <input
                  type="text"
                  value={newStoryUrl}
                  onChange={e => setNewStoryUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddStoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 font-bold"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold shadow-md"
                >
                  Додати історію
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

