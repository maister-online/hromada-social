import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, RobotState } from '../types';
import { FREQUENT_QUERIES } from '../data/mockData';
import { RobotAvatar } from './RobotAvatar';
import { speakGentleUkVoice, stopSpeaking, createSpeechRecognizer } from '../utils/speechUtils';
import {
  Send, Mic, MicOff, Bot, User, Sparkles, RefreshCw, Copy, Check,
  Volume2, FileText, MapPin, HeartHandshake, ShieldCheck, Building2,
  Trash2, ExternalLink, Search, Globe, X
} from 'lucide-react';

interface AiChatTabProps { onNavigateTab: (tab: string, payload?: any) => void; }

export const AiChatTab: React.FC<AiChatTabProps> = ({ onNavigateTab }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome-1', sender: 'bot',
    text: 'Вітаю вас у цифровому просторі Рокитнівської громади! Я — ваш муніципальний консультант із голосовою підтримкою.\n\nЗапитайте мене про послуги, документи, громаду або відкрийте Google прямо в цьому вікні для пошуку по всьому інтернету.',
    timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
    quickActions: [
      { label: '📅 Запис у ЦНАП', action: 'NAVIGATE_CNAP' },
      { label: '🗺️ Карта старостатів', action: 'NAVIGATE_MAP' },
      { label: '🛡️ Підтримка ветеранів', action: 'ASK_PROMPT', payload: 'Які послуги надаються для ветеранів та їх сімей у Рокитному?' }
    ]
  }]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [robotState, setRobotState] = useState<RobotState>('idle');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showGoogle, setShowGoogle] = useState(false);
  const [googleQuery, setGoogleQuery] = useState('');
  const [googleUrl, setGoogleUrl] = useState('https://www.google.com/search?igu=1');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, robotState]);
  useEffect(() => () => stopSpeaking(), []);

  const openGoogle = (query?: string) => {
    const q = (query ?? googleQuery).trim();
    if (!q) return;
    setGoogleQuery(q);
    setGoogleUrl(`https://www.google.com/search?igu=1&q=${encodeURIComponent(q)}`);
    setShowGoogle(true);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;
    setInputText(''); stopSpeaking();
    const userMsg: ChatMessage = { id: `usr-${Date.now()}`, sender: 'user', text: query, timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]); setIsLoading(true); setRobotState('thinking');
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: query, conversationHistory: messages.slice(-6) }) });
      const data = await response.json();
      const botReplyText = data.reply || data.fallbackReply || 'Перепрошую, виникла помилка під час обробки. Будь ласка, спробуйте ще раз.';
      const botMsg: ChatMessage = { id: `bot-${Date.now()}`, sender: 'bot', text: botReplyText, timestamp: data.timestamp || new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }), quickActions: data.quickActions || [] };
      setMessages(prev => [...prev, botMsg]); setIsLoading(false);
      if (voiceEnabled) {
        setRobotState('speaking');
        speakGentleUkVoice(botReplyText, () => setRobotState('speaking'), () => setRobotState('idle'), () => setRobotState('idle'));
      } else setRobotState('idle');
    } catch (error) {
      console.error('Chat error:', error); setIsLoading(false); setRobotState('idle');
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, sender: 'bot', text: 'Зараз сервер Машуні недоступний. Спробуйте ще раз або скористайтеся Google у цьому чаті.', timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) }]);
    }
  };

  const toggleListening = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); setRobotState('idle'); return; }
    const recognizer = createSpeechRecognizer(text => { setInputText(text); setIsListening(false); setRobotState('idle'); handleSendMessage(text); }, () => { setIsListening(false); setRobotState('idle'); }, () => { setIsListening(false); setRobotState('idle'); });
    if (!recognizer) { alert('Голосовий ввід не підтримується цим браузером.'); return; }
    recognitionRef.current = recognizer;
    try { recognizer.start(); setIsListening(true); setRobotState('listening'); } catch { setIsListening(false); setRobotState('idle'); }
  };

  const copyToClipboard = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };
  const handleSpeakMessage = (text: string) => { setRobotState('speaking'); speakGentleUkVoice(text, () => setRobotState('speaking'), () => setRobotState('idle'), () => setRobotState('idle')); };
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
      <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md shadow-xl overflow-y-auto">
        <div>
          <div className="text-center pb-4 border-b border-slate-800">
            <RobotAvatar state={robotState} size="lg" subtitle="Муніципальний помічник з голосовою підтримкою" isSpeaking={robotState === 'speaking'} isListening={isListening} voiceEnabled={voiceEnabled} onToggleVoice={() => setVoiceEnabled(!voiceEnabled)} onStartListening={toggleListening} onClick={() => handleSpeakMessage('Вітаю! Я консультант Рокитнівської громади. Запитайте мене про будь-яку муніципальну послугу чи довідку.')} />
          </div>
          <div className="mt-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-cyan-400" />Часті запити жителів Рокитного:</h3>
            <div className="space-y-2">{FREQUENT_QUERIES.map(q => <button key={q.id} onClick={() => handleSendMessage(q.prompt)} className="w-full text-left p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/50 transition-all group flex items-start gap-3"><div className="mt-0.5 p-1.5 rounded-lg bg-slate-900 border border-slate-700">{getQueryIcon(q.icon)}</div><div><div className="text-xs font-semibold text-cyan-200">{q.title}</div><div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{q.prompt}</div></div></button>)}</div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-800/80 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800"><div className="text-xs font-semibold text-slate-300 flex items-center justify-between"><span>Гаряча лінія селищної ради:</span><span className="text-emerald-400 font-bold">(03635) 2-15-42</span></div><p className="text-[11px] text-slate-400 mt-1">Графік: Пн-Чт 08:00–17:15, Пт 08:00–16:00</p></div>
      </div>

      <div className="lg:col-span-8 bg-slate-950/90 border border-slate-800 rounded-2xl flex flex-col shadow-2xl backdrop-blur-md overflow-hidden">
        <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3"><div className="relative"><div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400"><Bot className="w-5 h-5 animate-pulse" /></div><span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" /></div><div><h2 className="text-sm font-bold text-slate-100">Машуня <span className="text-cyan-400">•</span> Консультант Рокитнівської громади</h2><p className="text-xs text-slate-400">Чат та Google-пошук в одному вікні</p></div></div>
          <div className="flex items-center gap-2"><button onClick={() => setShowGoogle(v => !v)} className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-2 ${showGoogle ? 'bg-cyan-900/60 text-cyan-200 border-cyan-500/50' : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-cyan-500/50'}`}><Globe className="w-4 h-4" /> Google</button><button onClick={() => { setMessages([{ id: 'welcome-reset', sender: 'bot', text: 'Розмову оновлено. Чим я можу допомогти вам зараз?', timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) }]); stopSpeaking(); }} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400" title="Очистити чат"><RefreshCw className="w-4 h-4" /></button></div>
        </div>

        {showGoogle && <div className="border-b border-slate-800 bg-slate-900/80 p-3">
          <form onSubmit={e => { e.preventDefault(); openGoogle(); }} className="flex gap-2 mb-3">
            <Search className="w-5 h-5 text-cyan-400 mt-2.5 shrink-0" />
            <input value={googleQuery} onChange={e => setGoogleQuery(e.target.value)} placeholder="Шукати в Google по всьому інтернету..." className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500" />
            <button type="submit" className="px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold">Пошук</button>
            <button type="button" onClick={() => setShowGoogle(false)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </form>
          <div className="h-[360px] rounded-xl overflow-hidden border border-slate-700 bg-white">
            <iframe title="Google Search" src={googleUrl} className="w-full h-full border-0" />
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Google відкривається всередині вікна чату. Машуня не підміняє результати Google своїми вигадками.</p>
        </div>}

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map(msg => <div key={msg.id} className={`flex items-start gap-3.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${msg.sender === 'user' ? 'bg-blue-600 text-white border-blue-400' : 'bg-cyan-950 text-cyan-400 border-cyan-500/40'}`}>{msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}</div>
            <div className="max-w-[85%] space-y-2"><div className={`p-4 rounded-2xl border text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none' : 'bg-slate-900 text-slate-200 border-slate-800 rounded-tl-none shadow-lg'}`}><div className="whitespace-pre-wrap font-sans">{msg.text}</div>{msg.sender === 'bot' && <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400"><span className="text-[11px]">{msg.timestamp}</span><div className="flex items-center gap-2"><button onClick={() => handleSpeakMessage(msg.text)} className="hover:text-cyan-400 p-1" title="Озвучити"><Volume2 className="w-3.5 h-3.5" /></button><button onClick={() => copyToClipboard(msg.text, msg.id)} className="hover:text-cyan-400 p-1" title="Скопіювати">{copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}</button></div></div>}</div>
              {msg.quickActions && msg.quickActions.length > 0 && <div className="flex flex-wrap gap-2 pt-1">{msg.quickActions.map((qa, idx) => <button key={idx} onClick={() => { if (qa.action === 'NAVIGATE_CNAP' || qa.action === 'NAVIGATE_CNAP_QUEUE') onNavigateTab('cnap'); else if (qa.action === 'NAVIGATE_MAP') onNavigateTab('map'); else if (qa.action === 'NAVIGATE_SOCIAL') onNavigateTab('social'); else if (qa.action === 'ASK_PROMPT' && qa.payload) handleSendMessage(qa.payload); }} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5"><span>{qa.label}</span><ExternalLink className="w-3 h-3" /></button>)}</div>}
            </div>
          </div>)}
          {isLoading && <div className="flex items-start gap-3.5"><div className="w-9 h-9 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/40 flex items-center justify-center animate-pulse"><Bot className="w-5 h-5" /></div><div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-cyan-300">Машуня готує відповідь...</div></div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-slate-900/90 border-t border-slate-800"><form onSubmit={e => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2">
          <button type="button" onClick={toggleListening} className={`p-3 rounded-xl border ${isListening ? 'bg-rose-500 text-white border-rose-400 animate-pulse' : 'bg-slate-800 text-slate-300 border-slate-700'}`} title="Голосовий ввід">{isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-cyan-400" />}</button>
          <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Запитайте Машуню..." disabled={isLoading} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
          <button type="submit" disabled={!inputText.trim() || isLoading} className="p-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white disabled:opacity-50"><Send className="w-5 h-5" /></button>
        </form></div>
      </div>
    </div>
  );
};
