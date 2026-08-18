import React from 'react';
import { Home, Users, PlusCircle, ShoppingBag, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onCreateNew?: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onSelectTab, onCreateNew }) => {
  const items = [
    { id: 'feed', label: 'Головна', icon: Home },
    { id: 'groups', label: 'Групи', icon: Users },
    { id: 'create', label: 'Створити', icon: PlusCircle, isCreateAction: true },
    { id: 'business', label: 'Маркет', icon: ShoppingBag },
    { id: 'profile', label: 'Профіль', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[110] lg:hidden bg-[#080b12]/96 border-t border-white/10 backdrop-blur-2xl px-2 py-1.5 flex items-center justify-around select-none shadow-[0_-12px_35px_rgba(0,0,0,.35)] safe-area-bottom">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button key={item.id} onClick={() => {
            if (item.isCreateAction) onCreateNew ? onCreateNew() : onSelectTab('business');
            else onSelectTab(item.id);
          }} className={`min-w-[58px] flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all relative cursor-pointer ${
            isActive ? 'text-cyan-300 font-bold bg-cyan-400/10 border border-cyan-400/20' : item.isCreateAction ? 'text-emerald-300 font-bold hover:text-emerald-200' : 'text-slate-400 hover:text-white'
          }`}>
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

