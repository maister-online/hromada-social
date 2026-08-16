import React, { useState } from 'react';
import { CommunityProblem, ProblemStatus } from '../../types';
import { useWindowContext } from '../../context/WindowContext';
import {
  AlertTriangle,
  MapPin,
  Building2,
  ThumbsUp,
  MessageSquare,
  Share2,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ProblemCardProps {
  problem: CommunityProblem;
  onUpvote?: (id: string) => void;
  onOpenMap?: (coords: { lat: number; lng: number }) => void;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({ problem, onUpvote, onOpenMap }) => {
  const [upvoted, setUpvoted] = useState(problem.userVoted || false);
  const [votesCount, setVotesCount] = useState(problem.upvotesCount);
  const [showHistory, setShowHistory] = useState(false);

  const handleVote = () => {
    if (upvoted) {
      setUpvoted(false);
      setVotesCount(prev => prev - 1);
    } else {
      setUpvoted(true);
      setVotesCount(prev => prev + 1);
    }
    if (onUpvote) onUpvote(problem.id);
  };

  const getStatusBadge = (status: ProblemStatus) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">🟠 Нове</span>;
      case 'accepted':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-500/40">🔵 Прийнято</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-500/40">🟣 В роботі ({problem.statusProgress}%)</span>;
      case 'resolved':
      case 'closed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">🟢 Виконано</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={problem.authorAvatar}
            alt={problem.authorName}
            className="w-10 h-10 rounded-xl object-cover ring-1 ring-cyan-500/40"
          />
          <div>
            <div className="font-bold text-xs text-white">{problem.authorName}</div>
            <div className="text-[10px] text-slate-400 font-mono">
              {problem.createdAt} • {problem.settlement}
            </div>
          </div>
        </div>

        {getStatusBadge(problem.status)}
      </div>

      {/* Problem Title & Category */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
            ⚠️ {problem.category}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            {problem.address}
          </span>
        </div>
        <h3 className="text-sm font-bold text-white leading-snug">{problem.title}</h3>
        <p className="text-xs text-slate-300 leading-relaxed">{problem.description}</p>
      </div>

      {/* Image Attachment if available */}
      {problem.imageUrl && (
        <div className="rounded-xl overflow-hidden border border-slate-800 max-h-64">
          <img
            src={problem.imageUrl}
            alt={problem.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Status Progress Bar */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Відповідальний: <strong className="text-white">{problem.assignedDepartment}</strong></span>
          </span>
          <span className="text-cyan-300 font-bold">{problem.statusProgress}%</span>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${problem.statusProgress}%` }}
          />
        </div>

        {/* Status History Toggle */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 hover:underline pt-1"
        >
          <span>{showHistory ? 'Сховати історію змін' : 'Показати хронологію обробки'}</span>
          {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showHistory && problem.updatesHistory && (
          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] animate-fadeIn">
            {problem.updatesHistory.map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-300">
                <span className="text-[10px] font-mono text-cyan-400 shrink-0">{h.date}</span>
                <span className="font-bold text-white shrink-0">[{h.status}]</span>
                <span className="text-slate-400">{h.note}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between border-t border-slate-900 pt-3 text-xs">
        <button
          onClick={handleVote}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
            upvoted
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Підтримати ({votesCount})</span>
        </button>

        {problem.coordinates && onOpenMap && (
          <button
            onClick={() => onOpenMap(problem.coordinates!)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 font-medium border border-slate-800"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>На карті</span>
          </button>
        )}
      </div>
    </div>
  );
};
