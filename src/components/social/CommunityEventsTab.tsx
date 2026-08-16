import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Plus,
  Sparkles,
  Heart,
  Share2,
  Check,
  Tag
} from 'lucide-react';
import { RokytaEvent } from '../../types';
import { COMMUNITY_EVENTS } from '../../data/mockData';

const ADDITIONAL_EVENTS: RokytaEvent[] = [
  {
    id: 'ev-2',
    title: '🏆 Турнір з Міні-Футболу між селами Рокитнівщини',
    date: '20 Серпня 2026',
    time: '10:00',
    location: 'Стадіон "Полісся", смт Рокитне',
    organizer: 'Спортивна спільнота громади',
    organizerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    category: 'Спорт',
    goingCount: 140,
    interestedCount: 210,
    description: 'Щорічний відкритий чемпіонат Рокитнівської громади з футболу. Безалкогольна зона, призи для вболівальників та дитячі атракціони.'
  },
  {
    id: 'ev-3',
    title: '🌿 Екологічна Толока & Очищення берега озера Залавське',
    date: '25 Серпня 2026',
    time: '09:00',
    location: 'Озеро Залавське, с. Залав\'я',
    organizer: 'Еко-активісти с. Залав\'я',
    organizerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    category: 'Волонтерство',
    goingCount: 88,
    interestedCount: 156,
    description: 'Збираємося для прибирання сміття та облаштування нових лавочок для відпочинку. Рукавиці та пакеті надаються селищною радою!'
  }
];

export const CommunityEventsTab: React.FC = () => {
  const [events, setEvents] = useState<RokytaEvent[]>([
    ...COMMUNITY_EVENTS,
    ...ADDITIONAL_EVENTS
  ]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleRSVP = (eventId: string, status: 'going' | 'interested') => {
    setEvents(prev =>
      prev.map(ev => {
        if (ev.id === eventId) {
          const currentStatus = ev.userStatus;
          if (currentStatus === status) {
            // toggle off
            return {
              ...ev,
              userStatus: null,
              goingCount: status === 'going' ? ev.goingCount - 1 : ev.goingCount,
              interestedCount: status === 'interested' ? ev.interestedCount - 1 : ev.interestedCount
            };
          }
          return {
            ...ev,
            userStatus: status,
            goingCount: status === 'going' ? (currentStatus === 'going' ? ev.goingCount : ev.goingCount + 1) : (currentStatus === 'going' ? ev.goingCount - 1 : ev.goingCount),
            interestedCount: status === 'interested' ? (currentStatus === 'interested' ? ev.interestedCount : ev.interestedCount + 1) : (currentStatus === 'interested' ? ev.interestedCount - 1 : ev.interestedCount)
          };
        }
        return ev;
      })
    );
  };

  const filteredEvents = events.filter(e => {
    if (activeCategory === 'all') return true;
    return e.category === activeCategory;
  });

  return (
    <div className="space-y-6 text-slate-100 animate-fadeIn">
      {/* Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-teal-950/80 via-slate-900 to-cyan-950/80 border border-teal-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-mono font-bold uppercase">
            <Calendar className="w-3.5 h-3.5" />
            <span>Календар Подій Рокитнівщини</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Події, Зустрічі та Ярмарки
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Дізнавайтеся про культурні заходи, благодійні збори, спортивні турніри та толоки у Рокитному та селах громади.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 border-b border-slate-900 text-xs font-bold">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeCategory === 'all' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Усі події ({events.length})
        </button>
        <button
          onClick={() => setActiveCategory('Ярмарок')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeCategory === 'Ярмарок' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Ярмарки & Культура
        </button>
        <button
          onClick={() => setActiveCategory('Спорт')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeCategory === 'Спорт' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Спорт
        </button>
        <button
          onClick={() => setActiveCategory('Волонтерство')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeCategory === 'Волонтерство' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Волонтерство & Толока
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-5">
        {filteredEvents.map(event => (
          <div
            key={event.id}
            className="rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all overflow-hidden shadow-2xl flex flex-col md:flex-row group"
          >
            {/* Event Cover Image */}
            <div className="w-full md:w-80 h-52 md:h-auto relative overflow-hidden shrink-0">
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>{event.category}</span>
              </div>
            </div>

            {/* Event Details */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-cyan-400 font-mono font-bold">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{event.time}</span>
                  </span>
                </div>

                <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">
                  {event.title}
                </h3>

                <div className="text-xs text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{event.location}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {event.description}
                </p>
              </div>

              {/* Attendance & Organizer Footer */}
              <div className="pt-3 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <img
                    src={event.organizerAvatar}
                    alt={event.organizer}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-cyan-500/30"
                  />
                  <div className="text-[11px]">
                    <span className="text-slate-400">Організатор: </span>
                    <span className="font-bold text-white">{event.organizer}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRSVP(event.id, 'going')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      event.userStatus === 'going'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Я піду ({event.goingCount})</span>
                  </button>

                  <button
                    onClick={() => handleRSVP(event.id, 'interested')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      event.userStatus === 'interested'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                    <span>Цікаво ({event.interestedCount})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
