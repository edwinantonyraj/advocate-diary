import { Case } from '../types';

export interface DueStatus {
  isDueSoon: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  hoursLeft: number;
  badgeText: string;
  urgentLevel: 'today' | 'tomorrow' | 'soon' | 'normal' | 'past';
}

/**
 * Computes whether a case next hearing date is within the next 48 hours.
 */
export function getHearingDueStatus(nextHearingDateStr: string | undefined): DueStatus {
  if (!nextHearingDateStr) {
    return {
      isDueSoon: false,
      isToday: false,
      isTomorrow: false,
      hoursLeft: 999,
      badgeText: '',
      urgentLevel: 'normal',
    };
  }

  const now = new Date();
  
  // Format today's YYYY-MM-DD in local time
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  // Tomorrow's YYYY-MM-DD
  const tomorrowDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`;

  // Parse target date assuming court session end time at 17:00 (5:00 PM)
  const targetDateObj = new Date(`${nextHearingDateStr}T17:00:00`);
  const diffMs = targetDateObj.getTime() - now.getTime();
  const hoursLeft = Math.ceil(diffMs / (1000 * 60 * 60));

  const isToday = nextHearingDateStr === todayStr;
  const isTomorrow = nextHearingDateStr === tomorrowStr;

  // Check if within 48 hours (diffMs >= 0 and hoursLeft <= 48 or date is today/tomorrow)
  const isDueSoon = isToday || isTomorrow || (hoursLeft >= 0 && hoursLeft <= 48);

  let badgeText = '';
  let urgentLevel: 'today' | 'tomorrow' | 'soon' | 'normal' | 'past' = 'normal';

  if (isToday) {
    badgeText = 'HEARING TODAY';
    urgentLevel = 'today';
  } else if (isTomorrow) {
    badgeText = 'DUE TOMORROW';
    urgentLevel = 'tomorrow';
  } else if (isDueSoon) {
    badgeText = `DUE SOON (${hoursLeft}H)`;
    urgentLevel = 'soon';
  } else if (hoursLeft < 0 && !isToday) {
    badgeText = 'OVERDUE';
    urgentLevel = 'past';
  }

  return {
    isDueSoon,
    isToday,
    isTomorrow,
    hoursLeft,
    badgeText,
    urgentLevel,
  };
}

/**
 * Returns all active cases that have a hearing due within the next 48 hours.
 */
export function getDueSoonCases(cases: Case[]): Case[] {
  return cases.filter((c) => {
    if (c.status === 'Disposed') return false;
    const status = getHearingDueStatus(c.nextHearingDate);
    return status.isDueSoon;
  });
}

/**
 * Requests browser notification permission.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications.');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.error('Failed to request notification permission', e);
    return 'denied';
  }
}

/**
 * Fires a single browser notification.
 */
export function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'advocate-diary-hearing',
      ...options,
    });
  } catch (e) {
    console.error('Error sending notification', e);
  }
}

/**
 * Checks cases due in < 48 hours and sends browser notifications.
 */
export function triggerDueSoonNotifications(cases: Case[], force: boolean = false) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const dueCases = getDueSoonCases(cases);
  if (dueCases.length === 0) return;

  const notifiedKey = 'advocate_diary_notified_cases_48h';
  const notifiedIdsStr = sessionStorage.getItem(notifiedKey) || '[]';
  const notifiedIds: string[] = JSON.parse(notifiedIdsStr);

  const unnotifiedCases = force
    ? dueCases
    : dueCases.filter((c) => !notifiedIds.includes(`${c.id}_${c.nextHearingDate}`));

  if (unnotifiedCases.length === 0) return;

  // Send summary or individual notification
  if (unnotifiedCases.length === 1) {
    const c = unnotifiedCases[0];
    const status = getHearingDueStatus(c.nextHearingDate);
    sendBrowserNotification(`⚖️ Hearing Due Soon: ${c.caseNumber}`, {
      body: `${c.caseTitle}\nCourt: ${c.courtName}\nNext Hearing: ${c.nextHearingDate} (${status.badgeText})\nClient: ${c.clientName}`,
    });
  } else {
    sendBrowserNotification(`⚖️ ${unnotifiedCases.length} Court Hearings Due in <48 Hours`, {
      body: unnotifiedCases
        .map((c) => `• ${c.caseNumber} - ${c.courtName} (${c.nextHearingDate})`)
        .slice(0, 4)
        .join('\n'),
    });
  }

  // Record notified IDs
  const newNotifiedIds = Array.from(
    new Set([...notifiedIds, ...unnotifiedCases.map((c) => `${c.id}_${c.nextHearingDate}`)])
  );
  sessionStorage.setItem(notifiedKey, JSON.stringify(newNotifiedIds));
}
