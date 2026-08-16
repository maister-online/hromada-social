import React, { useState } from 'react';
import { TOURISM_SPOTS, COMMUNITY_EVENTS } from '../data/mockData';
import { TourismSpot, CommunityEvent } from '../types';
const lakeImg = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
import {
  Compass,
  Trees,
  Fish,
  UtensilsCrossed,
  MapPin,
  Star,
  Phone,
  Calendar,
  Sparkles,
  Users,
  CheckCircle,
  ExternalLink,
  Flame,
  Search,
  Filter,
  Heart,
  Navigation,
  Send
} from 'lucide-react';

interface TourismRecreationTabProps {
  onNavigateTab: (tab: string, payload?: any) => void;
}

export const TourismRecreationTab: React.FC<TourismRecreationTabProps> = ({ onNavigateTab }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpot, setSelectedSpot] = useState<TourismSpot | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const categories = [
    { id: 'all', label: 'Усі місця', icon: Compass },
    { id: 'nature_lake', label: 'Озера & Пляжі', icon: Trees },
    { id: 'fishing', label: 'Риболовля & Сплави', icon: Fish },
    { id: 'historic_heritage', label: 'Історія & Заповідники', icon: MapPin },
    { id: 'forest_trail', label: 'Еко-Маршрути', icon: Navigation },
    { id: 'gastro_cafe', label: 'Поліська Кухня & Бази', icon: UtensilsCrossed }
  ];

  const filteredSpots = TOURISM_SPOTS.filter(spot => {
    const matchesCategory = selectedCategory === 'all' || spot.category === selectedCategory;
    const matchesSearch = spot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          spot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          spot.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBookSpot = (spot: TourismSpot) => {
    setSelectedSpot(spot);
    setBookingModalOpen(true);
    setBookingSuccess(false);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingModalOpen(false);
      setBookingName('');
      setBookingPhone('');
      setBookingDate('');
      setBookingSuccess(false);
    }, 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner Header */}
      <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-slate-950">
        <div className="absolute inset-0">
          <img
            src={lakeImg}
            alt="Озеро Засвітське Рокитне"
            className="w-full h-full object-cover filter brightness-50 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
            <Trees className="w-4 h-4" />
            <span>Туризм & Дозвілля Рокитнівщини</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Відпочинок у Серці Перлин Полісся 🌲🚣‍♂️
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Кришталеві лісові озера, тихі річкові затони, 1000-літні дуби-патріархи та справжня автентична поліська кухня. Все для активного та сімейного дозвілля у Рокитнівській громаді.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setSelectedCategory('nature_lake')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Знайти Альтанку або Пляж</span>
            </button>

            <button
              onClick={() => onNavigateTab('map')}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Інтерактивна Карта Туризму</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter & Search */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/50'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук озера, маршруту..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Tourism Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSpots.map(spot => (
          <div
            key={spot.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all hover:shadow-xl hover:shadow-cyan-500/10 flex flex-col justify-between group"
          >
            <div>
              {/* Card Image Header */}
              <div className="relative h-48 overflow-hidden bg-slate-950">
                <img
                  src={spot.imageUrl}
                  alt={spot.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{spot.rating} ({spot.reviewsCount})</span>
                </div>

                <div className="absolute top-3 right-3 bg-emerald-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-500/40 text-[10px] font-bold text-emerald-200">
                  {spot.bestSeason}
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-extrabold text-base leading-snug drop-shadow-md">
                    {spot.title}
                  </h3>
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{spot.location}</span>
                  </p>
                </div>
              </div>

              {/* Body Details */}
              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {spot.description}
                </p>

                {/* Features Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {spot.features.map((feat: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 text-[10px] font-medium border border-slate-800"
                    >
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-4 pt-0 border-t border-slate-800/60 mt-3 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>Інфо-лінія</span>
              </span>

              <button
                onClick={() => handleBookSpot(spot)}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center gap-1.5 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Забронювати / Інфо</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Community Events & Festivals Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Афіша Дозвілля & Культури</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              Найближчі Події та Етно-Фестивалі Рокитно
            </h2>
          </div>

          <button
            onClick={() => onNavigateTab('social')}
            className="px-4 py-2 rounded-xl bg-purple-900/40 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Запропонувати Подію</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COMMUNITY_EVENTS.map(ev => (
            <div
              key={ev.id}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-purple-500/40 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/30">
                  {ev.date}
                </span>
                <span className="text-slate-400 font-mono">{ev.time}</span>
              </div>

              <h4 className="font-extrabold text-sm text-slate-100 leading-snug">
                {ev.title}
              </h4>

              <p className="text-xs text-slate-400 leading-relaxed">
                {ev.description}
              </p>

              <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1 text-cyan-300">
                  <MapPin className="w-3 h-3" />
                  <span>{ev.location}</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Users className="w-3 h-3" />
                  <span>{ev.participantsCount} йдуть</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Booking / Info Request */}
      {bookingModalOpen && selectedSpot && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 relative shadow-2xl animate-scaleUp">
            <button
              onClick={() => setBookingModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Бронювання & Консультація
              </span>
              <h3 className="text-lg font-extrabold text-white">
                {selectedSpot.title}
              </h3>
              <p className="text-xs text-slate-400">{selectedSpot.location}</p>
            </div>

            {bookingSuccess ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-bold text-emerald-200 text-sm">Заявку прийнято!</h4>
                <p className="text-xs text-emerald-300">
                  Представник туризму Рокитнівщини зателефонує вам найближчим часом для підтвердження.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Ваше Ім'я</label>
                  <input
                    type="text"
                    required
                    value={bookingName}
                    onChange={e => setBookingName(e.target.value)}
                    placeholder="Наприклад: Олексій"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Номер телефону</label>
                  <input
                    type="tel"
                    required
                    value={bookingPhone}
                    onChange={e => setBookingPhone(e.target.value)}
                    placeholder="+380 (__) ___-__-__"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Бажана дата відпочинку</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Підтвердити заявку</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
