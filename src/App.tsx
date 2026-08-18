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

function MainAppShell() {
  const [activeTab, setActiveTab] = useState<string>('feed');
  const { openWindow } = useWindowContext();

  const handleSelectNavTab = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAiWindow = () => {
    openWindow({
      id: 'ai-chat-window',
      title: 'Машуня AI — помічник Рокитнівської громади',
      component: <AIAssistantPanel />,
      initialSize: { width: 540, height: 620 }
    });
  };

  return (
    <div className="min-h-screen rokytne-site-bg text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-sky-400/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <TopBar onSelectNavTab={handleSelectNavTab} activeNavTab={activeTab} />
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 flex-1 flex gap-6 pb-20 lg:pb-8">
          <LeftSidebar activeTab={activeTab} onSelectTab={handleSelectNavTab} />
          <main className="flex-1 min-w-0 space-y-6">
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
          </main>
          <RightSidebar onSelectNavTab={handleSelectNavTab} />
        </div>
      </div>

      <WindowManager />
      <Taskbar />
      <BottomNavigation activeTab={activeTab} onSelectTab={handleSelectNavTab} />
      <GoogleSearchButton />
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <WindowProvider>
        <MainAppShell />
      </WindowProvider>
    </UserProvider>
  );
}
