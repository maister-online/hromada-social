import React from 'react';
import { useUser } from '../../context/UserContext';
import { User, FileText, FileSpreadsheet, Bookmark, CheckCircle2, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

export const UserProfileTab: React.FC = () => {
  const { user, bookmarks } = useUser();

  return (
    <div className="space-y-6 text-slate-100 animate-fadeIn">
      {/* Profile Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-purple-950/80 border border-cyan-500/30 flex flex-col sm:flex-row items-center gap-6 shadow-2xl">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-24 h-24 rounded-2xl object-cover ring-2 ring-cyan-500 shadow-xl"
        />

        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-black text-white">{user.name}</h2>
            {user.isVerified && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ВЕРИФІКОВАНИЙ
              </span>
            )}
          </div>

          <div className="text-xs text-cyan-300 font-mono">{user.role} • {user.settlement}</div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 pt-1">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              {user.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              {user.phone}
            </span>
          </div>
        </div>
      </div>

      {/* User Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Мої офіційні звернення</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">2</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-purple-400" />
            <span>Підписані петиції</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">5</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>Збережені закладки</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{bookmarks.length}</div>
        </div>
      </div>
    </div>
  );
};
