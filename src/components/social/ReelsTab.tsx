import React, { useState } from 'react';
import {
  Video,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  Music,
  UserCheck,
  Tag,
  Volume2,
  VolumeX,
  Plus,
  Play,
  Pause,
  Send,
  Eye,
  Bookmark
} from 'lucide-react';

interface ReelItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  isVerified: boolean;
  settlement: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  soundTrack: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

const INITIAL_REELS: ReelItem[] = [
  {
    id: 'reel-1',
    authorName: 'Марія Боровець',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    authorRole: 'Фотографка / Жителька смт Рокитне',
    isVerified: true,
    settlement: 'смт Рокитне',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    caption: 'Ранкова магія над річкою Лев в Рокитному! Ліс дихає свіжістю 🌲✨ Полісся неймовірне!',
    soundTrack: 'Оригінальний звук — Марія Боровець',
    hashtags: ['#Рокитне', '#Полісся', '#РічкаЛев', '#ПриродаРокитнівщини'],
    likesCount: 342,
    commentsCount: 28,
    sharesCount: 19,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 'reel-2',
    authorName: 'Іван Захаров',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    authorRole: 'Тренер ФК "Полісся"',
    isVerified: true,
    settlement: 'с. Залав\'я',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-playing-football-in-a-stadium-41443-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    caption: 'Вирішальний гол у турнірі між селами громади! Дякуємо вболівальникам за шалену підтримку! ⚽🏆',
    soundTrack: 'Марш Спортивної Громади — Рокитне',
    hashtags: ['#ФутболРокитне', '#СпортГромади', '#Залавʼя', '#Турнір'],
    likesCount: 512,
    commentsCount: 45,
    sharesCount: 33,
    isLiked: true,
    isBookmarked: true
  },
  {
    id: 'reel-3',
    authorName: 'Волонтерський Штаб "Рокитне Полісся"',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    authorRole: 'Офіційна волонтерська спільнота',
    isVerified: true,
    settlement: 'смт Рокитне',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-box-with-donations-42861-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    caption: 'Завантажили черговий бус із тепловізорами та маскувальними сітками для земляків на фронті! Дякуємо усім жителям! 🇺🇦❤️',
    soundTrack: 'Волонтерський Гімн — Захисники Рокитного',
    hashtags: ['#ВолонтериРокитного', '#РазомДоПеремоги', '#ЗСУ', '#Рокитнівщина'],
    likesCount: 890,
    commentsCount: 67,
    sharesCount: 84,
    isLiked: true,
    isBookmarked: false
  }
];

export const ReelsTab: React.FC = () => {
  const [reels, setReels] = useState<ReelItem[]>(INITIAL_REELS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<{ id: string; author: string; text: string; time: string }[]>([
    { id: 'c1', author: 'Валентина К.', text: 'Дуже гарні кадри, пишаюся нашою громадою! 🌲', time: '10 хв тому' },
    { id: 'c2', author: 'Олег С.', text: 'Дякуємо волонтерам за працю! 🇺🇦', time: '5 хв тому' }
  ]);

  const activeReel = reels[currentIndex];

  const toggleLike = (id: string) => {
    setReels(prev =>
      prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            isLiked: !r.isLiked,
            likesCount: r.isLiked ? r.likesCount - 1 : r.likesCount + 1
          };
        }
        return r;
      })
    );
  };

  const toggleBookmark = (id: string) => {
    setReels(prev =>
      prev.map(r => {
        if (r.id === id) {
          return { ...r, isBookmarked: !r.isBookmarked };
        }
        return r;
      })
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setCommentsList(prev => [
      { id: `c-${Date.now()}`, author: 'Я (Житель Рокитного)', text: commentText, time: 'Щойно' },
      ...prev
    ]);

    setReels(prev =>
      prev.map(r => (r.id === activeReel.id ? { ...r, commentsCount: r.commentsCount + 1 } : r))
    );

    setCommentText('');
  };

  return (
    <div className="space-y-6 text-slate-100 animate-fadeIn max-w-2xl mx-auto">
      {/* Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-cyan-950/80 border border-purple-500/30 shadow-2xl flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-mono font-bold uppercase mb-1">
            <Video className="w-3.5 h-3.5" />
            <span>Рокитне Reels & Short Video</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Короткі Відео та Моменти
          </h2>
          <p className="text-xs text-slate-300 max-w-md">
            Вертикальний відеопотік про життя, природи, події та спорт Рокитнівської громади.
          </p>
        </div>

        <button
          onClick={() => alert('Завантажте коротке відео зі смартфона чи ПК. AI Машуня допоможе сформувати хештеги.')}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 shrink-0 hover:scale-105 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Опублікувати Reel</span>
        </button>
      </div>

      {/* Main Reels Vertical Player Container */}
      <div className="relative w-full h-[580px] rounded-3xl overflow-hidden bg-slate-950 border border-purple-500/40 shadow-2xl flex flex-col justify-between group">
        {/* Background Video / Thumbnail */}
        <video
          src={activeReel.videoUrl}
          poster={activeReel.thumbnailUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

        {/* Top Controls Overlay */}
        <div className="relative z-10 p-4 flex items-center justify-between bg-gradient-to-b from-slate-950/80 to-transparent">
          <div className="flex items-center gap-2">
            <img
              src={activeReel.authorAvatar}
              alt={activeReel.authorName}
              className="w-10 h-10 rounded-2xl object-cover ring-2 ring-purple-500 shadow-md"
            />
            <div>
              <div className="font-bold text-xs text-white flex items-center gap-1">
                <span>{activeReel.authorName}</span>
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-[10px] text-slate-300 font-mono">{activeReel.authorRole}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-white hover:bg-slate-900 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-white hover:bg-slate-900 transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Right Floating Actions Column */}
        <div className="absolute right-4 bottom-20 z-20 flex flex-col items-center gap-4 text-white">
          <button
            onClick={() => toggleLike(activeReel.id)}
            className="flex flex-col items-center gap-1 group/btn cursor-pointer"
          >
            <div className={`p-3 rounded-2xl border transition-all ${
              activeReel.isLiked
                ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/50 scale-110'
                : 'bg-slate-950/80 border-slate-800 hover:border-rose-500/50 text-slate-300'
            }`}>
              <Heart className={`w-5 h-5 ${activeReel.isLiked ? 'fill-current' : ''}`} />
            </div>
            <span className="text-[11px] font-bold font-mono">{activeReel.likesCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex flex-col items-center gap-1 group/btn cursor-pointer"
          >
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 text-slate-300 transition-all">
              <MessageCircle className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-[11px] font-bold font-mono">{activeReel.commentsCount}</span>
          </button>

          <button
            onClick={() => toggleBookmark(activeReel.id)}
            className="flex flex-col items-center gap-1 group/btn cursor-pointer"
          >
            <div className={`p-3 rounded-2xl border transition-all ${
              activeReel.isBookmarked
                ? 'bg-amber-600 border-amber-400 text-white'
                : 'bg-slate-950/80 border-slate-800 text-slate-300'
            }`}>
              <Bookmark className={`w-5 h-5 ${activeReel.isBookmarked ? 'fill-current' : ''}`} />
            </div>
          </button>

          <button
            onClick={() => alert(`Посилання на відео збережено!`)}
            className="flex flex-col items-center gap-1 group/btn cursor-pointer"
          >
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white transition-all">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold font-mono">{activeReel.sharesCount}</span>
          </button>
        </div>

        {/* Bottom Details Overlay */}
        <div className="relative z-10 p-5 space-y-2 pr-16 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
          <div className="flex items-center gap-2 text-xs text-cyan-300 font-mono">
            <Music className="w-3.5 h-3.5 text-purple-400 animate-spin-slow" />
            <span className="truncate">{activeReel.soundTrack}</span>
          </div>

          <p className="text-xs text-white font-medium leading-relaxed">
            {activeReel.caption}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {activeReel.hashtags.map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-lg bg-purple-950/80 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Next / Previous Reel Controls */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white font-bold disabled:opacity-30 cursor-pointer"
          >
            ▲ Попереднє
          </button>
          <span className="text-xs font-mono font-bold text-purple-400">
            {currentIndex + 1} / {reels.length}
          </span>
          <button
            disabled={currentIndex === reels.length - 1}
            onClick={() => setCurrentIndex(prev => Math.min(reels.length - 1, prev + 1))}
            className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white font-bold disabled:opacity-30 cursor-pointer"
          >
            ▼ Наступне
          </button>
        </div>

        {/* Comments Overlay Drawer */}
        {showComments && (
          <div className="absolute inset-x-0 bottom-0 z-30 bg-slate-950/95 border-t border-purple-500/40 rounded-t-3xl p-4 space-y-3 animate-fadeIn max-h-80 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-xs text-white flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-cyan-400" />
                <span>Коментарі ({commentsList.length})</span>
              </span>
              <button
                onClick={() => setShowComments(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Закрити
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-xs scrollbar-thin pr-1">
              {commentsList.map(c => (
                <div key={c.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-cyan-300">{c.author}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{c.time}</span>
                  </div>
                  <p className="text-slate-200">{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Залиште коментар..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
