import React, { useState } from 'react';
import { Case, FeeTransaction } from '../types';
import { DollarSign, Plus, ArrowUpRight, ArrowDownLeft, FileText, CheckCircle2, TrendingUp, CreditCard } from 'lucide-react';

interface FeeLedgerProps {
  cases: Case[];
  transactions: FeeTransaction[];
  onAddTransaction: (tx: FeeTransaction) => void;
  onUpdateCaseFee: (caseId: string, paidFee: number) => void;
}

export const FeeLedger: React.FC<FeeLedgerProps> = ({
  cases,
  transactions,
  onAddTransaction,
  onUpdateCaseFee,
}) => {
  const [showRecordModal, setShowRecordModal] = useState(false);

  const totalAgreedFee = cases.reduce((sum, c) => sum + (c.totalFee || 0), 0);
  const totalPaidFee = cases.reduce((sum, c) => sum + (c.paidFee || 0), 0);
  const totalOutstanding = totalAgreedFee - totalPaidFee;

  // New Transaction State
  const [newTx, setNewTx] = useState({
    caseId: cases.length > 0 ? cases[0].id : '',
    amount: 10000,
    type: 'Payment' as 'Payment' | 'Retainer' | 'Court Fee Expense' | 'Misc Expense',
    paymentMethod: 'UPI / GPay' as 'Cash' | 'UPI / GPay' | 'Bank Transfer' | 'Cheque' | 'Card',
    receiptNo: `REC-${Date.now().toString().slice(-4)}`,
    notes: '',
  });

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCase = cases.find((c) => c.id === newTx.caseId);
    if (!selectedCase) return;

    const tx: FeeTransaction = {
      id: `tx-${Date.now()}`,
      caseId: selectedCase.id,
      caseNumber: selectedCase.caseNumber,
      caseTitle: selectedCase.caseTitle,
      clientId: selectedCase.clientId,
      clientName: selectedCase.clientName,
      date: new Date().toISOString().split('T')[0],
      amount: Number(newTx.amount) || 0,
      type: newTx.type,
      paymentMethod: newTx.paymentMethod,
      receiptNo: newTx.receiptNo,
      notes: newTx.notes,
    };

    onAddTransaction(tx);

    // If payment or retainer, update paid fee on case
    if (newTx.type === 'Payment' || newTx.type === 'Retainer') {
      const updatedPaid = (selectedCase.paidFee || 0) + Number(newTx.amount);
      onUpdateCaseFee(selectedCase.id, updatedPaid);
    }

    setShowRecordModal(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Ledger Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#0F172A] border border-white/10 p-4 shadow-xl">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">AGREED PROFESSIONAL FEES</span>
          <span className="text-2xl font-black text-white tracking-tight mt-1 block">₹{totalAgreedFee.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 block">{cases.length} CONTRACTED SUITS</span>
        </div>

        <div className="bg-[#0F172A] border border-white/10 p-4 shadow-xl">
          <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest block">COLLECTED FEES</span>
          <span className="text-2xl font-black text-emerald-400 tracking-tight mt-1 block">₹{totalPaidFee.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-emerald-500/90 uppercase tracking-wider mt-0.5 block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> RECEIVED IN BANK/CASH
          </span>
        </div>

        <div className="bg-[#0F172A] border border-white/10 p-4 shadow-xl">
          <span className="text-[10px] text-sky-400 font-black uppercase tracking-widest block">OUTSTANDING BALANCE</span>
          <span className="text-2xl font-black text-sky-400 tracking-tight mt-1 block">₹{totalOutstanding.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-sky-500/90 uppercase tracking-wider mt-0.5 block">PENDING CLIENT DUE</span>
        </div>
      </div>

      {/* Record Payment Action Banner */}
      <div className="bg-[#0F172A] border border-white/10 p-4 flex items-center justify-between gap-3 shadow-xl">
        <div>
          <h3 className="font-black text-lg text-white uppercase tracking-tight">FEE LEDGER & EXPENSES</h3>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">RECORD INCOMING PAYMENTS & COURT EXPENSES</p>
        </div>
        <button
          onClick={() => setShowRecordModal(true)}
          className="bg-sky-400 hover:bg-sky-300 text-slate-950 font-black px-4 py-2.5 text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Record Entry</span>
        </button>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-[#0F172A] border border-white/10 p-4 space-y-3 shadow-xl">
        <h4 className="font-black text-xs text-sky-400 uppercase tracking-widest">TRANSACTIONS LOG</h4>

        {transactions.length === 0 ? (
          <p className="text-xs text-slate-400 uppercase font-bold text-center py-6 tracking-wider">No payment transactions recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-[#1E293B] p-3 border border-white/10 flex items-center justify-between gap-3 text-xs uppercase font-bold tracking-wider"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 border ${
                      tx.type === 'Payment' || tx.type === 'Retainer'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {tx.type === 'Payment' || tx.type === 'Retainer' ? (
                      <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-sm">{tx.clientName}</span>
                      <span className="text-[10px] bg-[#0F172A] text-sky-400 px-2 py-0.5 border border-white/10 font-bold">
                        {tx.caseNumber}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                      {tx.type} • VIA {tx.paymentMethod} {tx.receiptNo ? `(${tx.receiptNo})` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-black text-base block ${
                      tx.type === 'Payment' || tx.type === 'Retainer' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {tx.type === 'Payment' || tx.type === 'Retainer' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-semibold">{tx.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-md p-5 space-y-4 text-white shadow-2xl">
            <h3 className="font-black text-lg border-b border-white/10 pb-2 uppercase tracking-tight">RECORD PAYMENT / FEE ENTRY</h3>
            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Select Case & Client *</label>
                <select
                  value={newTx.caseId}
                  onChange={(e) => setNewTx({ ...newTx, caseId: e.target.value })}
                  className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold focus:outline-none focus:border-sky-400 uppercase"
                  required
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.clientName} ({c.caseTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                    className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-black text-sm focus:outline-none focus:border-sky-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Entry Type</label>
                  <select
                    value={newTx.type}
                    onChange={(e) => setNewTx({ ...newTx, type: e.target.value as any })}
                    className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold focus:outline-none focus:border-sky-400 uppercase"
                  >
                    <option value="Payment">Client Fee Payment</option>
                    <option value="Retainer">Advance Retainer</option>
                    <option value="Court Fee Expense">Court Fee Expense</option>
                    <option value="Misc Expense">Misc Office Expense</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Payment Mode</label>
                  <select
                    value={newTx.paymentMethod}
                    onChange={(e) => setNewTx({ ...newTx, paymentMethod: e.target.value as any })}
                    className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold focus:outline-none focus:border-sky-400 uppercase"
                  >
                    <option value="UPI / GPay">UPI / GPay / PhonePe</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Card">Debit / Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Receipt / Ref No.</label>
                  <input
                    type="text"
                    value={newTx.receiptNo}
                    onChange={(e) => setNewTx({ ...newTx, receiptNo: e.target.value })}
                    className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold focus:outline-none focus:border-sky-400 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Remarks / Payment Notes</label>
                <input
                  type="text"
                  placeholder="E.G. RECEIVED 2ND INSTALLMENT FOR EVIDENCE STAGE"
                  value={newTx.notes}
                  onChange={(e) => setNewTx({ ...newTx, notes: e.target.value })}
                  className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold focus:outline-none focus:border-sky-400 uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 bg-[#1E293B] hover:bg-slate-700 text-slate-300 text-xs font-black uppercase tracking-wider border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs uppercase tracking-wider"
                >
                  Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
