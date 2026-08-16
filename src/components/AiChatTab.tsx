import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, RobotState } from '../types';
import { FREQUENT_QUERIES } from '../data/mockData';
import { RobotAvatar } from './RobotAvatar';
import { speakGentleUkVoice, stopSpeaking, createSpeechRecognizer } from '../utils/speechUtils';
import {
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Volume2,
  VolumeX,
  FileText,
  Calendar,
  MapPin,
  HeartHandshake,
  ShieldCheck,
  Building2,
  Trash2,
  MessageSquare,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface AiChatTabProps {
  onNavigateTab: (tab: string, payload?: any) => void;
}

export const AiChatTab: React.FC<AiChatTabProps> = ({ onNavigateTab }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Вітаю вас у цифровому просторі Рокитнівської громади! Я — ваш інтелектуальний муніципальний консультант із голосовою підтримкою.\n\nЯ можу допомогти вам із:\n- **Послугами ЦНАПу** (запис у чергу, паспорти, прописка, ВПО, ветеранський сервіс)\n- **Соціальними запитами** та оформленням матеріальної допомоги\n- **Навігацією по карті** старостатів, лікарень, шкіл та укриттів\n- **Комунальними та муніципальними питаннями** Рокитнівської громади\n\nПро що бажаєте дізнатися сьогодні?',
      timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        { label: '📅 Запис у ЦНАП', action: 'NAVIGATE_CNAP' },
        { label: '🗺️ Карта старостатів', action: 'NAVIGATE_MAP' },
        { label: '🛡️ Підтримка ветеранів', action: 'ASK_PROMPT', payload: 'Які послуги надаються для ветеранів та їх сімей у Рокитному?' },
      ]
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [robotState, setRobotState] = useState<RobotState>('idle');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, robotState]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Handle sending a user message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    setInputText('');
    stopSpeaking();

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setRobotState('thinking');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory: messages.slice(-6), // last 6 turns
        }),
      });

      const data = await response.json();

      const botReplyText = data.reply || data.fallbackReply || 'Перепрошую, виникла помилка під час обробки. Будь ласка, зверніться до нашого ЦНАПу за номером (03635) 2-15-42.';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReplyText,
        timestamp: data.timestamp || new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
        quickActions: data.quickActions || [],
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsLoading(false);

      // Voice output if voice enabled
      if (voiceEnabled) {
        setRobotState('speaking');
        speakGentleUkVoice(
          botReplyText,
          () => setRobotState('speaking'),
          () => setRobotState('idle'),
          () => setRobotState('idle')
        );
      } else {
        setRobotState('idle');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsLoading(false);
      setRobotState('idle');

      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: 'Шановний жителю! Зараз сервер зв\'язку із селищною радою оновлюється. Ви можете скористатися нашою картою або каталогом послуг ЦНАП.',
        timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Voice recording toggle
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setRobotState('idle');
      return;
    }

    const recognizer = createSpeechRecognizer(
      (text) => {
        setInputText(text);
        setIsListening(false);
        setRobotState('idle');
        handleSendMessage(text);
      },
      () => {
        setIsListening(false);
        setRobotState('idle');
      },
      () => {
        setIsListening(false);
        setRobotState('idle');
      }
    );

    if (recognizer) {
      recognitionRef.current = recognizer;
      try {
        recognizer.start();
        setIsListening(true);
        setRobotState('listening');
      } catch (err) {
        console.warn('Recognition start failed:', err);
        setIsListening(false);
        setRobotState('idle');
      }
    } else {
      alert('Голосовий ввід не підтримується цим браузером. Ви можете ввести запит текстом.');
    }
  };

  // Copy text helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Speak specific message
  const handleSpeakMessage = (text: string) => {
    setRobotState('speaking');
    speakGentleUkVoice(
      text,
      () => setRobotState('speaking'),
      () => setRobotState('idle'),
      () => setRobotState('idle')
    );
  };

  // Render icon for query category
  const getQueryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Passport': return <FileText className="w-4 h-4 text-cyan-400" />;
      case 'HeartHandshake': return <HeartHandshake className="w-4 h-4 text-emerald-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      case 'MapPin': return <MapPin className="w-4 h-4 text-rose-400" />;
      case 'Trash2': return <Trash2 className="w-4 h-4 text-teal-400" />;
      default: return <Building2 className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
      {/* Left Sidebar: Robot Head Visual + Quick Prompts (ChatGPT style sidebar) */}
      <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md shadow-xl overflow-y-auto">
        <div>
          {/* Header Robot Stage */}
          <div className="text-center pb-4 border-b border-slate-800">
            <RobotAvatar
              state={robotState}
              size="lg"
              subtitle="Муніципальний помічник з голосовою підтримкою"
              isSpeaking={robotState === 'speaking'}
              isListening={isListening}
              voiceEnabled={voiceEnabled}
              onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
              onStartListening={toggleListening}
              onClick={() => {
                handleSpeakMessage('Вітаю! Я консультант Рокитнівської громади. Запитайте мене про будь-яку муніципальну послугу чи довідку.');
              }}
            />
          </div>

          {/* Quick Municipal Prompts */}
          <div className="mt-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Часті запити жителів Рокитного:
            </h3>

            <div className="space-y-2">
              {FREQUENT_QUERIES.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleSendMessage(q.prompt)}
                  className="w-full text-left p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/50 transition-all group flex items-start gap-3"
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-900 border border-slate-700 group-hover:border-cyan-500/50">
                    {getQueryIcon(q.icon)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-cyan-200 group-hover:text-cyan-400">
                      {q.title}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {q.prompt}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Hotline Info Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Гаряча лінія селищної ради:</span>
            <span className="text-emerald-400 font-bold">(03635) 2-15-42</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Графік: Пн-Чт 08:00–17:15, Пт 08:00–16:00
          </p>
        </div>
      </div>

      {/* Right Column: AI ChatGPT-style Conversation Stream */}
      <div className="lg:col-span-8 bg-slate-950/90 border border-slate-800 rounded-2xl flex flex-col justify-between shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Консультант Рокитнівської Громади
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wide rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Онлайн
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Консультації щодо ЦНАП, послуг, виплат та гео-інформації
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setMessages([
                {
                  id: 'welcome-reset',
                  sender: 'bot',
                  text: 'Розмову оновлено. Чим я можу допомогти вам зараз?',
                  timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
                }
              ]);
              stopSpeaking();
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Очистити чат"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Stream Container */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                    : 'bg-cyan-950 text-cyan-400 border-cyan-500/40 shadow-md shadow-cyan-500/20'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>

              {/* Message Content Bubble */}
              <div className={`max-w-[85%] space-y-2`}>
                <div
                  className={`p-4 rounded-2xl border text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none'
                      : 'bg-slate-900 text-slate-200 border-slate-800 rounded-tl-none shadow-lg'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>

                  {/* Actions for bot response */}
                  {msg.sender === 'bot' && (
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span className="text-[11px]">{msg.timestamp}</span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSpeakMessage(msg.text)}
                          className="hover:text-cyan-400 transition-colors p-1"
                          title="Прослухати з лагідним голосом"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(msg.text, msg.id)}
                          className="hover:text-cyan-400 transition-colors p-1"
                          title="Скопіювати відповідь"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Action Interactive Buttons attached to bot reply */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {msg.quickActions.map((qa, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (qa.action === 'NAVIGATE_CNAP' || qa.action === 'NAVIGATE_CNAP_QUEUE') {
                            onNavigateTab('cnap');
                          } else if (qa.action === 'NAVIGATE_MAP') {
                            onNavigateTab('map');
                          } else if (qa.action === 'NAVIGATE_SOCIAL') {
                            onNavigateTab('social');
                          } else if (qa.action === 'ASK_PROMPT' && qa.payload) {
                            handleSendMessage(qa.payload);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <span>{qa.label}</span>
                        <ExternalLink className="w-3 h-3 text-cyan-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Thinking Loading State */}
          {isLoading && (
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/40 flex items-center justify-center animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-cyan-300 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Рокитне-Бот готує відповідь з бази даних громади...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title={isListening ? 'Зупинити прослуховування' : 'Голосовий ввід'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-cyan-400" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Запитайте у робота (наприклад: як записатись у ЦНАП на закордонний паспорт)..."
              disabled={isLoading}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-cyan-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
