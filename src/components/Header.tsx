import React from 'react';
import { BookOpen, Calendar, CalendarDays, Download, RefreshCw, Scale, Search, ShieldCheck, Bell, Mail } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedDate: string;
  todayCount: number;
  dueSoonCount: number;
  onOpenDueSoonAlerts: () => void;
  onOpenEmailReminders: () => void;
  onResetData: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  selectedDate,
  todayCount,
  dueSoonCount,
  onOpenDueSoonAlerts,
  onOpenEmailReminders,
  onResetData,
  searchQuery,
  onSearchChange,
}) => {
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <header className="bg-[#0F172A] text-white sticky top-0 z-30 shadow-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Top Branding Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-sky-400/10 text-sky-400 p-2.5 rounded-none border border-sky-400/30 flex items-center justify-center">
              <Scale className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-xl sm:text-2xl text-white tracking-tighter leading-none uppercase">
                  ADVOCATE <span className="text-sky-400">DIARY.</span>
                </h1>
                <span className="bg-sky-400 text-slate-950 text-[9px] font-black px-2 py-0.5 uppercase tracking-widest">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
                Case Management & Legal Schedule
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDueSoonAlerts}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-wider transition-all border ${
                dueSoonCount > 0
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-400/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-white/10'
              }`}
              title="Cases due within next 48 hours"
            >
              <Bell className={`w-3.5 h-3.5 stroke-[3] ${dueSoonCount > 0 ? 'animate-bounce' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Due Soon (48h)</span>
              <span className={`px-1.5 py-0.5 text-[10px] font-black ${dueSoonCount > 0 ? 'bg-slate-950 text-amber-400' : 'bg-slate-700 text-slate-300'}`}>
                {dueSoonCount}
              </span>
            </button>

            <button
              onClick={onOpenEmailReminders}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-wider bg-sky-400/10 text-sky-400 hover:bg-sky-400/20 border border-sky-400/30 transition-all"
              title="Configure 7D, 3D & 1D Email Reminders"
            >
              <Mail className="w-3.5 h-3.5 stroke-[3] text-sky-400" />
              <span className="hidden md:inline">Email Reminders</span>
            </button>

            <button
              onClick={() => onTabChange('cause-list')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'cause-list'
                  ? 'bg-sky-400 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10'
              }`}
              title="Daily Cause List Board"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Cause List</span>
              <span className={`px-2 py-0.5 text-[10px] font-black ${activeTab === 'cause-list' ? 'bg-slate-950 text-sky-400' : 'bg-sky-400 text-slate-950'}`}>
                {todayCount}
              </span>
            </button>

            <button
              onClick={() => onTabChange('calendar')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'calendar'
                  ? 'bg-sky-400 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10'
              }`}
              title="Monthly Calendar Schedule"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Monthly</span>
            </button>

            <button
              onClick={() => onTabChange('import')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-white/10 transition-colors"
              title="WP & PC EXE Sync/Import"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Import Data</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset app data back to default sample records?')) {
                  onResetData();
                }
              }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset Sample Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Search Bar (Shown on Cause List, Calendar, Cases, Clients) */}
        {['cause-list', 'calendar', 'cases', 'clients'].includes(activeTab) && (
          <div className="mt-3 relative">
            <Search className="w-4 h-4 text-sky-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="SEARCH BY CASE NO, TITLE, CLIENT, COURT OR CNR NUMBER..."
              className="w-full pl-10 pr-10 py-2 bg-[#1E293B] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-sky-400 uppercase tracking-wide placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2 text-[10px] font-black text-sky-400 hover:text-white uppercase tracking-wider"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
