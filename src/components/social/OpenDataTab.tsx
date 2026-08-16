import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  PieChart,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Calendar,
  Sparkles,
  Download,
  FileSpreadsheet
} from 'lucide-react';

interface CouncilDocument {
  id: string;
  title: string;
  number: string;
  date: string;
  category: 'Рішення сесії' | 'Розпорядження голови' | 'Бюджет' | 'Закупівлі' | 'Земля';
  status: 'Чинне' | 'Проєкт' | 'Прийнято';
  fileSize: string;
}

const DOCUMENTS_DATA: CouncilDocument[] = [
  {
    id: 'doc-1',
    title: 'Про затвердження бюджету Рокитнівської селищної територіальної громади на 2026 рік',
    number: '№ 1248-VIII',
    date: '15 Грудня 2025',
    category: 'Бюджет',
    status: 'Чинне',
    fileSize: '2.4 MB PDF'
  },
  {
    id: 'doc-2',
    title: 'Про виділення субвенції на підтримку підрозділів Збройних Сил України',
    number: '№ 1290-VIII',
    date: '20 Січня 2026',
    category: 'Рішення сесії',
    status: 'Чинне',
    fileSize: '1.1 MB PDF'
  },
  {
    id: 'doc-3',
    title: 'Про капітальний ремонт дорожнього покриття у с. Блажове та смт Томашгород',
    number: '№ 45-Р',
    date: '02 Лютого 2026',
    category: 'Розпорядження голови',
    status: 'Чинне',
    fileSize: '850 KB PDF'
  },
  {
    id: 'doc-4',
    title: 'Звіт про стан використання коштів комунального майна громади за IV квартал',
    number: '№ 88-З',
    date: '10 Лютого 2026',
    category: 'Закупівлі',
    status: 'Прийнято',
    fileSize: '3.6 MB PDF'
  }
];

export const OpenDataTab: React.FC = () => {
  const [documents] = useState<CouncilDocument[]>(DOCUMENTS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredDocs = documents.filter(doc => {
    const matchesCategory = activeCategory === 'all' || doc.category === activeCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || doc.number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 text-slate-100 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-cyan-950/90 via-slate-900 to-teal-950/90 border border-cyan-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Відкрита Громада & Прозорість</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Офіційні Документи та Бюджет
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Публічний реєстр рішень Рокитнівської селищної ради, розпоряджень голови, публічних закупівель та відкритих даних.
          </p>
        </div>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-1 shadow-xl">
          <div className="text-[11px] text-emerald-400 font-mono font-bold uppercase flex items-center justify-between">
            <span>Доходи громади 2026</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-white font-mono">342,800,000 ₴</div>
          <p className="text-[10px] text-slate-400">Виконання плану: 104%</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-1 shadow-xl">
          <div className="text-[11px] text-cyan-400 font-mono font-bold uppercase flex items-center justify-between">
            <span>Підтримка ЗСУ</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-white font-mono">28,500,000 ₴</div>
          <p className="text-[10px] text-slate-400">Субвенції та допомога</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-teal-500/30 space-y-1 shadow-xl">
          <div className="text-[11px] text-teal-400 font-mono font-bold uppercase flex items-center justify-between">
            <span>Прозорі Закупівлі</span>
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-white font-mono">154 Тобдери</div>
          <p className="text-[10px] text-slate-400">Система Prozorro</p>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="p-4 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-xl space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Шукати рішення, розпорядження чи номер документа..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-bold pt-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeCategory === 'all' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Усі документи
          </button>
          <button
            onClick={() => setActiveCategory('Рішення сесії')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeCategory === 'Рішення сесії' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Рішення сесії
          </button>
          <button
            onClick={() => setActiveCategory('Розпорядження голови')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeCategory === 'Розпорядження голови' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Розпорядження голови
          </button>
          <button
            onClick={() => setActiveCategory('Бюджет')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeCategory === 'Бюджет' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Бюджет
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold">
                <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                  {doc.category}
                </span>
                <span className="text-slate-400">{doc.number}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{doc.date}</span>
              </div>

              <h3 className="text-sm font-bold text-white hover:text-cyan-300 transition-colors">
                {doc.title}
              </h3>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] text-slate-400 font-mono">{doc.fileSize}</span>
              <button
                onClick={() => alert(`Завантаження офіційного документа: ${doc.title}`)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Завантажити</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
