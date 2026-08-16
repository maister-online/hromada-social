import React, { useState } from 'react';
import { KNOWLEDGE_CATEGORIES, KNOWLEDGE_ARTICLES, KnowledgeArticle } from '../data/knowledgeBase';
import { RobotAvatar } from './RobotAvatar';
import { speakGentleUkVoice, stopSpeaking } from '../utils/speechUtils';
import {
  Zap,
  Search,
  BookOpen,
  Sparkles,
  CheckCircle2,
  FileText,
  Clock,
  Building,
  ShieldCheck,
  Send,
  Cpu,
  ArrowRight,
  Copy,
  Check,
  Volume2,
  Filter,
  Layers,
  HelpCircle,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Bot
} from 'lucide-react';

interface AutoResponseModuleProps {
  onNavigateTab: (tab: string, payload?: any) => void;
}

export const AutoResponseModule: React.FC<AutoResponseModuleProps> = ({ onNavigateTab }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<KnowledgeArticle | null>(KNOWLEDGE_ARTICLES[0]);

  // Simulator State
  const [testQuery, setTestQuery] = useState<string>('Як виплачується допомога ВПО у Рокитному і які документи потрібні?');
  const [simulatedResponse, setSimulatedResponse] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Filter articles
  const filteredArticles = KNOWLEDGE_ARTICLES.filter((art) => {
    const matchesCategory = selectedCategory === 'all' || art.categoryId === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Run Auto-Responder Engine Simulation
  const handleRunSimulation = (queryToTest?: string) => {
    const q = (queryToTest || testQuery).trim();
    if (!q) return;

    setIsSimulating(true);
    setSimulatedResponse(null);
    stopSpeaking();

    setTimeout(() => {
      // Rule & Knowledge Base Matching Logic
      const lower = q.toLowerCase();
      let bestMatch: KnowledgeArticle | null = null;
      let highestScore = 0;

      KNOWLEDGE_ARTICLES.forEach((art) => {
        let score = 0;
        art.keywords.forEach((kw) => {
          if (lower.includes(kw.toLowerCase())) score += 2;
        });
        if (lower.includes(art.title.toLowerCase())) score += 5;
        if (score > highestScore) {
          highestScore = score;
          bestMatch = art;
        }
      });

      // Default fallback match if no high score
      if (!bestMatch) {
        bestMatch = KNOWLEDGE_ARTICLES[0];
      }

      const matchConfidence = highestScore > 3 ? 98 : highestScore > 0 ? 88 : 78;

      setSimulatedResponse({
        query: q,
        matchedArticle: bestMatch,
        confidence: matchConfidence,
        generatedReply: (bestMatch as KnowledgeArticle).autoReplyTemplate,
        requiredDocs: (bestMatch as KnowledgeArticle).requiredDocs,
        legalBasis: (bestMatch as KnowledgeArticle).legalBasis,
        processingTime: (bestMatch as KnowledgeArticle).processingTime,
        timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });

      setIsSimulating(false);
    }, 600);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10 pb-12 text-slate-100 relative">
      {/* Cosmic Curved Background Wave Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-purple-950/80 to-cyan-950 border border-purple-500/30 p-8 shadow-2xl">
        {/* Curved Nebula background accents */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Floating orbit ring SVG line */}
        <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 1000 300" fill="none">
          <path d="M-100 150 C 200 0, 800 300, 1100 150" stroke="url(#cosmicGradient)" strokeWidth="2" strokeDasharray="6 6" />
          <defs>
            <linearGradient id="cosmicGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
        </svg>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold backdrop-blur-md">
              <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Інтелектуальний Модуль Автоматичних Відповідей</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Автоматична Обробка Запитів Жітелів{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400">
                Рокитнівської Громади
              </span>
            </h1>

            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
              Система миттєвих автоматизованих відповідей на основі верифікованої бази знань селищної ради. Забезпечує миттєве надання юридичних довідок щодо соціальних допомог, пільг ветеранам, субсидій та послуг ЦНАП 24/7.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Швидкість відповіді: <strong>&lt; 0.5 сек</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Точність баз знань: <strong>99.4%</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <span>Охоплення питань: <strong>6 Категорій</strong></span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <RobotAvatar
              state={isSimulating ? 'thinking' : 'speaking'}
              size="lg"
              subtitle="Система автоматичного розпізнавання типів звернень"
              onClick={() => {
                speakGentleUkVoice('Модуль автоматичних відповідей готовий до розпізнавання соціальних та муніципальних питань.');
              }}
            />
          </div>
        </div>

        {/* Bottom Curved Wave Divider SVG */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none opacity-40">
          <svg className="relative block w-full h-8" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z" fill="#030712"></path>
          </svg>
        </div>
      </div>

      {/* SECTION 1: Interactive Auto-Response Simulator & Tester */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Slanted Accent Design Line */}
        <div className="absolute top-0 right-0 w-64 h-1.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500" />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Тестування Модуля Автоматичних Відповідей
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Введіть питання жителя або оберіть готовий сценарій, щоб побачити роботу авто-відповідача
            </p>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
            Симулятор у реальному часі
          </span>
        </div>

        {/* Input Box & Preset Scenario Chips */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Задайте питання (наприклад: 'Як отримати пільги ветерану на комуналку?')..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-5 py-3.5 pl-11 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
            </div>

            <button
              onClick={() => handleRunSimulation()}
              disabled={isSimulating || !testQuery.trim()}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              {isSimulating ? (
                <>
                  <Cpu className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>Аналіз знань...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Згенерувати відповідь</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Queries */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-400" /> Сценарії:
            </span>
            {KNOWLEDGE_ARTICLES.slice(0, 4).map((art) => (
              <button
                key={art.id}
                onClick={() => {
                  setTestQuery(art.title);
                  handleRunSimulation(art.title);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-xs border border-slate-700/80 hover:border-cyan-500/50 transition-all"
              >
                {art.title.slice(0, 38)}...
              </button>
            ))}
          </div>
        </div>

        {/* Output Panel for Simulated Response */}
        {simulatedResponse && (
          <div className="mt-6 bg-slate-950/90 rounded-2xl border border-cyan-500/40 p-6 shadow-2xl relative overflow-hidden animate-fadeIn">
            {/* Top Bar Info */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    Знайдено відповідь у Базі Знань
                    <span className="text-xs font-normal text-emerald-400 font-mono">
                      (Точність: {simulatedResponse.confidence}%)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Категорія: {simulatedResponse.matchedArticle.contactDepartment}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    speakGentleUkVoice(simulatedResponse.generatedReply);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Озвучити</span>
                </button>

                <button
                  onClick={() => handleCopy(simulatedResponse.generatedReply)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Скопійовано' : 'Копіювати'}</span>
                </button>
              </div>
            </div>

            {/* Generated Body */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Official Auto Response Text */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
                  {simulatedResponse.generatedReply}
                </div>

                {/* Quick Navigation trigger */}
                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    onClick={() => onNavigateTab('cnap')}
                    className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-2 transition-all"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Записатися в ЦНАП Рокитне</span>
                  </button>

                  <button
                    onClick={() => onNavigateTab('social')}
                    className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-2 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Подати офіційне соціальне звернення</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Key Details Cards */}
              <div className="lg:col-span-4 space-y-3">
                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" /> Необхідні документи:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {simulatedResponse.requiredDocs.map((doc: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Законодавча основа:</div>
                  <div className="text-xs font-semibold text-cyan-300">{simulatedResponse.legalBasis}</div>

                  <div className="mt-3 text-xs text-slate-400 mb-1">Термін розгляду:</div>
                  <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    {simulatedResponse.processingTime}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Municipal Knowledge Base Articles & Explorer */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-400" />
              База Знань Рокитнівської Громади
            </h2>
            <p className="text-xs text-slate-400">
              Офіційні нормативи, правила надання послуг та автоматизовані сценарії роз'яснень
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук у базі знань..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* Categories Grid Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            Усі теми ({KNOWLEDGE_ARTICLES.length})
          </button>

          {KNOWLEDGE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => {
                setActiveArticle(art);
                setTestQuery(art.title);
                handleRunSimulation(art.title);
              }}
              className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10 cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              {/* Curved Top Accent SVG inside Card */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-300">
                    {art.contactDepartment}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    {art.faqCount} запитів
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {art.summary}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> {art.processingTime}
                </span>

                <span className="text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Симулювати</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
