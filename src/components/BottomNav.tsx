import React from 'react';
import { Calendar, CalendarDays, Briefcase, Users, DollarSign, Bot, ArrowLeftRight, Plus } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAddCase: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddCase,
}) => {
  const tabs = [
    { id: 'cause-list', label: 'Cause List', icon: Calendar },
    { id: 'calendar', label: 'Monthly', icon: CalendarDays },
    { id: 'cases', label: 'Cases', icon: Briefcase },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'fees', label: 'Ledger', icon: DollarSign },
    { id: 'ai', label: 'AI Legal', icon: Bot },
    { id: 'import', label: 'Import', icon: ArrowLeftRight },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#0F172A] border-t border-white/10 text-slate-400 pb-safe">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-1 px-2 transition-all ${
                isActive
                  ? 'text-sky-400 font-black'
                  : 'hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-sky-400' : 'text-slate-400'}`} />
              <span className="text-[9px] mt-1 font-black uppercase tracking-wider leading-none">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full mt-1" />
              )}
            </button>
          );
        })}

        {/* Floating Add Button for Mobile Quick Access */}
        <button
          onClick={onOpenAddCase}
          className="fixed bottom-16 right-4 z-40 bg-sky-400 text-slate-950 p-4 shadow-xl shadow-sky-400/20 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center font-black"
          title="Add New Case"
        >
          <Plus className="w-6 h-6 stroke-[3] text-slate-950" />
        </button>
      </div>
    </nav>
  );
};
