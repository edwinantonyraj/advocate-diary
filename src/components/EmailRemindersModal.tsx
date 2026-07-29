import React, { useState, useEffect } from 'react';
import { Case, Client } from '../types';
import {
  EmailReminderSettings,
  DEFAULT_EMAIL_SETTINGS,
  getUpcomingEmailReminderQueue,
  ReminderItem,
  buildMailToUrl,
  generateHearingEmailContent,
} from '../utils/emailReminders';
import {
  Mail,
  Send,
  Copy,
  CheckCircle2,
  Clock,
  Calendar,
  Settings,
  X,
  ExternalLink,
  AlertCircle,
  FileText,
  User,
  Building,
} from 'lucide-react';

interface EmailRemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: Case[];
  clients: Client[];
}

export const EmailRemindersModal: React.FC<EmailRemindersModalProps> = ({
  isOpen,
  onClose,
  cases,
  clients,
}) => {
  const [settings, setSettings] = useState<EmailReminderSettings>(() => {
    const saved = localStorage.getItem('advocate_diary_email_settings');
    return saved ? JSON.parse(saved) : DEFAULT_EMAIL_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<'queue' | 'settings'>('queue');
  const [sentReminders, setSentReminders] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendingApi, setSendingApi] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<ReminderItem | null>(null);

  useEffect(() => {
    localStorage.setItem('advocate_diary_email_settings', JSON.stringify(settings));
  }, [settings]);

  if (!isOpen) return null;

  const queue = getUpcomingEmailReminderQueue(cases, clients, settings);

  const handleCopyEmail = (item: ReminderItem) => {
    const text = `Subject: ${item.subject}\n\n${item.body}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleSendMailTo = (item: ReminderItem) => {
    const url = buildMailToUrl(item.recipientEmail, item.subject, item.body);
    window.open(url, '_blank');
    setSentReminders((prev) => ({ ...prev, [item.id]: true }));
  };

  const handleSendViaServerApi = async (item: ReminderItem) => {
    setSendingApi(item.id);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/reminders/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: item.recipientEmail,
          subject: item.subject,
          body: item.body,
          caseNumber: item.caseItem.caseNumber,
          daysNotice: item.daysNotice,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch email');

      setSentReminders((prev) => ({ ...prev, [item.id]: true }));
      setStatusMessage(`Email notification dispatched for ${item.caseItem.caseNumber}!`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      // Fallback to Mailto if server API fails or is unconfigured
      handleSendMailTo(item);
    } finally {
      setSendingApi(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0F172A] border border-white/10 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl text-white">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1E293B]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-400/20 text-sky-400 border border-sky-400/30">
              <Mail className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base text-white uppercase tracking-tight">HEARING EMAIL REMINDERS</h2>
                <span className="bg-sky-400 text-slate-950 text-[10px] font-black px-2 py-0.5 uppercase tracking-wider">
                  7D / 3D / 1D NOTICES
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">
                AUTOMATED EMAIL NOTIFICATIONS FOR ADVOCATES & CLIENTS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Selector Bar */}
        <div className="bg-[#1E293B]/80 border-b border-white/10 p-2 flex items-center gap-2 text-xs uppercase font-bold tracking-wider">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 flex items-center gap-2 transition-colors ${
              activeTab === 'queue'
                ? 'bg-sky-400 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 stroke-[2.5]" />
            <span>Upcoming Email Queue ({queue.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 flex items-center gap-2 transition-colors ${
              activeTab === 'settings'
                ? 'bg-sky-400 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 stroke-[2.5]" />
            <span>Reminder Rules & Settings</span>
          </button>
        </div>

        {statusMessage && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 p-2.5 text-center text-xs text-emerald-300 font-black uppercase tracking-wider flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'queue' ? (
            <div className="space-y-3">
              {/* Info banner */}
              <div className="bg-[#1E293B] border border-white/10 p-3 text-xs space-y-1">
                <div className="flex items-center gap-2 text-sky-400 font-black uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>7-DAY, 3-DAY & 1-DAY AUTOMATED SCHEDULE</span>
                </div>
                <p className="text-slate-300 text-[11px] font-medium leading-relaxed uppercase tracking-wide">
                  The system scans all active court hearings and flags cases at 7 Days, 3 Days, and 1 Day before the hearing date. Click &quot;Send Email&quot; or &quot;Copy Mail Text&quot; to notify the client/advocate immediately.
                </p>
              </div>

              {queue.length === 0 ? (
                <div className="bg-[#1E293B] border border-white/10 p-8 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h3 className="font-black text-white text-base uppercase tracking-tight">NO EMAIL REMINDERS DUE TODAY</h3>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider max-w-md mx-auto">
                    No active court cases fall exactly on 7 days, 3 days, or 1 day prior to their next hearing date based on your rule settings.
                  </p>
                </div>
              ) : (
                queue.map((item) => {
                  const isSent = sentReminders[item.id];
                  const daysNoticeColor =
                    item.daysNotice === 1
                      ? 'bg-rose-500 text-white'
                      : item.daysNotice === 3
                      ? 'bg-amber-400 text-slate-950'
                      : item.daysNotice === 7
                      ? 'bg-sky-400 text-slate-950'
                      : 'bg-emerald-400 text-slate-950';

                  const daysText =
                    item.daysNotice === 1
                      ? '1 DAY OUT (TOMORROW)'
                      : item.daysNotice === 3
                      ? '3 DAYS OUT'
                      : item.daysNotice === 7
                      ? '7 DAYS OUT'
                      : 'HEARING TODAY';

                  return (
                    <div
                      key={item.id}
                      className="bg-[#1E293B] border border-white/10 p-4 space-y-3 shadow-md"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 font-black uppercase tracking-wider ${daysNoticeColor}`}
                          >
                            {daysText}
                          </span>
                          <span className="font-black text-xs text-sky-400 uppercase tracking-wider">
                            {item.caseItem.caseNumber}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
                          <span>HEARING: <strong className="text-white font-black">{item.caseItem.nextHearingDate}</strong></span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-black text-base text-white uppercase tracking-tight">
                          {item.caseItem.caseTitle}
                        </h3>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-0.5">
                          {item.caseItem.courtName} • Client: <strong className="text-slate-200">{item.caseItem.clientName}</strong> ({item.recipientEmail})
                        </p>
                      </div>

                      {/* Recipient bar */}
                      <div className="bg-[#0F172A] p-2.5 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-300 font-semibold truncate">
                          <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="text-slate-400 uppercase font-bold text-[10px]">RECIPIENT:</span>
                          <span className="font-mono text-white font-bold truncate">{item.recipientEmail}</span>
                        </div>

                        <button
                          onClick={() => setPreviewItem(previewItem?.id === item.id ? null : item)}
                          className="text-sky-400 hover:underline font-black text-[11px] uppercase tracking-wider flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{previewItem?.id === item.id ? 'Hide Draft' : 'Preview Mail Body'}</span>
                        </button>
                      </div>

                      {/* Expandable Preview */}
                      {previewItem?.id === item.id && (
                        <div className="bg-[#0F172A] border border-sky-400/30 p-3 text-xs space-y-2">
                          <div className="font-bold text-sky-400 uppercase tracking-wider">
                            SUBJECT: {item.subject}
                          </div>
                          <pre className="font-sans text-slate-300 text-[11px] whitespace-pre-wrap leading-relaxed bg-[#1E293B] p-2.5 border border-white/10">
                            {item.body}
                          </pre>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2">
                          {isSent && (
                            <span className="flex items-center gap-1 text-emerald-400 text-xs font-black uppercase tracking-wider">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Email Sent</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyEmail(item)}
                            className="bg-[#0F172A] hover:bg-slate-800 text-slate-300 font-bold px-3 py-1.5 text-xs uppercase tracking-wider border border-white/10 flex items-center gap-1.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedId === item.id ? 'Copied!' : 'Copy Body'}</span>
                          </button>

                          <button
                            onClick={() => handleSendViaServerApi(item)}
                            disabled={sendingApi === item.id}
                            className="bg-sky-400 hover:bg-sky-300 text-slate-950 font-black px-4 py-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-colors"
                          >
                            <Send className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{sendingApi === item.id ? 'Sending...' : 'Send Email Notice'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Settings Tab */
            <div className="bg-[#1E293B] border border-white/10 p-5 space-y-5 shadow-xl text-xs">
              <div>
                <h3 className="font-black text-sm text-white uppercase tracking-tight">AUTOMATED EMAIL REMINDER SCHEDULE RULES</h3>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">
                  TOGGLE AUTOMATIC REMINDER NOTICES BEFORE COURT HEARING DATES
                </p>
              </div>

              {/* Toggles */}
              <div className="space-y-3 bg-[#0F172A] p-4 border border-white/10">
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="font-black text-white uppercase tracking-wider block">7 Days Before Hearing Notice</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">
                      Generates advance preparation email reminder 1 week before court date
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enable7Days}
                    onChange={(e) => setSettings({ ...settings, enable7Days: e.target.checked })}
                    className="w-5 h-5 accent-sky-400 rounded-none cursor-pointer"
                  />
                </label>

                <div className="border-t border-white/10 pt-3">
                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="font-black text-white uppercase tracking-wider block">3 Days Before Hearing Notice</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">
                        Generates urgent document & evidence preparation check 3 days prior
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enable3Days}
                      onChange={(e) => setSettings({ ...settings, enable3Days: e.target.checked })}
                      className="w-5 h-5 accent-sky-400 rounded-none cursor-pointer"
                    />
                  </label>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="font-black text-white uppercase tracking-wider block">1 Day Before Hearing (Tomorrow) Notice</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">
                        Generates final court appearance, hall & item number confirmation email
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enable1Day}
                      onChange={(e) => setSettings({ ...settings, enable1Day: e.target.checked })}
                      className="w-5 h-5 accent-sky-400 rounded-none cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Form details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    ADVOCATE NAME
                  </label>
                  <input
                    type="text"
                    value={settings.advocateName}
                    onChange={(e) => setSettings({ ...settings, advocateName: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/10 text-white font-bold p-2.5 uppercase focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    ADVOCATE EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={settings.advocateEmail}
                    onChange={(e) => setSettings({ ...settings, advocateEmail: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/10 text-white font-bold p-2.5 focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    LAW FIRM / CHAMBER NAME
                  </label>
                  <input
                    type="text"
                    value={settings.firmName}
                    onChange={(e) => setSettings({ ...settings, firmName: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/10 text-white font-bold p-2.5 uppercase focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-black uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SETTINGS ARE AUTO-SAVED TO YOUR ADVOCATE DIARY ENVIRONMENT.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-[#1E293B] flex items-center justify-between text-xs uppercase font-bold text-slate-400">
          <span>EMAIL REMINDERS WORK SAFELY VIA MAILTO OR DIRECT SMTP DISPATCH</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white font-black uppercase tracking-wider border border-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
