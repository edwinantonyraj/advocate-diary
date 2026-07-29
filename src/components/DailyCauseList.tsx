import React, { useState } from 'react';
import { Case } from '../types';
import { DueSoonBadge } from './DueSoonBadge';
import { Calendar, CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, User, FileText, Send, Plus, Filter, Printer, ExternalLink, Scale, CheckCircle2, AlertCircle } from 'lucide-react';

interface DailyCauseListProps {
  cases: Case[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSelectCase: (caseItem: Case) => void;
  onOpenAddCase: () => void;
  onOpenAiDraft: (caseItem: Case) => void;
  searchQuery: string;
  onSwitchToMonthlyView?: () => void;
}

export const DailyCauseList: React.FC<DailyCauseListProps> = ({
  cases,
  selectedDate,
  onDateChange,
  onSelectCase,
  onOpenAddCase,
  onOpenAiDraft,
  searchQuery,
  onSwitchToMonthlyView,
}) => {
  const [selectedCourtFilter, setSelectedCourtFilter] = useState<string>('ALL');

  // Date Nav Helpers
  const shiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Extract list of courts available
  const availableCourts: string[] = Array.from(new Set(cases.map((c) => c.courtName))).filter(Boolean) as string[];

  // Filter cases scheduled for selectedDate
  const dailyCases = cases.filter((c) => {
    const matchesDate = c.nextHearingDate === selectedDate;
    if (!matchesDate) return false;

    if (selectedCourtFilter !== 'ALL' && c.courtName !== selectedCourtFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = c.caseNumber.toLowerCase().includes(q);
      const matchTitle = c.caseTitle.toLowerCase().includes(q);
      const matchClient = c.clientName.toLowerCase().includes(q);
      const matchCourt = c.courtName.toLowerCase().includes(q);
      const matchCnr = (c.cnrNumber || '').toLowerCase().includes(q);
      return matchNo || matchTitle || matchClient || matchCourt || matchCnr;
    }

    return true;
  });

  // Sort by item number if numeric or available
  const sortedCases = [...dailyCases].sort((a, b) => {
    const itemA = parseInt((a.itemNumber || '').replace(/\D/g, '')) || 999;
    const itemB = parseInt((b.itemNumber || '').replace(/\D/g, '')) || 999;
    return itemA - itemB;
  });

  // Format date display
  const dateObj = new Date(selectedDate);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Date Controls Banner */}
      <div className="bg-[#0F172A] border border-white/10 p-4 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => shiftDate(-1)}
            className="p-2.5 bg-[#1E293B] text-slate-300 hover:bg-slate-700 transition-colors border border-white/10"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4 text-sky-400" />
          </button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-sky-400 font-black text-base uppercase tracking-wider focus:outline-none cursor-pointer"
              />
              {selectedDate === todayStr && (
                <span className="bg-sky-400 text-slate-950 text-[10px] font-black px-2 py-0.5 uppercase tracking-widest">
                  TODAY
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">{formattedDate}</span>
          </div>

          <button
            onClick={() => shiftDate(1)}
            className="p-2.5 bg-[#1E293B] text-slate-300 hover:bg-slate-700 transition-colors border border-white/10"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4 text-sky-400" />
          </button>
        </div>

        {/* Quick Date Presets & Court Filter Row */}
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onDateChange(todayStr)}
              className={`px-3 py-1 font-black text-[11px] uppercase tracking-wider transition-colors ${
                selectedDate === todayStr
                  ? 'bg-sky-400 text-slate-950'
                  : 'bg-[#1E293B] text-slate-300 hover:bg-slate-700 border border-white/10'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => onDateChange(tomorrowStr)}
              className={`px-3 py-1 font-black text-[11px] uppercase tracking-wider transition-colors ${
                selectedDate === tomorrowStr
                  ? 'bg-sky-400 text-slate-950'
                  : 'bg-[#1E293B] text-slate-300 hover:bg-slate-700 border border-white/10'
              }`}
            >
              Tomorrow
            </button>

            {onSwitchToMonthlyView && (
              <button
                onClick={onSwitchToMonthlyView}
                className="px-3 py-1 bg-sky-400/10 hover:bg-sky-400/20 text-sky-400 border border-sky-400/30 font-black text-[11px] uppercase tracking-wider flex items-center gap-1 transition-all"
                title="Switch to Monthly Calendar Grid"
              >
                <CalendarDays className="w-3.5 h-3.5 text-sky-400" />
                <span>Monthly Calendar</span>
              </button>
            )}
          </div>

          {/* Court Filter Dropdown */}
          <div className="flex items-center gap-1.5 min-w-[140px]">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={selectedCourtFilter}
              onChange={(e) => setSelectedCourtFilter(e.target.value)}
              className="bg-[#1E293B] text-slate-200 border border-white/10 text-xs font-semibold px-2 py-1 w-full uppercase focus:outline-none focus:border-sky-400"
            >
              <option value="ALL">All Courts ({cases.filter((c) => c.nextHearingDate === selectedDate).length})</option>
              {availableCourts.map((court) => (
                <option key={court} value={court}>
                  {court.length > 25 ? court.slice(0, 22) + '...' : court}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#1E293B] text-slate-300 hover:bg-slate-700 border border-white/10 text-[11px] font-bold uppercase tracking-wider"
            title="Print Daily Cause List"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span>Print Board</span>
          </button>
        </div>
      </div>

      {/* Summary Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span className="font-bold uppercase tracking-wider text-[11px]">
          LISTED HEARINGS: <strong className="text-sky-400 font-black text-sm ml-1">{sortedCases.length}</strong>
        </span>
        <button
          onClick={onOpenAddCase}
          className="text-sky-400 font-black uppercase text-xs hover:underline flex items-center gap-1 tracking-wider"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Case</span>
        </button>
      </div>

      {/* Cause List Cases Grid */}
      {sortedCases.length === 0 ? (
        <div className="bg-[#0F172A] border border-white/10 p-8 text-center space-y-3 shadow-xl">
          <div className="w-12 h-12 bg-[#1E293B] border border-sky-400/30 flex items-center justify-center mx-auto text-sky-400">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-white font-black text-base uppercase tracking-tight">No Court Hearings Scheduled</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto uppercase tracking-wide">
            No active cases listed for {formattedDate}. Pick another date or create a new entry.
          </p>
          <button
            onClick={onOpenAddCase}
            className="inline-flex items-center gap-2 bg-sky-400 text-slate-950 font-black px-4 py-2.5 text-xs uppercase tracking-wider hover:bg-sky-300 transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Hearing / Case</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedCases.map((caseItem) => {
            const isHighPriority = caseItem.caseType.includes('Writ') || caseItem.caseType.includes('Criminal') || caseItem.caseType.includes('Bail');

            return (
              <div
                key={caseItem.id}
                className="bg-[#0F172A] border border-white/10 p-4 hover:border-sky-400/50 transition-all shadow-xl relative group"
              >
                {/* Top Row: Item No, Court, Status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {caseItem.itemNumber && (
                      <span className="bg-sky-400 text-slate-950 font-black text-xs px-2.5 py-0.5 uppercase tracking-wider">
                        ITEM #{caseItem.itemNumber}
                      </span>
                    )}
                    <DueSoonBadge nextHearingDate={caseItem.nextHearingDate} />
                    <span className="bg-[#1E293B] text-slate-300 text-[11px] px-2 py-0.5 font-bold border border-white/10 uppercase tracking-wider">
                      {caseItem.caseType}
                    </span>
                    {isHighPriority && (
                      <span className="bg-rose-500/20 text-rose-400 text-[10px] font-black px-2 py-0.5 uppercase tracking-widest border border-rose-500/30">
                        PRIORITY
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 tracking-widest ${
                      caseItem.status === 'Pending'
                        ? 'bg-sky-400/10 text-sky-400 border border-sky-400/30'
                        : caseItem.status === 'Disposed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    {caseItem.status}
                  </span>
                </div>

                {/* Case Title & Case Number */}
                <div className="mb-3">
                  <h3
                    onClick={() => onSelectCase(caseItem)}
                    className="font-black text-base text-white hover:text-sky-400 cursor-pointer transition-colors leading-tight tracking-tight uppercase"
                  >
                    {caseItem.caseTitle}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-sky-400 font-bold tracking-wider uppercase mt-1">
                    <span>{caseItem.caseNumber}</span>
                    {caseItem.cnrNumber && (
                      <span className="text-slate-400 text-[10px] font-semibold">
                        CNR: {caseItem.cnrNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Court Name, Judge, Hall */}
                <div className="bg-[#1E293B] p-3 mb-3 border border-white/10 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-slate-200 font-bold uppercase tracking-wide">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{caseItem.courtName}</span>
                    {caseItem.courtHall && (
                      <span className="text-slate-400 font-normal">({caseItem.courtHall})</span>
                    )}
                  </div>

                  {caseItem.judgeName && (
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider pl-5">
                      BENCH: {caseItem.judgeName}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-white/10 text-[11px] uppercase font-bold tracking-wider">
                    <span className="text-slate-400">STAGE:</span>
                    <span className="text-sky-400 font-black">{caseItem.stage}</span>
                  </div>
                </div>

                {/* Client Info & Opposite Party */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-[#1E293B]/70 p-2.5 border border-white/10">
                    <span className="text-[9px] text-slate-400 font-black block uppercase tracking-widest">CLIENT ({caseItem.clientRole})</span>
                    <span className="font-bold text-white block truncate text-xs uppercase mt-0.5">{caseItem.clientName}</span>
                    {caseItem.advocateFor && (
                      <span className="text-[10px] font-bold text-sky-400 block uppercase tracking-wider mt-0.5">
                        FOR: {caseItem.advocateFor}
                      </span>
                    )}
                    {caseItem.clientPhone && (
                      <a
                        href={`tel:${caseItem.clientPhone}`}
                        className="text-[10px] font-semibold text-slate-400 hover:text-sky-300 hover:underline block tracking-wider mt-0.5"
                      >
                        {caseItem.clientPhone}
                      </a>
                    )}
                  </div>

                  <div className="bg-[#1E293B]/70 p-2.5 border border-white/10">
                    <span className="text-[9px] text-slate-400 font-black block uppercase tracking-widest">OPPOSITE PARTY / ADV</span>
                    <span className="font-bold text-slate-300 block truncate text-xs uppercase mt-0.5">{caseItem.oppositeParty}</span>
                    {caseItem.oppositeLawyer && (
                      <span className="text-[10px] font-semibold text-slate-400 block truncate uppercase mt-0.5">ADV. {caseItem.oppositeLawyer}</span>
                    )}
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => onSelectCase(caseItem)}
                    className="flex-1 py-2 px-3 bg-[#1E293B] hover:bg-slate-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>Diary & Next Date</span>
                  </button>

                  <button
                    onClick={() => onOpenAiDraft(caseItem)}
                    className="py-2 px-3.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border border-emerald-500/30"
                    title="Generate WhatsApp Client Update"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">WhatsApp Update</span>
                    <span className="sm:hidden">WA</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
