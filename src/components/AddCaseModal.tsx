import React, { useState } from 'react';
import { Case, CaseType, Client } from '../types';
import { X, Plus, Scale, Calendar, User, Building } from 'lucide-react';

interface AddCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCase: (newCase: Case) => void;
  clients: Client[];
  onAddClient: (client: Client) => Client;
}

export const AddCaseModal: React.FC<AddCaseModalProps> = ({
  isOpen,
  onClose,
  onSaveCase,
  clients,
  onAddClient,
}) => {
  if (!isOpen) return null;

  const caseTypes: CaseType[] = [
    'Civil Suit',
    'Criminal Case',
    'High Court Writ',
    'Bail Application',
    'Family Court / Matrimonial',
    'Consumer Forum',
    'Arbitration',
    'Labour / Industrial',
    'Revenue / Land',
    'Cheque Bounce (Sec 138)',
    'Motor Accident Claims (MACT)',
    'Other',
  ];

  const [formData, setFormData] = useState({
    caseNumber: '',
    cnrNumber: '',
    caseTitle: '',
    caseType: 'Civil Suit' as CaseType,
    courtName: 'District & Sessions Court',
    courtHall: 'Court Hall 1',
    judgeName: '',
    itemNumber: '',
    clientRole: 'Petitioner/Plaintiff' as 'Petitioner/Plaintiff' | 'Respondent/Defendant' | 'Opposite Party' | 'Third Party',
    advocateFor: '',
    clientId: clients.length > 0 ? clients[0].id : '',
    newClientName: '',
    newClientPhone: '',
    oppositeParty: '',
    oppositeLawyer: '',
    stage: 'Admission / Initial Filing',
    nextHearingDate: new Date().toISOString().split('T')[0],
    totalFee: 25000,
    paidFee: 10000,
    notes: '',
  });

  const [isCreatingNewClient, setIsCreatingNewClient] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let selectedClientId = formData.clientId;
    let selectedClientName = clients.find((c) => c.id === selectedClientId)?.name || '';
    let selectedClientPhone = clients.find((c) => c.id === selectedClientId)?.phone || '';

    // Create client if user typed a new client name
    if (isCreatingNewClient || !selectedClientId) {
      if (formData.newClientName.trim()) {
        const newClient: Client = {
          id: `cli-${Date.now()}`,
          name: formData.newClientName,
          phone: formData.newClientPhone || '',
          createdAt: new Date().toISOString().split('T')[0],
        };
        const created = onAddClient(newClient);
        selectedClientId = created.id;
        selectedClientName = created.name;
        selectedClientPhone = created.phone;
      }
    }

    const newCase: Case = {
      id: `case-${Date.now()}`,
      caseNumber: formData.caseNumber || 'SUIT-' + Math.floor(Math.random() * 9000 + 1000),
      cnrNumber: formData.cnrNumber,
      caseTitle: formData.caseTitle,
      caseType: formData.caseType,
      courtName: formData.courtName,
      courtHall: formData.courtHall,
      judgeName: formData.judgeName,
      itemNumber: formData.itemNumber,
      clientRole: formData.clientRole,
      advocateFor: formData.advocateFor,
      clientId: selectedClientId,
      clientName: selectedClientName || formData.newClientName || 'Client',
      clientPhone: selectedClientPhone || formData.newClientPhone || '',
      oppositeParty: formData.oppositeParty || 'Opposite Party',
      oppositeLawyer: formData.oppositeLawyer,
      stage: formData.stage,
      status: 'Pending',
      nextHearingDate: formData.nextHearingDate,
      totalFee: Number(formData.totalFee) || 0,
      paidFee: Number(formData.paidFee) || 0,
      notes: formData.notes,
      hearingHistory: [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSaveCase(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0F172A] border border-white/10 w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl text-white">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-400/10 text-sky-400 border border-sky-400/30">
              <Scale className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-black text-base text-white uppercase tracking-tight">ADD NEW CASE TO DIARY</h2>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">RECORD CASE DETAILS, COURT INFO, CLIENT & HEARING SCHEDULE</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 text-xs flex-1 uppercase font-bold tracking-wider">
          {/* Case Number & CNR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Case Number / Suit No. *</label>
              <input
                type="text"
                placeholder="E.G. WP (C) 1204/2025 OR OS 45/2024"
                value={formData.caseNumber}
                onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">CNR Number (Optional)</label>
              <input
                type="text"
                placeholder="CENTRAL NATIONAL RECORD ID"
                value={formData.cnrNumber}
                onChange={(e) => setFormData({ ...formData, cnrNumber: e.target.value })}
                className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* Case Title */}
          <div>
            <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Case Title / Party Name *</label>
            <input
              type="text"
              placeholder="E.G. RAMESH KUMAR VS. STATE OF DELHI & ANR"
              value={formData.caseTitle}
              onChange={(e) => setFormData({ ...formData, caseTitle: e.target.value })}
              className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
              required
            />
          </div>

          {/* Type & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Case Category / Type</label>
              <select
                value={formData.caseType}
                onChange={(e) => setFormData({ ...formData, caseType: e.target.value as CaseType })}
                className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
              >
                {caseTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Client Role</label>
              <select
                value={formData.clientRole}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    clientRole: e.target.value as 'Petitioner/Plaintiff' | 'Respondent/Defendant' | 'Opposite Party' | 'Third Party',
                  })
                }
                className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
              >
                <option value="Petitioner/Plaintiff">Petitioner / Plaintiff / Complainant</option>
                <option value="Respondent/Defendant">Respondent / Defendant / Accused</option>
                <option value="Opposite Party">Opposite Party</option>
                <option value="Third Party">Third Party / Intervenor</option>
              </select>
            </div>
          </div>

          {/* Advocate For (Party / OP / Petitioner No.) Row */}
          <div className="bg-[#1E293B] p-3 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                Advocate For (Specific Party / OP / Petitioner No.)
              </label>
              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
                E.G. OP 1, OP 2, PETITIONER 1 & 2
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. OP 1, OP 2, OP 1 to 10, Petitioner 1, Petitioner 1 and 2..."
              value={formData.advocateFor || ''}
              onChange={(e) => setFormData({ ...formData, advocateFor: e.target.value })}
              className="w-full bg-[#0F172A] border border-white/10 p-2.5 text-white font-semibold uppercase focus:outline-none focus:border-sky-400 text-xs"
            />
            {/* Quick preset chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Quick Presets (1-Click Fill):</span>
              {['OP 1', 'OP 2', 'OP 1 to 5', 'OP 1 to 10', 'Petitioner 1', 'Petitioner 1 & 2', 'Respondent 1', 'Respondent 1 & 2', 'Accused 1 to 3'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFormData({ ...formData, advocateFor: preset })}
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border transition-all ${
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
                  className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30 transition-all ml-auto"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Court Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Court Name *</label>
              <input
                type="text"
                placeholder="E.G. HIGH COURT, DISTRICT & SESSIONS COURT"
                value={formData.courtName}
                onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Court Hall / Room</label>
              <input
                type="text"
                placeholder="E.G. HALL 4"
                value={formData.courtHall}
                onChange={(e) => setFormData({ ...formData, courtHall: e.target.value })}
                className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* Item No & Judge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Item / Board Number</label>
              <input
                type="text"
                placeholder="E.G. ITEM 12"
                value={formData.itemNumber}
                onChange={(e) => setFormData({ ...formData, itemNumber: e.target.value })}
                className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Presiding Judge / Bench</label>
              <input
                type="text"
                placeholder="E.G. HON'BLE JUSTICE A. K. VARMA"
                value={formData.judgeName}
                onChange={(e) => setFormData({ ...formData, judgeName: e.target.value })}
                className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* Client Selection or New Client Creation */}
          <div className="bg-[#1E293B] p-3 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sky-400 font-black text-xs uppercase tracking-wider">Client Selection</label>
              <button
                type="button"
                onClick={() => setIsCreatingNewClient(!isCreatingNewClient)}
                className="text-sky-400 hover:underline text-[10px] font-black uppercase tracking-widest"
              >
                {isCreatingNewClient ? 'Select Existing Client' : '+ New Client Profile'}
              </button>
            </div>

            {isCreatingNewClient ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="CLIENT FULL NAME *"
                  value={formData.newClientName}
                  onChange={(e) => setFormData({ ...formData, newClientName: e.target.value })}
                  className="bg-[#0F172A] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
                  required
                />
                <input
                  type="text"
                  placeholder="CLIENT MOBILE / PHONE"
                  value={formData.newClientPhone}
                  onChange={(e) => setFormData({ ...formData, newClientPhone: e.target.value })}
                  className="bg-[#0F172A] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
                />
              </div>
            ) : (
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full bg-[#0F172A] border border-white/10 p-2 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
              >
                {clients.map((cli) => (
                  <option key={cli.id} value={cli.id}>
                    {cli.name} ({cli.phone || 'NO PHONE'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Opposite Party & Lawyer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Opposite Party Name</label>
              <input
                type="text"
                placeholder="E.G. STATE OF UP / RELIANCE INFRA"
                value={formData.oppositeParty}
                onChange={(e) => setFormData({ ...formData, oppositeParty: e.target.value })}
                className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Opposite Advocate Name</label>
              <input
                type="text"
                placeholder="E.G. ADV. R. K. SHARMA"
                value={formData.oppositeLawyer}
                onChange={(e) => setFormData({ ...formData, oppositeLawyer: e.target.value })}
                className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* Stage & Next Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Current Case Stage *</label>
              <input
                type="text"
                placeholder="E.G. FILING REPLY / ARGUMENTS"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
                required
              />
            </div>
            <div>
              <label className="block text-sky-400 font-black uppercase text-[10px] tracking-wider mb-1">First / Next Hearing Date *</label>
              <input
                type="date"
                value={formData.nextHearingDate}
                onChange={(e) => setFormData({ ...formData, nextHearingDate: e.target.value })}
                className="w-full bg-[#1E293B] border border-sky-400/50 p-2.5 text-sky-400 font-black focus:outline-none focus:border-sky-400"
                required
              />
            </div>
          </div>

          {/* Fees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Agreed Professional Fee (₹)</label>
              <input
                type="number"
                value={formData.totalFee}
                onChange={(e) => setFormData({ ...formData, totalFee: Number(e.target.value) })}
                className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Received Advance Fee (₹)</label>
              <input
                type="number"
                value={formData.paidFee}
                onChange={(e) => setFormData({ ...formData, paidFee: Number(e.target.value) })}
                className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Case Notes / Brief Overview</label>
            <textarea
              rows={2}
              placeholder="IMPORTANT POINTS, DOCUMENTS REQUIRED, INTERIM ORDERS..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold uppercase focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1E293B] hover:bg-slate-700 text-slate-300 font-black uppercase text-xs tracking-wider border border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black uppercase text-xs tracking-wider shadow-md transition-all"
            >
              Add Case to Diary
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
