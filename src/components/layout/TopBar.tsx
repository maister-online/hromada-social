import React, { useState } from 'react';
import { CoatOfArmsIcon } from '../CoatOfArmsIcon';
import { useUser } from '../../context/UserContext';
import { useWindowContext } from '../../context/WindowContext';
import { WeatherModalView } from '../weather/WeatherModalView';
import { NetworkStatusModal } from '../network/NetworkStatusModal';
import { Search, Bell, Sparkles, Sun, User, FileText, AlertTriangle, FileSpreadsheet, Briefcase, ShieldCheck, ChevronDown, X, CheckCircle2, Bot, Menu, Home, Map, Building2, Users, Wifi, Mic, MicOff } from 'lucide-react';

interface TopBarProps { onSelectNavTab: (tab: string) => void; activeNavTab: string; }

const MARKETPLACE_URL = 'https://maister-online.github.io/';

export const TopBar: React.FC<TopBarProps> = ({ onSelectNavTab, activeNavTab }) => {
  const { user, notifications, unreadCount, markNotificationAsRead } = useUser();
  const { openWindow } = useWindowContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLeftNavMenu, setShowLeftNavMenu] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [networkInitialTab, setNetworkInitialTab] = useState<'network' | 'errors'>('network');

  const openMarketplace = () => window.open(MARKETPLACE_URL, '_blank', 'noopener,noreferrer');

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Ваш браузер не підтримує розпізнавання голосу. Спробуйте Chrome або Edge.'); return; }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'uk-UA'; recognition.interimResults = false; recognition.maxAlternatives = 1;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => { setSearchQuery(event.results[0][0].transcript || ''); setIsListening(false); };
      recognition.onerror = () => setIsListening(false); recognition.onend = () => setIsListening(false); recognition.start();
    } catch { setIsListening(false); }
  };

  const navMenuItems = [
    { id: 'feed', label: 'Стрічка', icon: Home },
    { id: 'chat', label: 'Машуня AI', icon: Bot, badge: 'ONLINE' },
    { id: 'forum', label: 'Групи та спільноти', icon: Users },
    { id: 'map', label: 'Карта громади', icon: Map },
    { id: 'problems', label: 'Повідомити проблему', icon: AlertTriangle, highlight: true },
    { id: 'petitions', label: 'Петиції', icon: FileSpreadsheet },
    { id: 'business', label: 'Маркетплейс', icon: Briefcase, external: true },
    { id: 'cnap', label: 'Послуги ЦНАП', icon: Building2 },
    { id: 'appeals', label: 'Електронні звернення', icon: FileText },
    { id: 'weather', label: 'Погода', icon: Sun },
    { id: 'profile', label: 'Мій профіль', icon: User },
    { id: 'admin', label: 'Адмін-панель', icon: ShieldCheck }
  ];

  const handleOpenWeatherWindow = () => openWindow({ id: 'weather-window', title: '🌦 Погода Рокитнівської громади', component: <WeatherModalView />, initialSize: { width: 680, height: 520 } });

  return (
    <header className="sticky top-0 z-50 bg-[#05070d]/90 backdrop-blur-2xl border-b border-white/10 shadow-[0_12px_40px_rgba(0,0,0,.35)]">
      <div className="h-1 bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-500 opacity-80" />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 shrink-0 relative">
          <button onClick={() => { setShowLeftNavMenu(!showLeftNavMenu); setShowNotifications(false); setShowProfileMenu(false); }} className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 text-slate-200 flex items-center justify-center transition-all" title="Навігація"><Menu className="w-5 h-5 text-cyan-300" /></button>
          <div onClick={() => { onSelectNavTab('feed'); setShowLeftNavMenu(false); }} className="flex items-center gap-2 cursor-pointer group">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-400 p-[1.5px] shadow-lg shadow-cyan-500/20"><div className="w-full h-full bg-[#080b12] rounded-[14px] flex items-center justify-center"><CoatOfArmsIcon className="w-8 h-8" /></div><span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#05070d]" /></div>
            <div className="hidden sm:block"><div className="font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">HROMADA <span className="text-cyan-300">SOCIAL</span></div><div className="text-[10px] text-slate-400">Рокитнівська громада</div></div>
          </div>
          {showLeftNavMenu && <div className="absolute top-full left-0 mt-3 w-80 p-3 rounded-3xl bg-[#080b12]/95 border border-white/10 backdrop-blur-2xl shadow-2xl z-50 animate-fadeIn">
            <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-white/10"><div className="font-bold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-cyan-300" /> Меню громади</div><button onClick={() => setShowLeftNavMenu(false)}><X className="w-4 h-4 text-slate-400" /></button></div>
            <div className="max-h-[70vh] overflow-y-auto space-y-1">{navMenuItems.map(item => { const Icon = item.icon; const active = activeNavTab === item.id; return <button key={item.id} onClick={() => { if (item.external) openMarketplace(); else onSelectNavTab(item.id); setShowLeftNavMenu(false); }} className={`w-full px-3 py-2.5 rounded-2xl flex items-center justify-between text-left transition-all ${active ? 'bg-cyan-400/15 text-cyan-200 border border-cyan-400/30' : item.highlight ? 'bg-amber-400/10 text-amber-200 border border-amber-400/20' : 'text-slate-300 hover:bg-white/5 border border-transparent'}`}><span className="flex items-center gap-3"><span className="p-2 rounded-xl bg-black/20"><Icon className="w-4 h-4" /></span><span className="text-xs font-semibold">{item.label}</span></span>{item.badge && <span className="text-[8px] px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">{item.badge}</span>}</button>; })}</div>
            <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-slate-500 flex justify-between"><span>● Онлайн</span><span>Hromada Social</span></div>
          </div>}
        </div>

        <div className="relative flex-1 max-w-2xl mx-auto">
          <div className={`relative flex items-center rounded-2xl border transition-all ${searchFocused ? 'bg-white/[.07] border-cyan-400/50 ring-4 ring-cyan-400/5' : 'bg-white/[.04] border-white/10 hover:border-white/20'}`}>
            <Search className="w-4 h-4 ml-4 text-cyan-300" /><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setTimeout(() => setSearchFocused(false), 200)} placeholder={isListening ? 'Слухаю…' : 'Пошук у громаді та соцмережі…'} className="w-full px-3 py-2.5 text-sm text-white placeholder-slate-500 bg-transparent outline-none" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white mr-2"><X className="w-4 h-4" /></button>}
            <button onClick={handleVoiceSearch} title="Голосовий пошук" className={`mr-2 p-2 rounded-xl ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/5 text-cyan-300 hover:bg-white/10'}`}>{isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}</button>
          </div>
          {searchFocused && <div className="absolute top-full left-0 right-0 mt-2 p-3 rounded-3xl bg-[#080b12]/95 border border-white/10 backdrop-blur-2xl shadow-2xl z-50 animate-fadeIn"><div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Швидкий доступ</div><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{[["problems","Проблеми",AlertTriangle],["petitions","Петиції",FileSpreadsheet],["business","Маркетплейс",Briefcase],["appeals","Звернення",FileText],["map","Карта",Map],["chat","Машуня AI",Bot]].map(([id,label,Icon]: any) => <button key={id} onClick={() => { if (id === 'business') openMarketplace(); else onSelectNavTab(id); setSearchFocused(false); }} className="p-2.5 rounded-2xl bg-white/[.04] hover:bg-white/[.08] border border-white/5 text-slate-300 flex items-center gap-2 text-xs"><Icon className="w-4 h-4 text-cyan-300" />{label}</button>)}</div></div>}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => { setNetworkInitialTab('network'); setShowNetworkModal(true); }} className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 hover:bg-emerald-400/15 text-[10px] font-bold"><Wifi className="w-3.5 h-3.5 animate-pulse" /> ONLINE</button>
          <button onClick={() => onSelectNavTab('chat')} className="hidden md:flex items-center gap-2 px-3 py-2 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-200 hover:bg-cyan-400/15 text-[10px] font-bold"><Bot className="w-3.5 h-3.5" /> МАШУНЯ</button>
          <button onClick={handleOpenWeatherWindow} className="p-2.5 rounded-2xl bg-white/[.04] border border-white/10 hover:bg-white/[.08] text-slate-200"><Sun className="w-4 h-4 text-amber-300" /><span className="hidden xl:inline ml-1 text-xs">+24°</span></button>
          <div className="relative"><button onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }} className="relative p-2.5 rounded-2xl bg-white/[.04] border border-white/10 hover:bg-white/[.08] text-slate-300"><Bell className="w-4 h-4" />{unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">{unreadCount}</span>}</button>{showNotifications && <div className="absolute right-0 mt-2 w-80 sm:w-96 p-3 rounded-3xl bg-[#080b12]/95 border border-white/10 backdrop-blur-2xl shadow-2xl z-50 animate-fadeIn"><div className="font-bold text-white px-2 pb-3 border-b border-white/10">Сповіщення <span className="text-cyan-300 text-xs">{unreadCount} нових</span></div><div className="space-y-2 max-h-72 overflow-y-auto mt-2">{notifications.map(n => <div key={n.id} onClick={() => markNotificationAsRead(n.id)} className={`p-3 rounded-2xl border cursor-pointer ${n.isRead ? 'bg-white/[.02] border-white/5 text-slate-400' : 'bg-cyan-400/5 border-cyan-400/20 text-slate-200'}`}><div className="text-xs font-bold text-cyan-200">{n.title}</div><div className="text-[11px] mt-1">{n.description}</div></div>)}</div></div>}</div>
          <div className="relative"><button onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }} className="flex items-center gap-2 p-1 rounded-2xl bg-white/[.04] border border-white/10 hover:border-cyan-400/30"><img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-xl object-cover" /><ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1 hidden sm:block" /></button>{showProfileMenu && <div className="absolute right-0 mt-2 w-60 p-2 rounded-3xl bg-[#080b12]/95 border border-white/10 backdrop-blur-2xl shadow-2xl z-50 animate-fadeIn"><div className="px-3 py-3 border-b border-white/10"><div className="font-bold text-white truncate">{user.name}</div><div className="text-[10px] text-cyan-300">{user.role}</div></div>{[["profile","Мій профіль",User],["appeals","Мої звернення",FileText],["petitions","Мої петиції",FileSpreadsheet],["business","Мої оголошення",Briefcase],["documents","Електронний кабінет",CheckCircle2],["admin","Адмін-панель",ShieldCheck]].map(([id,label,Icon]: any) => <button key={id} onClick={() => { if (id === 'business') openMarketplace(); else onSelectNavTab(id); setShowProfileMenu(false); }} className="w-full text-left px-3 py-2.5 rounded-2xl hover:bg-white/5 text-slate-200 flex items-center gap-3 text-xs"><Icon className="w-4 h-4 text-cyan-300" />{label}</button>)}</div>}</div>
        </div>
      </div>
      {showNetworkModal && <NetworkStatusModal initialTab={networkInitialTab} onClose={() => setShowNetworkModal(false)} />}
    </header>
  );
};