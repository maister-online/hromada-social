import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Users,
  AlertTriangle,
  FileText,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';

interface StarostaDistrict {
  id: string;
  name: string;
  centerVillage: string;
  includedVillages: string[];
  starostaName: string;
  starostaAvatar: string;
  phone: string;
  address: string;
  hours: string;
  population: number;
  openProblemsCount: number;
  latestNews: string;
}

const DISTRICTS_DATA: StarostaDistrict[] = [
  {
    id: 'dist-blazhove',
    name: 'Блажовський Старостинський Округ',
    centerVillage: 'с. Блажове',
    includedVillages: ['с. Блажове', 'с. Більськ', 'с. Залав\'я'],
    starostaName: 'Петро Миколайович Трофимчук',
    starostaAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    phone: '+380 (97) 345-21-01',
    address: 'вул. Центральна, 45, с. Блажове',
    hours: 'Пн-Пт: 08:00 - 17:00 (Прийом: Вт, Чт)',
    population: 3420,
    openProblemsCount: 3,
    latestNews: 'Триває капітальний ремонт під\'їзної дороги та облаштування освітлення біля школи.'
  },
  {
    id: 'dist-tomashhorod',
    name: 'Томашгородський Старостинський Округ',
    centerVillage: 'смт Томашгород',
    includedVillages: ['смт Томашгород', 'с. Томашгород'],
    starostaName: 'Ганна Володимирівна Ковальова',
    starostaAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    phone: '+380 (97) 890-12-34',
    address: 'вул. Залізнична, 12, смт Томашгород',
    hours: 'Пн-Пт: 08:00 - 17:00',
    population: 4890,
    openProblemsCount: 5,
    latestNews: 'Відкрито нову філію ЦНАП із віддаленим робочим місцем для видачі довідок.'
  },
  {
    id: 'dist-snovydovychi',
    name: 'Сновидовицький Старостинський Округ',
    centerVillage: 'с. Сновидовичі',
    includedVillages: ['с. Сновидовичі', 'с. Будки-Сновидовицькі', 'с. Остки'],
    starostaName: 'Сергій Васильович Боровець',
    starostaAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    phone: '+380 (98) 234-56-78',
    address: 'вул. Шкільна, 2, с. Сновидовичі',
    hours: 'Пн-Пт: 08:30 - 16:30',
    population: 2950,
    openProblemsCount: 2,
    latestNews: 'Успішно завершено екологічну толоку біля водойми та встановлено нові сміттєві контейнери.'
  },
  {
    id: 'dist-kyselchi',
    name: 'Кисорицький Старостинський Округ',
    centerVillage: 'с. Кисоричі',
    includedVillages: ['с. Кисоричі', 'с. Дерть'],
    starostaName: 'Олена Іванівна Ковальчук',
    starostaAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    phone: '+380 (96) 112-33-44',
    address: 'вул. Лесі Українки, 10, с. Кисоричі',
    hours: 'Пн-Пт: 08:00 - 17:00',
    population: 3100,
    openProblemsCount: 4,
    latestNews: 'Проведено благоустрій місцевого парку та закуплено нове обладнання для медпункту.'
  }
];

export const StarostinDistrictsTab: React.FC = () => {
  const [districts] = useState<StarostaDistrict[]>(DISTRICTS_DATA);
  const [selectedDistrict, setSelectedDistrict] = useState<StarostaDistrict>(DISTRICTS_DATA[0]);

  return (
    <div className="space-y-6 text-slate-100 animate-fadeIn">
      {/* Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-teal-950/90 via-slate-900 to-cyan-950/90 border border-teal-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-mono font-bold uppercase">
            <Building2 className="w-3.5 h-3.5" />
            <span>Старостинські Округи Громади</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Місцеве Самоврядування у Селах
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Контакти старост, населені пункти, графіки прийому громадян та оперативні новини округів.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Districts */}
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold uppercase text-slate-400 px-1">
            Округи Рокитнівщини ({districts.length})
          </div>

          {districts.map(d => {
            const isSelected = d.id === selectedDistrict.id;
            return (
              <div
                key={d.id}
                onClick={() => setSelectedDistrict(d)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-950/90 to-teal-950/90 border-cyan-500/60 shadow-xl'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{d.name}</span>
                  </h3>
                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isSelected ? 'translate-x-1 text-cyan-400' : ''}`} />
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Населені пункти: {d.includedVillages.length}</span>
                  <span className="font-mono text-cyan-300">{d.population} жителів</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed View of Selected District */}
        <div className="lg:col-span-2 space-y-5">
          <div className="p-6 rounded-3xl bg-slate-950/90 border border-cyan-500/40 shadow-2xl space-y-6">
            {/* Header Title */}
            <div className="border-b border-slate-800 pb-4 space-y-1">
              <div className="text-xs text-cyan-400 font-mono font-bold uppercase">
                Центр округу: {selectedDistrict.centerVillage}
              </div>
              <h2 className="text-xl font-black text-white">{selectedDistrict.name}</h2>
            </div>

            {/* Starosta Info Box */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
              <img
                src={selectedDistrict.starostaAvatar}
                alt={selectedDistrict.starostaName}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-500/50 shrink-0"
              />
              <div className="space-y-1 text-center sm:text-left flex-1">
                <div className="text-[10px] text-slate-400 font-mono font-bold uppercase">Староста округу:</div>
                <div className="font-bold text-sm text-white flex items-center justify-center sm:justify-start gap-1.5">
                  <span>{selectedDistrict.starostaName}</span>
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-xs text-cyan-300 font-mono flex items-center justify-center sm:justify-start gap-1 pt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedDistrict.phone}</span>
                </div>
              </div>

              <button
                onClick={() => alert(`Запис на прийом до старости (${selectedDistrict.starostaName})`)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-xs shadow-md shrink-0 cursor-pointer"
              >
                Записатися на прийом
              </button>
            </div>

            {/* Grid Stats & Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="text-slate-400 flex items-center gap-1.5 font-bold">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>Адреса приймальні:</span>
                </div>
                <p className="text-white font-medium">{selectedDistrict.address}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="text-slate-400 flex items-center gap-1.5 font-bold">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Графік роботи:</span>
                </div>
                <p className="text-white font-medium">{selectedDistrict.hours}</p>
              </div>
            </div>

            {/* Included Villages */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 font-mono uppercase">
                Населені пункти у складі округу:
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedDistrict.includedVillages.map((v, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{v}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Latest District News */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-cyan-400 font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Останні події та роботи в окрузі:</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {selectedDistrict.latestNews}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
