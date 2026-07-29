import { Case, Client } from '../types';

export interface EmailReminderSettings {
  enable7Days: boolean;
  enable3Days: boolean;
  enable1Day: boolean;
  advocateEmail: string;
  advocateName: string;
  firmName: string;
  autoSendToClient: boolean;
}

export const DEFAULT_EMAIL_SETTINGS: EmailReminderSettings = {
  enable7Days: true,
  enable3Days: true,
  enable1Day: true,
  advocateEmail: 'advocate@lawfirm.com',
  advocateName: 'Adv. R. K. Sharma',
  firmName: 'Sharma & Associates Advocates',
  autoSendToClient: true,
};

export interface ReminderItem {
  id: string;
  caseItem: Case;
  client?: Client;
  daysNotice: 7 | 3 | 1 | 0;
  targetDate: string;
  recipientEmail: string;
  subject: string;
  body: string;
  status: 'PENDING' | 'SENT' | 'SKIPPED';
}

/**
 * Calculates days remaining from today (YYYY-MM-DD) to hearing date.
 */
export function getDaysUntilHearing(hearingDateStr: string | undefined): number {
  if (!hearingDateStr) return 999;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const [year, month, day] = hearingDateStr.split('-').map(Number);
  const target = new Date(year, month - 1, day);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Generates email subject and body for a given case and days notice.
 */
export function generateHearingEmailContent(
  caseItem: Case,
  daysNotice: 7 | 3 | 1 | 0,
  settings: EmailReminderSettings = DEFAULT_EMAIL_SETTINGS
) {
  const noticeText =
    daysNotice === 7
      ? 'In 7 Days'
      : daysNotice === 3
      ? 'In 3 Days'
      : daysNotice === 1
      ? 'Tomorrow'
      : 'Today';

  const subject = `⚖️ COURT HEARING REMINDER (${noticeText}): ${caseItem.caseNumber} - ${caseItem.caseTitle}`;

  const body = `Dear ${caseItem.clientName},

This is an official court hearing reminder from ${settings.firmName}.

Your case details are as follows:

• Case Number: ${caseItem.caseNumber}
• Case Title: ${caseItem.caseTitle}
• Court Name: ${caseItem.courtName} ${caseItem.courtHall ? `(${caseItem.courtHall})` : ''}
• Next Hearing Date: ${caseItem.nextHearingDate} (${noticeText})
• Case Stage: ${caseItem.stage}
• Client Role: ${caseItem.clientRole}
${caseItem.itemNumber ? `• Daily Board Item No: ${caseItem.itemNumber}\n` : ''}
Please ensure all required documents, affidavits, and court fee receipts are ready. Should you have any questions or require an update prior to the hearing, please contact our office.

Best regards,
${settings.advocateName}
${settings.firmName}
Email: ${settings.advocateEmail}
`;

  return { subject, body };
}

/**
 * Scans all cases and filters those that fall on 7-day, 3-day, 1-day, or today reminders.
 */
export function getUpcomingEmailReminderQueue(
  cases: Case[],
  clients: Client[],
  settings: EmailReminderSettings
): ReminderItem[] {
  const queue: ReminderItem[] = [];

  cases.forEach((c) => {
    if (c.status === 'Disposed') return;

    const daysLeft = getDaysUntilHearing(c.nextHearingDate);
    let daysNotice: 7 | 3 | 1 | 0 | null = null;

    if (daysLeft === 7 && settings.enable7Days) daysNotice = 7;
    else if (daysLeft === 3 && settings.enable3Days) daysNotice = 3;
    else if (daysLeft === 1 && settings.enable1Day) daysNotice = 1;
    else if (daysLeft === 0) daysNotice = 0;

    if (daysNotice !== null) {
      const client = clients.find((cli) => cli.id === c.clientId || cli.name === c.clientName);
      const recipientEmail = client?.email || settings.advocateEmail;
      const { subject, body } = generateHearingEmailContent(c, daysNotice, settings);

      queue.push({
        id: `rem-${c.id}-${daysNotice}`,
        caseItem: c,
        client,
        daysNotice,
        targetDate: c.nextHearingDate,
        recipientEmail,
        subject,
        body,
        status: 'PENDING',
      });
    }
  });

  return queue;
}

/**
 * Creates a mailto link string for launching email client.
 */
export function buildMailToUrl(toEmail: string, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}
