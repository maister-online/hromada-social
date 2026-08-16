import React, { useState } from 'react';
import { CNAP_SERVICES } from '../data/mockData';
import { CnapService, CnapTicket } from '../types';
import {
  Calendar,
  Clock,
  QrCode,
  CheckCircle2,
  FileText,
  User,
  Phone,
  Search,
  Sparkles,
  MapPin,
  Building2,
  ShieldCheck,
  CreditCard,
  Download,
  Printer
} from 'lucide-react';

interface CnapQueueTabProps {
  onAskAi: (prompt: string) => void;
}

export const CnapQueueTab: React.FC<CnapQueueTabProps> = ({ onAskAi }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedService, setSelectedService] = useState<CnapService | null>(CNAP_SERVICES[0]);
  
  // Ticket booking state
  const [bookingDate, setBookingDate] = useState<string>('2026-08-10');
  const [timeSlot, setTimeSlot] = useState<string>('10:15');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [generatedTicket, setGeneratedTicket] = useState<CnapTicket | null>(null);

  // Status lookup state
  const [lookupTicketCode, setLookupTicketCode] = useState<string>('');
  const [lookupResult, setLookupResult] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Всі послуги' },
    { id: 'passport', label: 'Паспорти (ID/Закордонний)' },
    { id: 'residence', label: 'Прописка та витяги' },
    { id: 'social', label: 'Соціальні допомоги & ВПО' },
    { id: 'veterans', label: 'Сервіс "Я-Ветеран"' },
    { id: 'land', label: 'Земля та кадастр' },
    { id: 'construction', label: 'Будівництво & Архітектура' },
    { id: 'business', label: 'Бізнес (ФОП/ТОВ)' }
  ];

  const timeSlots = ['09:00', '09:30', '10:15', '11:00', '11:45', '13:30', '14:15', '15:00', '16:00'];

  const filteredServices = CNAP_SERVICES.filter((svc) => {
    const matchesCat = selectedCategory === 'all' || svc.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      svc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleBookTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !fullName.trim() || !phone.trim()) {
      alert('Будь ласка, заповніть ваше ім\'я та контактний номер телефону');
      return;
    }

    const randomCode = `ROK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: CnapTicket = {
      ticketCode: randomCode,
      serviceTitle: selectedService.title,
      date: bookingDate,
      timeSlot,
      fullName,
      phone,
      status: 'active',
      qrCodeData: `https://rokytne-gromada.gov.ua/ticket/${randomCode}`,
      createdTime: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    };

    setGeneratedTicket(newTicket);
  };

  const handleLookupStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupTicketCode.trim()) return;

    setLookupResult(
      `Талон №${lookupTicketCode.toUpperCase()} зареєстрований у терміналі ЦНАП смт Рокитне. Спеціаліст очікуватиме вас у вікні №3.`
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Cosmic Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 border border-cyan-500/30 p-8 shadow-2xl overflow-hidden">
        {/* Background orbits lines */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            Інтеграція ЦНАП Рокитнівської Селищної Ради
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Електронна Черга та Каталог Адміністративних Послуг
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Зареєструйтесь у зручний час без черг, згенеруйте QR-талон для відвідування ЦНАП у смт Рокитне та перевіряйте готовність документів у реальному часі.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>смт Рокитне, вул. Незалежності, 13</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Пн-Чт: 08:00 - 17:15 | Пт: 08:00 - 16:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white border-cyan-400 shadow-lg shadow-cyan-500/30'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Services List & Ticket Reservation Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Services Directory */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук за назвою або кодом послуги (наприклад: паспорт, ВПО, ДЗК)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {filteredServices.map((svc) => {
              const isSelected = selectedService?.id === svc.id;
              return (
                <div
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/10'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                        {svc.code}
                      </span>
                      <h3 className="text-sm font-bold text-slate-100 mt-1.5 leading-snug">
                        {svc.title}
                      </h3>
                    </div>

                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg shrink-0">
                      {svc.feeUah === 0 ? 'Безкоштовно' : `${svc.feeUah} грн`}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {svc.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                    <span>{svc.department}</span>
                    <span className="text-cyan-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {svc.processingDays} дн.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Ticket Booking System & Instant Ticket Card */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between">
          {generatedTicket ? (
            /* Generated Ticket Display */
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center pb-4 border-b border-slate-800">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  Талон у Електронну Чергу Успішно Сформовано!
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Збережіть талон або збережіть код для реєстрації у терміналі ЦНАП
                </p>
              </div>

              {/* Holographic Digital Ticket Card */}
              <div className="relative rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 border-2 border-cyan-500/60 p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">ЦНАП РОКИТНЕ</span>
                    <h4 className="text-xl font-extrabold text-white tracking-widest">{generatedTicket.ticketCode}</h4>
                  </div>
                  <div className="w-14 h-14 bg-white p-1 rounded-xl flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-950" />
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Послуга:</span>
                    <span className="font-semibold text-slate-100 text-right max-w-[220px]">{generatedTicket.serviceTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Дата та час:</span>
                    <span className="font-bold text-cyan-300">{generatedTicket.date} о {generatedTicket.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Заявник:</span>
                    <span className="font-semibold text-slate-100">{generatedTicket.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Телефон:</span>
                    <span className="font-semibold text-slate-100">{generatedTicket.phone}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 text-center">
                  Будь ласка, прибудьте за 5 хвилин до обраного часу із необхідними документами.
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setGeneratedTicket(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                >
                  Записатися ще раз
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Роздрукувати / Зберегти
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleBookTicket} className="space-y-5">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Крок 1 із 2: Обрана послуга
                </span>
                <h3 className="text-base font-extrabold text-white mt-1">
                  {selectedService ? selectedService.title : 'Оберіть послугу ліворуч'}
                </h3>
                {selectedService && (
                  <p className="text-xs text-slate-400 mt-1">
                    Департамент: <span className="text-slate-300">{selectedService.department}</span>
                  </p>
                )}
              </div>

              {/* Date & Slot selection */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 block">
                  Оберіть дату та час візиту:
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  min="2026-08-08"
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        timeSlot === slot
                          ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/30'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">ПІБ заявника:</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Шевченко Тарас Григорович"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Номер телефону:</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+380 67 123 45 67"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Submit Ticket Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                Сформувати талон у чергу
              </button>

              {/* Quick Prompt to Ask AI */}
              {selectedService && (
                <button
                  type="button"
                  onClick={() => onAskAi(`Підкажи які документи потрібні для: ${selectedService.title}`)}
                  className="w-full text-center text-xs text-cyan-400 hover:underline flex items-center justify-center gap-1 mt-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Запитати у Рокитне-Бот AI детальний перелік документів
                </button>
              )}
            </form>
          )}

          {/* Quick Ticket Status Checker Footer */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Перевірити статус талону або справи:
            </h4>
            <form onSubmit={handleLookupStatus} className="flex gap-2">
              <input
                type="text"
                value={lookupTicketCode}
                onChange={(e) => setLookupTicketCode(e.target.value)}
                placeholder="Введіть код талону (наприклад ROK-4821)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Перевірити
              </button>
            </form>
            {lookupResult && (
              <p className="text-xs text-emerald-400 mt-2 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800">
                {lookupResult}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
