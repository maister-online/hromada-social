import React, { useState, useRef, useEffect } from 'react';
import { AIAvatar } from './AIAvatar';
import { RobotState, ChatMessage } from '../../types';
import { speakGentleUkVoice, stopSpeaking, createSpeechRecognizer } from '../../utils/speechUtils';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  AlertTriangle,
  Sun,
  FileText,
  Globe,
  ExternalLink,
  RefreshCw,
  Radio,
  Sliders,
  Check,
  Search
} from 'lucide-react';

interface AIAssistantPanelProps {
  onQuickAction?: (action: string, payload?: any) => void;
  compactMode?: boolean;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  onQuickAction,
  compactMode = false
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Вітаю! Я Машуня — ваш онлайн AI голосовий помічник Рокитнівської громади. 🌐 Я підключена до мережі Інтернет (Google Search) у режимі реального часу. Запитайте мене голосом або текстом про найновіші новини, закони, розклад ЦНАП чи будь-що з мережі!',
      timestamp: 'Зараз',
      emotion: 'happy'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [robotState, setRobotState] = useState<RobotState>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.95);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const speechRecognizerRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, interimText]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (speechRecognizerRef.current) {
        try { speechRecognizerRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setInterimText('');
    setIsLoading(true);
    setRobotState('thinking');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.slice(-8)
        })
      });

      const data = await res.json();
      const botReply = data.reply || data.answer || data.fallbackReply || 'Запит опрацьовано. Які ще дані з мережі вас цікавлять?';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
        quickActions: data.quickActions,
        sources: data.webSources || data.sources,
        emotion: 'speaking'
      };

      setMessages(prev => [...prev, botMsg]);
      setRobotState('speaking');

      if (audioEnabled) {
        speakGentleUkVoice(
          botReply,
          () => setRobotState('speaking'),
          () => {
            setRobotState('idle');
            // Auto-trigger continuous microphone if mode enabled
            if (continuousMode) {
              setTimeout(() => toggleVoiceInput(), 500);
            }
          },
          undefined,
          speechRate
        );
      } else {
        setRobotState('idle');
      }
    } catch (err) {
      console.error('Online AI Voice Assistant Error:', err);
      const fallbackMsg: ChatMessage = {
        id: `bot-fallback-${Date.now()}`,
        sender: 'bot',
        text: 'Опрацьовую запит. Сервіси Рокитного працюють. Ви можете перевірити послуги ЦНАП чи оголошення громади.',
        timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
        emotion: 'idle'
      };
      setMessages(prev => [...prev, fallbackMsg]);
      setRobotState('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      if (speechRecognizerRef.current) {
        try { speechRecognizerRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      setRobotState('idle');
      setInterimText('');
      return;
    }

    stopSpeaking();

    const recognizer = createSpeechRecognizer(
      (transcript, isFinal) => {
        if (isFinal) {
          setIsListening(false);
          setInputText(transcript);
          setInterimText('');
          handleSendMessage(transcript);
        } else {
          setInterimText(transcript);
        }
      },
      () => {
        setIsListening(false);
        setRobotState('idle');
      },
      (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
        setRobotState('idle');
        setInterimText('');
      }
    );

    if (recognizer) {
      speechRecognizerRef.current = recognizer;
      try {
        recognizer.start();
        setIsListening(true);
        setRobotState('listening');
        setInterimText('');
      } catch (err) {
        console.warn('Speech start error:', err);
        setIsListening(false);
        setRobotState('idle');
      }
    } else {
      alert('Голосове введення недоступне у даному браузері.');
    }
  };

  const quickPrompts = [
    { label: '🌐 Новини у мережі', prompt: 'Знайди в інтернеті останні новини Рокитного та Рівненщини за сьогодні', icon: Globe },
    { label: '🏛️ Запис у ЦНАП', prompt: 'Які послуги надає ЦНАП у Рокитному і як записатися в електронну чергу?', icon: Sparkles },
    { label: '📜 Допомога та пільги', prompt: 'Які соціальні виплати й пільги діють для ВПО та ветеранів у 2026 році?', icon: FileText },
    { label: '🌦 Погода в Рокитному', prompt: 'Яка погода сьогодні у смт Рокитне?', icon: Sun },
    { label: '⚠️ Повідомити проблему', prompt: 'Як подати скаргу або звернення селищній раді Рокитного?', icon: AlertTriangle }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950/95 rounded-2xl border border-slate-800 backdrop-blur-2xl overflow-hidden shadow-2xl text-slate-100">
      {/* Top Header Bar */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="font-black text-xs text-white flex items-center gap-2 font-mono">
              <span>МАШУНЯ AI • Голосовий Помічник</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Google Search Grounding • Live Network</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Continuous Voice Mode Toggle */}
          <button
            onClick={() => setContinuousMode(!continuousMode)}
            className={`px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold transition-all ${
              continuousMode
                ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title="Автоматичне прослуховування мікрофона після відповіді"
          >
            <span>{continuousMode ? '⚡ Авто-діалог' : 'Одноразово'}</span>
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={() => {
              if (audioEnabled) stopSpeaking();
              setAudioEnabled(!audioEnabled);
            }}
            className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
              audioEnabled
                ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={audioEnabled ? 'Вимкнути звук' : 'Увімкнути звук'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Futuristic 3D Cyber Head & Equalizer */}
      <div className="p-4 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 flex flex-col items-center justify-center border-b border-slate-800/80 relative">
        <AIAvatar state={robotState} size={140} interactive={false} />

        <div className="mt-2 text-center space-y-1">
          <div className="text-xs font-bold text-slate-200">
            {isListening
              ? (interimText ? `"${interimText}"` : 'Слухаю ваш голос...')
              : robotState === 'thinking'
              ? 'Пошук інформації в мережі Інтернет...'
              : robotState === 'speaking'
              ? 'Відповідаю голосом...'
              : 'Запитайте Машуню голосом або текстом'}
          </div>

          {/* Equalizer Waveform */}
          {isListening && (
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="w-1 h-4 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
            </div>
          )}
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-2 border-b border-slate-800 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {quickPrompts.map((qp, idx) => {
          const Icon = qp.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.prompt)}
              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-medium text-slate-300 hover:text-cyan-200 shrink-0 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Icon className="w-3 h-3 text-cyan-400" />
              <span>{qp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-thin text-xs">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-br-none shadow-md'
                  : 'bg-slate-900/95 border border-slate-800 text-slate-200 rounded-bl-none shadow-inner'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>

              {/* Verified Web Sources Grounding List */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 font-mono">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Джерела з мережі Інтернет:</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {msg.sources.slice(0, 3).map((src, idx) => (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-cyan-300 hover:text-white flex items-center gap-1 underline truncate bg-slate-950/60 p-1.5 rounded-lg border border-slate-800"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0 text-cyan-400" />
                        <span className="truncate">{src.title || src.url}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Action Navigation Buttons */}
              {msg.quickActions && msg.quickActions.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                  {msg.quickActions.map((qa, i) => (
                    <button
                      key={i}
                      onClick={() => onQuickAction && onQuickAction(qa.action, qa.payload)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-[10px] font-bold border border-cyan-500/40 transition-colors cursor-pointer"
                    >
                      {qa.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs p-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl w-max animate-pulse">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>ШІ шукає інформацію в мережі Інтернет...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Voice & Text Input Controls */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/95 flex items-center gap-2">
        <button
          onClick={toggleVoiceInput}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-600 border-rose-400 text-white animate-pulse shadow-lg shadow-rose-500/50'
              : 'bg-slate-950 border-slate-800 text-cyan-400 hover:text-cyan-200'
          }`}
          title={isListening ? 'Зупинити мікрофон' : 'Голосове введення'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          placeholder={isListening ? "Запис мовлення..." : "Напишіть або скажіть запит..."}
          className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 outline-none focus:border-cyan-500"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
          className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white disabled:opacity-40 transition-all cursor-pointer shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
