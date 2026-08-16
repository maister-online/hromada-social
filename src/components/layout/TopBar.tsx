import React, { useState } from 'react';
import { CoatOfArmsIcon } from '../CoatOfArmsIcon';
import { useUser } from '../../context/UserContext';
import { useWindowContext } from '../../context/WindowContext';
import { WeatherModalView } from '../weather/WeatherModalView';
import { NetworkStatusModal } from '../network/NetworkStatusModal';
import {
  Search,
  Bell,
  Sparkles,
  Sun,
  User,
  FileText,
  AlertTriangle,
  FileSpreadsheet,
  Briefcase,
  Settings,
  ShieldCheck,
  ChevronDown,
  X,
  CheckCircle2,
  Bot,
  Menu,
  Home,
  Map,
  Building2,
  MessageSquare,
  Users,
  FolderKanban,
  Globe,
  Compass,
  Wifi,
  Mic,
  MicOff
} from 'lucide-react';

interface TopBarProps {
  onSelectNavTab: (tab: string) => void;
  activeNavTab: string;
}

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

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Ваш браузер не підтримує розпізнавання голосу. Спробуйте Chrome або Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'uk-UA';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const navMenuItems = [
    { id: 'feed', label: 'Головна Стрічка', icon: Home, badge: 'FB-Style', category: 'ОСНОВНЕ' },
    { id: 'chat', label: 'AI Машуня (Інтернет)', icon: Bot, badge: 'Online', category: 'ОСНОВНЕ' },
    { id: 'cnap', label: 'ЦНАП & Дія Сервіси', icon: Building2, badge: 'Черга', category: 'ПОСЛУГИ' },
    { id: 'map', label: 'Інтерактивна Карта', icon: Map, category: 'ОСНОВНЕ' },
    { id: 'problems', label: 'Проблеми Громади', icon: AlertTriangle, highlight: true, category: 'ПОСЛУГИ' },
    { id: 'petitions', label: 'Петиції Мешканців', icon: FileSpreadsheet, category: 'ПОСЛУГИ' },
    { id: 'business', label: 'Маркетплейс & Бізнес', icon: Briefcase, category: 'БІЗНЕС' },
    { id: 'appeals', label: 'Електронні Звернення', icon: FileText, category: 'ПОСЛУГИ' },
    { id: 'weather', label: 'Погода & Супутник', icon: Sun, category: 'ОСНОВНЕ' },
    { id: 'forum', label: 'Форум & Чат Громади', icon: Users, category: 'СПІЛКУВАННЯ' },
    { id: 'admin', label: 'Адмін-Панель & Аналітика', icon: ShieldCheck, category: 'АДМІНІСТРУВАННЯ' },
    { id: 'profile', label: 'Особистий Кабінет', icon: User, category: 'АДМІНІСТРУВАННЯ' }
  ];

  const handleOpenWeatherWindow = () => {
    openWindow({
      id: 'weather-window',
      title: '🌦 Погода & Космічний Моніторинг Рокитного',
      component: <WeatherModalView />,
      initialSize: { width: 680, height: 520 }
    });
  };

  const handleOpenAiWindow = () => {
    onSelectNavTab('chat');
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-2xl border-b border-slate-800/80 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
      {/* Subtle top neon glow bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-amber-500 via-cyan-400 to-purple-600 opacity-80" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Top-Left Section: Navigation Menu Button + Logo */}
        <div className="flex items-center gap-2 shrink-0 relative">
          {/* Top-Left Navigation Menu Toggle Button */}
          <button
            onClick={() => {
              setShowLeftNavMenu(!showLeftNavMenu);
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
            className={`p-2.5 rounded-xl border text-xs transition-all duration-300 flex items-center gap-1.5 font-bold shadow-lg cursor-pointer ${
              showLeftNavMenu
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/30'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-white hover:text-cyan-300'
            }`}
            title="Відкрити навігацію по сайту"
          >
            <Menu className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-wide">Меню</span>
          </button>

          {/* Logo Section */}
          <div
            onClick={() => {
              onSelectNavTab('feed');
              setShowLeftNavMenu(false);
            }}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <div className="relative">
              <div className="w-10 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-cyan-500 to-emerald-500 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[10px] p-0.5 flex items-center justify-center">
                  <CoatOfArmsIcon className="w-full h-full p-0.5 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
            </div>

            <div className="hidden md:block">
              <div className="text-sm font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5 font-mono">
                <span>ROKYTNE</span>
                <span className="px-1.5 py-0.2 text-[9px] rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  AI
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wide">
                Рокитнівська Громада
              </div>
            </div>
          </div>

          {/* TOP-LEFT SLIDE-OUT / DROPDOWN NAVIGATION DRAWER */}
          {showLeftNavMenu && (
            <div className="absolute top-full left-0 mt-3 w-72 sm:w-80 p-3 rounded-2xl bg-slate-950/95 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 text-xs animate-fadeIn space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 px-1">
                <div className="flex items-center gap-2 text-cyan-300 font-bold font-mono text-xs uppercase tracking-wider">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Навігація Громади</span>
                </div>
                <button
                  onClick={() => setShowLeftNavMenu(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {navMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNavTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectNavTab(item.id);
                        setShowLeftNavMenu(false);
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-600/30 border border-cyan-400/50'
                          : item.highlight
                          ? 'text-amber-300 hover:bg-slate-900/90 hover:text-white border border-amber-500/30 bg-amber-950/20'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-slate-900 text-cyan-400 group-hover:text-cyan-300'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-xs">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                          item.badge === 'Online'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                            : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between px-1 text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Портал онлайн
                </span>
                <span>Рокитне AI 2026</span>
              </div>
            </div>
          )}
        </div>

        {/* Center Search Bar */}
        <div className="relative flex-1 max-w-xl mx-2">
          <div className={`relative flex items-center transition-all duration-300 rounded-2xl border ${
            searchFocused
              ? 'bg-slate-900 border-cyan-500/80 ring-2 ring-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}>
            <Search className="w-4 h-4 ml-3.5 text-cyan-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder={isListening ? "Слухаю вашу назву..." : "Пошук у громаді..."}
              className="w-full px-3 py-2 text-xs text-white placeholder-slate-400 bg-transparent outline-none font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mr-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleVoiceSearch}
              title="Голосовий пошук"
              className={`mr-2.5 p-1.5 rounded-lg transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/50'
                  : 'bg-slate-800 text-cyan-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Expandable Search Popup Drawer */}
          {searchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 p-3 rounded-2xl bg-slate-950/95 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl z-50 text-xs animate-fadeIn space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Категорії пошуку
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                <button
                  onClick={() => { onSelectNavTab('problems'); setSearchFocused(false); }}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 flex items-center gap-2 border border-slate-800"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Проблеми</span>
                </button>
                <button
                  onClick={() => { onSelectNavTab('petitions'); setSearchFocused(false); }}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 flex items-center gap-2 border border-slate-800"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-purple-400" />
                  <span>Петиції</span>
                </button>
                <button
                  onClick={() => { onSelectNavTab('business'); setSearchFocused(false); }}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 flex items-center gap-2 border border-slate-800"
                >
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Бізнес</span>
                </button>
                <button
                  onClick={() => { onSelectNavTab('appeals'); setSearchFocused(false); }}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 flex items-center gap-2 border border-slate-800"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Звернення</span>
                </button>
                <button
                  onClick={() => { onSelectNavTab('map'); setSearchFocused(false); }}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 flex items-center gap-2 border border-slate-800"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>Карта</span>
                </button>
                <button
                  onClick={() => { onSelectNavTab('chat'); setSearchFocused(false); }}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 flex items-center gap-2 border border-slate-800"
                >
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Запитати AI</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Section Tools */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Network Connection Status Badge Button */}
          <button
            onClick={() => {
              setNetworkInitialTab('network');
              setShowNetworkModal(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-900/60 transition-all cursor-pointer group shadow-lg shadow-emerald-950/50"
            title="Мережа громади у режимі онлайн (Google Search & Cloud Hub)"
          >
            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[11px] font-extrabold font-mono tracking-wide group-hover:text-white">
              В МЕРЕЖІ 🌐
            </span>
          </button>

          {/* AI Status Badge */}
          <button
            onClick={handleOpenAiWindow}
            className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 transition-all cursor-pointer group"
            title="AI Рокитне онлайн"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-extrabold font-mono tracking-wide group-hover:text-white">
              AI ONLINE
            </span>
          </button>

          {/* Weather Floating Window Trigger */}
          <button
            onClick={handleOpenWeatherWindow}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Погода у Рокитному"
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline font-mono text-white">+24°C</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-colors relative"
              title="Сповіщення"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 p-3 rounded-2xl bg-slate-950/95 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl z-50 animate-fadeIn space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="font-bold text-xs text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <span>Центр Сповіщень</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    {unreadCount} нових
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-2.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                        n.isRead
                          ? 'bg-slate-900/50 border-slate-800/80 text-slate-400'
                          : 'bg-slate-900 border-cyan-500/30 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-cyan-300 text-[11px]">{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-300">{n.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-colors"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-xl object-cover ring-1 ring-cyan-500/50"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-slate-950/95 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl z-50 animate-fadeIn text-xs space-y-1">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <div className="font-bold text-white truncate">{user.name}</div>
                  <div className="text-[10px] text-cyan-400 font-medium">{user.role}</div>
                </div>

                <button
                  onClick={() => { onSelectNavTab('profile'); setShowProfileMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Мій профіль</span>
                </button>
                <button
                  onClick={() => { onSelectNavTab('appeals'); setShowProfileMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Мої звернення</span>
                </button>
                <button
                  onClick={() => { onSelectNavTab('petitions'); setShowProfileMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                  <span>Мої петиції</span>
                </button>
                <button
                  onClick={() => { onSelectNavTab('business'); setShowProfileMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <span>Мої оголошення</span>
                </button>
                <button
                  onClick={() => { onSelectNavTab('documents'); setShowProfileMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>Електронний Кабінет</span>
                </button>
                <button
                  onClick={() => { onSelectNavTab('admin'); setShowProfileMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 flex items-center gap-2 border-t border-slate-800/80 pt-2"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Адмін-Панель & AI Аналітика</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNetworkModal && (
        <NetworkStatusModal initialTab={networkInitialTab} onClose={() => setShowNetworkModal(false)} />
      )}
    </header>
  );
};
