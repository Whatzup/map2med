import React from 'react';
import { Home, Calendar, ClipboardList, User } from 'lucide-react';

interface BottomNavBarProps {
  activeTab?: 'home' | 'book' | 'orders' | 'profile';
  onTabChange?: (tab: 'home' | 'book' | 'orders' | 'profile') => void;
  badgeCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab = 'home',
  onTabChange,
  badgeCount = 0
}) => {
  interface TabItem {
    id: 'home' | 'book' | 'orders' | 'profile';
    label: string;
    icon: React.ElementType;
    badge?: number;
  }

  const tabs: TabItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'book', label: 'Book Visit', icon: Calendar, badge: badgeCount },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 max-w-[430px] mx-auto z-50 bg-white/98 backdrop-blur-md border-t border-slate-200/90 px-3 py-1 flex items-center justify-around select-none shrink-0 shadow-lg h-[52px]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={`flex flex-col items-center justify-center py-0.5 px-3 relative transition-all cursor-pointer ${
              isActive ? 'text-emerald-800' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-emerald-800' : 'stroke-[1.75px]'}`} />
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-2xs">
                  {tab.badge}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] mt-0.5 leading-tight text-center ${
                isActive ? 'font-bold text-emerald-800' : 'font-medium text-slate-500'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
