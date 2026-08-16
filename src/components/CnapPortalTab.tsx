import React, { useState } from 'react';
import { CNAP_SERVICES } from '../data/mockData';
import { CnapService, CnapTicket } from '../types';
import {
  Building2,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  User,
  Phone,
  QrCode,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Download,
  Printer,
  Sparkles,
  Info,
  MapPin
} from 'lucide-react';

interface CnapPortalTabProps {
  onNavigateTab: (tab: string, payload?: any) => void;
}

export const CnapPortalTab: React.FC<CnapPortalTabProps> = ({ onNavigateTab }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedService, setSelectedService] = useState<CnapService | null>(null);

  // Booking Modal State
  const [bookingService, setBookingService] = useState<CnapService | null>(null);
  const [bookingStep, setBookingStep] = useState<1 | 2>(1);
  const [bookingDate, setBookingDate] = useState<string>('2026-08-10');
  const [bookingTime, setBookingTime] = useState<string>('10:15');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  // Active Tickets State
  const [myTickets, setMyTickets] = useState<CnapTicket[]>([
    {
      ticketCode: 'RK-CNAP-9421',
      serviceTitle: 'Оформлення та видача паспорта громадянина України (ID-картка)',
      date: '2026-08-11',
      timeSlot: '11:00',
      fullName: 'Петренко Олексій Іванович',
      phone: '+380671234567',
      status: 'active',
      qrCodeData: 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=RK-CNAP-9421',
      createdTime: '08.08.2026 10:30'
    }
  ]);

  const [activeTicketModal, setActiveTicketModal] = useState<CnapTicket | null>(null);

  const categories = [
    { id: 'all', label: 'Усі послуги' },
    { id: 'passport', label: 'Паспорти (ID / Закордонний)' },
    { id: 'residence', label: 'Реєстрація місця проживання' },
    { id: 'social', label: 'Соціальний захист & ВПО' },
    { id: 'veterans', label: 'Я-Ветеран (Пільги)' },
    { id: 'land', label: 'Земля & ДЗК' },
    { id: 'construction', label: 'Будівництво' },
    { id: 'business', label: 'Бізнес (ФОП/ТОВ)' },
  ];

  const filteredServices = CNAP_SERVICES.filter((srv) => {
    const matchesCategory = selectedCategory === 'all' || srv.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingService || !fullName || !phone) return;

    const ticketNum = `RK-CNAP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: CnapTicket = {
      ticketCode: ticketNum,
      serviceTitle: bookingService.title,
      date: bookingDate,
      timeSlot: bookingTime,
      fullName,
      phone,
      status: 'active',
      qrCodeData: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${ticketNum}`,
      createdTime: new Date().toLocaleDateString('uk-UA') + ' ' + new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    };

    setMyTickets([newTicket, ...myTickets]);
    setActiveTicketModal(newTicket);
    setBookingService(null);
    setBookingStep(1);
    setFullName('');
    setPhone('');
  };

  return (
    <div className="space-y-10 pb-12 text-slate-100">
      {/* Curved Cosmic Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-900 border border-cyan-500/30 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Центр Надання Адміністративних Послуг смт Рокитне</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
              Електронний Портал Послуг та Черги ЦНАП
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Записуйтеся в електронну чергу онлайн без затримок. Оформлюйте паспорти, довідки про проживання, витяги ДЗК та соціальну допомогу "Я-Ветеран".
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Адреса: <strong>смт Рокитне, вул. Незалежності, 13</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Графік: <strong>Пн-Чт 08:00–17:15, Пт 08:00–16:00</strong></span>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 bg-slate-900/90 border border-cyan-500/40 p-5 rounded-2xl text-center space-y-3 backdrop-blur-md">
            <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
              Електронна Черга ЦНАП
            </div>
            <div className="text-2xl font-black text-white">
              {myTickets.length} Активних Талонів
            </div>
            {myTickets.length > 0 && (
              <button
                onClick={() => setActiveTicketModal(myTickets[0])}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Переглянути QR Талон</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Services Explorer Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-cyan-400" />
              Каталог Муніципальних Послуг ({filteredServices.length})
            </h2>
            <p className="text-xs text-slate-400">
              Оберіть необхідну послугу для перегляду переліку документів та запису в чергу
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук послуги або коду..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-all duration-300 hover:shadow-cyan-500/10 group relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
                    {srv.code}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {srv.department}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {srv.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {srv.description}
                </p>

                {/* Key specs */}
                <div className="pt-2 flex flex-wrap gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{srv.processingDays} дн.</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{srv.feeUah > 0 ? `${srv.feeUah} грн` : 'Безкоштовно'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedService(srv)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Документи</span>
                </button>

                <button
                  onClick={() => {
                    setBookingService(srv);
                    setBookingStep(1);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Записатися</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 md:p-8 max-w-2xl w-full space-y-6 shadow-2xl relative animate-fadeIn">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 text-xs font-mono border border-cyan-500/30">
                  {selectedService.code}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedService.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs md:text-sm text-slate-300">
              <p className="leading-relaxed text-slate-300">
                {selectedService.description}
              </p>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-cyan-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Перелік необхідних документів:
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-slate-300 pl-2">
                  {selectedService.requiredDocuments.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-xs block">Термін виконання:</span>
                  <span className="font-bold text-slate-100">{selectedService.processingDays} робочих днів</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-xs block">Адміністративний збір:</span>
                  <span className="font-bold text-emerald-400">
                    {selectedService.feeUah > 0 ? `${selectedService.feeUah} UAH` : 'Безкоштовно'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedService(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Закрити
              </button>
              <button
                onClick={() => {
                  setBookingService(selectedService);
                  setSelectedService(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Записатися в чергу</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {bookingService && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-6 shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Запис у чергу ЦНАП Рокитне
              </h3>
              <button
                onClick={() => setBookingService(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block">Обрана послуга:</span>
              <span className="font-bold text-cyan-300">{bookingService.title}</span>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Оберіть дату прийому:
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  min="2026-08-08"
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Часовий слот (вільний час):
                </label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="09:00">09:00 - Вільно</option>
                  <option value="09:45">09:45 - Вільно</option>
                  <option value="10:30">10:30 - Вільно</option>
                  <option value="11:15">11:15 - Вільно</option>
                  <option value="14:00">14:00 - Вільно</option>
                  <option value="15:00">15:00 - Вільно</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ПІБ заявника:
                </label>
                <input
                  type="text"
                  placeholder="наприклад: Шевченко Тарас Григорович"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Номер телефону:
                </label>
                <input
                  type="tel"
                  placeholder="+380 67 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Згенерувати QR Талон</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Modal / Print View */}
      {activeTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 md:p-8 max-w-sm w-full space-y-6 text-center shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setActiveTicketModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Талон Електронної Черги</span>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
              <img
                src={activeTicketModal.qrCodeData}
                alt="QR Code Ticket"
                className="w-36 h-36 mx-auto"
              />
            </div>

            <div>
              <div className="text-2xl font-black text-cyan-400 font-mono tracking-widest">
                {activeTicketModal.ticketCode}
              </div>
              <p className="text-xs font-semibold text-slate-200 mt-1 line-clamp-2">
                {activeTicketModal.serviceTitle}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Дата прийому:</span>
                <span className="font-bold text-white">{activeTicketModal.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Час:</span>
                <span className="font-bold text-cyan-300">{activeTicketModal.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Заявник:</span>
                <span className="font-bold text-white">{activeTicketModal.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Локація:</span>
                <span className="font-bold text-slate-200">ЦНАП смт Рокитне, кабінет 2</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Будь ласка, прибудьте за 5 хвилин до вашого часу та покажіть даний QR-код адміністратору при вході.
            </p>

            <button
              onClick={() => {
                window.print();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Роздрукувати / Зберегти PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
