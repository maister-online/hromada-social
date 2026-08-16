import React, { useState } from 'react';
import { CommunityPetition } from '../../types';
import { FileSpreadsheet, CheckCircle2, UserCheck, MessageSquare, Share2, Sparkles, Clock } from 'lucide-react';

interface PetitionCardProps {
  petition: CommunityPetition;
  onSign?: (id: string) => void;
}

export const PetitionCard: React.FC<PetitionCardProps> = ({ petition, onSign }) => {
  const [signed, setSigned] = useState(petition.userSigned || false);
  const [signatures, setSignatures] = useState(petition.signaturesCount);

  const percent = Math.min(100, Math.round((signatures / petition.signaturesGoal) * 100));

  const handleSign = () => {
    if (!signed) {
      setSigned(true);
      setSignatures(prev => prev + 1);
      if (onSign) onSign(petition.id);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/40 transition-all shadow-xl space-y-4 text-slate-100">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={petition.authorAvatar}
            alt={petition.authorName}
            className="w-10 h-10 rounded-xl object-cover ring-1 ring-purple-500/40"
          />
          <div>
            <div className="font-bold text-xs text-white">{petition.authorName}</div>
            <div className="text-[10px] text-slate-400 font-mono">
              Створено: {petition.createdDate} • До: {petition.endDate}
            </div>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-950 text-purple-300 border border-purple-500/30 uppercase">
          ✍️ {petition.category}
        </span>
      </div>

      {/* Body */}
      <div className="space-y-2">
        <h3 className="text-base font-extrabold text-white leading-snug">{petition.title}</h3>
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{petition.description}</p>
      </div>

      {petition.imageUrl && (
        <div className="rounded-xl overflow-hidden max-h-52 border border-slate-800">
          <img src={petition.imageUrl} alt={petition.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Signature Progress Gauge */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-purple-400" />
            <span>Підписали: <strong className="text-white">{signatures}</strong> з {petition.signaturesGoal}</span>
          </span>
          <span className="text-purple-300 font-bold">{percent}%</span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Official Answer Box if accepted */}
      {petition.officialAnswer && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-1">
          <div className="font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Офіційна відповідь Рокитнівської селищної ради:</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">{petition.officialAnswer}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-slate-900 pt-3 text-xs">
        <button
          onClick={handleSign}
          disabled={signed}
          className={`px-5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
            signed
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20'
          }`}
        >
          {signed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <FileSpreadsheet className="w-4 h-4" />}
          <span>{signed ? 'Петицію підписано' : 'Підписати петицію'}</span>
        </button>

        <span className="text-slate-400 text-xs flex items-center gap-1 font-mono">
          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
          {petition.commentsCount} коментарів
        </span>
      </div>
    </div>
  );
};
