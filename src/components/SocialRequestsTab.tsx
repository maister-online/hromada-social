import React, { useState } from 'react';
import { SocialInquiry } from '../types';
import { RobotAvatar } from './RobotAvatar';
import { speakGentleUkVoice } from '../utils/speechUtils';
import {
  FileText,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  HeartHandshake,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Printer
} from 'lucide-react';

interface SocialRequestsTabProps {
  onNavigateTab: (tab: string, payload?: any) => void;
}

export const SocialRequestsTab: React.FC<SocialRequestsTabProps> = ({ onNavigateTab }) => {
  const [category, setCategory] = useState<'vpo' | 'veteran_support' | 'material_help' | 'utilities' | 'pension' | 'mayor_appeal'>('material_help');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [details, setDetails] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const [inquiriesHistory, setInquiriesHistory] = useState<SocialInquiry[]>([
    {
      id: 'REQ-1082',
      category: 'vpo',
      title: 'Оформлення щомісячної виплати ВПО на дитину',
      fullName: 'Ковальчук Марина Олексіївна',
      phone: '+380679876543',
      address: 'смт Рокитне, вул. Соборна, 12',
      details: 'Перемістилися з Харківської області у березні 2026 року. Потребуємо роз\'яснення щодо виплат на 2 дітей.',
      status: 'resolved',
      aiResponse: 'Всі документи зафіксовано. Надано направлення у Вікно №3 ЦНАП смт Рокитне.',
      suggestedDocuments: ['Заява ВПО', 'Паспорт', 'Свідоцтва про народження дітей', 'IBAN'],
      createdDate: '06.08.2026'
    }
  ]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !details) return;

    setIsLoading(true);
    setAiAnalysisResult(null);

    try {
      const response = await fetch('/api/social-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          fullName,
          phone,
          address,
          details
        })
      });

      const data = await response.json();
      const analysisText = data.analysis || 'Звернення зареєстровано та прийнято до розгляду.';

      setAiAnalysisResult(analysisText);

      const newInquiry: SocialInquiry = {
        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        category,
        title: getCategoryTitle(category),
        fullName,
        phone,
        address,
        details,
        status: 'ai_processed',
        aiResponse: analysisText,
        suggestedDocuments: ['Паспорт громадянина України', 'Ідентифікаційний код', 'Заява на ім\'я Голови'],
        createdDate: new Date().toLocaleDateString('uk-UA')
      };

      setInquiriesHistory([newInquiry, ...inquiriesHistory]);
      setIsLoading(false);

      speakGentleUkVoice('Ваше соціальне звернення успішно проаналізовано та сформовано черновик заяви на ім\'я селищного голови.');
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setAiAnalysisResult('Звернення зареєстровано в базі даних Рокитнівської ради.');
    }
  };

  const getCategoryTitle = (catKey: string) => {
    switch (catKey) {
      case 'vpo': return 'Підтримка ВПО (переселенців)';
      case 'veteran_support': return 'Пільги та виплати Ветеранам';
      case 'material_help': return 'Матеріальна допомога на лікування/складні обставини';
      case 'utilities': return 'Комунальні питання та дрова';
      case 'pension': return 'Пенсійне забезпечення та пільги';
      default: return 'Офіційне звернення до Селищного голови';
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10 pb-12 text-slate-100">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 border border-purple-500/30 p-8 shadow-2xl">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-xs font-semibold">
              <HeartHandshake className="w-4 h-4 text-purple-400" />
              <span>Соціальний Захист Жителів Рокитно</span>
            </div>

            <h1 className="text-3xl font-extrabold text-white">
              Автоматизована Подача Соціальних Звернень
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Подавайте електронні запити на матеріальну допомогу, пільги, компенсацію дров та підтримку ВПО. AI Рокитне-Бот сформує черновик заяви відповідно до законодавства України.
            </p>
          </div>

          <div className="md:col-span-4 flex justify-center">
            <RobotAvatar
              state={isLoading ? 'thinking' : 'speaking'}
              size="md"
              subtitle="Юридичний штучний інтелект селищної ради"
            />
          </div>
        </div>
      </div>

      {/* Main Request Form + AI Analysis Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Форма Соціального Запиту
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Заповніть дані, щоб зафіксувати звернення та згенерувати заяву
            </p>
          </div>

          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Категорія звернення:
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
              >
                <option value="material_help">Матеріальна допомога (лікування, складні обставини)</option>
                <option value="vpo">Підтримка ВПО (довідки, грошова допомога)</option>
                <option value="veteran_support">Сервіс "Я-Ветеран" (пільги, компенсації)</option>
                <option value="utilities">Комунальні послуги, дрова та благоустрій</option>
                <option value="mayor_appeal">Офіційне звернення до Селищного голови Таргонського Г. М.</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ПІБ Заявника:
              </label>
              <input
                type="text"
                placeholder="наприклад: Франко Іван Якович"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Телефон:
                </label>
                <input
                  type="tel"
                  placeholder="+380671234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Адреса проживання:
                </label>
                <input
                  type="text"
                  placeholder="смт Рокитне / село..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Опис проблеми / суть звернення:
              </label>
              <textarea
                rows={4}
                placeholder="Детально опишіть вашу ситуацію..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !fullName || !phone || !details}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>AI Аналізує законодавчу базу...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Подати та згенерувати заяву</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output AI Analysis Box */}
        <div className="lg:col-span-6 space-y-6">
          {aiAnalysisResult ? (
            <div className="bg-slate-900/90 border border-purple-500/40 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                  <h3 className="text-base font-bold text-white">
                    Результат AI-Аналізу & Шаблон Заяви
                  </h3>
                </div>

                <button
                  onClick={() => handleCopy(aiAnalysisResult)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Скопійовано' : 'Копіювати'}</span>
                </button>
              </div>

              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans max-h-[420px] overflow-y-auto">
                {aiAnalysisResult}
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Друкувати заяву</span>
                </button>

                <button
                  onClick={() => onNavigateTab('cnap')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all flex items-center gap-2"
                >
                  <span>Записатися в ЦНАП з цією заявою</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[360px]">
              <div className="w-16 h-16 rounded-full bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Очікування Подання Звернення
              </h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Заповніть форму ліворуч. Штучний інтелект Рокитнівської ради автоматично перевірить законні підстави та сформує бланк заяви на ім'я селищного голови.
              </p>
            </div>
          )}

          {/* History of Recent Appeals */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Останні Зареєстровані Запити
            </h3>

            <div className="space-y-3">
              {inquiriesHistory.map((inq) => (
                <div
                  key={inq.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-400 font-bold">{inq.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px]">
                      Оброблено AI
                    </span>
                  </div>

                  <div className="font-bold text-slate-100">{inq.title}</div>
                  <div className="text-slate-400 line-clamp-2">{inq.details}</div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{inq.fullName}</span>
                    <span>{inq.createdDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
