import React, { useState } from 'react';
import { Client, Case } from '../types';
import { Phone, Mail, MapPin, Briefcase, Plus, Search, MessageSquare, DollarSign, UserCheck } from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  cases: Case[];
  onAddClient: (client: Client) => void;
  onSelectCase: (caseItem: Case) => void;
  searchQuery: string;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  cases,
  onAddClient,
  onSelectCase,
  searchQuery,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    company: '',
    notes: '',
  });

  const filteredClients = clients.filter((cli) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      cli.name.toLowerCase().includes(q) ||
      cli.phone.toLowerCase().includes(q) ||
      (cli.company || '').toLowerCase().includes(q) ||
      (cli.email || '').toLowerCase().includes(q)
    );
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name.trim()) return;

    onAddClient({
      id: `cli-${Date.now()}`,
      name: newClient.name,
      phone: newClient.phone,
      email: newClient.email,
      address: newClient.address,
      company: newClient.company,
      notes: newClient.notes,
      createdAt: new Date().toISOString().split('T')[0],
    });

    setNewClient({
      name: '',
      phone: '',
      email: '',
      address: '',
      company: '',
      notes: '',
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner */}
      <div className="bg-[#0F172A] border border-white/10 p-4 flex items-center justify-between gap-3 shadow-xl">
        <div>
          <h2 className="font-black text-lg text-white uppercase tracking-tight">CLIENTS DIRECTORY</h2>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">
            TOTAL {clients.length} ACTIVE CLIENT PROFILES
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-sky-400 hover:bg-sky-300 text-slate-950 font-black px-4 py-2.5 text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Client</span>
        </button>
      </div>

      {/* Clients Cards Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-[#0F172A] border border-white/10 p-8 text-center text-slate-400 uppercase font-bold text-xs tracking-wider">
          No clients found matching "{searchQuery}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredClients.map((client) => {
            const clientCases = cases.filter((c) => c.clientId === client.id || c.clientName === client.name);
            const totalAgreed = clientCases.reduce((sum, c) => sum + (c.totalFee || 0), 0);
            const totalPaid = clientCases.reduce((sum, c) => sum + (c.paidFee || 0), 0);
            const balance = totalAgreed - totalPaid;

            return (
              <div
                key={client.id}
                className="bg-[#0F172A] border border-white/10 p-4 space-y-3 hover:border-sky-400/50 transition-all shadow-xl"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-400 text-slate-950 flex items-center justify-center font-black text-base uppercase">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-base text-white uppercase tracking-tight">{client.name}</h3>
                      {client.company && (
                        <p className="text-[11px] text-slate-400 uppercase font-bold">{client.company}</p>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] bg-[#1E293B] text-sky-400 font-black px-2.5 py-1 uppercase tracking-wider border border-white/10">
                    {clientCases.length} {clientCases.length === 1 ? 'Case' : 'Cases'}
                  </span>
                </div>

                {/* Contact Details & Quick Actions */}
                <div className="space-y-2 text-xs text-slate-300">
                  {client.phone && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-200 font-bold uppercase tracking-wider">
                        <Phone className="w-3.5 h-3.5 text-sky-400" />
                        <span>{client.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${client.phone}`}
                          className="px-2.5 py-1 bg-[#1E293B] hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-wider border border-white/10"
                        >
                          Call
                        </a>
                        <a
                          href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  )}

                  {client.email && (
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] uppercase font-semibold">
                      <Mail className="w-3.5 h-3.5 text-sky-400" />
                      <span>{client.email}</span>
                    </div>
                  )}

                  {client.address && (
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] uppercase font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>

                {/* Fee Status Bar */}
                <div className="bg-[#1E293B] p-2.5 border border-white/10 flex items-center justify-between text-xs uppercase font-bold tracking-wider">
                  <div>
                    <span className="text-[9px] text-slate-400 font-black block">FEE RECEIVED</span>
                    <span className="font-black text-emerald-400 text-sm">₹{totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 font-black block">PENDING DUE</span>
                    <span className={`font-black text-sm ${balance > 0 ? 'text-sky-400' : 'text-slate-400'}`}>
                      ₹{balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Associated Cases List */}
                {clientCases.length > 0 && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-black block mb-1.5 tracking-wider">
                      ACTIVE LEGAL SUITS:
                    </span>
                    <div className="space-y-1">
                      {clientCases.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => onSelectCase(c)}
                          className="bg-[#1E293B] hover:bg-slate-700 p-2 cursor-pointer flex items-center justify-between text-xs transition-colors border border-white/10 uppercase"
                        >
                          <div>
                            <span className="font-black text-sky-400 mr-2">{c.caseNumber}</span>
                            <span className="text-white font-bold truncate">{c.caseTitle}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 ml-2 whitespace-nowrap">{c.nextHearingDate}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-md p-5 space-y-4 text-white shadow-2xl">
            <h3 className="font-black text-lg border-b border-white/10 pb-2 uppercase tracking-tight">ADD NEW CLIENT PROFILE</h3>
            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="E.G. RAMESH CHANDRA"
                  className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold focus:outline-none focus:border-sky-400 uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Mobile / Phone</label>
                <input
                  type="text"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold focus:outline-none focus:border-sky-400 uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="CLIENT@EMAIL.COM"
                  className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold focus:outline-none focus:border-sky-400 uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={newClient.company}
                  onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                  placeholder="INDIVIDUAL / COMPANY LTD"
                  className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold focus:outline-none focus:border-sky-400 uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">Address</label>
                <textarea
                  rows={2}
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  placeholder="STREET, CITY, STATE"
                  className="w-full bg-[#1E293B] border border-white/10 p-2.5 text-white font-semibold focus:outline-none focus:border-sky-400 uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#1E293B] hover:bg-slate-700 text-slate-300 text-xs font-black uppercase tracking-wider border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs uppercase tracking-wider"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
