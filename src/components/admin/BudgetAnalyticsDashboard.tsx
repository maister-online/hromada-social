import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  BUDGET_EXPENSES_DATA,
  BUDGET_REVENUE_SOURCES,
  MONTHLY_BUDGET_TRENDS,
  DISTRICT_BUDGET_DISTRIBUTION,
  BudgetExpenseCategory
} from '../../data/budgetData';
import {
  Coins,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  Info,
  X,
  Printer,
  ChevronRight,
  Filter,
  Sparkles
} from 'lucide-react';

export const BudgetAnalyticsDashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<BudgetExpenseCategory | null>(
    BUDGET_EXPENSES_DATA[0]
  );
  const [selectedYear, setSelectedYear] = useState<'2025' | '2026'>('2026');
  const [modalCategory, setModalCategory] = useState<BudgetExpenseCategory | null>(null);

  // Interactive Simulator state (e.g. increase road infrastructure allocation)
  const [infraBoostMln, setInfraBoostMln] = useState<number>(0);
  const [eduBoostMln, setEduBoostMln] = useState<number>(0);

  const totalExpenseBase = BUDGET_EXPENSES_DATA.reduce((acc, curr) => acc + curr.amountMln, 0);
  const totalExpenseSimulated = totalExpenseBase + infraBoostMln + eduBoostMln;
  const totalRevenueBase = 408.3; // Mln UAH
  const simulatedSurplus = totalRevenueBase - totalExpenseSimulated;

  // Custom Dark Mode Tooltip for PieChart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as BudgetExpenseCategory;
      return (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs font-mono space-y-1">
          <div className="font-bold text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.name}</span>
          </div>
          <div className="text-cyan-300 font-bold text-sm">
            {data.amountMln} млн грн ({data.percent}%)
          </div>
          <div className="text-[10px] text-slate-400 max-w-xs">{data.description}</div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for BarChart Revenues
  const CustomRevenueTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs font-mono space-y-1.5">
          <div className="font-bold text-amber-300">{label}</div>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-slate-200">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-bold">{entry.value} млн грн</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Monthly Trends
  const CustomTrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const rev = payload[0]?.value || 0;
      const exp = payload[1]?.value || 0;
      const surplus = (rev - exp).toFixed(1);
      return (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs font-mono space-y-1.5">
          <div className="font-bold text-cyan-300">Місяць: {label}</div>
          <div className="text-emerald-400 font-bold">Надходження: {rev} млн грн</div>
          <div className="text-rose-400 font-bold">Видатки: {exp} млн грн</div>
          <div className="text-amber-300 pt-1 border-t border-slate-800 font-bold">
            Профіцит: +{surplus} млн грн
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner & Key Metrics */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-cyan-950/90 border border-emerald-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-[11px] font-mono font-bold text-emerald-300">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span>ФІНАНСОВО-БЮДЖЕТНА ПАНЕЛЬ • РОКИТНІВСЬКА ТГ</span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">
              Бюджет Громади Рокитне (2025–2026)
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              Інтерактивна візуалізація видатків, джерел доходів, виконання бюджетних програм та міжбюджетних субвенцій у розрізі старостинських округів.
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs font-mono">
              <button
                onClick={() => setSelectedYear('2026')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedYear === '2026'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                План 2026 року
              </button>
              <button
                onClick={() => setSelectedYear('2025')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedYear === '2025'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Фактичні підсумки 2025
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0 w-full lg:w-auto">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-center space-y-0.5">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Загальні Доходи</div>
              <div className="text-xl font-black text-emerald-400 font-mono">408.3M</div>
              <div className="text-[10px] text-emerald-300 font-mono flex items-center justify-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +9.2% UAH
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-center space-y-0.5">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Видатки Громади</div>
              <div className="text-xl font-black text-cyan-400 font-mono">{totalExpenseBase.toFixed(1)}M</div>
              <div className="text-[10px] text-cyan-300 font-mono">100% Затверджено</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 text-center space-y-0.5 col-span-2 sm:col-span-1">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Резерв & Профіцит</div>
              <div className="text-xl font-black text-amber-400 font-mono">71.3M</div>
              <div className="text-[10px] text-amber-300 font-mono">Забезпечено 100%</div>
            </div>
          </div>
        </div>
      </div>

      {/* CHART SECTION 1: PIE / DONUT CHART (EXPENSES) + INTERACTIVE SUB-ITEMS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pie Chart Panel (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                Функціональний Розподіл Видатків Бюджету
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
              Натисніть на сектор для деталізації
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={BUDGET_EXPENSES_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={4}
                  dataKey="amountMln"
                  onClick={(entry) => setSelectedCategory(entry)}
                  cursor="pointer"
                >
                  {BUDGET_EXPENSES_DATA.map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={entry.color}
                      stroke={selectedCategory?.id === entry.id ? '#ffffff' : '#0f172a'}
                      strokeWidth={selectedCategory?.id === entry.id ? 3 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={48}
                  formatter={(value: string) => <span className="text-xs text-slate-300 font-sans">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Найбільша стаття: <strong className="text-cyan-300">Освіта & Дошкілля (48.2%)</strong></span>
            <span className="text-emerald-400 font-bold">Усього: {totalExpenseBase.toFixed(1)} млн грн</span>
          </div>
        </div>

        {/* Selected Category Breakdown & Program Details (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          {selectedCategory ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-900 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCategory.color }} />
                    <span className="text-xs font-mono font-bold uppercase text-slate-400">Деталізація Галузі</span>
                  </div>
                  <h4 className="text-base font-black text-white">{selectedCategory.name}</h4>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-cyan-300 font-mono">
                    {selectedCategory.amountMln} млн грн
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{selectedCategory.percent}% від загалу</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                {selectedCategory.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                  <span>Бюджетні проєкти & Заходи:</span>
                  <span className="text-[10px] text-teal-400">{selectedCategory.subItems.length} активних</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin pr-1">
                  {selectedCategory.subItems.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-slate-200 font-medium leading-snug">{sub.title}</span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          sub.status === 'виконано'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : sub.status === 'у процесі'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-teal-400 font-bold">
                        {(sub.amountThousandUah / 1000).toFixed(2)} млн грн ({sub.amountThousandUah.toLocaleString('uk-UA')} тис. грн)
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setModalCategory(selectedCategory)}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 text-xs font-bold border border-slate-800 hover:border-teal-500/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
                <span>Відкрити повну паспортну відомість програми</span>
              </button>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono">
              Оберіть категорію на діаграмі
            </div>
          )}
        </div>
      </div>

      {/* CHART SECTION 2: BAR CHART (REVENUES SOURCES) & AREA CHART (MONTHLY DYNAMICS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Sources Bar Chart */}
        <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                Джерела Надходжень Доходів (млн грн)
              </h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              ПДФО + Єдиний Податок
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BUDGET_REVENUE_SOURCES} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="source"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomRevenueTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="fact2025" name="2025 Фактично" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="plan2026" name="2026 План" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Area Chart */}
        <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                Місячна Динаміка Виконання (Доходи vs Видатки)
              </h3>
            </div>
            <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
              Посячні тренди 2025
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_BUDGET_TRENDS} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTrendTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="revenue" name="Доходи (млн грн)" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expenses" name="Видатки (млн грн)" stroke="#06b6d4" fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHART SECTION 3: DISTRICT BUDGET DISTRIBUTION (STACKED BAR CHART) */}
      <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
              Розподіл Бюджетних Коштів по Старостинських Округах Громади
            </h3>
          </div>
          <span className="text-[10px] text-purple-300 font-mono bg-purple-950 px-2.5 py-1 rounded-md border border-purple-500/30">
            Освіта, Інфраструктура, Соцзахист, Культура
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DISTRICT_BUDGET_DISTRIBUTION} margin={{ top: 20, right: 10, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="district" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="education" name="Освіта" stackId="a" fill="#06b6d4" />
              <Bar dataKey="infrastructure" name="Інфраструктура & Дороги" stackId="a" fill="#f59e0b" />
              <Bar dataKey="social" name="Соцзахист & Медицина" stackId="a" fill="#10b981" />
              <Bar dataKey="culture" name="Культура & Спорт" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* INTERACTIVE BUDGET REALLOCATION SIMULATOR */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 border border-teal-500/40 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                Інтерактивний Симулятор Перерозподілу Бюджету Громади
              </h3>
              <p className="text-[11px] text-slate-400">
                Моделювання зміни обсягів фінансування доріг та освітніх закладів Рокитнівщини.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setInfraBoostMln(0);
              setEduBoostMln(0);
            }}
            className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-mono font-bold border border-slate-800"
          >
            Скинути моделювання
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4 text-xs font-mono">
            {/* Infra Slider */}
            <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex justify-between font-bold">
                <span className="text-amber-400">Додаткове фінансування ремонтів доріг:</span>
                <span className="text-white">+{infraBoostMln} млн грн</span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={0.5}
                value={infraBoostMln}
                onChange={(e) => setInfraBoostMln(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 млн</span>
                <span>+12.5 млн</span>
                <span>+25 млн</span>
              </div>
            </div>

            {/* Edu Slider */}
            <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex justify-between font-bold">
                <span className="text-cyan-400">Додатковий фонд укриттів та автобусів шкіл:</span>
                <span className="text-white">+{eduBoostMln} млн грн</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                step={0.5}
                value={eduBoostMln}
                onChange={(e) => setEduBoostMln(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 млн</span>
                <span>+10 млн</span>
                <span>+20 млн</span>
              </div>
            </div>
          </div>

          {/* Simulation Outcome Panel */}
          <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/30 space-y-3 flex flex-col justify-between">
            <div className="space-y-2 font-mono text-xs">
              <div className="text-slate-400 font-bold uppercase text-[10px]">
                Результат Симуляції Виконання:
              </div>

              <div className="flex justify-between py-1 border-b border-slate-900">
                <span>Початковий Видатковий Бюджет:</span>
                <span className="font-bold text-white">{totalExpenseBase.toFixed(1)} млн грн</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-900">
                <span>Скоригований Бюджет:</span>
                <span className="font-bold text-cyan-300">{totalExpenseSimulated.toFixed(1)} млн грн</span>
              </div>

              <div className="flex justify-between py-1 font-bold">
                <span>Прогнозований Залишок / Резерв:</span>
                <span className={`text-sm ${simulatedSurplus >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {simulatedSurplus >= 0 ? `+${simulatedSurplus.toFixed(1)}` : simulatedSurplus.toFixed(1)} млн грн
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 text-[11px] text-slate-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-400 shrink-0" />
              <span>
                {simulatedSurplus >= 0
                  ? 'Симуляція знаходиться в межах профіцитного резерву громади. Дефіцит відсутній.'
                  : 'Зауваження: перерозподіл перевищує резервний фонд. Потрібна додаткова субвенція.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PASSPORT MODAL DRILL-DOWN */}
      {modalCategory && (
        <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-950 border border-teal-500/50 rounded-2xl shadow-2xl p-6 space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setModalCategory(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 font-mono text-xs text-teal-400 font-bold">
                <FileSpreadsheet className="w-4 h-4" />
                <span>БЮДЖЕТНИЙ ПАСПОРТ ПРОГРАМИ 2026</span>
              </div>
              <h3 className="text-xl font-black text-white">{modalCategory.name}</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              {modalCategory.description}
            </p>

            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
                Перелік затверджених об'єктів та кошторис:
              </h4>

              <div className="space-y-2 font-mono text-xs">
                {modalCategory.subItems.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-0.5">
                      <div className="text-white font-bold">{sub.title}</div>
                      <div className="text-[10px] text-slate-400">Статус: {sub.status}</div>
                    </div>
                    <div className="text-teal-300 font-bold text-right shrink-0">
                      {sub.amountThousandUah.toLocaleString('uk-UA')} тис. грн
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-slate-900">
              <button
                onClick={() => setModalCategory(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Закрити
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Друкувати відомість</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
