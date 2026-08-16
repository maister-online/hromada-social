import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import {
  Users,
  Search,
  UserPlus,
  UserCheck,
  MessageSquare,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Filter,
  Sparkles,
  Heart,
  User
} from 'lucide-react';

interface ResidentProfile {
  id: string;
  name: string;
  avatar: string;
  settlement: string;
  role: string;
  isVerified: boolean;
  mutualFriendsCount: number;
  bio: string;
  interests: string[];
  isFriend: boolean;
  isOnline: boolean;
}

const INITIAL_RESIDENTS: ResidentProfile[] = [
  {
    id: 'res-1',
    name: 'Григорій Таргонський',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    settlement: 'смт Рокитне',
    role: 'Селищний голова Рокитнівської громади',
    isVerified: true,
    mutualFriendsCount: 142,
    bio: 'Селищний голова Рокитнівської територіальної громади. Працюємо задля розвитку Полісся!',
    interests: ['Місцеве самоврядування', 'Благоустрій', 'Розвиток громади'],
    isFriend: true,
    isOnline: true
  },
  {
    id: 'res-2',
    name: 'Валентина Коваль',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    settlement: 'смт Рокитне',
    role: 'Вчителька / Верифікований житель',
    isVerified: true,
    mutualFriendsCount: 28,
    bio: 'Викладачка української мови. Организую культурні ініціативи для молоді Рокитного.',
    interests: ['Освіта', 'Культура', 'Волонтерство'],
    isFriend: true,
    isOnline: true
  },
  {
    id: 'res-3',
    name: 'Сергій Боловець',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    settlement: 'с. Блажове',
    role: 'Староста Блажовського округу',
    isVerified: true,
    mutualFriendsCount: 54,
    bio: 'Староста Блажове, Залав’я, Більськ. Завжди на зв’язку з мешканцями.',
    interests: ['Агросектор', 'Благоустрій', 'Спорт'],
    isFriend: false,
    isOnline: false
  },
  {
    id: 'res-4',
    name: 'Максим Мельник',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    settlement: 'смт Томашгород',
    role: 'Спортивний активіст',
    isVerified: true,
    mutualFriendsCount: 19,
    bio: 'Лідер спортивного руху Томашгорода. Автор петиції про спортивний майданчик WorkOut.',
    interests: ['Футбол', 'WorkOut', 'Здоровий спосіб життя'],
    isFriend: false,
    isOnline: true
  },
  {
    id: 'res-5',
    name: 'Олена Семенюк',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    settlement: 'с. Сновидовичі',
    role: 'Медсестра & Волонтерка',
    isVerified: true,
    mutualFriendsCount: 37,
    bio: 'Медична працівниця, збираю гуманітарну допомогу для Захисників.',
    interests: ['Медицина', 'Волонтерство ЗСУ', 'Поліська кухня'],
    isFriend: true,
    isOnline: false
  },
  {
    id: 'res-6',
    name: 'Андрій Ковальчук',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    settlement: 'смт Рокитне',
    role: 'Підприємець / Автоклуб',
    isVerified: true,
    mutualFriendsCount: 62,
    bio: 'Засновником автоклубу Рокитного. Займаюся авторемонтом та волонтерською допомогою.',
    interests: ['Автомобілі', 'Техніка', 'Автопробіги'],
    isFriend: false,
    isOnline: true
  }
];

interface ResidentsNetworkTabProps {
  onOpenMessenger?: (residentName: string) => void;
}

export const ResidentsNetworkTab: React.FC<ResidentsNetworkTabProps> = ({ onOpenMessenger }) => {
  const { user } = useUser();
  const [residents, setResidents] = useState<ResidentProfile[]>(INITIAL_RESIDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSettlement, setSelectedSettlement] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'friends' | 'online'>('all');

  const toggleFriend = (id: string) => {
    setResidents(prev =>
      prev.map(r => (r.id === id ? { ...r, isFriend: !r.isFriend } : r))
    );
  };

  const filteredResidents = residents.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.settlement.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSettlement =
      selectedSettlement === 'all' || r.settlement === selectedSettlement;

    if (activeSubTab === 'friends') return matchesSearch && matchesSettlement && r.isFriend;
    if (activeSubTab === 'online') return matchesSearch && matchesSettlement && r.isOnline;
    return matchesSearch && matchesSettlement;
  });

  return (
    <div className="space-y-6 text-slate-100 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-emerald-950/80 border border-cyan-500/30 shadow-2xl space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold uppercase">
              <Users className="w-3.5 h-3.5" />
              <span>Соціальна Мережа Рокитного</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Жителі та Друзі Громади
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Знаходьте сусідів, додавайте друзів, обмінюйтеся повідомленнями та об’єднуйтеся задля розвитку нашої територіальної громади.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shrink-0">
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-lg font-black text-cyan-400 font-mono">1,240+</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Жителів</div>
            </div>
            <div className="text-center px-3">
              <div className="text-lg font-black text-emerald-400 font-mono">850</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Верифіковано</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & SubTabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shadow-xl">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Пошук за ім'ям чи посадою..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Settlement & Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto scrollbar-none">
          <select
            value={selectedSettlement}
            onChange={e => setSelectedSettlement(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none focus:border-cyan-500 font-medium"
          >
            <option value="all">Всі населені пункти</option>
            <option value="смт Рокитне">смт Рокитне</option>
            <option value="с. Блажове">с. Блажове</option>
            <option value="смт Томашгород">смт Томашгород</option>
            <option value="с. Сновидовичі">с. Сновидовичі</option>
            <option value="с. Залав'я">с. Залав'я</option>
          </select>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'all' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Усі жителі ({residents.length})
            </button>
            <button
              onClick={() => setActiveSubTab('friends')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'friends' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Мої Друзі ({residents.filter(r => r.isFriend).length})
            </button>
            <button
              onClick={() => setActiveSubTab('online')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'online' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Онлайн ({residents.filter(r => r.isOnline).length})
            </button>
          </div>
        </div>
      </div>

      {/* Residents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResidents.map(resident => (
          <div
            key={resident.id}
            className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-xl space-y-3.5 relative group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={resident.avatar}
                    alt={resident.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-cyan-500/30 group-hover:scale-105 transition-transform"
                  />
                  {resident.isOnline && (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950" title="Онлайн зараз" />
                  )}
                </div>

                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>{resident.name}</span>
                    {resident.isVerified && (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 fill-cyan-400/20" title="Верифікований житель громади" />
                    )}
                  </div>
                  <div className="text-[11px] text-cyan-300 font-medium">
                    {resident.role}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{resident.settlement}</span>
                    <span className="mx-1">•</span>
                    <span>{resident.mutualFriendsCount} спільних друзів</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => toggleFriend(resident.id)}
                  className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    resident.isFriend
                      ? 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-rose-950/50 hover:text-rose-300 hover:border-rose-500/40'
                      : 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md hover:from-cyan-500 hover:to-teal-500'
                  }`}
                  title={resident.isFriend ? 'Видалити з друзів' : 'Додати в друзі'}
                >
                  {resident.isFriend ? (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline">Друзі</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span className="hidden sm:inline">Додати</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => alert(`Профіль жителя: ${resident.name} (${resident.role}). Зв'язок доступний у спільнотах та офіційному кабінеті громади.`)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Інформація про жителя"
                >
                  <User className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
              "{resident.bio}"
            </p>

            {/* Interests Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {resident.interests.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
