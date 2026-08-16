import React from 'react';
import { Home, Map, PlusCircle, Bot, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onCreateNew?: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab,
  onCreateNew
}) => {
  const items = [
    { id: 'feed', label: 'Головна', icon: Home },
    { id: 'map', label: 'Карта', icon: Map },
    { id: 'create', label: 'Створити', icon: PlusCircle, isCreateAction: true },
    { id: 'chat', label: 'Машуня', icon: Bot, highlight: true },
    { id: 'admin', label: 'Профіль', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[110] lg:hidden bg-slate-950/95 border-t border-slate-800 backdrop-blur-2xl px-2 py-1.5 flex items-center justify-around select-none shadow-2xl">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.isCreateAction) {
                if (onCreateNew) onCreateNew();
                else onSelectTab('problems');
              } else {
                onSelectTab(item.id);
              }
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative cursor-pointer ${
              isActive
                ? 'text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-500/30'
                : item.isCreateAction
                ? 'text-emerald-400 font-bold hover:text-emerald-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon className={`w-5 h-5 ${item.highlight && !isActive ? 'text-cyan-400 animate-pulse' : ''}`} />
            <span className="text-[10px] font-mono mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

