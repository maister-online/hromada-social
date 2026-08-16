import React, { useState } from 'react';
import { PetitionCard } from './PetitionCard';
import { INITIAL_COMMUNITY_PETITIONS } from '../../data/mockData';
import { CommunityPetition } from '../../types';
import { useUser } from '../../context/UserContext';
import { FileSpreadsheet, Plus, Search, Filter } from 'lucide-react';

export const PetitionsTab: React.FC = () => {
  const [petitions, setPetitions] = useState<CommunityPetition[]>(INITIAL_COMMUNITY_PETITIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'accepted'>('all');
  const { addNotification, user } = useUser();

  const handleSignPetition = (id: string) => {
    addNotification({
      category: 'petition',
      title: 'Підпис враховано',
      description: 'Ваш голос успішно додано до електронної петиції.',
      timestamp: 'Щойно'
    });
  };

  const filtered = petitions.filter(p => {
    const matchesQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6 text-slate-100 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider font-mono">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Електронна демократія громади</span>
          </div>
          <h2 className="text-xl font-black text-white">Петиції мешканців</h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Ініціюйте важливі соціальні та інфраструктурні рішення. Петиції, що наберуть 1000 підписів, розглядаються селищним головою.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Пошук петицій..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterStatus === 'all' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'
            }`}
          >
            Всі петиції
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterStatus === 'active' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'
            }`}
          >
            Активні
          </button>
          <button
            onClick={() => setFilterStatus('accepted')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterStatus === 'accepted' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'
            }`}
          >
            Розглянуті
          </button>
        </div>
      </div>

      {/* Petitions list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <PetitionCard key={p.id} petition={p} onSign={handleSignPetition} />
        ))}
      </div>
    </div>
  );
};
