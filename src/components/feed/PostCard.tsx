import React, { useState } from 'react';
import { SocialPost } from '../../types';
import { useUser } from '../../context/UserContext';
import {
  Heart,
  MessageSquare,
  Share2,
  Sparkles,
  CheckCircle2,
  Bookmark,
  MoreHorizontal,
  Send
} from 'lucide-react';

interface PostCardProps {
  post: SocialPost;
  onLike?: (id: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike }) => {
  const { user, bookmarks, toggleBookmark } = useUser();
  const [liked, setLiked] = useState(post.userLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState(post.comments || []);
  const [commentInput, setCommentInput] = useState('');

  const isBookmarked = bookmarks.includes(post.id);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      setLiked(true);
      setLikesCount(prev => prev + 1);
    }
    if (onLike) onLike(post.id);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newC = {
      id: `c-${Date.now()}`,
      authorName: user.name,
      authorAvatar: user.avatar,
      text: commentInput,
      createdAt: 'Щойно'
    };

    setCommentsList(prev => [...prev, newC]);
    setCommentInput('');
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/30 transition-all shadow-xl space-y-3.5 text-slate-100">
      {/* Post Author Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-10 h-10 rounded-xl object-cover ring-1 ring-cyan-500/40"
          />
          <div>
            <div className="font-bold text-xs text-white flex items-center gap-1.5">
              <span>{post.authorName}</span>
              {post.isOfficialAccount && (
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" title="Офіційна сторінка" />
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {post.authorRole} • {post.createdAt}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleBookmark(post.id)}
            className={`p-1.5 rounded-lg hover:bg-slate-900 transition-colors ${
              isBookmarked ? 'text-amber-400' : 'text-slate-500'
            }`}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-2">
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">{post.content}</p>

        {/* AI Summary Widget */}
        {post.content.length > 150 && (
          <div>
            <button
              onClick={() => setShowAiSummary(!showAiSummary)}
              className="text-[10px] font-mono font-bold text-cyan-400 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{showAiSummary ? 'Сховати ШІ аналіз' : 'Згенерувати AI короткий зміст'}</span>
            </button>

            {showAiSummary && (
              <div className="mt-2 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 animate-fadeIn space-y-1">
                <div className="font-bold text-[10px] uppercase font-mono text-cyan-400">
                  ⚡ AI РЕЗЮМЕ ПУБЛІКАЦІЇ:
                </div>
                <p className="text-[11px] leading-relaxed">
                  Повідомлення стосується важливих соціальних та комунальних оновлень у смт Рокитне. Запрошуємо мешканців долучатися до обговорення.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media Gallery */}
      {post.imageUrls && post.imageUrls.length > 0 && (
        <div className="rounded-xl overflow-hidden max-h-80 border border-slate-800">
          <img src={post.imageUrls[0]} alt="Post media" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Stats & Actions Bar */}
      <div className="flex items-center justify-between border-t border-slate-900 pt-3 text-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 font-bold transition-colors ${
              liked ? 'text-rose-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span>{likesCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 font-bold text-slate-400 hover:text-white transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{commentsList.length} коментарів</span>
          </button>
        </div>

        <button
          onClick={() => alert('Посилання на публікацію скопійовано у буфер обміну')}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-3 pt-2 border-t border-slate-900 animate-fadeIn text-xs">
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
            {commentsList.map(c => (
              <div key={c.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px]">{c.authorName}</span>
                  <span className="text-[9px] text-slate-500 font-mono">{c.createdAt}</span>
                </div>
                <p className="text-slate-300 text-[11px]">{c.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex items-center gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              placeholder="Написати коментар..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="p-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
