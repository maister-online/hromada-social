import React, { useState } from 'react';
import { WindowProvider, useWindowContext } from './context/WindowContext';
import { UserProvider } from './context/UserContext';
import { TopBar } from './components/layout/TopBar';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { Taskbar } from './components/layout/Taskbar';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { WindowManager } from './components/windows/WindowManager';
import { MainFeed } from './components/feed/MainFeed';
import { AIAssistantPanel } from './components/ai/AIAssistantPanel';
import { GoogleSearchButton } from './components/ai/GoogleSearchButton';
import { CommunityProblemsTab } from './components/problems/CommunityProblemsTab';
import { PetitionsTab } from './components/petitions/PetitionsTab';
import { BusinessMarketplaceTab } from './components/business/BusinessMarketplaceTab';
import { SocialInquiriesTab } from './components/appeals/SocialInquiriesTab';
import { CnapServicesTab } from './components/cnap/CnapServicesTab';
import { InteractiveCommunityMap } from './components/map/InteractiveCommunityMap';
import { AdminAnalyticsTab } from './components/admin/AdminAnalyticsTab';
import { UserProfileTab } from './components/profile/UserProfileTab';
import { ResidentsNetworkTab } from './components/social/ResidentsNetworkTab';
import { GroupsCommunitiesTab } from './components/social/GroupsCommunitiesTab';
import { CommunityEventsTab } from './components/social/CommunityEventsTab';
import { ReelsTab } from './components/social/ReelsTab';
import { XTrendsTab } from './components/social/XTrendsTab';
import { StarostinDistrictsTab } from './components/social/StarostinDistrictsTab';
import { OpenDataTab } from './components/social/OpenDataTab';
import { TourismCommunityTab } from './components/TourismCommunityTab';
import { NetworkStatusModal } from './components/network/NetworkStatusModal';
import {
  Sparkles, Users, MapPin, ShoppingBag, Bot, Building2, Landmark, FileText,
  Droplets, School, HeartPulse, HandHeart, ChevronRight, ShieldCheck
} from 'lucide-react';

function CommunitySocialHeader({ onAi }: { onAi: () => void }) {
  return (
    <section className="rounded-3xl border border-cyan-500/20 bg-slate-950/90 shadow-2xl overflow-hidden">
      <div className="relative p-5 sm:p-6 bg-gradient-to-r from-cyan-950/60 via-slate-950 to-teal-950/50">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.12),transparent_35%)]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-cyan-300 font-bold"><Sparkles className="w-3.5 h-3.5" /> Hromada Social</div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white">Рокитнівська громада</h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">Соціальна мережа громади: спілкування, групи, маркетплейс, Машуня та офіційні новини.</p>
          </div>
          <button onClick={onAi} className="shrink-0 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-cyan-900/30 flex items-center gap-2"><Bot className="w-4 h-4" /> Запитати Машуню</button>
        </div>
        <div className="relative mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-3"><Users className="w-4 h-4 text-cyan-400 mb-1" /><div className="text-[11px] font-bold text-white">Соціальна стрічка</div><div className="text-[10px] text-slate-500">Дописи та спілкування</div></div>
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-3"><ShoppingBag className="w-4 h-4 text-amber-400 mb-1" /><div className="text-[11px] font-bold text-white">Маркетплейс</div><div className="text-[10px] text-slate-500">Товари та послуги</div></div>
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-3"><MapPin className="w-4 h-4 text-emerald-400 mb-1" /><div className="text-[11px] font-bold text-white">Громада</div><div className="text-[10px] text-slate-500">Новини та сервіси</div></div>
        </div>
      </div>
    </section>
  );
}

function OfficialPortal({ onSelectTab }: { onSelectTab: (tab: string) => void }) {
  const institutions = [
    { title: 'Селищна рада', subtitle: 'Рішення, розпорядження, новини', icon: Landmark, accent: 'cyan', tab: 'documents' },
    { title: 'Водоканал', subtitle: 'Вода, аварії, тарифи та повідомлення', icon: Droplets, accent: 'sky', tab: 'appeals' },
    { title: 'КП Рокитне', subtitle: 'Комунальні послуги та благоустрій', icon: Building2, accent: 'emerald', tab: 'problems' },
    { title: 'Освіта', subtitle: 'Заклади освіти та офіційні оголошення', icon: School, accent: 'amber', tab: 'documents' },
    { title: 'Медицина', subtitle: 'Медичні установи та інформація', icon: HeartPulse, accent: 'rose', tab: 'documents' },
    { title: 'Соціальний захист', subtitle: 'Допомога, пільги та соціальні послуги', icon: HandHeart, accent: 'violet', tab: 'cnap' },
  ];

  const services = [
    ['Рішення та документи', 'Офіційні рішення, розпорядження та документи', 'documents'],
    ['Бюджет та відкриті дані', 'Фінанси громади, набори даних і прозорість', 'opendata'],
    ['ЦНАП та послуги', 'Адміністративні послуги для мешканців', 'cnap'],
    ['Звернення громадян', 'Офіційні звернення та повідомлення про проблеми', 'appeals'],
    ['Карта громади', 'Об’єкти, установи та інфраструктура', 'map'],
    ['Старостинські округи', 'Офіційна інформація по округах', 'starostins'],
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <section className="official-hero rounded-3xl overflow-hidden border border-emerald-500/20">
        <div className="relative p-6 sm:p-8">
          <div className="official-grid" />
          <div className="relative max-w-3xl">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-emerald-300 font-bold"><ShieldCheck className="w-4 h-4" /> Офіційний портал громади</div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-white">🏛️ ОФІЦІЙНІ</h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl">Окремий простір для офіційної інформації Рокитнівської громади. Тут установи та органи громади не змішуються з дописами мешканців.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-3 px-1"><div><h2 className="text-lg font-black text-white">Установи громади</h2><p className="text-xs text-slate-500">Офіційні сторінки та інформаційні розділи</p></div><span className="official-badge">ОФІЦІЙНО</span></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {institutions.map(({ title, subtitle, icon: Icon, accent, tab }) => (
            <button key={title} onClick={() => onSelectTab(tab)} className="official-institution-card text-left group">
              <div className={`official-icon official-${accent}`}><Icon className="w-5 h-5" /></div>
              <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="font-bold text-white truncate">{title}</h3><span className="text-[9px] font-bold text-emerald-400">✓</span></div><p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p></div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition" />
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-black text-white mb-3 px-1">Офіційні сервіси</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map(([title, subtitle, tab]) => (
            <button key={title} onClick={() => onSelectTab(tab)} className="official-service-card text-left group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-emerald-400" /></div>
              <div className="min-w-0 flex-1"><h3 className="font-bold text-sm text-white">{title}</h3><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div><ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionSwitcher({ mode, onChange }: { mode: 'official' | 'community'; onChange: (mode: 'official' | 'community') => void }) {
  return (
    <div className="section-switcher sticky top-2 z-30">
      <button className={mode === 'official' ? 'section-switch active-official' : 'section-switch'} onClick={() => onChange('official')}><Landmark className="w-4 h-4" /><span>🏛️ ОФІЦІЙНІ</span><small>установи та документи</small></button>
      <button className={mode === 'community' ? 'section-switch active-community' : 'section-switch'} onClick={() => onChange('community')}><Users className="w-4 h-4" /><span>👥 ГРОМАДА</span><small>мешканці та спілкування</small></button>
    </div>
  );
}

function MainAppShell() {
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [sectionMode, setSectionMode] = useState<'official' | 'community'>('community');
  const { openWindow } = useWindowContext();
  const handleSelectNavTab = (tab: string) => { setSectionMode('community'); setActiveTab(tab); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleOpenAiWindow = () => openWindow({ id: 'ai-chat-window', title: 'Машуня AI — помічник Рокитнівської громади', component: <AIAssistantPanel />, initialSize: { width: 540, height: 620 } });

  return (
    <div className="min-h-screen rokytne-site-bg text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden"><div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[140px]" /><div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-sky-400/10 rounded-full blur-[140px]" /></div>
      <div className="relative z-10 flex-1 flex flex-col">
        <TopBar onSelectNavTab={handleSelectNavTab} activeNavTab={activeTab} />
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 pt-3 flex-1">
          <SectionSwitcher mode={sectionMode} onChange={(mode) => { setSectionMode(mode); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </div>
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 flex-1 flex gap-6 pb-20 lg:pb-8">
          {sectionMode === 'community' && <LeftSidebar activeTab={activeTab} onSelectTab={handleSelectNavTab} />}
          <main className="flex-1 min-w-0 space-y-6">
            {sectionMode === 'official' ? <OfficialPortal onSelectTab={handleSelectNavTab} /> : <>
              <CommunitySocialHeader onAi={handleOpenAiWindow} />
              {activeTab === 'feed' && <MainFeed />}
              {activeTab === 'reels' && <ReelsTab />}
              {activeTab === 'x-trends' && <XTrendsTab />}
              {activeTab === 'residents' && <ResidentsNetworkTab />}
              {activeTab === 'groups' && <GroupsCommunitiesTab />}
              {activeTab === 'events' && <CommunityEventsTab />}
              {activeTab === 'chat' && <AIAssistantPanel />}
              {activeTab === 'network' && <NetworkStatusModal initialTab="network" onClose={() => setActiveTab('feed')} />}
              {activeTab === 'problems' && <CommunityProblemsTab />}
              {activeTab === 'petitions' && <PetitionsTab />}
              {activeTab === 'starostins' && <StarostinDistrictsTab />}
              {activeTab === 'business' && <BusinessMarketplaceTab />}
              {activeTab === 'business-auto' && <BusinessMarketplaceTab initialCategoryFilter="auto" />}
              {activeTab === 'business-realty' && <BusinessMarketplaceTab initialCategoryFilter="realty" />}
              {activeTab === 'business-services' && <BusinessMarketplaceTab initialCategoryFilter="services" />}
              {activeTab === 'tourism' && <TourismCommunityTab />}
              {activeTab === 'opendata' && <OpenDataTab />}
              {activeTab === 'appeals' && <SocialInquiriesTab />}
              {activeTab === 'cnap' && <CnapServicesTab />}
              {activeTab === 'map' && <InteractiveCommunityMap />}
              {activeTab === 'forum' && <GroupsCommunitiesTab />}
              {activeTab === 'weather' && <InteractiveCommunityMap />}
              {activeTab === 'documents' && <OpenDataTab />}
              {activeTab === 'admin' && <AdminAnalyticsTab />}
              {activeTab === 'profile' && <UserProfileTab />}
            </>}
          </main>
          {sectionMode === 'community' && <RightSidebar onSelectNavTab={handleSelectNavTab} />}
        </div>
      </div>
      {sectionMode === 'community' && <><WindowManager /><Taskbar /><BottomNavigation activeTab={activeTab} onSelectTab={handleSelectNavTab} /><GoogleSearchButton /></>}
    </div>
  );
}

export default function App() { return <UserProvider><WindowProvider><MainAppShell /></WindowProvider></UserProvider>; }
