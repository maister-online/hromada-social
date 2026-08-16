import React, { useState } from 'react';
import { COMMUNITY_POSTS } from '../data/mockData';
import { ForumPost } from '../types';
import {
  MessageSquare,
  ThumbsUp,
  MessageCircle,
  Share2,
  PlusCircle,
  Megaphone,
  UserCheck,
  Send,
  CheckCircle2,
  Filter,
  Sparkles,
  Flame,
  Search,
  Building,
  Heart
} from 'lucide-react';

interface CommunityForumTabProps {
  onNavigateTab: (tab: string, payload?: any) => void;
}

export const CommunityForumTab: React.FC<CommunityForumTabProps> = ({ onNavigateTab }) => {
  const [posts, setPosts] = useState<ForumPost[]>(COMMUNITY_POSTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newPostModalOpen, setNewPostModalOpen] = useState(false);

  // New Post Form State
  const [authorName, setAuthorName] = useState('');
  const [settlement, setSettlement] = useState('смт Рокитне');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<'discussion' | 'initiative' | 'announcement' | 'recreation_meet' | 'lost_found'>('discussion');
  const [newCommentTexts, setNewCommentTexts] = useState<{ [postId: string]: string }>({});

  const categories = [
    { id: 'all', label: 'Всі дописи' },
    { id: 'initiative', label: '🧹 Толоки & Ініціативи' },
    { id: 'discussion', label: '💬 Дискусії громади' },
    { id: 'recreation_meet', label: '🎉 Відпочинок & Зустрічі' },
    { id: 'announcement', label: '📢 Оголошення Старост' }
  ];

  const handleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  const handleAddComment = (postId: string) => {
    const text = newCommentTexts[postId];
    if (!text || !text.trim()) return;

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const newComments = p.comments || [];
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [
              ...newComments,
              {
                id: `c-${Date.now()}`,
                author: 'Я (Житель громади)',
                text: text.trim(),
                timestamp: 'Щойно'
              }
            ]
          };
        }
        return p;
      })
    );

    setNewCommentTexts(prev => ({ ...prev, [postId]: '' }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postContent || !authorName) return;

    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      author: authorName,
      authorRole: 'Житель Рокитнівщини',
      category: postCategory,
      title: postTitle,
      content: postContent,
      likes: 1,
      sharesCount: 0,
      commentsCount: 0,
      timestamp: 'Щойно',
      settlement: settlement,
      comments: []
    };

    setPosts([newPost, ...posts]);
    setNewPostModalOpen(false);
    setPostTitle('');
    setPostContent('');
    setAuthorName('');
  };

  const filteredPosts = posts.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Платформа Діалогу & Спілкування Громади</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Громадський Чат & Форум Жителів Рокитнівщини 💬
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Спілкуйтеся із сусідами та земляками, пропонуйте місцеві еко-ініціативи, організовуйте спільний відпочинок та залишайте звернення до старостатів у єдиному відкритому середовищі.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setNewPostModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Створити Допис або Обговорення</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/50'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Пошук обговорення..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Forum Posts List */}
      <div className="space-y-4">
        {filteredPosts.map(post => (
          <div
            key={post.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 hover:border-indigo-500/40 transition-colors shadow-lg"
          >
            {/* Author Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">{post.author}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-medium">
                      {post.authorRole}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>📍 {post.settlement}</span>
                    <span>•</span>
                    <span>{post.timestamp}</span>
                  </div>
                </div>
              </div>

              {post.isPopular && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Популярне</span>
                </span>
              )}
            </div>

            {/* Post Content */}
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                {post.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>
            </div>

            {/* Interaction Bar */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 transition-colors border border-slate-800 font-semibold"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Вподобати ({post.likes})</span>
                </button>

                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Коментарів: {post.commentsCount}</span>
                </span>
              </div>
            </div>

            {/* Comments List */}
            {post.comments && post.comments.length > 0 && (
              <div className="pt-2 space-y-2 pl-2 border-l-2 border-indigo-500/30">
                {post.comments.map(c => (
                  <div key={c.id} className="bg-slate-950/80 p-2.5 rounded-xl text-xs space-y-0.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-cyan-300">{c.author}</span>
                      <span>{c.timestamp}</span>
                    </div>
                    <p className="text-slate-200 text-xs">{c.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newCommentTexts[post.id] || ''}
                onChange={(e) =>
                  setNewCommentTexts({ ...newCommentTexts, [post.id]: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddComment(post.id);
                }}
                placeholder="Напишіть відповідь сусідам..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleAddComment(post.id)}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Creating New Post */}
      {newPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 relative shadow-2xl animate-scaleUp">
            <button
              onClick={() => setNewPostModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Громадський Форум
              </span>
              <h3 className="text-lg font-extrabold text-white">
                Новий Допис у Чаті Громади
              </h3>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Ваше Ім'я</label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    placeholder="Напр: Андрій В."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Населений пункт</label>
                  <select
                    value={settlement}
                    onChange={e => setSettlement(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="смт Рокитне">смт Рокитне</option>
                    <option value="с. Кисоричі">с. Кисоричі</option>
                    <option value="с. Блажове">с. Блажове</option>
                    <option value="с. Сновидовичі">с. Сновидовичі</option>
                    <option value="с. Глинне">с. Глинне</option>
                    <option value="с. Томашгород">с. Томашгород</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Категорія</label>
                <select
                  value={postCategory}
                  onChange={e => setPostCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="initiative">🧹 Ініціатива / Толока</option>
                  <option value="discussion">💬 Загальна Дискусія</option>
                  <option value="recreation_meet">🎉 Відпочинок / Зустрічі</option>
                  <option value="announcement">📢 Оголошення</option>
                  <option value="lost_found">🔍 Бюро Знахідок</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Заголовок теми</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  placeholder="Про що саме тема?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Текст допису</label>
                <textarea
                  required
                  rows={4}
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  placeholder="Опишіть деталі вашої пропозиції чи запитання..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Опублікувати у Форумі</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
