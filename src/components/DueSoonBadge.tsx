import React from 'react';
import { Clock, AlertTriangle, Bell } from 'lucide-react';
import { getHearingDueStatus, DueStatus } from '../utils/hearingAlerts';

interface DueSoonBadgeProps {
  nextHearingDate: string | undefined;
  size?: 'sm' | 'md' | 'lg';
  showAlways?: boolean; // if false, only renders when isDueSoon is true
}

export const DueSoonBadge: React.FC<DueSoonBadgeProps> = ({
  nextHearingDate,
  size = 'md',
  showAlways = false,
}) => {
  const status: DueStatus = getHearingDueStatus(nextHearingDate);

  if (!status.isDueSoon && !showAlways) {
    return null;
  }

  if (!status.isDueSoon) {
    return null;
  }

  // Styles based on urgency
  let styleClasses = 'bg-amber-400 text-slate-950 border-amber-300';
  let icon = <Clock className="w-3 h-3 stroke-[3]" />;

  if (status.urgentLevel === 'today') {
    styleClasses = 'bg-rose-500 text-white border-rose-400 animate-pulse';
    icon = <AlertTriangle className="w-3 h-3 stroke-[3]" />;
  } else if (status.urgentLevel === 'tomorrow') {
    styleClasses = 'bg-amber-400 text-slate-950 border-amber-300';
    icon = <Clock className="w-3 h-3 stroke-[3]" />;
  } else if (status.urgentLevel === 'soon') {
    styleClasses = 'bg-sky-400 text-slate-950 border-sky-300';
    icon = <Bell className="w-3 h-3 stroke-[3]" />;
  }

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 gap-1 font-black',
    md: 'text-[10px] px-2 py-0.5 gap-1.5 font-black',
    lg: 'text-xs px-2.5 py-1 gap-1.5 font-black',
  };

  return (
    <span
      className={`inline-flex items-center uppercase tracking-wider border shadow-sm ${sizeClasses[size]} ${styleClasses}`}
      title={`Hearing scheduled on ${nextHearingDate} - Due in <48 hours`}
    >
      {icon}
      <span>{status.badgeText}</span>
    </span>
  );
};
