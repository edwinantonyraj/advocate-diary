import React, { useState } from 'react';
import { Case, HearingNote, CaseStatus, CaseDocument } from '../types';
import { DueSoonBadge } from './DueSoonBadge';
import { DocumentScannerModal } from './DocumentScannerModal';
import { 
  X, Calendar, Clock, MapPin, User, FileText, Plus, Send, CheckCircle2, 
  DollarSign, Edit3, Trash2, ArrowRight, Bot, Sparkles, Archive, RotateCcw, 
  Search, ArrowUpDown, Copy, Check, ShieldAlert, Award, Camera, Download, Eye, Printer
} from 'lucide-react';

interface CaseDetailsModalProps {
  caseItem: Case | null;
  onClose: () => void;
  onSaveCase: (updatedCase: Case) => void;
  onDeleteCase: (caseId: string) => void;
  onOpenAiDraft: (caseItem: Case) => void;
}

export const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({
  caseItem,
  onClose,
  onSaveCase,
  onDeleteCase,
  onOpenAiDraft,
}) => {
  if (!caseItem) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'add-hearing' | 'documents'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [copiedHistory, setCopiedHistory] = useState(false);

  // Document Scanner & Lightbox state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<CaseDocument | null>(null);

  // Edit form state
  const [formData, setFormData] = useState<Case>({ ...caseItem });

  // Update Proceeding vs Close Case state
  const [proceedingMode, setProceedingMode] = useState<'update' | 'close'>('update');
  const [disposalOutcome, setDisposalOutcome] = useState<string>('Allowed');
  const [disposalRemarks, setDisposalRemarks] = useState<string>('');

  // History search and sort
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historySort, setHistorySort] = useState<'newest' | 'oldest'>('newest');

  // Document filter search
  const [docSearch, setDocSearch] = useState<string>('');

  // Handle Save Document from Scanner
  const handleSaveDocument = (newDoc: CaseDocument) => {
    const currentDocs = caseItem.documents || [];
    const updatedCase: Case = {
      ...caseItem,
      documents: [newDoc, ...currentDocs],
      updatedAt: new Date().toISOString(),
    };
    onSaveCase(updatedCase);
    setActiveTab('documents');
  };

  // Handle Delete Document
  const handleDeleteDocument = (docId: string) => {
    if (!window.confirm('Are you sure you want to delete this scanned document?')) return;
    const currentDocs = caseItem.documents || [];
    const updatedCase: Case = {
      ...caseItem,
      documents: currentDocs.filter((d) => d.id !== docId),
      updatedAt: new Date().toISOString(),
    };
    onSaveCase(updatedCase);
    if (previewDocument?.id === docId) {
      setPreviewDocument(null);
    }
  };

  // Handle Print / Download Document
  const handleDownloadDocument = (doc: CaseDocument) => {
    const link = document.createElement('a');
    link.href = doc.dataUrl;
    link.download = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintDocument = (doc: CaseDocument) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${doc.title} - ${caseItem.caseNumber}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: sans-serif; text-align: center; background: #fff; }
            h2 { margin-bottom: 5px; text-transform: uppercase; }
            p { margin-top: 0; color: #555; font-size: 12px; text-transform: uppercase; }
            img { max-width: 100%; height: auto; border: 1px solid #ccc; margin-top: 15px; }
          </style>
        </head>
        <body>
          <h2>${doc.title}</h2>
          <p>Case: ${caseItem.caseNumber} - ${caseItem.caseTitle} | Category: ${doc.category}</p>
          <img src="${doc.dataUrl}" onload="window.print();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // New hearing note state
  const [newHearing, setNewHearing] = useState({
    date: new Date().toISOString().split('T')[0],
    stage: caseItem.stage || '',
    orderSummary: '',
    nextDate: caseItem.nextHearingDate && caseItem.nextHearingDate !== 'Disposed' ? caseItem.nextHearingDate : '',
    judge: caseItem.judgeName || '',
    costImposed: 0,
    actionItems: '',
  });

  const handleAddHearing = (e: React.FormEvent) => {
    e.preventDefault();

    if (proceedingMode === 'close') {
      // Close / Dispose Case
      const finalStage = `Disposed (${disposalOutcome})`;
      const finalSummary = `FINAL JUDGMENT / ORDER: Case disposed as [${disposalOutcome}]. ${disposalRemarks || 'Final order delivered by court.'}`;

      const hearingNote: HearingNote = {
        id: `h-${Date.now()}`,
        caseId: caseItem.id,
        date: newHearing.date || new Date().toISOString().split('T')[0],
        courtName: caseItem.courtName,
        judge: newHearing.judge || caseItem.judgeName,
        stage: finalStage,
        orderSummary: finalSummary,
        nextDate: 'Disposed',
        costImposed: Number(newHearing.costImposed) || 0,
        actionItems: newHearing.actionItems ? newHearing.actionItems.split(',').map((s) => s.trim()) : [],
        createdAt: new Date().toISOString(),
      };

      const updatedCase: Case = {
        ...caseItem,
        status: 'Disposed',
        stage: finalStage,
        previousHearingDate: newHearing.date,
        nextHearingDate: 'Disposed',
        hearingHistory: [hearingNote, ...caseItem.hearingHistory],
        updatedAt: new Date().toISOString(),
      };

      onSaveCase(updatedCase);
      setActiveTab('history');
      return;
    }

    // Regular Hearing Update / Adjournment
    if (!newHearing.stage.trim()) return;

    const hearingNote: HearingNote = {
      id: `h-${Date.now()}`,
      caseId: caseItem.id,
      date: newHearing.date || new Date().toISOString().split('T')[0],
      courtName: caseItem.courtName,
      judge: newHearing.judge || caseItem.judgeName,
      stage: newHearing.stage,
      orderSummary: newHearing.orderSummary || 'Proceeding recorded.',
      nextDate: newHearing.nextDate || 'Adjourned',
      costImposed: Number(newHearing.costImposed) || 0,
      actionItems: newHearing.actionItems ? newHearing.actionItems.split(',').map((s) => s.trim()) : [],
      createdAt: new Date().toISOString(),
    };

    const updatedCase: Case = {
      ...caseItem,
      status: caseItem.status === 'Disposed' ? 'Pending' : caseItem.status,
      previousHearingDate: newHearing.date,
      nextHearingDate: newHearing.nextDate || caseItem.nextHearingDate,
      stage: newHearing.stage,
      hearingHistory: [hearingNote, ...caseItem.hearingHistory],
      updatedAt: new Date().toISOString(),
    };

    onSaveCase(updatedCase);
    setActiveTab('history');
  };

  const handleReopenCase = () => {
    const nextDate = prompt('Enter next hearing date for reopened case (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!nextDate) return;

    const reopenedNote: HearingNote = {
      id: `h-${Date.now()}`,
      caseId: caseItem.id,
      date: new Date().toISOString().split('T')[0],
      courtName: caseItem.courtName,
      stage: 'Restored / Reopened',
      orderSummary: 'Case re-opened and restored to pending cause list.',
      nextDate: nextDate,
      createdAt: new Date().toISOString(),
    };

    const updatedCase: Case = {
      ...caseItem,
      status: 'Pending',
      stage: 'Restored / Pending',
      nextHearingDate: nextDate,
      hearingHistory: [reopenedNote, ...caseItem.hearingHistory],
      updatedAt: new Date().toISOString(),
    };

    onSaveCase(updatedCase);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCase(formData);
    setIsEditing(false);
  };

  // Filter & sort history
  const sortedHistory = [...caseItem.hearingHistory].sort((a, b) => {
    if (historySort === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const filteredHistory = sortedHistory.filter((h) => {
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return (
      h.date.toLowerCase().includes(q) ||
      h.stage.toLowerCase().includes(q) ||
      h.orderSummary.toLowerCase().includes(q) ||
      (h.judge || '').toLowerCase().includes(q)
    );
  });

  const handleCopyHistory = () => {
    const text = [
      `=== JUDICIAL HEARING HISTORY BRIEF ===`,
      `Case No: ${caseItem.caseNumber}`,
      `Title: ${caseItem.caseTitle}`,
      `Court: ${caseItem.courtName} ${caseItem.courtHall ? `(${caseItem.courtHall})` : ''}`,
      `Client: ${caseItem.clientName} (${caseItem.clientRole})`,
      `Status: ${caseItem.status} | Current Stage: ${caseItem.stage}`,
      `Total Hearings Recorded: ${caseItem.hearingHistory.length}`,
      `--------------------------------------`,
      ...caseItem.hearingHistory.map((h, i) => 
        `[${i + 1}] Date: ${h.date}\n    Stage: ${h.stage}\n    Proceeding Order: ${h.orderSummary}\n    Next Date: ${h.nextDate || 'N/A'}`
      ),
      `--------------------------------------`,
      `Exported from Advocate Diary - ${new Date().toLocaleDateString()}`
    ].join('\n\n');

    navigator.clipboard.writeText(text);
    setCopiedHistory(true);
    setTimeout(() => setCopiedHistory(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0F172A] border border-white/10 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-white">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-start justify-between gap-3 bg-[#1E293B]">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="bg-sky-400 text-slate-950 font-black text-xs px-2.5 py-0.5 uppercase tracking-wider">
                {caseItem.caseNumber}
              </span>
              {caseItem.status !== 'Disposed' && <DueSoonBadge nextHearingDate={caseItem.nextHearingDate} size="sm" />}
              <span className="bg-[#0F172A] text-slate-300 text-xs px-2 py-0.5 font-bold uppercase tracking-wider border border-white/10">
                {caseItem.caseType}
              </span>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 tracking-wider border ${
                  caseItem.status === 'Disposed'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : caseItem.status === 'Stayed'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                }`}
              >
                {caseItem.status}
              </span>
            </div>
            <h2 className="font-black text-base text-white uppercase tracking-tight">{caseItem.caseTitle}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 pt-2 border-b border-white/10 bg-[#0F172A] text-xs flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-3 font-black uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Case Details
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-3 font-black uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Full History ({caseItem.hearingHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-2 px-3 font-black uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Documents ({(caseItem.documents || []).length})</span>
          </button>
          <button
            onClick={() => {
              setProceedingMode('update');
              setActiveTab('add-hearing');
            }}
            className={`py-2 px-3 font-black uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1 ${
              activeTab === 'add-hearing'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-sky-400 hover:text-sky-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Update / Close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs uppercase font-bold tracking-wider">
          {activeTab === 'overview' && (
            <>
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">Case Number</label>
                      <input
                        type="text"
                        value={formData.caseNumber}
                        onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                        className="w-full bg-[#1E293B] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">CNR Number</label>
                      <input
                        type="text"
                        value={formData.cnrNumber || ''}
                        onChange={(e) => setFormData({ ...formData, cnrNumber: e.target.value })}
                        className="w-full bg-[#1E293B] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">Case Title</label>
                    <input
                      type="text"
                      value={formData.caseTitle}
                      onChange={(e) => setFormData({ ...formData, caseTitle: e.target.value })}
                      className="w-full bg-[#1E293B] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">Court Name</label>
                      <input
                        type="text"
                        value={formData.courtName}
                        onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                        className="w-full bg-[#1E293B] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">Court Hall / Room</label>
                      <input
                        type="text"
                        value={formData.courtHall || ''}
                        onChange={(e) => setFormData({ ...formData, courtHall: e.target.value })}
                        className="w-full bg-[#1E293B] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">Case Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as CaseStatus })}
                        className="w-full bg-[#1E293B] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Disposed">Disposed / Closed</option>
                        <option value="Stayed">Stayed</option>
                        <option value="Reserved for Order">Reserved for Order</option>
                        <option value="Transferred">Transferred</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">Next Hearing Date</label>
                      <input
                        type="text"
                        value={formData.nextHearingDate}
                        onChange={(e) => setFormData({ ...formData, nextHearingDate: e.target.value })}
                        className="w-full bg-[#1E293B] border border-white/10 p-2 text-sky-400 font-bold focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">Stage</label>
                      <input
                        type="text"
                        value={formData.stage}
                        onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                        className="w-full bg-[#1E293B] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">Client Role</label>
                      <select
                        value={formData.clientRole}
                        onChange={(e) => setFormData({ ...formData, clientRole: e.target.value as any })}
                        className="w-full bg-[#1E293B] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
                      >
                        <option value="Petitioner/Plaintiff">Petitioner / Plaintiff</option>
                        <option value="Respondent/Defendant">Respondent / Defendant</option>
                        <option value="Opposite Party">Opposite Party</option>
                        <option value="Third Party">Third Party / Intervenor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">Client Name</label>
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="w-full bg-[#1E293B] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">Client Phone</label>
                      <input
                        type="text"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        className="w-full bg-[#1E293B] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  {/* Advocate For Edit Field */}
                  <div className="bg-[#1E293B] p-2.5 border border-white/10 space-y-1.5">
                    <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                      Advocate For (Specific Party / OP / Petitioner No.)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. OP 1, OP 2, OP 1 to 10, Petitioner 1, Petitioner 1 & 2..."
                      value={formData.advocateFor || ''}
                      onChange={(e) => setFormData({ ...formData, advocateFor: e.target.value })}
                      className="w-full bg-[#0F172A] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-sky-400 text-xs"
                    />
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mr-1">Quick Presets:</span>
                      {['OP 1', 'OP 2', 'OP 1 to 5', 'OP 1 to 10', 'Petitioner 1', 'Petitioner 1 & 2', 'Respondent 1', 'Respondent 1 & 2', 'Accused 1 to 3'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setFormData({ ...formData, advocateFor: preset })}
                          className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border transition-all ${
                            formData.advocateFor === preset
                              ? 'bg-sky-400 text-slate-950 border-sky-400 font-black'
                              : 'bg-[#0F172A] text-slate-300 border-white/10 hover:border-sky-400/50'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                      {formData.advocateFor && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, advocateFor: '' })}
                          className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30 transition-all ml-auto"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 bg-[#1E293B] hover:bg-slate-700 text-slate-300 font-black uppercase text-xs tracking-wider border border-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black uppercase text-xs tracking-wider shadow-md transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Status & Key Dates Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#1E293B] p-3 border border-white/10">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Next Hearing Date</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-black text-sky-400 text-sm tracking-wider">{caseItem.nextHearingDate}</span>
                        {caseItem.status !== 'Disposed' && <DueSoonBadge nextHearingDate={caseItem.nextHearingDate} size="sm" />}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Current Stage & Status</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-bold text-white text-xs uppercase tracking-wider">{caseItem.stage}</span>
                      </div>
                    </div>
                  </div>

                  {/* Disposed Case Banner or Close Action Bar */}
                  {caseItem.status === 'Disposed' ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-black text-emerald-400 text-xs uppercase tracking-wider block">CASE IS DISPOSED / CLOSED</span>
                          <span className="text-[10px] text-slate-300 font-bold uppercase">Final Outcome: {caseItem.stage}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleReopenCase}
                        className="px-3 py-1.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Re-open Case</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-rose-500/10 border border-rose-500/30 p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Archive className="w-4 h-4 text-rose-400 shrink-0" />
                        <div>
                          <span className="font-black text-white text-xs uppercase tracking-wider block">Ready to Close this Case?</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Mark as Disposed after final judgment or order</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setProceedingMode('close');
                          setActiveTab('add-hearing');
                        }}
                        className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-black text-[10px] uppercase tracking-wider border border-rose-400 flex items-center gap-1 shadow-md"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Close Case Now</span>
                      </button>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2 bg-[#1E293B] p-3 border border-white/10">
                      <h4 className="font-black text-sky-400 text-xs border-b border-white/10 pb-1 uppercase tracking-wider">Court & Judge</h4>
                      <p><strong className="text-slate-400 uppercase">Court:</strong> {caseItem.courtName}</p>
                      <p><strong className="text-slate-400 uppercase">Hall:</strong> {caseItem.courtHall || 'N/A'}</p>
                      <p><strong className="text-slate-400 uppercase">Judge:</strong> {caseItem.judgeName || 'N/A'}</p>
                      <p><strong className="text-slate-400 uppercase">Item No:</strong> {caseItem.itemNumber || 'N/A'}</p>
                    </div>

                    <div className="space-y-2 bg-[#1E293B] p-3 border border-white/10">
                      <h4 className="font-black text-sky-400 text-xs border-b border-white/10 pb-1 uppercase tracking-wider">Parties & Advocates</h4>
                      <p><strong className="text-slate-400 uppercase">Client ({caseItem.clientRole}):</strong> {caseItem.clientName}</p>
                      {caseItem.advocateFor && (
                        <p><strong className="text-slate-400 uppercase">Advocate For:</strong> <span className="text-sky-400 font-bold">{caseItem.advocateFor}</span></p>
                      )}
                      <p><strong className="text-slate-400 uppercase">Phone:</strong> {caseItem.clientPhone}</p>
                      <p><strong className="text-slate-400 uppercase">Opposite Party:</strong> {caseItem.oppositeParty}</p>
                      <p><strong className="text-slate-400 uppercase">Opposite Lawyer:</strong> {caseItem.oppositeLawyer || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Fee Summary */}
                  <div className="bg-[#1E293B] p-3 border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Fee Ledger</span>
                      <span className="text-white font-bold text-xs uppercase tracking-wider">
                        Agreed: ₹{caseItem.totalFee.toLocaleString()} | Paid: ₹{caseItem.paidFee.toLocaleString()}
                      </span>
                    </div>
                    <span className="font-black text-sky-400 text-sm tracking-wider">
                      Balance: ₹{(caseItem.totalFee - caseItem.paidFee).toLocaleString()}
                    </span>
                  </div>

                  {caseItem.notes && (
                    <div className="bg-[#1E293B] p-3 border border-white/10">
                      <span className="text-sky-400 text-[10px] uppercase font-black tracking-widest block mb-1">Advocate Notes</span>
                      <p className="text-slate-200 font-semibold uppercase tracking-wider whitespace-pre-wrap">{caseItem.notes}</p>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 flex-wrap">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 bg-[#1E293B] hover:bg-slate-700 text-slate-200 font-black uppercase text-xs tracking-wider border border-white/10 flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Edit Details</span>
                    </button>

                    <button
                      onClick={() => setIsScannerOpen(true)}
                      className="px-3 py-1.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black uppercase text-xs tracking-wider flex items-center gap-1 shadow-md transition-all"
                    >
                      <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Scan Document</span>
                    </button>

                    <button
                      onClick={() => onOpenAiDraft(caseItem)}
                      className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-black uppercase text-xs tracking-wider flex items-center gap-1 border border-emerald-500/30"
                    >
                      <Send className="w-3.5 h-3.5 stroke-[2.5] text-emerald-400" />
                      <span>AI WhatsApp</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this case?')) {
                          onDeleteCase(caseItem.id);
                          onClose();
                        }
                      }}
                      className="p-1.5 text-red-400 hover:bg-red-500/10"
                      title="Delete Case"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {/* History Summary Header */}
              <div className="bg-[#1E293B] p-3 border border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-black text-white text-xs uppercase tracking-wider flex items-center gap-2">
                    Complete Hearing Log
                    <span className="bg-sky-400 text-slate-950 px-1.5 py-0.2 text-[10px]">
                      {caseItem.hearingHistory.length} Sessions
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">
                    Chronological case proceedings & order summary
                  </p>
                </div>

                <button
                  onClick={handleCopyHistory}
                  className="px-2.5 py-1.5 bg-sky-400/20 hover:bg-sky-400/30 text-sky-300 border border-sky-400/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                >
                  {copiedHistory ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-400" />}
                  <span>{copiedHistory ? 'Copied Brief!' : 'Copy History Brief'}</span>
                </button>
              </div>

              {/* History Controls (Search & Sort) */}
              <div className="flex items-center gap-2 bg-[#0F172A] p-2 border border-white/10 text-xs">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search history by date, stage, order..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full bg-[#1E293B] border border-white/10 pl-8 pr-2 py-1.5 text-white text-xs font-semibold uppercase focus:outline-none focus:border-sky-400"
                  />
                </div>

                <button
                  onClick={() => setHistorySort(historySort === 'newest' ? 'oldest' : 'newest')}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-[#1E293B] border border-white/10 text-slate-300 font-black text-[10px] uppercase tracking-wider hover:bg-slate-700"
                >
                  <ArrowUpDown className="w-3 h-3 text-sky-400" />
                  <span>{historySort === 'newest' ? 'Newest First' : 'Oldest First'}</span>
                </button>
              </div>

              {/* History Timeline */}
              {filteredHistory.length === 0 ? (
                <p className="text-center text-slate-500 py-6 uppercase font-bold tracking-wider">
                  {historySearch ? 'No hearing logs match search query.' : 'No previous hearing logs recorded yet.'}
                </p>
              ) : (
                <div className="relative border-l-2 border-sky-400/30 ml-3 pl-4 space-y-4 pt-1">
                  {filteredHistory.map((hNote, index) => {
                    const isDisposal = hNote.stage.toLowerCase().includes('disposed') || hNote.orderSummary.toLowerCase().includes('final judgment');
                    
                    return (
                      <div key={hNote.id} className="relative group">
                        {/* Timeline Circle Bullet */}
                        <span className={`absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
                          isDisposal
                            ? 'bg-emerald-400 border-white shadow-lg shadow-emerald-400/50'
                            : 'bg-sky-400 border-slate-900'
                        }`} />

                        <div className={`p-3 border space-y-2 transition-all ${
                          isDisposal
                            ? 'bg-emerald-950/30 border-emerald-500/40'
                            : 'bg-[#1E293B] border-white/10 hover:border-sky-400/40'
                        }`}>
                          <div className="flex items-center justify-between text-xs border-b border-white/10 pb-1.5 flex-wrap gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sky-400 text-sm tracking-wider">{hNote.date}</span>
                              {hNote.judge && (
                                <span className="text-[10px] text-slate-400 font-bold uppercase">
                                  BENCH: {hNote.judge}
                                </span>
                              )}
                            </div>

                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                              isDisposal
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-sky-400/20 text-sky-300 border-sky-400/30'
                            }`}>
                              STAGE: {hNote.stage}
                            </span>
                          </div>

                          <p className="text-slate-200 text-xs font-semibold uppercase tracking-wider whitespace-pre-wrap leading-relaxed">
                            {hNote.orderSummary}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10 text-[11px]">
                            {hNote.nextDate && (
                              <div className="text-slate-400 flex items-center gap-1 font-bold uppercase tracking-wider">
                                <ArrowRight className="w-3 h-3 text-sky-400 stroke-[3]" />
                                <span>Adjourned To: <strong className={hNote.nextDate === 'Disposed' ? 'text-emerald-400 font-black' : 'text-white font-black'}>{hNote.nextDate}</strong></span>
                              </div>
                            )}

                            {hNote.costImposed ? (
                              <span className="text-amber-400 font-black text-[10px] uppercase tracking-wider">
                                Cost/Fine: ₹{hNote.costImposed}
                              </span>
                            ) : null}
                          </div>

                          {hNote.actionItems && hNote.actionItems.length > 0 && (
                            <div className="pt-1.5 border-t border-white/10 text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                              <span className="font-black text-sky-400 block mb-1">Action Items Required:</span>
                              <ul className="list-disc list-inside space-y-0.5 text-slate-200 font-semibold">
                                {hNote.actionItems.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'add-hearing' && (
            <div className="space-y-4">
              {/* Mode Switcher: Update Hearing vs Close Case */}
              <div className="grid grid-cols-2 gap-2 bg-[#1E293B] p-1.5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setProceedingMode('update')}
                  className={`py-2 px-3 text-xs font-black uppercase tracking-wider transition-all border ${
                    proceedingMode === 'update'
                      ? 'bg-sky-400 text-slate-950 border-sky-400'
                      : 'bg-[#0F172A] text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  1. Update Hearing & Adjourn
                </button>
                <button
                  type="button"
                  onClick={() => setProceedingMode('close')}
                  className={`py-2 px-3 text-xs font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 ${
                    proceedingMode === 'close'
                      ? 'bg-rose-500 text-white border-rose-400'
                      : 'bg-[#0F172A] text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5 stroke-[3]" />
                  <span>2. Close & Dispose Case</span>
                </button>
              </div>

              {proceedingMode === 'update' ? (
                <form onSubmit={handleAddHearing} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">Hearing Date</label>
                      <input
                        type="date"
                        value={newHearing.date}
                        onChange={(e) => setNewHearing({ ...newHearing, date: e.target.value })}
                        className="w-full bg-[#1E293B] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sky-400 mb-1 font-black text-[10px] tracking-wider uppercase">Next Hearing Date (Adjourned To)</label>
                      <input
                        type="date"
                        value={newHearing.nextDate}
                        onChange={(e) => setNewHearing({ ...newHearing, nextDate: e.target.value })}
                        className="w-full bg-[#1E293B] border border-sky-400/50 p-2 text-sky-400 font-black focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">New Stage of Case</label>
                    <input
                      type="text"
                      value={newHearing.stage}
                      onChange={(e) => setNewHearing({ ...newHearing, stage: e.target.value })}
                      placeholder="E.G. EVIDENCE / ARGUMENTS / REPLY"
                      className="w-full bg-[#1E293B] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">Court Proceeding / Order Summary</label>
                    <textarea
                      rows={3}
                      value={newHearing.orderSummary}
                      onChange={(e) => setNewHearing({ ...newHearing, orderSummary: e.target.value })}
                      placeholder="RECORD WHAT TRANSPIRED IN COURT TODAY..."
                      className="w-full bg-[#1E293B] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">Action Items (comma separated)</label>
                    <input
                      type="text"
                      value={newHearing.actionItems}
                      onChange={(e) => setNewHearing({ ...newHearing, actionItems: e.target.value })}
                      placeholder="E.G., FILE REPLICATION, DEPOSIT COURT FEE ₹500"
                      className="w-full bg-[#1E293B] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black uppercase text-xs tracking-wider shadow-md transition-all"
                    >
                      Save Hearing Log & Update Next Date
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAddHearing} className="space-y-3 bg-[#1E293B] p-4 border border-rose-500/30">
                  <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase border-b border-rose-500/20 pb-2">
                    <Archive className="w-4 h-4" />
                    <span>RECORD FINAL DISPOSAL / CASE CLOSURE</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">Disposal Date</label>
                      <input
                        type="date"
                        value={newHearing.date}
                        onChange={(e) => setNewHearing({ ...newHearing, date: e.target.value })}
                        className="w-full bg-[#0F172A] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-rose-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-rose-300 mb-1 font-bold text-[10px] tracking-wider uppercase">Disposal Outcome</label>
                      <select
                        value={disposalOutcome}
                        onChange={(e) => setDisposalOutcome(e.target.value)}
                        className="w-full bg-[#0F172A] border border-rose-400/50 p-2 text-rose-300 font-bold uppercase focus:outline-none focus:border-rose-400"
                      >
                        <option value="Allowed">Allowed / Decreed in favour</option>
                        <option value="Dismissed">Dismissed / Rejected</option>
                        <option value="Settled in Lok Adalat">Settled in Lok Adalat / Compromised</option>
                        <option value="Quashed/Withdrawn">Quashed / Withdrawn</option>
                        <option value="Transferred">Transferred to another Bench</option>
                        <option value="Other Final Order">Other Final Order</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">Final Judgment / Order Details</label>
                    <textarea
                      rows={4}
                      value={disposalRemarks}
                      onChange={(e) => setDisposalRemarks(e.target.value)}
                      placeholder="ENTER FINAL JUDGMENT SUMMARY, DECREE DETAILS, OR DISPOSAL REMARKS..."
                      className="w-full bg-[#0F172A] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-rose-400"
                      required
                    />
                  </div>

                  <div className="pt-2 border-t border-rose-500/20">
                    <button
                      type="submit"
                      className="w-full py-3 bg-rose-500 hover:bg-rose-400 text-white font-black uppercase text-xs tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                      <span>CONFIRM & DISPOSE CASE PERMANENTLY</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              {/* Header Bar */}
              <div className="bg-[#1E293B] p-3 border border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-black text-white text-xs uppercase tracking-wider flex items-center gap-2">
                    Scanned Case Records
                    <span className="bg-sky-400 text-slate-950 px-1.5 py-0.2 text-[10px]">
                      {(caseItem.documents || []).length} Attached
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">
                    Physical court orders, petitions, vakalatnamas & evidence
                  </p>
                </div>

                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="px-3 py-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Camera className="w-4 h-4 stroke-[2.5]" />
                  <span>Scan New Document</span>
                </button>
              </div>

              {/* Search Bar */}
              {(caseItem.documents || []).length > 0 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search documents by title or category..."
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    className="w-full bg-[#1E293B] border border-white/10 pl-8 pr-2 py-1.5 text-white text-xs font-semibold uppercase focus:outline-none focus:border-sky-400"
                  />
                </div>
              )}

              {/* Documents Grid */}
              {!(caseItem.documents) || caseItem.documents.length === 0 ? (
                <div className="bg-[#1E293B] border border-dashed border-white/20 p-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-sky-400/10 text-sky-400 rounded-full flex items-center justify-center mx-auto border border-sky-400/20">
                    <Camera className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-xs uppercase tracking-wider">No Scanned Documents Attached</h4>
                    <p className="text-[11px] text-slate-400 font-bold uppercase mt-1 max-w-sm mx-auto">
                      Use your phone or desktop camera to scan court orders, petitions, and evidence directly into this case file.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="px-4 py-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md"
                  >
                    <Camera className="w-4 h-4 stroke-[2.5]" />
                    <span>Open Camera Scanner Now</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(caseItem.documents || [])
                    .filter((doc) => {
                      if (!docSearch.trim()) return true;
                      const q = docSearch.toLowerCase();
                      return doc.title.toLowerCase().includes(q) || doc.category.toLowerCase().includes(q);
                    })
                    .map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-[#1E293B] border border-white/10 hover:border-sky-400/40 p-3 space-y-2 flex flex-col justify-between group transition-all"
                      >
                        <div>
                          {/* Image Thumbnail */}
                          <div
                            onClick={() => setPreviewDocument(doc)}
                            className="relative bg-slate-950 border border-white/10 h-36 overflow-hidden cursor-pointer flex items-center justify-center group-hover:border-sky-400/50 transition-colors"
                          >
                            <img
                              src={doc.dataUrl}
                              alt={doc.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <span className="p-2 bg-sky-400 text-slate-950 font-black rounded-full">
                                <Eye className="w-4 h-4 stroke-[3]" />
                              </span>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="bg-sky-400/20 text-sky-300 border border-sky-400/30 text-[9px] font-black px-1.5 py-0.2 uppercase">
                                {doc.category}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">
                                {new Date(doc.capturedAt).toLocaleDateString()}
                              </span>
                            </div>

                            <h4 className="font-black text-white text-xs uppercase tracking-wider line-clamp-1">
                              {doc.title}
                            </h4>

                            {doc.notes && (
                              <p className="text-[10px] text-slate-300 font-semibold uppercase line-clamp-2">
                                {doc.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Document Actions */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs gap-1">
                          <button
                            onClick={() => setPreviewDocument(doc)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-[10px] uppercase flex items-center gap-1 border border-white/10"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Preview</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handlePrintDocument(doc)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10"
                              title="Print Document"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDownloadDocument(doc)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10"
                              title="Download Image"
                            >
                              <Download className="w-3.5 h-3.5 text-sky-400" />
                            </button>

                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-white/10"
                              title="Delete Document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Document Camera Scanner Modal */}
        <DocumentScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          caseId={caseItem.id}
          caseNumber={caseItem.caseNumber}
          caseTitle={caseItem.caseTitle}
          onSaveDocument={handleSaveDocument}
        />

        {/* Lightbox Document Preview Modal */}
        {previewDocument && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-[#0F172A] border border-white/10 w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden my-auto">
              <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-[#1E293B]">
                <div>
                  <span className="bg-sky-400 text-slate-950 font-black text-[10px] px-2 py-0.5 uppercase tracking-wider block w-fit mb-0.5">
                    {previewDocument.category}
                  </span>
                  <h3 className="font-black text-sm sm:text-base text-white uppercase tracking-tight">
                    {previewDocument.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrintDocument(previewDocument)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black uppercase flex items-center gap-1 border border-white/10"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Print</span>
                  </button>

                  <button
                    onClick={() => handleDownloadDocument(previewDocument)}
                    className="px-2.5 py-1.5 bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-black uppercase flex items-center gap-1 shadow-md"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span className="hidden sm:inline">Download</span>
                  </button>

                  <button
                    onClick={() => setPreviewDocument(null)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              <div className="p-4 overflow-y-auto bg-slate-950 flex flex-col items-center justify-center min-h-[350px]">
                <img
                  src={previewDocument.dataUrl}
                  alt={previewDocument.title}
                  className="max-h-[65vh] w-auto object-contain border border-white/10 shadow-2xl"
                />

                {previewDocument.notes && (
                  <div className="mt-4 bg-[#1E293B] p-3 border border-white/10 w-full text-xs uppercase font-bold text-slate-300">
                    <span className="text-sky-400 text-[10px] block font-black mb-0.5">Document Remarks / Notes:</span>
                    <p>{previewDocument.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

