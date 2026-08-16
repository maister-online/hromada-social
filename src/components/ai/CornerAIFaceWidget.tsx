import React, { useState, useEffect, useRef } from 'react';
import { useWindowContext } from '../../context/WindowContext';
import { AIAssistantPanel } from './AIAssistantPanel';
import { AIAvatar } from './AIAvatar';
import { createSpeechRecognizer, speakGentleUkVoice, stopSpeaking } from '../../utils/speechUtils';
import {
  Bot,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Mic,
  MicOff,
  Send,
  ChevronUp,
  ChevronDown,
  Globe,
  ExternalLink,
  Radio,
  RefreshCw,
  Search,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface CornerAIFaceWidgetProps {
  position?: 'bottom-right' | 'top-right';
}

interface WebSource {
  title: string;
  url: string;
  snippet?: string;
}

export const CornerAIFaceWidget: React.FC<CornerAIFaceWidgetProps> = ({
  position = 'bottom-right'
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [aiState, setAiState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [quickInput, setQuickInput] = useState('');
  const [interimSpeech, setInterimSpeech] = useState('');
  const [speechBubbleText, setSpeechBubbleText] = useState(
    'Вітаю! Я Машуня — ваш онлайн AI голосовий помічник. Поставте запитання про Рокитне, ЦНАП або будь-яку інформацію з інтернету!'
  );
  const [webSources, setWebSources] = useState<WebSource[]>([]);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const [cornerPos, setCornerPos] = useState<'bottom-right' | 'top-right'>(position);
  const [isListening, setIsListening] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [continuousVoiceMode, setContinuousVoiceMode] = useState(false);
  const [networkPing, setNetworkPing] = useState(12);

  const speechRecognizerRef = useRef<any>(null);
  const { openWindow } = useWindowContext();

  // Cleanup speech synthesis and recognition on unmount
  useEffect(() => {
    return () => {
      if (speechRecognizerRef.current) {
        try {
          speechRecognizerRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      stopSpeaking();
    };
  }, []);

  // Open Full Floating AI OS Window
  const handleOpenAiAssistant = () => {
    openWindow({
      id: 'ai-chat-window',
      title: '🤖 Машуня AI • Онлайн Консультант Рокитного',
      component: <AIAssistantPanel />,
      initialSize: { width: 560, height: 640 }
    });
  };

  // Process voice/text query directly through online network AI API with Google Search grounding
  const processNetworkQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    setAiState('thinking');
    setSpeechBubbleText(`🌐 Пошук в Інтернеті та обробка запиту: "${queryText}"...`);
    setWebSources([]);
    setQuickInput('');
    setInterimSpeech('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryText })
      });

      const data = await res.json();
      const replyText = data.reply || data.answer || data.fallbackReply || `Дякую за ваші запитання про "${queryText}". Інформація з мережі опрацьована.`;
      
      setSpeechBubbleText(replyText);
      if (Array.isArray(data.webSources) && data.webSources.length > 0) {
        setWebSources(data.webSources.slice(0, 3));
      } else if (Array.isArray(data.sources) && data.sources.length > 0) {
        setWebSources(data.sources.slice(0, 3));
      }

      setAiState('speaking');

      if (soundEnabled) {
        speakGentleUkVoice(
          replyText,
          () => setAiState('speaking'),
          () => {
            setAiState('idle');
            // If continuous voice mode is on, restart mic listening automatically
            if (continuousVoiceMode) {
              setTimeout(() => toggleVoiceListening(), 400);
            }
          }
        );
      } else {
        setTimeout(() => setAiState('idle'), 5000);
      }
    } catch (err) {
      console.error('Online Network Voice AI Error:', err);
      const fallbackReply = `Опрацьовую запит про "${queryText}". Сервіси Рокитного працюють в автономному режимі. Ви можете звернутися до ЦНАП за адресою вул. Незалежності, 13.`;
      setSpeechBubbleText(fallbackReply);
      setAiState('idle');
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processNetworkQuery(quickInput);
  };

  // Toggle Microphone Voice Recognition
  const toggleVoiceListening = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (isListening) {
      if (speechRecognizerRef.current) {
        try {
          speechRecognizerRef.current.stop();
        } catch (err) {
          console.warn('Speech stop error:', err);
        }
      }
      setIsListening(false);
      setAiState('idle');
      setInterimSpeech('');
      return;
    }

    setShowSpeechBubble(true);
    stopSpeaking();

    const recognizer = createSpeechRecognizer(
      (transcript, isFinal) => {
        if (isFinal) {
          setIsListening(false);
          setQuickInput(transcript);
          setInterimSpeech('');
          setSpeechBubbleText(`🎤 Голос розпізнано: "${transcript}"`);
          processNetworkQuery(transcript);
        } else {
          setInterimSpeech(transcript);
        }
      },
      () => {
        setIsListening(false);
        setAiState(prev => prev === 'listening' ? 'idle' : prev);
      },
      (err) => {
        console.warn('Voice recognition error:', err);
        setIsListening(false);
        setAiState('idle');
        setInterimSpeech('');
        setSpeechBubbleText('Не вдалося чітко розпізнати мову. Натисніть мікрофон і повторіть або напишіть текстом.');
      }
    );

    if (recognizer) {
      speechRecognizerRef.current = recognizer;
      try {
        recognizer.start();
        setIsListening(true);
        setAiState('listening');
        setInterimSpeech('');
        setSpeechBubbleText('🎤 Запис голосу... Поставте запитання про Рокитне, новини чи закони...');
      } catch (err) {
        console.error('Failed to start recognizer:', err);
        setIsListening(false);
        setAiState('idle');
        setSpeechBubbleText('Дозвольте доступ до мікрофона в налаштуваннях браузера.');
      }
    } else {
      setSpeechBubbleText('Ваш браузер не підтримує розпізнавання мови. Введіть запит з клавіатури.');
    }
  };

  const stateBadges = {
    idle: '🌐 В МЕРЕЖІ 24/7',
    listening: '🎤 ЗАПИС ГОЛОСУ...',
    thinking: '⚡ ПОШУК В ІНТЕРНЕТІ...',
    speaking: '🗣️ ВІДПОВІДЬ ГОЛОСОМ...'
  };

  const positionClasses = cornerPos === 'bottom-right'
    ? 'bottom-20 lg:bottom-6 right-4 sm:right-6'
    : 'top-20 right-4 sm:right-6';

  return (
    <div className={`fixed ${positionClasses} z-[120] flex flex-col items-end gap-3 select-none transition-all duration-300`}>
      {/* Speech Bubble Card */}
      {showSpeechBubble && isExpanded && (
        <div className="w-80 sm:w-96 p-4 rounded-2xl bg-slate-950/95 border border-cyan-500/50 backdrop-blur-2xl shadow-2xl space-y-3 animate-fadeIn relative text-slate-100">
          {/* Top Bar inside bubble */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-[10px] font-mono font-bold text-emerald-300 flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-400 animate-spin-slow" />
                <span>МЕРЕЖА ONLINE</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(prev => !prev)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  soundEnabled ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
                title={soundEnabled ? 'Озвучка увімкнена' : 'Озвучка вимкнена'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setCornerPos(prev => prev === 'bottom-right' ? 'top-right' : 'bottom-right')}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
                title="Змінити розташування"
              >
                {cornerPos === 'bottom-right' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setShowSpeechBubble(false)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Microphone Listening Dynamic Waveform */}
          {isListening && (
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-950/90 via-slate-950 to-rose-950/90 border border-amber-500/60 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-[11px] font-bold text-amber-300 font-mono">
                  {interimSpeech ? `"${interimSpeech}"` : "Говоріть у мікрофон..."}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Main Answer Bubble Text */}
          <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium whitespace-pre-line max-h-44 overflow-y-auto scrollbar-thin">
            {speechBubbleText}
          </p>

          {/* Web Sources Grounding Preview */}
          {webSources.length > 0 && (
            <div className="p-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-[11px] space-y-1">
              <div className="font-mono font-bold text-cyan-400 flex items-center gap-1.5 text-[10px]">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>Знайдено в мережі Інтернет:</span>
              </div>
              <div className="space-y-1">
                {webSources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[10px] text-cyan-300 hover:text-white underline truncate"
                  >
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{src.title || src.url}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Quick Input Form */}
          <form onSubmit={handleQuickSubmit} className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              value={quickInput}
              onChange={e => setQuickInput(e.target.value)}
              placeholder={isListening ? "Слухаю ваш голос..." : "Запитати Машуню голосом або текстом..."}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
            />

            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleVoiceListening}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 border-rose-400 text-white animate-pulse shadow-lg shadow-rose-500/50'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-cyan-400 hover:text-cyan-300'
              }`}
              title={isListening ? 'Вимкнути мікрофон' : 'Увімкнути мікрофон'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              disabled={!quickInput.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Open Full Interactive Chat Button */}
          <button
            onClick={handleOpenAiAssistant}
            className="w-full py-2 rounded-xl bg-slate-900 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-500/50 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all group cursor-pointer"
          >
            <Bot className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>Відкрити повний інтерактивний AI Чат</span>
          </button>

          {/* Pointer triangle */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-slate-950 border-r border-b border-cyan-500/50 rotate-45" />
        </div>
      )}

      {/* Main Floating Avatar Capsule */}
      <div
        className="relative flex items-center gap-3 p-2 pr-4 rounded-full bg-slate-950/95 border border-slate-800 hover:border-cyan-500/60 backdrop-blur-2xl shadow-2xl transition-all duration-300 cursor-pointer"
        onClick={handleOpenAiAssistant}
      >
        <div className="shrink-0">
          <AIAvatar
            state={aiState}
            size={56}
            interactive={false}
            usePhotoTexture={true}
          />
        </div>

        <div className="hidden sm:flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-white font-mono tracking-wide">
              МАШУНЯ AI
            </span>
            <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
          </div>
          <span className={`text-[10px] font-mono font-bold ${isListening ? 'text-amber-400 animate-pulse' : 'text-cyan-300'}`}>
            {stateBadges[aiState]}
          </span>
        </div>

        {/* Floating Microphone Action Button */}
        <button
          onClick={toggleVoiceListening}
          className={`p-2.5 rounded-full border transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-600 border-rose-400 text-white animate-pulse shadow-lg shadow-rose-500/50'
              : 'bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border-slate-800'
          }`}
          title={isListening ? 'Зупинити запис' : 'Увімкнути голосовий пошук'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Bubble Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowSpeechBubble(prev => !prev);
          }}
          className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800"
          title="Діалогова хмарка"
        >
          <Bot className="w-4 h-4 text-cyan-400" />
        </button>
      </div>
    </div>
  );
};
