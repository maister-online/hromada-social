import React from 'react';
import { Home, Users, PlusCircle, ShoppingBag, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onCreateNew?: () => void;
}

const MARKETPLACE_URL = 'https://maister-online.github.io/';

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onSelectTab, onCreateNew }) => {
  const items = [
    { id: 'feed', label: 'Головна', icon: Home },
    { id: 'groups', label: 'Групи', icon: Users },
    { id: 'create', label: 'Створити', icon: PlusCircle, isCreateAction: true },
    { id: 'business', label: 'Маркет', icon: ShoppingBag, isMarketplace: true },
    { id: 'profile', label: 'Акаунт', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[110] lg:hidden bg-[#080b12]/98 border-t border-white/10 backdrop-blur-2xl px-1.5 py-1.5 flex items-center justify-around select-none shadow-[0_-12px_35px_rgba(0,0,0,.35)] safe-area-bottom">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button key={item.id} aria-label={item.label} onClick={() => {
            if (item.isMarketplace) window.open(MARKETPLACE_URL, '_blank', 'noopener,noreferrer');
            else if (item.isCreateAction) onCreateNew ? onCreateNew() : onSelectTab('business');
            else onSelectTab(item.id);
          }} className={`flex-1 max-w-[92px] min-w-0 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all relative cursor-pointer ${isActive ? 'text-cyan-300 font-bold bg-cyan-400/10 border border-cyan-400/20' : item.isCreateAction ? 'text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'}`}>
            <Icon className={`w-5 h-5 ${item.isCreateAction ? 'w-6 h-6' : ''}`} />
            <span className="text-[10px] font-semibold mt-0.5 truncate max-w-full">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
