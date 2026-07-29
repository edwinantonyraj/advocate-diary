import React, { useState } from 'react';
import { Case, CaseStatus, CaseType } from '../types';
import { DueSoonBadge } from './DueSoonBadge';
import { getHearingDueStatus } from '../utils/hearingAlerts';
import { Briefcase, Calendar, MapPin, User, Search, Filter, Plus, FileText, ChevronRight, CheckCircle2, Clock, Bell, Camera } from 'lucide-react';

interface CaseListProps {
  cases: Case[];
  onSelectCase: (caseItem: Case) => void;
  onOpenAddCase: () => void;
  searchQuery: string;
}

export const CaseList: React.FC<CaseListProps> = ({
  cases,
  onSelectCase,
  onOpenAddCase,
  searchQuery,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [onlyDueSoon, setOnlyDueSoon] = useState<boolean>(false);

  const filteredCases = cases.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && c.caseType !== typeFilter) return false;
    if (onlyDueSoon && !getHearingDueStatus(c.nextHearingDate).isDueSoon) return false;

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

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner */}
      <div className="bg-[#0F172A] border border-white/10 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div>
          <h2 className="font-black text-lg text-white uppercase tracking-tight">MASTER CASES DIRECTORY</h2>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">
            TOTAL {cases.length} REGISTERED LEGAL SUITS & PETITIONS
          </p>
        </div>

        <button
          onClick={onOpenAddCase}
          className="bg-sky-400 hover:bg-sky-300 text-slate-950 font-black px-4 py-2.5 text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Case</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-[#0F172A] p-2.5 border border-white/10 text-xs">
        <button
          onClick={() => setOnlyDueSoon(!onlyDueSoon)}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-black uppercase text-[11px] tracking-wider transition-all border ${
            onlyDueSoon
              ? 'bg-amber-400 text-slate-950 border-amber-300'
              : 'bg-[#1E293B] text-slate-300 border-white/10 hover:bg-slate-700'
          }`}
        >
          <Bell className="w-3.5 h-3.5 stroke-[3]" />
          <span>Due Soon (&lt;48h)</span>
        </button>

        <div className="flex items-center gap-2 min-w-[120px] flex-1">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1E293B] border border-white/10 text-white text-xs font-semibold px-2 py-1 w-full uppercase focus:outline-none focus:border-sky-400"
          >
            <option value="ALL">All Status ({cases.length})</option>
            <option value="Pending">Pending ({cases.filter((c) => c.status === 'Pending').length})</option>
            <option value="Disposed">Disposed ({cases.filter((c) => c.status === 'Disposed').length})</option>
            <option value="Stayed">Stayed ({cases.filter((c) => c.status === 'Stayed').length})</option>
          </select>
        </div>

        <div className="flex items-center gap-2 min-w-[140px] flex-1">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Category:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#1E293B] border border-white/10 text-white text-xs font-semibold px-2 py-1 w-full uppercase focus:outline-none focus:border-sky-400"
          >
            <option value="ALL">All Types</option>
            <option value="Civil Suit">Civil Suit</option>
            <option value="Criminal Case">Criminal Case</option>
            <option value="High Court Writ">High Court Writ</option>
            <option value="Bail Application">Bail Application</option>
            <option value="Family Court / Matrimonial">Family / Matrimonial</option>
            <option value="Cheque Bounce (Sec 138)">Cheque Bounce (Sec 138)</option>
            <option value="Arbitration">Arbitration</option>
          </select>
        </div>
      </div>

      {/* Cases List */}
      {filteredCases.length === 0 ? (
        <div className="bg-[#0F172A] border border-white/10 p-8 text-center text-slate-400 uppercase font-bold text-xs tracking-wider">
          No cases found matching your search criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCase(c)}
              className="bg-[#0F172A] border border-white/10 p-4 hover:border-sky-400/50 transition-all shadow-xl cursor-pointer space-y-3 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-black text-xs text-sky-400 uppercase tracking-wider">{c.caseNumber}</span>
                    <DueSoonBadge nextHearingDate={c.nextHearingDate} />
                    <span className="text-[10px] bg-[#1E293B] text-slate-300 px-2 py-0.5 font-bold border border-white/10 uppercase tracking-wider">
                      {c.caseType}
                    </span>
                    {c.documents && c.documents.length > 0 && (
                      <span className="text-[10px] bg-sky-400/20 text-sky-300 px-2 py-0.5 font-black border border-sky-400/30 uppercase tracking-wider flex items-center gap-1">
                        <Camera className="w-3 h-3 text-sky-400" />
                        <span>{c.documents.length} {c.documents.length === 1 ? 'Doc' : 'Docs'}</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-base text-white group-hover:text-sky-400 transition-colors uppercase tracking-tight">
                    {c.caseTitle}
                  </h3>
                  <div className="text-[11px] text-slate-300 font-bold uppercase tracking-wider mt-1 flex items-center gap-2 flex-wrap">
                    <span>CLIENT ({c.clientRole}): <strong className="text-white">{c.clientName}</strong></span>
                    {c.advocateFor && (
                      <span className="bg-sky-400/20 text-sky-400 border border-sky-400/30 px-1.5 py-0.5 text-[10px] font-black">
                        FOR: {c.advocateFor}
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 tracking-widest ${
                    c.status === 'Pending'
                      ? 'bg-sky-400/10 text-sky-400 border border-sky-400/30'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold uppercase tracking-wide">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">{c.courtName}</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-300 justify-end font-bold uppercase tracking-wide">
                  <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>NEXT: <strong className="text-sky-400 font-black">{c.nextHearingDate}</strong></span>
                </div>
              </div>

              <div className="bg-[#1E293B] p-2.5 border border-white/10 flex items-center justify-between text-xs text-slate-300 uppercase font-bold tracking-wider">
                <span className="text-slate-400">STAGE: <strong className="text-white font-black">{c.stage}</strong></span>
                <span className="text-sky-400 font-black flex items-center gap-1 hover:underline">
                  <span>View Record</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
