import React, { useState } from 'react';
import { KNOWLEDGE_CATEGORIES, KNOWLEDGE_ARTICLES, KnowledgeArticle } from '../data/knowledgeBase';
import {
  Sparkles,
  Search,
  BookOpen,
  FileCheck,
  Building2,
  Clock,
  ArrowRight,
  Copy,
  Check,
  Send,
  MessageSquare,
  Flame,
  ShieldCheck,
  HeartHandshake,
  Banknote,
  IdCard,
  Building,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface KnowledgeBaseTabProps {
  onAskAi: (prompt: string) => void;
  onNavigateTab: (tab: string, payload?: any) => void;
}

export const KnowledgeBaseTab: React.FC<KnowledgeBaseTabProps> = ({ onAskAi, onNavigateTab }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<KnowledgeArticle | null>(KNOWLEDGE_ARTICLES[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testUserQuery, setTestUserQuery] = useState<string>('');
  const [matchedAutoReply, setMatchedAutoReply] = useState<string | null>(null);

  // Category Icon Resolver
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Banknote': return <Banknote className="w-5 h-5 text-emerald-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-amber-400" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-sky-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-purple-400" />;
      case 'IdCard': return <IdCard className="w-5 h-5 text-cyan-400" />;
      case 'Building': return <Building className="w-5 h-5 text-rose-400" />;
      default: return <BookOpen className="w-5 h-5 text-indigo-400" />;
    }
  };

  // Filter Articles
  const filteredArticles = KNOWLEDGE_ARTICLES.filter((art) => {
    const matchesCat = selectedCategory === 'all' || art.categoryId === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Handle Quick Auto-Reply Simulation
  const handleSimulateAutoReply = (queryText: string) => {
    const lower = queryText.toLowerCase();
    const found = KNOWLEDGE_ARTICLES.find((art) =>
      art.keywords.some((kw) => lower.includes(kw))
    );

    if (found) {
      setActiveArticle(found);
      setMatchedAutoReply(found.autoReplyTemplate);
    } else {
      setMatchedAutoReply(
        `Запитувана тема не знайдена в автоматичних шаблонах. AI Рокитне-Бот обробить ваше запитання у чаті з урахуванням розширеної бази даних Рокитнівської ради.`
      );
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Cosmic Hero Banner with Curved Lines */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-8 shadow-2xl overflow-hidden">
        {/* Decorative Curved Orbits background */}
        <svg className="absolute -right-10 -bottom-10 w-96 h-96 opacity-20 pointer-events-none" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx="100" cy="100" r="55" fill="none" stroke="#818cf8" strokeWidth="2" />
          <path d="M 20 100 Q 100 20 180 100 T 20 100" fill="none" stroke="#f43f5e" strokeWidth="1.5" />
        </svg>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            База Знань & Автоматичні Відповіді AI
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Модуль Автоматизованих Консультацій Рокитнівської Громади
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Автоматичні точні відповіді на соціальні запити жителів щодо виплат, субсидій, пільг ветеранам, послуг ЦНАП та земельних питань. База знань оновлюється згідно із рішеннями Рокитнівської селищної ради.
          </p>

          {/* Quick Auto-reply Interactive Search Test */}
          <div className="pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (testUserQuery.trim()) {
                  handleSimulateAutoReply(testUserQuery);
                }
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-cyan-400" />
                <input
                  type="text"
                  value={testUserQuery}
                  onChange={(e) => setTestUserQuery(e.target.value)}
                  placeholder="Введіть запит для автоматичної відповіді (наприклад: як оформити дрова або закордонний паспорт)..."
                  className="w-full bg-slate-950/80 border border-indigo-500/40 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                Отримати авто-відповідь
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Категорії муніципальних послуг:
        </h3>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white border-cyan-400 shadow-lg shadow-cyan-500/30'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Всі категорії ({KNOWLEDGE_ARTICLES.length})
          </button>

          {KNOWLEDGE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-cyan-300 border-cyan-500/60 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {getCategoryIcon(cat.iconName)}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left List + Right Article Detail & Auto-Reply Template */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Articles List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук за ключовими словами..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredArticles.map((art) => {
              const isSelected = activeArticle?.id === art.id;
              return (
                <div
                  key={art.id}
                  onClick={() => {
                    setActiveArticle(art);
                    setMatchedAutoReply(null);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  {/* Subtle glowing edge line */}
                  {isSelected && (
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-indigo-500" />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors leading-snug">
                      {art.title}
                    </h4>
                    <span className="text-[10px] font-medium text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 shrink-0">
                      {art.faqCount} звернень
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {art.summary}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {art.processingTime}
                    </span>
                    <span className="text-cyan-400 font-semibold group-hover:underline flex items-center gap-1">
                      Деталі шаблону
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredArticles.length === 0 && (
              <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                За вказаними критеріями статтей не знайдено. Ви можете запитати у Рокитне-Бот AI безпосередньо у чаті.
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Card & Auto-Reply Preview */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between space-y-6 relative overflow-hidden">
          {/* Background curved cosmic glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {activeArticle ? (
            <div className="space-y-6 relative z-10">
              {/* Article Title & Department Header */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 text-[11px] font-semibold">
                    {activeArticle.contactDepartment}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Строк: {activeArticle.processingTime}
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-slate-100 leading-snug">
                  {activeArticle.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Нормативно-правова база: <span className="text-slate-300 font-medium">{activeArticle.legalBasis}</span>
                </p>
              </div>

              {/* Required Documents Checklist */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-cyan-400" />
                  Перелік необхідних документів:
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {activeArticle.requiredDocs.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Automatic Response Template Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/40 shadow-xl relative group">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-cyan-200">
                      Шаблон автоматичної відповіді Рокитне-Бот AI:
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopyText(activeArticle.autoReplyTemplate, activeArticle.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                    title="Скопіювати шаблон"
                  >
                    {copiedId === activeArticle.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Скопійовано</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Скопіювати</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                  {matchedAutoReply || activeArticle.autoReplyTemplate}
                </div>
              </div>

              {/* Action Buttons to trigger Chat or Social Inquiry */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => onAskAi(activeArticle.title)}
                  className="flex-1 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Запитати у AI-робота голосом
                </button>

                <button
                  onClick={() => onNavigateTab('social', { category: activeArticle.categoryId, title: activeArticle.title })}
                  className="flex-1 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-indigo-400" />
                  Подати офіційне звернення
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm">
              Оберіть консультацію з списку ліворуч
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
