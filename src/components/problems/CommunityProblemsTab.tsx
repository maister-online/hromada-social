import React, { useState } from 'react';
import { ProblemCard } from './ProblemCard';
import { ReportProblemModal } from './ReportProblemModal';
import { INITIAL_COMMUNITY_PROBLEMS } from '../../data/mockData';
import { CommunityProblem, ProblemCategory } from '../../types';
import { useWindowContext } from '../../context/WindowContext';
import { useUser } from '../../context/UserContext';
import { AlertTriangle, Plus, Search, Filter, CheckCircle2 } from 'lucide-react';

export const CommunityProblemsTab: React.FC = () => {
  const [problems, setProblems] = useState<CommunityProblem[]>(INITIAL_COMMUNITY_PROBLEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const { openWindow } = useWindowContext();
  const { addNotification, user } = useUser();

  const handleCreateProblem = (newProb: Partial<CommunityProblem>) => {
    const created: CommunityProblem = {
      id: `prob-${Date.now()}`,
      title: newProb.title || 'Нове звернення про проблему',
      description: newProb.description || '',
      category: newProb.category || 'інше',
      settlement: newProb.settlement || 'смт Рокитне',
      address: newProb.address || 'Рокитнівська громада',
      coordinates: newProb.coordinates,
      imageUrl: newProb.imageUrl,
      authorName: user.name,
      authorAvatar: user.avatar,
      createdAt: 'Сьогодні, щойно',
      status: 'new',
      statusProgress: 10,
      assignedDepartment: 'Диспетчерський сектор селищної ради',
      upvotesCount: 1,
      userVoted: true,
      commentsCount: 0,
      updatesHistory: [{ date: 'Сьогодні', status: 'Нове', note: 'Заявку прийнято системою' }]
    };

    setProblems(prev => [created, ...prev]);

    addNotification({
      category: 'problem',
      title: 'Проблему зареєстровано',
      description: `Ваше звернення "${created.title}" прийнято у систему.`,
      timestamp: 'Щойно'
    });
  };

  const handleOpenReportModal = () => {
    openWindow({
      id: 'report-problem-window',
      title: '⚠️ Повідомити про проблему у громаді',
      component: (
        <ReportProblemModal
          onClose={() => {}}
          onSubmit={(p) => {
            handleCreateProblem(p);
          }}
        />
      ),
      initialSize: { width: 560, height: 520 }
    });
  };

  const filtered = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCat === 'all' || p.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 text-slate-100 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-cyan-950/80 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
            <AlertTriangle className="w-4 h-4" />
            <span>Інтерактивна система рішень</span>
          </div>
          <h2 className="text-xl font-black text-white">Проблеми громади</h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Повідомляйте про ями на дорогах, пошкоджене освітлення чи сміття. Статус виконання відстежується прозоро у реальному часі.
          </p>
        </div>

        <button
          onClick={handleOpenReportModal}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 shrink-0 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Повідомити про проблему</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Пошук за назвою чи адресою..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none">
          <span className="text-slate-400 font-mono text-[11px] shrink-0">Категорія:</span>
          {['all', 'дороди', 'освітлення', 'дерева', 'сміття', 'вода'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all uppercase font-mono ${
                selectedCat === cat
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'Всі' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Feed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <ProblemCard key={p.id} problem={p} />
        ))}
      </div>
    </div>
  );
};
