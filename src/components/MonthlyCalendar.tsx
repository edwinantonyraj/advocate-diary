import React, { useState, useMemo } from 'react';
import { Case } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Plus,
  Filter,
  Printer,
  Scale,
  Briefcase,
  AlertCircle,
  Eye,
  Search,
  CheckCircle2,
  CalendarDays,
  ListFilter
} from 'lucide-react';

interface MonthlyCalendarProps {
  cases: Case[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSelectCase: (caseItem: Case) => void;
  onOpenAddCase: () => void;
  onSwitchToDailyView?: () => void;
  searchQuery?: string;
}

const formatDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  cases,
  selectedDate,
  onDateChange,
  onSelectCase,
  onOpenAddCase,
  onSwitchToDailyView,
  searchQuery = '',
}) => {
  const todayStr = formatDateStr(new Date());

  // Parse currently viewed month and year from selectedDate or initial state
  const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState<number>(
    isNaN(initialDate.getTime()) ? new Date().getFullYear() : initialDate.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(
    isNaN(initialDate.getTime()) ? new Date().getMonth() : initialDate.getMonth()
  ); // 0-indexed: 0 = Jan, 11 = Dec

  const [selectedCourtFilter, setSelectedCourtFilter] = useState<string>('ALL');
  const [selectedCaseTypeFilter, setSelectedCaseTypeFilter] = useState<string>('ALL');
  const [activeDayDetail, setActiveDayDetail] = useState<string>(selectedDate || todayStr);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    const today = formatDateStr(now);
    onDateChange(today);
    setActiveDayDetail(today);
  };

  // Build Month Grid Data
  const calendarGrid = useMemo(() => {
    const days: Array<{
      cellKey: string;
      dateString: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isWeekend: boolean;
    }> = [];

    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);

    const firstDayOfWeek = firstDay.getDay(); // 0 = Sun, 1 = Mon...
    const daysInMonth = lastDay.getDate();

    // Previous month padding
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevDate = new Date(viewYear, viewMonth - 1, dayNum);
      const dateString = formatDateStr(prevDate);
      days.push({
        cellKey: `prev-${dateString}-${i}`,
        dateString,
        dayNum,
        isCurrentMonth: false,
        isToday: dateString === todayStr,
        isWeekend: prevDate.getDay() === 0 || prevDate.getDay() === 6,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const currDate = new Date(viewYear, viewMonth, d);
      const dateString = formatDateStr(currDate);

      days.push({
        cellKey: `curr-${dateString}`,
        dateString,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateString === todayStr,
        isWeekend: currDate.getDay() === 0 || currDate.getDay() === 6,
      });
    }

    // Next month padding to reach full week grid (multiple of 7)
    const remainingGridCells = (7 - (days.length % 7)) % 7;
    for (let j = 1; j <= remainingGridCells; j++) {
      const nextDate = new Date(viewYear, viewMonth + 1, j);
      const dateString = formatDateStr(nextDate);
      days.push({
        cellKey: `next-${dateString}-${j}`,
        dateString,
        dayNum: j,
        isCurrentMonth: false,
        isToday: dateString === todayStr,
        isWeekend: nextDate.getDay() === 0 || nextDate.getDay() === 6,
      });
    }

    return days;
  }, [viewYear, viewMonth, todayStr]);

  // Extract available filter options across all cases
  const availableCourts = useMemo(() => {
    return Array.from(new Set(cases.map((c) => c.courtName))).filter(Boolean) as string[];
  }, [cases]);

  const availableCaseTypes = useMemo(() => {
    return Array.from(new Set(cases.map((c) => c.caseType))).filter(Boolean) as string[];
  }, [cases]);

  // Map cases by nextHearingDate for quick month lookup
  const casesByDateMap = useMemo(() => {
    const map = new Map<string, Case[]>();
    cases.forEach((c) => {
      // Filter by Search Query & Filters
      if (selectedCourtFilter !== 'ALL' && c.courtName !== selectedCourtFilter) return;
      if (selectedCaseTypeFilter !== 'ALL' && c.caseType !== selectedCaseTypeFilter) return;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNo = c.caseNumber.toLowerCase().includes(q);
        const matchTitle = c.caseTitle.toLowerCase().includes(q);
        const matchClient = c.clientName.toLowerCase().includes(q);
        const matchCourt = c.courtName.toLowerCase().includes(q);
        if (!matchNo && !matchTitle && !matchClient && !matchCourt) return;
      }

      if (c.nextHearingDate) {
        const existing = map.get(c.nextHearingDate) || [];
        map.set(c.nextHearingDate, [...existing, c]);
      }
    });
    return map;
  }, [cases, selectedCourtFilter, selectedCaseTypeFilter, searchQuery]);

  // Calculate Monthly Statistics
  const monthCasesSummary = useMemo(() => {
    let totalListed = 0;
    const courtCounts: Record<string, number> = {};

    calendarGrid.forEach((day) => {
      if (!day.isCurrentMonth) return;
      const dayCases = casesByDateMap.get(day.dateString) || [];
      totalListed += dayCases.length;

      dayCases.forEach((c) => {
        courtCounts[c.courtName] = (courtCounts[c.courtName] || 0) + 1;
      });
    });

    return { totalListed, courtCounts };
  }, [calendarGrid, casesByDateMap]);

  // Cases scheduled for the actively selected day detail
  const activeDayCases = useMemo(() => {
    return casesByDateMap.get(activeDayDetail) || [];
  }, [casesByDateMap, activeDayDetail]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthTitle = `${monthNames[viewMonth]} ${viewYear}`;

  const handleSelectDay = (dateString: string) => {
    setActiveDayDetail(dateString);
    onDateChange(dateString);
  };

  const handlePrintMonth = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Month Navigation & View Header */}
      <div className="bg-[#0F172A] border border-white/10 p-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Month Header Title & Arrows */}
          <div className="flex items-center justify-between md:justify-start gap-2">
            <div className="flex items-center gap-1.5 bg-[#1E293B] border border-white/10 p-1">
              <button
                onClick={handlePrevMonth}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-5 h-5 text-sky-400" />
              </button>

              <div className="px-3 py-1 text-center min-w-[150px]">
                <h2 className="font-black text-base sm:text-lg text-white uppercase tracking-tight">
                  {monthTitle}
                </h2>
              </div>

              <button
                onClick={handleNextMonth}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-5 h-5 text-sky-400" />
              </button>
            </div>

            <button
              onClick={handleJumpToToday}
              className="px-3 py-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1"
            >
              <CalendarDays className="w-3.5 h-3.5 stroke-[3]" />
              <span>Current Month</span>
            </button>
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center justify-between md:justify-end gap-2 flex-wrap">
            <div className="bg-[#1E293B] border border-white/10 px-3 py-1.5 flex items-center gap-2">
              <Scale className="w-4 h-4 text-sky-400" />
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-black block">Month Total</span>
                <span className="font-black text-xs text-white uppercase">
                  {monthCasesSummary.totalListed} Cases Posted
                </span>
              </div>
            </div>

            {onSwitchToDailyView && (
              <button
                onClick={onSwitchToDailyView}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs uppercase tracking-wider border border-white/10 flex items-center gap-1.5"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>Daily Cause Board</span>
              </button>
            )}

            <button
              onClick={handlePrintMonth}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10"
              title="Print Monthly Schedule"
            >
              <Printer className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-black uppercase text-[10px] tracking-wider">
            <ListFilter className="w-3.5 h-3.5 text-sky-400" />
            <span>Filter Month:</span>
          </div>

          <select
            value={selectedCourtFilter}
            onChange={(e) => setSelectedCourtFilter(e.target.value)}
            className="bg-[#1E293B] border border-white/10 text-sky-400 font-bold uppercase text-xs p-1.5 focus:outline-none focus:border-sky-400"
          >
            <option value="ALL">All Courts ({cases.length})</option>
            {availableCourts.map((court) => (
              <option key={court} value={court}>
                {court}
              </option>
            ))}
          </select>

          <select
            value={selectedCaseTypeFilter}
            onChange={(e) => setSelectedCaseTypeFilter(e.target.value)}
            className="bg-[#1E293B] border border-white/10 text-slate-300 font-bold uppercase text-xs p-1.5 focus:outline-none focus:border-sky-400"
          >
            <option value="ALL">All Case Types</option>
            {availableCaseTypes.map((ct) => (
              <option key={ct} value={ct}>
                {ct}
              </option>
            ))}
          </select>

          {(selectedCourtFilter !== 'ALL' || selectedCaseTypeFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCourtFilter('ALL');
                setSelectedCaseTypeFilter('ALL');
              }}
              className="text-[10px] font-black text-amber-400 hover:underline uppercase tracking-wider ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Grid & Side Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* MONTHLY CALENDAR GRID (7 Columns) */}
        <div className="lg:col-span-8 bg-[#0F172A] border border-white/10 p-2 sm:p-3 shadow-xl">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((dayName, idx) => (
              <div
                key={dayName}
                className={`py-1.5 font-black text-[10px] sm:text-xs uppercase tracking-wider ${
                  idx === 0 || idx === 6 ? 'text-amber-400/80 bg-slate-900/40' : 'text-slate-400'
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Days Grid Cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarGrid.map((day) => {
              const dayCases = casesByDateMap.get(day.dateString) || [];
              const isSelected = activeDayDetail === day.dateString;
              const hasCases = dayCases.length > 0;

              return (
                <div
                  key={day.cellKey}
                  onClick={() => handleSelectDay(day.dateString)}
                  className={`min-h-[75px] sm:min-h-[90px] p-1 sm:p-1.5 border transition-all cursor-pointer flex flex-col justify-between relative group ${
                    isSelected
                      ? 'bg-sky-400/10 border-sky-400 shadow-lg shadow-sky-400/10 z-10'
                      : day.isToday
                      ? 'bg-amber-400/10 border-amber-400/60'
                      : day.isCurrentMonth
                      ? 'bg-[#1E293B]/70 hover:bg-[#1E293B] border-white/10'
                      : 'bg-slate-950/60 border-white/5 opacity-40 hover:opacity-70'
                  }`}
                >
                  {/* Day Header Row */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black px-1.5 py-0.2 ${
                        day.isToday
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : isSelected
                          ? 'bg-sky-400 text-slate-950'
                          : day.isCurrentMonth
                          ? 'text-white'
                          : 'text-slate-500'
                      }`}
                    >
                      {day.dayNum}
                    </span>

                    {hasCases && (
                      <span className="bg-sky-400 text-slate-950 text-[9px] font-black px-1 py-0.2 uppercase tracking-tighter">
                        {dayCases.length} {dayCases.length === 1 ? 'Case' : 'Cases'}
                      </span>
                    )}
                  </div>

                  {/* Preview Case Chips inside Cell */}
                  <div className="space-y-1 my-1 overflow-hidden max-h-[50px]">
                    {dayCases.slice(0, 2).map((c) => (
                      <div
                        key={c.id}
                        className="text-[9px] font-bold px-1 py-0.5 bg-slate-900 border border-white/10 text-sky-300 truncate uppercase tracking-tight flex items-center gap-1"
                        title={`${c.caseNumber} - ${c.courtName}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                        <span className="truncate">{c.caseNumber}</span>
                      </div>
                    ))}

                    {dayCases.length > 2 && (
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block text-center">
                        +{dayCases.length - 2} More
                      </span>
                    )}
                  </div>

                  {/* Bottom selection indicator */}
                  {isSelected && (
                    <div className="h-0.5 bg-sky-400 w-full mt-auto" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SELECTED DAY CAUSE LIST PANEL (Right Side / Collapsible) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-[#0F172A] border border-white/10 p-4 shadow-xl space-y-3">
            {/* Header of Selected Day Panel */}
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-sky-400 font-black uppercase tracking-widest block">
                  Date Cause List
                </span>
                <h3 className="font-black text-sm sm:text-base text-white uppercase tracking-tight">
                  {new Date(activeDayDetail + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h3>
              </div>

              <span className="bg-sky-400 text-slate-950 font-black text-xs px-2.5 py-1 uppercase tracking-wider">
                {activeDayCases.length} Listed
              </span>
            </div>

            {/* List of cases for active day */}
            {activeDayCases.length === 0 ? (
              <div className="bg-[#1E293B] border border-dashed border-white/10 p-6 text-center space-y-2">
                <CalendarIcon className="w-8 h-8 text-slate-500 mx-auto" />
                <h4 className="font-black text-slate-300 text-xs uppercase tracking-wider">
                  No Cases Scheduled
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  There are no hearing dates posted on this day.
                </p>
                <button
                  onClick={onOpenAddCase}
                  className="mt-2 px-3 py-1.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs uppercase tracking-wider inline-flex items-center gap-1 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Schedule Case</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {activeDayCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectCase(c)}
                    className="bg-[#1E293B] border border-white/10 hover:border-sky-400 p-3 space-y-2 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="bg-sky-400/20 text-sky-300 border border-sky-400/30 text-[9px] font-black px-1.5 py-0.2 uppercase">
                        Item #{c.itemNumber || '—'}
                      </span>
                      <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider">
                        {c.caseType}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-xs text-white group-hover:text-sky-400 transition-colors uppercase tracking-tight">
                        {c.caseNumber}
                      </h4>
                      <p className="text-[11px] text-slate-300 font-bold uppercase truncate mt-0.5">
                        {c.caseTitle}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                      <span className="truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                        <span className="truncate">{c.courtName}</span>
                      </span>
                      <span className="text-sky-400 font-black flex items-center gap-1 shrink-0">
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Month Court Summary breakdown card */}
          {Object.keys(monthCasesSummary.courtCounts).length > 0 && (
            <div className="bg-[#0F172A] border border-white/10 p-4 shadow-xl space-y-2">
              <h4 className="font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2">
                <Scale className="w-4 h-4 text-sky-400" />
                <span>Court Distribution ({monthTitle})</span>
              </h4>

              <div className="space-y-1.5 pt-1">
                {Object.entries(monthCasesSummary.courtCounts).map(([court, count]) => (
                  <div key={court} className="flex items-center justify-between text-xs uppercase font-bold">
                    <span className="text-slate-300 truncate max-w-[200px]">{court}</span>
                    <span className="bg-[#1E293B] text-sky-400 border border-white/10 px-2 py-0.5 font-black text-[10px]">
                      {count} {count === 1 ? 'Hearing' : 'Hearings'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
