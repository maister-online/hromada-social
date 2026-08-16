import React, { useState, useMemo } from 'react';
import { INITIAL_CNAP_SERVICES } from '../../data/mockData';
import { CnapServiceItem } from '../../types';
import { useUser } from '../../context/UserContext';
import { useWindowContext } from '../../context/WindowContext';
import {
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Search,
  ChevronRight,
  QrCode,
  Sparkles,
  Ticket,
  X,
  Info,
  Phone,
  MapPin,
  SlidersHorizontal,
  ArrowUpDown,
  ShieldCheck,
  Download,
  ExternalLink,
  Layers,
  Tag,
  CheckSquare,
  HelpCircle
} from 'lucide-react';

type FeeFilterType = 'all' | 'free' | 'paid';
type SpeedFilterType = 'all' | 'express' | 'standard';
type SortOrderType = 'popular' | 'alpha' | 'speed' | 'fee';

export const CnapServicesTab: React.FC = () => {
  const [services] = useState<CnapServiceItem[]>(INITIAL_CNAP_SERVICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [feeFilter, setFeeFilter] = useState<FeeFilterType>('all');
  const [speedFilter, setSpeedFilter] = useState<SpeedFilterType>('all');
  const [sortOrder, setSortOrder] = useState<SortOrderType>('popular');

  // Modals state
  const [detailService, setDetailService] = useState<CnapServiceItem | null>(null);
  const [checkedDocsModal, setCheckedDocsModal] = useState<Record<string, boolean>>({});
  const [bookingService, setBookingService] = useState<CnapServiceItem | null>(null);
  const [selectedDate, setSelectedDate] = useState('2026-08-10');
  const [selectedSlot, setSelectedSlot] = useState('10:30');
  const [ticketModal, setTicketModal] = useState<{ serviceTitle: string; queueNum: string; time: string; department: string } | null>(null);

  const { user, addNotification } = useUser();

  // Quick categories list
  const categoriesList = [
    { id: 'all', label: 'Всі послуги', icon: Layers },
    { id: 'certificates', label: 'Довідки та Витяги', icon: FileText },
    { id: 'passport', label: 'Паспортні послуги', icon: ShieldCheck },
    { id: 'social', label: 'Соцзахист & ВПО', icon: Sparkles },
    { id: 'veterans', label: 'Я-Ветеран', icon: Tag },
    { id: 'land', label: 'Земля & Кадастр', icon: MapPin },
    { id: 'business', label: 'Бізнес & ФОП', icon: Building2 },
    { id: 'property', label: 'Нерухомість', icon: CheckCircle2 },
    { id: 'construction', label: 'Будівництво', icon: SlidersHorizontal }
  ];

  // Quick prompt chips
  const popularQuickQueries = [
    { label: '📜 Довідка про прописку', query: 'Витяг про прописку' },
    { label: '🪪 ID-картка', query: 'ID-картка' },
    { label: '👶 єМалятко', query: 'єМалятко' },
    { label: '🤝 Довідка ВПО', query: 'ВПО' },
    { label: '🛡️ Я-Ветеран', query: 'Я-Ветеран' },
    { label: '🌱 Земельний витяг ДЗК', query: 'ДЗК' },
    { label: '💼 Відкрити ФОП', query: 'ФОП' }
  ];

  // Book appointment action
  const handleBookQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingService) return;

    const queueNum = `A-${Math.floor(100 + Math.random() * 900)}`;

    addNotification({
      category: 'cnap',
      title: 'Електронний талон ЦНАП',
      description: `Запис на "${bookingService.title}" підтверджено. Талон ${queueNum} на ${selectedDate} о ${selectedSlot}.`,
      timestamp: 'Щойно'
    });

    setTicketModal({
      serviceTitle: bookingService.title,
      queueNum,
      time: `${selectedDate} о ${selectedSlot}`,
      department: bookingService.department
    });

    setBookingService(null);
  };

  // Filter & Sort Logic
  const filteredAndSortedServices = useMemo(() => {
    return services
      .filter(service => {
        // Search query matching
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          service.title.toLowerCase().includes(q) ||
          service.code.toLowerCase().includes(q) ||
          service.department.toLowerCase().includes(q) ||
          service.description.toLowerCase().includes(q) ||
          service.requiredDocuments.some(doc => doc.toLowerCase().includes(q));

        // Category filter
        const matchesCat = selectedCategory === 'all' || service.category === selectedCategory;

        // Fee filter
        const matchesFee =
          feeFilter === 'all' ||
          (feeFilter === 'free' && service.feeUah === 0) ||
          (feeFilter === 'paid' && service.feeUah > 0);

        // Speed filter
        const matchesSpeed =
          speedFilter === 'all' ||
          (speedFilter === 'express' && service.processingDays <= 3) ||
          (speedFilter === 'standard' && service.processingDays > 3);

        return matchesSearch && matchesCat && matchesFee && matchesSpeed;
      })
      .sort((a, b) => {
        if (sortOrder === 'alpha') {
          return a.title.localeCompare(b.title, 'uk');
        } else if (sortOrder === 'speed') {
          return a.processingDays - b.processingDays;
        } else if (sortOrder === 'fee') {
          return a.feeUah - b.feeUah;
        }
        // Popular default
        return a.id.localeCompare(b.id);
      });
  }, [services, searchQuery, selectedCategory, feeFilter, speedFilter, sortOrder]);

  const handleToggleDocCheck = (docName: string) => {
    setCheckedDocsModal(prev => ({
      ...prev,
      [docName]: !prev[docName]
    }));
  };

  return (
    <div className="space-y-6 text-slate-100 animate-fadeIn">
      {/* CNAP Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950/90 via-slate-900 to-cyan-950/90 border border-teal-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/90 border border-teal-500/50 text-[11px] font-mono font-bold text-teal-300">
              <Building2 className="w-3.5 h-3.5 text-teal-400" />
              <span>ЦНАП РОКИТНІВСЬКОЇ СЕЛИЩНОЇ РАДИ</span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">
              Електронній Реєстр Послуг та Довідок
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              Швидкий пошук адміністративних послуг, довідок, витягів та запис в електронну чергу без чергування у кабінетах.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-slate-300 font-mono">
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>смт Рокитне, вул. Незалежності, 13</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>(03635) 2-15-42</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Пн-Чт 08:00–17:15, Пт 08:00–16:00</span>
              </div>
            </div>
          </div>

          {/* Quick Counter Badge Box */}
          <div className="grid grid-cols-2 gap-2 shrink-0 w-full lg:w-auto">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-teal-500/30 text-center space-y-0.5">
              <div className="text-xl font-black text-teal-300 font-mono">{services.length}</div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Доступних послуг</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-center space-y-0.5">
              <div className="text-xl font-black text-cyan-300 font-mono">100%</div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Онлайн запис</div>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERING SECTION */}
      <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              Пошук та фільтрація послуг
            </h3>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Знайдено: <span className="font-bold text-teal-300">{filteredAndSortedServices.length}</span> з {services.length}
          </div>
        </div>

        {/* Main Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-teal-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Введіть назву послуги, довідки, код (напр., ID-картка, прописка, ВПО, ДЗК, ФОП)..."
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              title="Очистити пошук"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Popular Quick Prompt Chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1 pb-1">
          <span className="text-[11px] font-mono text-slate-400 shrink-0 font-bold">Популярне:</span>
          {popularQuickQueries.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setSearchQuery(item.query)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all shrink-0 border cursor-pointer ${
                searchQuery === item.query
                  ? 'bg-teal-600 text-white border-teal-400'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2 border-t border-slate-900 pb-1">
          {categoriesList.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-950/50'
                    : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-teal-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-Filters: Fee, Speed & Sort Order */}
        <div className="pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Fee Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 px-2 font-bold">Оплата:</span>
              <button
                onClick={() => setFeeFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  feeFilter === 'all' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Всі
              </button>
              <button
                onClick={() => setFeeFilter('free')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  feeFilter === 'free' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Безкоштовно (0 грн)
              </button>
              <button
                onClick={() => setFeeFilter('paid')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  feeFilter === 'paid' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Платні
              </button>
            </div>

            {/* Speed Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 px-2 font-bold">Термін:</span>
              <button
                onClick={() => setSpeedFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  speedFilter === 'all' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Всі
              </button>
              <button
                onClick={() => setSpeedFilter('express')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  speedFilter === 'express' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ Експрес (1–3 дні)
              </button>
              <button
                onClick={() => setSpeedFilter('standard')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  speedFilter === 'standard' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Стандарт
              </button>
            </div>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as SortOrderType)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs outline-none focus:border-teal-500"
            >
              <option value="popular">За популярністю</option>
              <option value="alpha">За назвою (А-Я)</option>
              <option value="speed">Швидше виконання</option>
              <option value="fee">За вартістю (0 грн перші)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SERVICES CATALOG GRID */}
      {filteredAndSortedServices.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
          <Info className="w-10 h-10 text-teal-400 mx-auto" />
          <h4 className="text-base font-bold text-white">За вашим запитом послуг не знайдено</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Спробуйте змінити ключові слова або виберіть категорію "Всі послуги".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setFeeFilter('all');
              setSpeedFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors"
          >
            Скинути всі фільтри
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAndSortedServices.map(service => (
            <div
              key={service.id}
              className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-teal-500/50 transition-all shadow-xl space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header Badge Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-teal-950/90 text-teal-300 border border-teal-500/40 text-[10px] font-mono font-bold uppercase">
                      {service.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 text-[10px] font-mono font-medium">
                      {service.category}
                    </span>
                  </div>

                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                    service.feeUah === 0
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {service.feeUah ? `${service.feeUah} грн` : 'Безкоштовно'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors leading-snug">
                  {service.title}
                </h3>

                {/* Department Info */}
                <div className="text-[11px] text-teal-400 font-mono flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{service.department}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {service.description}
                </p>

                {/* Required Documents Box */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 text-[11px]">
                  <div className="font-bold text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-cyan-400 font-mono">
                      <FileText className="w-3.5 h-3.5" />
                      Пакет документів ({service.requiredDocuments.length}):
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400 pl-1">
                    {service.requiredDocuments.slice(0, 2).map((doc, idx) => (
                      <li key={idx} className="truncate">{doc}</li>
                    ))}
                    {service.requiredDocuments.length > 2 && (
                      <li className="text-teal-400 font-mono font-bold text-[10px]">
                        + ще {service.requiredDocuments.length - 2} документ(ів)...
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Bottom Card Footer Actions */}
              <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {service.processingDays === 1 ? '1 робочий день' : `${service.processingDays} днів`}
                  </span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDetailService(service);
                      setCheckedDocsModal({});
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Детальніше</span>
                  </button>

                  <button
                    onClick={() => setBookingService(service)}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Записатись</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILED SERVICE MODAL INSPECTION */}
      {detailService && (
        <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-950 border border-teal-500/50 rounded-2xl shadow-2xl p-6 space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto scrollbar-thin relative">
            <button
              onClick={() => setDetailService(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-2 pr-8">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-teal-950 text-teal-300 border border-teal-500/40 font-mono text-xs font-bold">
                  {detailService.code}
                </span>
                <span className="text-xs text-slate-400 uppercase font-mono">
                  {detailService.department}
                </span>
              </div>
              <h3 className="text-xl font-black text-white leading-snug">
                {detailService.title}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              {detailService.description}
            </p>

            {/* Key Service Specs Grid */}
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Адмінзбір</div>
                <div className="font-bold text-teal-300">
                  {detailService.feeUah ? `${detailService.feeUah} грн` : 'Безкоштовно'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Термін виконання</div>
                <div className="font-bold text-amber-300">
                  {detailService.processingDays === 1 ? '1 робочий день' : `${detailService.processingDays} днів`}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Формат видачі</div>
                <div className="font-bold text-cyan-300">Очно / Електронний</div>
              </div>
            </div>

            {/* Interactive Document Checklist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-teal-400" />
                  Чек-лист необхідних документів для візиту:
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  Відмітьте підготовлені документи
                </span>
              </div>

              <div className="space-y-2 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                {detailService.requiredDocuments.map((doc, idx) => {
                  const isChecked = !!checkedDocsModal[doc];
                  return (
                    <label
                      key={idx}
                      onClick={() => handleToggleDocCheck(doc)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-teal-950/60 border-teal-500/50 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 accent-teal-500"
                      />
                      <span className="text-xs leading-snug">{doc}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Department Info Box */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1 text-slate-300">
              <div className="font-bold text-white flex items-center gap-1.5 font-mono">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>Організатор послуги: {detailService.department}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Прийом громадян: смт Рокитне, вул. Незалежності, 13 (Кабінети 101-105). Телефон для довідок: (03635) 2-15-42.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setDetailService(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Закрити
              </button>
              <button
                onClick={() => {
                  const s = detailService;
                  setDetailService(null);
                  setBookingService(s);
                }}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg"
              >
                <Calendar className="w-4 h-4" />
                <span>Записатись у чергу</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING DRAWER MODAL */}
      {bookingService && (
        <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-950 border border-teal-500/50 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-100 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono font-bold text-teal-400 uppercase">
                  Онлайн запис в електронну чергу
                </div>
                <div className="font-bold text-white text-sm">
                  {bookingService.title}
                </div>
              </div>
              <button onClick={() => setBookingService(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookQueue} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Дата прийому *</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Вільний слот часу *</label>
                  <select
                    value={selectedSlot}
                    onChange={e => setSelectedSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-teal-500 font-mono"
                  >
                    <option value="09:00">09:00 - Вільний</option>
                    <option value="09:30">09:30 - Вільний</option>
                    <option value="10:00">10:00 - Вільний</option>
                    <option value="10:30">10:30 - Вільний</option>
                    <option value="11:15">11:15 - Вільний</option>
                    <option value="14:00">14:00 - Вільний</option>
                    <option value="15:30">15:30 - Вільний</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Заявник</label>
                <input
                  type="text"
                  disabled
                  value={`${user.name} (${user.phone})`}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
                📍 Прийом здійснюється за адресою: <strong>смт Рокитне, вул. Незалежності, 13</strong>. Будь ласка, завітайте з пакетом оригіналів документів за 5 хвилин до обраного часу.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBookingService(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 font-bold"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Згенерувати талон</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TICKET CONFIRMATION MODAL */}
      {ticketModal && (
        <div className="fixed inset-0 z-[160] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950 border border-teal-500/50 rounded-2xl shadow-2xl p-6 space-y-4 text-center text-slate-100">
            <div className="p-3 rounded-full bg-teal-500/20 text-teal-300 w-14 h-14 mx-auto flex items-center justify-center shadow-lg">
              <Ticket className="w-7 h-7" />
            </div>

            <div className="text-xs font-mono text-teal-400 uppercase tracking-widest font-bold">
              ЕЛЕКТРОННИЙ ТАЛОН ЦНАП ПІДТВЕРДЖЕНО
            </div>

            <div className="text-4xl font-black text-white font-mono tracking-wider py-1 bg-slate-900/80 rounded-xl border border-teal-500/30">
              {ticketModal.queueNum}
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <div><strong>Послуга:</strong> {ticketModal.serviceTitle}</div>
              <div className="text-cyan-300 font-mono font-bold">
                <strong>Час прийому:</strong> {ticketModal.time}
              </div>
              <div className="text-slate-400 text-[11px] font-mono">
                {ticketModal.department}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400">
              📍 Адреса ЦНАП: смт Рокитне, вул. Незалежності, 13 (Кабінети 101-105).
            </div>

            <button
              onClick={() => setTicketModal(null)}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg cursor-pointer"
            >
              Зберегти талон у особистому кабінеті
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
