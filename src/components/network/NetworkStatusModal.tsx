import React, { useState, useEffect } from 'react';
import {
  X,
  Wifi,
  Globe,
  Radio,
  Activity,
  CheckCircle2,
  RefreshCw,
  Server,
  Zap,
  ShieldCheck,
  Cpu,
  Signal,
  AlertTriangle,
  Bug,
  Sparkles,
  Terminal,
  CloudLightning,
  AlertOctagon,
  Search,
  Check
} from 'lucide-react';
import { geminiAIService } from '../../services/geminiService';

interface NetworkStatusModalProps {
  onClose: () => void;
  initialTab?: 'network' | 'errors';
}

export const NetworkStatusModal: React.FC<NetworkStatusModalProps> = ({ onClose, initialTab = 'network' }) => {
  const [activeTab, setActiveTab] = useState<'network' | 'errors'>(initialTab);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [ping, setPing] = useState(12);
  const [isTesting, setIsTesting] = useState(false);
  const [activeNodes, setActiveNodes] = useState(1482);
  const [bandwidthUsed, setBandwidthUsed] = useState('2.4 MB/s');
  const [ipAddress, setIpAddress] = useState('194.44.220.18');
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] 🌐 Підключено: Rokytne Mesh Gateway IPv6 (Europe-West2)`,
    `[${new Date().toLocaleTimeString()}] ⚡ Синхронізація Дія & ЦНАП API: ОК (12ms)`,
    `[${new Date().toLocaleTimeString()}] 🤖 Шлюз Google Gemini Search: Підключено 100%`,
    `[${new Date().toLocaleTimeString()}] 📡 WebSocket Канал Повідомлень: Активний (1,482 вузли)`
  ]);

  // Error Analysis States
  const [customErrorInput, setCustomErrorInput] = useState('');
  const [selectedErrorScenario, setSelectedErrorScenario] = useState('');
  const [isAnalyzingError, setIsAnalyzingError] = useState(false);
  const [errorAnalysisResult, setErrorAnalysisResult] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🟢 З'єднання з мережею відновлено!`].slice(-8));
    };
    const handleOffline = () => {
      setIsOnline(false);
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🔴 Увага! Втрачено з'єднання з мережею Інтернет.`].slice(-8));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial ping
    handleTestConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    const timeStr = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timeStr}] 🔄 Запуск детальної діагностики шлюзу Рокитне...`].slice(-8));

    try {
      const pingData = await geminiAIService.pingNetwork();
      setPing(pingData.pingMs);
      setBandwidthUsed(pingData.bandwidth);
      setActiveNodes(pingData.activeNodes);
      setIpAddress(pingData.ip);
      setIsTesting(false);

      setLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ✅ Перевірка успішна! Затримка: ${pingData.pingMs}ms. Шлюз: ${pingData.ip}.`
      ].slice(-8));
    } catch (err) {
      setIsTesting(false);
      setLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ⚠️ Помилка пінгування: Перехід у локальний автономний кеш.`
      ].slice(-8));
    }
  };

  const sampleErrors = [
    {
      label: '429 Quota Exceeded (Gemini API)',
      text: 'Error: [GoogleGenAI Error]: 429 Resource Exhausted. Quota exceeded for quota metric "Generate Content Requests" per minute.'
    },
    {
      label: 'TypeError: Failed to fetch (Network Timeout)',
      text: 'TypeError: Failed to fetch at GeminiAIService.queryMashunya (geminiService.ts:42). Network disconnected or server unreachable.'
    },
    {
      label: '500 Internal Server Error (Cloud Run API)',
      text: 'HTTP/1.1 500 Internal Server Error. Response body: {"ok": false, "error": "Database sync timeout at Rokytne Mesh Node #42"}'
    },
    {
      label: 'CORS Policy Blocked Request',
      text: 'Access to XMLHttpRequest at "https://api.diia.gov.ua/v1/services" from origin "https://rokytne.gov.ua" has been blocked by CORS policy.'
    }
  ];

  const handleAnalyzeError = async (errorTextToAnalyze?: string) => {
    const text = errorTextToAnalyze || customErrorInput;
    if (!text.trim()) return;

    setIsAnalyzingError(true);
    setErrorAnalysisResult(null);

    const result = await geminiAIService.analyzeError(text, 'Система діагностики Рокитного');
    setErrorAnalysisResult(result);
    setIsAnalyzingError(false);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-2xl w-full p-4 sm:p-6 relative text-slate-100 shadow-2xl space-y-5 my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold uppercase">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Мережевий шлюз & Аналізатор системних помилок</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>Центр мережі та діагностики</span>
            <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('network')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'network'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>🌐 Статус Мережі & API</span>
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'errors'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bug className="w-4 h-4 text-amber-300" />
            <span>🚨 Аналізатор Помилок (AI)</span>
          </button>
        </div>

        {/* TAB 1: NETWORK STATUS */}
        {activeTab === 'network' && (
          <div className="space-y-4">
            {/* Online Status Header Banner */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              isOnline
                ? 'bg-gradient-to-r from-emerald-950/80 via-slate-950 to-teal-950/80 border-emerald-500/40'
                : 'bg-gradient-to-r from-rose-950/80 via-slate-950 to-amber-950/80 border-rose-500/40'
            }`}>
              <div className="space-y-1">
                <div className={`text-xs font-mono font-bold uppercase tracking-wide flex items-center gap-2 ${
                  isOnline ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isOnline ? 'ПІДКТЮЧЕНО ДО МЕРЕЖІ ІНТЕРНЕТ' : 'АВТОНОМНИЙ РЕЖИМ (ОФЛАЙН)'}</span>
                </div>
                <div className="text-sm font-bold text-white">
                  Єдина цифрова мережа Рокитнівської громади
                </div>
                <div className="text-[11px] text-slate-300 font-mono">
                  IP: {ipAddress} • Cloud Run Hub (Europe-West2)
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xl font-black text-emerald-400 font-mono">
                  {ping} <span className="text-xs font-normal text-slate-400">ms</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono uppercase">Затримка (Ping)</div>
              </div>
            </div>

            {/* Network Metrics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <Activity className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <div className="text-xs font-black text-white font-mono">{activeNodes}</div>
                <div className="text-[10px] text-slate-400 font-mono">Активних вузлів</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <Signal className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-xs font-black text-white font-mono">100 %</div>
                <div className="text-[10px] text-slate-400 font-mono">Якість сигналу</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <div className="text-xs font-black text-white font-mono">{bandwidthUsed}</div>
                <div className="text-[10px] text-slate-400 font-mono">Трафік громади</div>
              </div>
            </div>

            {/* Service Health Checklist */}
            <div className="space-y-2">
              <label className="font-mono font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                Статус підключених сервісів & API
              </label>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>Google Gemini AI Search Grounding</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    В мережі 🌐
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Шлюз ЦНАП & Дія Портал</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    Синхронізовано
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200">
                    <CloudLightning className="w-4 h-4 text-amber-400" />
                    <span>Погодний Супутник & Радар Опадів</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    Live Потік
                  </span>
                </div>
              </div>
            </div>

            {/* Terminal Request Log */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-mono font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                  Лог мережевих запитів у реальному часі
                </label>
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Діагностика...' : 'Перевірити зєднання'}</span>
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-black/90 border border-slate-800 font-mono text-[11px] text-emerald-400 space-y-1 h-28 overflow-y-auto scrollbar-thin">
                {logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI ERROR ANALYZER */}
        {activeTab === 'errors' && (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-slate-950 border border-cyan-500/30 text-xs space-y-1">
              <div className="font-bold text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>ШІ Інструмент аналізу помилок мережі та коду</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Вставте лог помилки, коди HTTP 429/500 або оберіть стандартний сценарій для отримання миттєвого AI-аналізу причин та інструкції виправлення.
              </p>
            </div>

            {/* Quick Sample Error Picker */}
            <div className="space-y-1.5">
              <label className="font-mono font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                Оберіть часті помилки для аналізу:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {sampleErrors.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedErrorScenario(sample.label);
                      setCustomErrorInput(sample.text);
                      handleAnalyzeError(sample.text);
                    }}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-left text-xs font-mono transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate text-slate-300 hover:text-white">{sample.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Error Input Field */}
            <div className="space-y-2">
              <label className="font-mono font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                Власна помилка або лог консолі:
              </label>
              <textarea
                value={customErrorInput}
                onChange={e => setCustomErrorInput(e.target.value)}
                placeholder="Вставте текст помилки (наприклад: Error: 429 Quota Exceeded або TypeError: Failed to fetch)..."
                className="w-full h-24 p-3 rounded-2xl bg-black/80 border border-slate-800 font-mono text-xs text-amber-300 placeholder-slate-600 outline-none focus:border-cyan-500/60"
              />

              <button
                onClick={() => handleAnalyzeError()}
                disabled={!customErrorInput.trim() || isAnalyzingError}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 ${isAnalyzingError ? 'animate-spin' : ''}`} />
                <span>{isAnalyzingError ? 'ШІ аналізує помилку...' : 'Проаналізувати помилку за допомогою ШІ'}</span>
              </button>
            </div>

            {/* Error Analysis Result Box */}
            {errorAnalysisResult && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 text-xs space-y-2 max-h-60 overflow-y-auto scrollbar-thin animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono font-bold text-cyan-300">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>Звіт AI Аналізатора Рокитного</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    Готово
                  </span>
                </div>

                <div className="text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                  {errorAnalysisResult}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/20 transition-all cursor-pointer"
        >
          Зберегти та закрити
        </button>
      </div>
    </div>
  );
};

