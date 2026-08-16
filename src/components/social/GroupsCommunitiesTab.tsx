import React, { useState } from 'react';
import {
  Users,
  Plus,
  Check,
  Sparkles,
  MessageSquare,
  Lock,
  Globe,
  Search,
  ShieldCheck,
  TrendingUp,
  Image,
  Send
} from 'lucide-react';
import { RokytaGroup } from '../../types';

const INITIAL_GROUPS: RokytaGroup[] = [
  {
    id: 'grp-1',
    name: '🚗 Автоклуб & Драйв Рокитного',
    category: 'Автомобілі & Подорожі',
    coverImage: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=150&q=80',
    membersCount: 480,
    description: 'Офіційна спільнота автовласників та автолюбителів Рокитнівської громади. Обговорення авторемонту, ситуації на дорогах Полісся та автопробігів.',
    isJoined: true,
    privacy: 'Відкрита',
    recentActivity: '12 дописів за сьогодні'
  },
  {
    id: 'grp-2',
    name: '🛍️ Барахолка & Маркетплейс Рокитнівщини',
    category: 'Купівля / Продаж / Обмін',
    coverImage: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=150&q=80',
    membersCount: 1250,
    description: 'Безкоштовні оголошення від жителів смт Рокитне, Томашгород, Блажове та інших сіл громади. Купуйте та продавайте товари локально.',
    isJoined: true,
    privacy: 'Відкрита',
    recentActivity: '34 дописи за сьогодні'
  },
  {
    id: 'grp-3',
    name: '🇺🇦 Волонтерський Штаб "Поліська Взаємодопомога"',
    category: 'Волонтерство & Підтримка ЗСУ',
    coverImage: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=150&q=80',
    membersCount: 890,
    description: 'Об’єднання волонтерів Рокитнівської ради. Збори коштів, виготовлення маскувальних сіток, доставка гуманітарних вантажів.',
    isJoined: true,
    privacy: 'Відкрита',
    recentActivity: '8 дописів за сьогодні'
  },
  {
    id: 'grp-4',
    name: '⚽ Спорт & Футбол Рокитнівщини',
    category: 'Спорт & Активний відпочинок',
    coverImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=150&q=80',
    membersCount: 310,
    description: 'Новини турнірів Рокитнівської ліги, волейбол, дитячі спортивні секції та тренування WorkOut.',
    isJoined: false,
    privacy: 'Відкрита',
    recentActivity: '5 дописів за тиждень'
  },
  {
    id: 'grp-5',
    name: '🌾 Поліська Кухня & Рецепти Рокитного',
    category: 'Традиції & Кулінарія',
    coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=150&q=80',
    membersCount: 640,
    description: 'Поліські деруни, млинці з чорницею, грибні юшки та стародавні рецепти мешканців нашої громади.',
    isJoined: false,
    privacy: 'Відкрита',
    recentActivity: '15 дописів за тиждень'
  }
];

export const GroupsCommunitiesTab: React.FC = () => {
  const [groups, setGroups] = useState<RokytaGroup[]>(INITIAL_GROUPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCat, setNewGroupCat] = useState('Загальне');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const toggleGroupJoin = (id: string) => {
    setGroups(prev =>
      prev.map(g => {
        if (g.id === id) {
          const nextJoined = !g.isJoined;
          return {
            ...g,
            isJoined: nextJoined,
            membersCount: nextJoined ? g.membersCount + 1 : g.membersCount - 1
          };
        }
        return g;
      })
    );
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newG: RokytaGroup = {
      id: `grp-${Date.now()}`,
      name: newGroupName,
      category: newGroupCat,
      coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      avatarImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      membersCount: 1,
      description: newGroupDesc || 'Нова спільнота жителів Рокитнівської громади.',
      isJoined: true,
      privacy: 'Відкрита',
      recentActivity: 'Створено щойно'
    };

    setGroups(prev => [newG, ...prev]);
    setNewGroupName('');
    setNewGroupDesc('');
    setShowCreateModal(false);
  };

  const filteredGroups = groups.filter(g => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 text-slate-100 animate-fadeIn">
      {/* Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-cyan-950/80 border border-purple-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-mono font-bold uppercase">
            <Users className="w-3.5 h-3.5" />
            <span>Спільноти Рокитнівщини</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Групи та Тематичні Клуби
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Приєднуйтесь до груп за інтересами або створюйте власні спільноти для жителів ваших сіл, клубів за інтересами та проектів громади.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Створити спільноту</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Пошук тематичних груп та клубів..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGroups.map(group => (
          <div
            key={group.id}
            className="rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all overflow-hidden shadow-xl flex flex-col justify-between group"
          >
            <div>
              {/* Cover Image */}
              <div className="h-28 w-full relative overflow-hidden bg-slate-900">
                <img
                  src={group.coverImage}
                  alt={group.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                <div className="absolute bottom-2 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-slate-700 text-[10px] text-cyan-300 font-mono font-bold flex items-center gap-1">
                    <Globe className="w-3 h-3 text-cyan-400" />
                    <span>{group.privacy}</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-slate-700 text-[10px] text-slate-300 font-mono">
                    {group.category}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={group.avatarImage}
                      alt={group.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-cyan-500/30 shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {group.name}
                      </h3>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                        <span>{group.membersCount} учасників</span>
                        <span>•</span>
                        <span className="text-emerald-400">{group.recentActivity}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {group.description}
                </p>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-900/80 mt-2">
              <span className="text-[10px] text-slate-500 font-mono">
                Громада Рокитного
              </span>

              <button
                onClick={() => toggleGroupJoin(group.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  group.isJoined
                    ? 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-rose-950/50 hover:text-rose-300'
                    : 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md hover:from-cyan-500 hover:to-teal-500'
                }`}
              >
                {group.isJoined ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Ви у спільноті</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Приєднатися</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-950 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>Створення Нової Спільноти</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Назва спільноти:</label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="напр. Молодь с. Блажове"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Категорія:</label>
                <select
                  value={newGroupCat}
                  onChange={e => setNewGroupCat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-500"
                >
                  <option value="Молодь та Спорт">Молодь та Спорт</option>
                  <option value="Благоустрій та Екологія">Благоустрій та Екологія</option>
                  <option value="Волонтерство">Волонтерство</option>
                  <option value="Автоклуб & Подорожі">Автоклуб & Подорожі</option>
                  <option value="Культура & Ремесла">Культура & Ремесла</option>
                  <option value="Купівля / Продаж">Купівля / Продаж</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Опис спільноти:</label>
                <textarea
                  rows={3}
                  value={newGroupDesc}
                  onChange={e => setNewGroupDesc(e.target.value)}
                  placeholder="Про що ця група та які правила спілкування..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 font-bold"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold shadow-md"
                >
                  Створити групу
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
