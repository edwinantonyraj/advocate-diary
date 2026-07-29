import React, { useState, useEffect } from 'react';
import { Case } from '../types';
import { getDueSoonCases, getHearingDueStatus, requestNotificationPermission, triggerDueSoonNotifications, sendBrowserNotification } from '../utils/hearingAlerts';
import { DueSoonBadge } from './DueSoonBadge';
import { Bell, BellOff, X, Clock, Calendar, MapPin, ChevronRight, AlertCircle, CheckCircle2, Send } from 'lucide-react';

interface DueSoonAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: Case[];
  onSelectCase: (caseItem: Case) => void;
}

export const DueSoonAlertModal: React.FC<DueSoonAlertModalProps> = ({
  isOpen,
  onClose,
  cases,
  onSelectCase,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notifiedMessage, setNotifiedMessage] = useState<string | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const dueSoonCases = getDueSoonCases(cases);

  const handleEnableNotifications = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      triggerDueSoonNotifications(cases, true);
      setNotifiedMessage('Browser notifications enabled! Alert sent for due cases.');
      setTimeout(() => setNotifiedMessage(null), 4000);
    } else if (res === 'denied') {
      alert('Notification permission was blocked in your browser settings. Please enable notifications in your browser location bar to receive alerts.');
    }
  };

  const handleTestAlert = () => {
    if (permission !== 'granted') {
      handleEnableNotifications();
      return;
    }

    if (dueSoonCases.length > 0) {
      triggerDueSoonNotifications(cases, true);
      setNotifiedMessage('Desktop notification sent!');
    } else {
      sendBrowserNotification('⚖️ Advocate Diary - System Test', {
        body: 'Browser notifications are active! No cases due in the next 48 hours.',
      });
      setNotifiedMessage('Test notification dispatched!');
    }
    setTimeout(() => setNotifiedMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0F172A] border border-white/10 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-white">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400/20 text-amber-400 border border-amber-400/30">
              <Bell className="w-5 h-5 stroke-[2.5] animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base text-white uppercase tracking-tight">HEARINGS DUE IN NEXT 48 HOURS</h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 uppercase tracking-wider">
                  {dueSoonCases.length} DUE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">
                URGENT COURT BOARD ALERT & BROWSER NOTIFICATIONS
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

        {/* Browser Notification Controls Bar */}
        <div className="bg-[#1E293B]/80 border-b border-white/10 p-3 flex flex-wrap items-center justify-between gap-2 text-xs uppercase font-bold tracking-wider">
          <div className="flex items-center gap-2">
            {permission === 'granted' ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-black text-[11px]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Browser Notifications: Active</span>
              </span>
            ) : permission === 'denied' ? (
              <span className="flex items-center gap-1.5 text-rose-400 font-black text-[11px]">
                <BellOff className="w-4 h-4" />
                <span>Notifications Blocked by Browser</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-black text-[11px]">
                <AlertCircle className="w-4 h-4" />
                <span>Browser Notifications: Disabled</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {permission !== 'granted' ? (
              <button
                onClick={handleEnableNotifications}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3 py-1.5 text-xs uppercase tracking-wider flex items-center gap-1 shadow-md"
              >
                <Bell className="w-3.5 h-3.5 stroke-[3]" />
                <span>Enable Browser Alerts</span>
              </button>
            ) : (
              <button
                onClick={handleTestAlert}
                className="bg-sky-400 hover:bg-sky-300 text-slate-950 font-black px-3 py-1.5 text-xs uppercase tracking-wider flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5 stroke-[3]" />
                <span>Trigger Desktop Alert</span>
              </button>
            )}
          </div>
        </div>

        {notifiedMessage && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 p-2.5 text-center text-xs text-emerald-300 font-black uppercase tracking-wider">
            {notifiedMessage}
          </div>
        )}

        {/* Modal Body - List of Due Cases */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {dueSoonCases.length === 0 ? (
            <div className="bg-[#1E293B] border border-white/10 p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="font-black text-white text-base uppercase tracking-tight">NO HEARINGS DUE IN THE NEXT 48 HOURS</h3>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                All upcoming court cases are scheduled beyond 48 hours or listed as disposed.
              </p>
            </div>
          ) : (
            dueSoonCases.map((caseItem) => {
              const status = getHearingDueStatus(caseItem.nextHearingDate);
              return (
                <div
                  key={caseItem.id}
                  onClick={() => {
                    onClose();
                    onSelectCase(caseItem);
                  }}
                  className="bg-[#1E293B] border border-white/10 p-3.5 hover:border-amber-400/60 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <DueSoonBadge nextHearingDate={caseItem.nextHearingDate} size="md" />
                      <span className="font-black text-xs text-sky-400 uppercase tracking-wider">
                        {caseItem.caseNumber}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      HEARING: <strong className="text-white font-black">{caseItem.nextHearingDate}</strong>
                    </span>
                  </div>

                  <h3 className="font-black text-base text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight">
                    {caseItem.caseTitle}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 bg-[#0F172A] p-2 border border-white/10">
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">{caseItem.courtName} {caseItem.courtHall ? `(${caseItem.courtHall})` : ''}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide">
                      <span className="text-slate-400">CLIENT:</span>
                      <span className="text-white font-black truncate">{caseItem.clientName}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-bold uppercase tracking-wider">
                    <span>STAGE: <strong className="text-sky-400 font-black">{caseItem.stage}</strong></span>
                    <span className="text-amber-400 font-black flex items-center gap-1 group-hover:underline">
                      <span>Open Case Record</span>
                      <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-[#1E293B] flex items-center justify-between text-xs uppercase font-bold text-slate-400">
          <span>TIPS: KEEP ADVOCATE DIARY OPEN OR PIN TAB FOR LIVE ALERTS</span>
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
