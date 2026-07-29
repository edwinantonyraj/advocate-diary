import { Case, Client, FeeTransaction } from '../types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Rajesh Malhotra',
    phone: '+91 98765 43210',
    email: 'rajesh.malhotra@gmail.com',
    address: 'B-14, Green Park Extension, New Delhi',
    company: 'Malhotra Logistics Pvt Ltd',
    notes: 'Key commercial client. Prefers WhatsApp updates on court dates.',
    createdAt: '2025-01-10',
  },
  {
    id: 'cli-2',
    name: 'Suman Sen Gupta',
    phone: '+91 98112 34567',
    email: 'suman.sen@yahoo.com',
    address: '42, Park Street, Civil Lines, Jaipur',
    company: 'Individual',
    notes: 'Property dispute client. Paid advance retainer.',
    createdAt: '2025-02-01',
  },
  {
    id: 'cli-3',
    name: 'Vikramaditya Rao',
    phone: '+91 97654 32109',
    email: 'v.rao@techcorp.in',
    address: 'Sector 62, Noida, UP',
    company: 'TechCorp Solutions',
    notes: 'Cheque Bounce and Recovery Suits.',
    createdAt: '2025-02-15',
  },
  {
    id: 'cli-4',
    name: 'Pooja Verma',
    phone: '+91 99001 12233',
    email: 'pooja.verma@hotmail.com',
    address: 'Model Town, Phase II, Delhi',
    company: 'Individual',
    notes: 'Family Court Matrimonial petition.',
    createdAt: '2025-03-01',
  }
];

// Helper date generator for realistic dates relative to today
const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];

const dateToday = formatDate(today);
const dateTomorrow = formatDate(new Date(today.getTime() + 86400000));
const dateIn3Days = formatDate(new Date(today.getTime() + 3 * 86400000));
const dateIn5Days = formatDate(new Date(today.getTime() + 5 * 86400000));
const dateIn7Days = formatDate(new Date(today.getTime() + 7 * 86400000));
const dateYesterday = formatDate(new Date(today.getTime() - 86400000));
const dateLastWeek = formatDate(new Date(today.getTime() - 7 * 86400000));

export const INITIAL_CASES: Case[] = [
  {
    id: 'case-101',
    caseNumber: 'WP (C) 4082/2025',
    cnrNumber: 'DLHC010892342025',
    caseTitle: 'Rajesh Malhotra vs. Municipal Corporation of Delhi',
    caseType: 'High Court Writ',
    courtName: 'High Court of Delhi',
    courtHall: 'Court Hall No. 4',
    judgeName: 'Hon\'ble Mr. Justice A. K. Sikri',
    itemNumber: 'Item 12',
    clientRole: 'Petitioner/Plaintiff',
    advocateFor: 'Petitioner 1',
    clientId: 'cli-1',
    clientName: 'Rajesh Malhotra',
    clientPhone: '+91 98765 43210',
    oppositeParty: 'Municipal Corporation of Delhi',
    oppositeLawyer: 'Adv. S. K. Nanda',
    stage: 'Final Arguments',
    status: 'Pending',
    nextHearingDate: dateToday,
    previousHearingDate: dateLastWeek,
    totalFee: 75000,
    paidFee: 50000,
    notes: 'Injunction against illegal demolition notice. Counter affidavit already filed.',
    hearingHistory: [
      {
        id: 'h-1',
        caseId: 'case-101',
        date: dateLastWeek,
        courtName: 'High Court of Delhi - Hall 4',
        judge: 'Hon\'ble Mr. Justice A. K. Sikri',
        stage: 'Arguments on Interim Relief',
        orderSummary: 'Court granted stay on demolition notice till next date. Directed respondent to file rejoinder.',
        nextDate: dateToday,
        actionItems: ['Prepare synopsis of facts', 'Print 3 copies of Supreme Court precedent judgment'],
        createdAt: dateLastWeek,
      }
    ],
    documents: [
      {
        id: 'doc-101-1',
        caseId: 'case-101',
        title: 'Interim Stay Order Copy',
        category: 'Court Order',
        dataUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:#f9f8f3; font-family:serif;"><rect x="20" y="20" width="560" height="760" fill="#fcfbf7" stroke="#333" stroke-width="2"/><rect x="30" y="30" width="540" height="740" fill="none" stroke="#666" stroke-width="0.5"/><circle cx="300" cy="90" r="30" fill="none" stroke="#2a4365" stroke-width="2"/><text x="300" y="95" text-anchor="middle" font-size="10" font-weight="bold" fill="#2a4365">HIGH COURT</text><text x="300" y="140" text-anchor="middle" font-size="16" font-weight="bold" fill="#111">IN THE HIGH COURT OF DELHI AT NEW DELHI</text><text x="300" y="160" text-anchor="middle" font-size="12" font-style="italic" fill="#444">EXTRAORDINARY ORIGINAL WRIT JURISDICTION</text><line x1="100" y1="175" x2="500" y2="175" stroke="#111" stroke-width="1"/><text x="300" y="200" text-anchor="middle" font-size="13" font-weight="bold" fill="#111">WRIT PETITION (CIVIL) NO. 4082 OF 2025</text><text x="60" y="240" font-size="12" font-weight="bold" fill="#222">IN THE MATTER OF:</text><text x="60" y="260" font-size="12" fill="#222">Rajesh Malhotra ... Petitioner</text><text x="300" y="280" text-anchor="middle" font-size="12" font-weight="bold" fill="#222">VERSUS</text><text x="60" y="300" font-size="12" fill="#222">Municipal Corporation of Delhi &amp; Anr. ... Respondents</text><line x1="60" y1="320" x2="540" y2="320" stroke="#ccc" stroke-width="1"/><text x="60" y="350" font-size="14" font-weight="bold" fill="#000">ORDER DATED 21-07-2025</text><text x="60" y="380" font-size="11" fill="#333">HON'BLE MR. JUSTICE A. K. SIKRI</text><text x="60" y="410" font-size="11" fill="#222">1. Heard learned advocate for the Petitioner and learned Counsel for MCD.</text><text x="60" y="435" font-size="11" fill="#222">2. Issue Notice. Mr. S. K. Nanda accepts notice on behalf of Respondent No. 1.</text><text x="60" y="460" font-size="11" fill="#222">3. In the interim, status quo regarding the suit property shall be maintained</text><text x="60" y="480" font-size="11" fill="#222">   by both parties until the next date of hearing.</text><text x="60" y="510" font-size="11" fill="#222">4. List on 28th July 2026 for further arguments.</text><rect x="420" y="650" width="120" height="60" fill="none" stroke="#2b6cb0" stroke-width="2" stroke-dasharray="4,2"/><text x="480" y="680" text-anchor="middle" font-size="10" font-weight="bold" fill="#2b6cb0">HIGH COURT OF DELHI</text><text x="480" y="695" text-anchor="middle" font-size="9" fill="#2b6cb0">CERTIFIED COPY</text></svg>`),
        capturedAt: '2025-07-21T11:30:00.000Z',
        notes: 'Certified copy of stay order granted by Hon\'ble Bench.',
      },
      {
        id: 'doc-101-2',
        caseId: 'case-101',
        title: 'Vakalatnama & Memo of Appearance',
        category: 'Vakalatnama',
        dataUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:#fefefe; font-family:sans-serif;"><rect x="20" y="20" width="560" height="760" fill="#fff" stroke="#444" stroke-width="2"/><rect x="40" y="40" width="200" height="60" fill="#e2e8f0" stroke="#94a3b8"/><text x="140" y="75" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e293b">COURT FEE STAMP ₹100</text><text x="300" y="140" text-anchor="middle" font-size="18" font-weight="bold" fill="#000">VAKALATNAMA</text><text x="300" y="170" text-anchor="middle" font-size="12" fill="#333">IN THE HIGH COURT OF DELHI</text><text x="60" y="220" font-size="12" font-weight="bold">WP (C) NO. 4082 / 2025</text><text x="60" y="260" font-size="11">I/We, Rajesh Malhotra, the Petitioner in the above mentioned case,</text><text x="60" y="280" font-size="11">do hereby appoint and authorize Advocate to appear, plead and act for me/us.</text><line x1="60" y1="550" x2="250" y2="550" stroke="#000"/><text x="155" y="570" text-anchor="middle" font-size="11" font-weight="bold">SIGNATURE OF CLIENT</text><line x1="350" y1="550" x2="540" y2="550" stroke="#000"/><text x="445" y="570" text-anchor="middle" font-size="11" font-weight="bold">ADVOCATE ENROLMENT NO.</text></svg>`),
        capturedAt: '2025-01-14T09:15:00.000Z',
        notes: 'Original signed Vakalatnama on record.',
      }
    ],
    createdAt: '2025-01-15',
    updatedAt: dateLastWeek,
  },
  {
    id: 'case-102',
    caseNumber: 'OS 142/2024',
    cnrNumber: 'RJJ1020304052024',
    caseTitle: 'Suman Sen Gupta vs. Anita Roy & Others',
    caseType: 'Civil Suit',
    courtName: 'District & Sessions Court, Jaipur',
    courtHall: 'Court Hall 7',
    judgeName: 'Sh. M. P. Sharma, ADJ-2',
    itemNumber: 'Item 05',
    clientRole: 'Petitioner/Plaintiff',
    clientId: 'cli-2',
    clientName: 'Suman Sen Gupta',
    clientPhone: '+91 98112 34567',
    oppositeParty: 'Anita Roy & Others',
    oppositeLawyer: 'Adv. Rameshwar Prasad',
    stage: 'Plaintiff Evidence (PW-1 Cross Ex)',
    status: 'Pending',
    nextHearingDate: dateToday,
    previousHearingDate: dateLastWeek,
    totalFee: 50000,
    paidFee: 30000,
    notes: 'Partition suit for ancestral property at Civil Lines. Bring original sale deed copies.',
    hearingHistory: [
      {
        id: 'h-2',
        caseId: 'case-102',
        date: dateLastWeek,
        courtName: 'District & Sessions Court, Jaipur',
        judge: 'Sh. M. P. Sharma',
        stage: 'Filing Documents',
        orderSummary: 'Plaintiff exhibit documents admitted. Case fixed for PW-1 cross examination.',
        nextDate: dateToday,
        actionItems: ['Brief client Suman Sen Gupta for cross examination questions'],
        createdAt: dateLastWeek,
      }
    ],
    createdAt: '2024-11-10',
    updatedAt: dateLastWeek,
  },
  {
    id: 'case-103',
    caseNumber: 'CC 8920/2024',
    cnrNumber: 'UPGB030991232024',
    caseTitle: 'TechCorp Solutions vs. Apex Infrastructure Ltd',
    caseType: 'Cheque Bounce (Sec 138)',
    courtName: 'Metropolitan Magistrate Court, Noida',
    courtHall: 'Room No. 202',
    judgeName: 'Ms. Neha Gupta, MM',
    itemNumber: 'Item 18',
    clientRole: 'Petitioner/Plaintiff',
    clientId: 'cli-3',
    clientName: 'Vikramaditya Rao',
    clientPhone: '+91 97654 32109',
    oppositeParty: 'Apex Infrastructure Ltd & Anr',
    oppositeLawyer: 'Adv. K. K. Mishra',
    stage: 'Frame of Notice / Plea Recording',
    status: 'Pending',
    nextHearingDate: dateTomorrow,
    previousHearingDate: dateYesterday,
    totalFee: 40000,
    paidFee: 25000,
    notes: 'Dishonour of cheque worth ₹12,50,000 for unpaid IT services.',
    hearingHistory: [
      {
        id: 'h-3',
        caseId: 'case-103',
        date: dateYesterday,
        courtName: 'MM Court, Noida',
        judge: 'Ms. Neha Gupta',
        stage: 'Appearance of Accused',
        orderSummary: 'Accused appeared on bail. Bail bonds accepted. Matter adjourned for framing of notice.',
        nextDate: dateTomorrow,
        actionItems: ['Verify original bank return memo'],
        createdAt: dateYesterday,
      }
    ],
    createdAt: '2024-12-01',
    updatedAt: dateYesterday,
  },
  {
    id: 'case-104',
    caseNumber: 'HMA 210/2025',
    cnrNumber: 'DLFC010045672025',
    caseTitle: 'Pooja Verma vs. Karan Verma',
    caseType: 'Family Court / Matrimonial',
    courtName: 'Family Court, Saket Courts, New Delhi',
    courtHall: 'Court Hall 2',
    judgeName: 'Principal Judge S. L. Varma',
    itemNumber: 'Item 08',
    clientRole: 'Petitioner/Plaintiff',
    clientId: 'cli-4',
    clientName: 'Pooja Verma',
    clientPhone: '+91 99001 12233',
    oppositeParty: 'Karan Verma',
    oppositeLawyer: 'Adv. Meenakshi Sundaram',
    stage: 'Counseling / Mediation Report',
    status: 'Pending',
    nextHearingDate: dateIn3Days,
    previousHearingDate: dateLastWeek,
    totalFee: 60000,
    paidFee: 35000,
    notes: 'Petition under Sec 13(1)(ia) for divorce and interim maintenance.',
    hearingHistory: [
      {
        id: 'h-4',
        caseId: 'case-104',
        date: dateLastWeek,
        courtName: 'Family Court Saket',
        judge: 'Principal Judge S. L. Varma',
        stage: 'Mediation Reference',
        orderSummary: 'Both parties sent to Mediation Centre. Report awaited.',
        nextDate: dateIn3Days,
        actionItems: ['Follow up with Mediation officer for settlement terms draft'],
        createdAt: dateLastWeek,
      }
    ],
    createdAt: '2025-01-20',
    updatedAt: dateLastWeek,
  },
  {
    id: 'case-105',
    caseNumber: 'ARB 18/2024',
    cnrNumber: 'DLHC010099882024',
    caseTitle: 'Malhotra Logistics vs. Global Warehousing Corp',
    caseType: 'Arbitration',
    courtName: 'Sole Arbitrator Tribunal',
    courtHall: 'Arbitration Centre, Delhi High Court',
    judgeName: 'Justice (Retd.) B. N. Kirpal',
    itemNumber: 'Session 1',
    clientRole: 'Petitioner/Plaintiff',
    clientId: 'cli-1',
    clientName: 'Rajesh Malhotra',
    clientPhone: '+91 98765 43210',
    oppositeParty: 'Global Warehousing Corp',
    oppositeLawyer: 'Adv. Tariq Ahmad',
    stage: 'Claim Statement Arguments',
    status: 'Pending',
    nextHearingDate: dateIn5Days,
    previousHearingDate: dateLastWeek,
    totalFee: 120000,
    paidFee: 80000,
    notes: 'Claim for warehouse breach damages worth ₹45 Lakhs.',
    hearingHistory: [],
    createdAt: '2024-10-05',
    updatedAt: dateLastWeek,
  },
  {
    id: 'case-106',
    caseNumber: 'CRA 88/2023',
    cnrNumber: 'RJHC010022332023',
    caseTitle: 'State of Rajasthan vs. Suresh Meena',
    caseType: 'Criminal Case',
    courtName: 'High Court of Rajasthan',
    courtHall: 'Bench 2',
    judgeName: 'Hon\'ble Ms. Justice R. Bhatnagar',
    itemNumber: 'Item 33',
    clientRole: 'Respondent/Defendant',
    clientId: 'cli-2',
    clientName: 'Suman Sen Gupta',
    clientPhone: '+91 98112 34567',
    oppositeParty: 'State of Rajasthan',
    oppositeLawyer: 'Public Prosecutor J. P. Sharma',
    stage: 'Acquittal Order Confirmed',
    status: 'Disposed',
    nextHearingDate: dateIn7Days,
    previousHearingDate: dateLastWeek,
    totalFee: 45000,
    paidFee: 45000,
    notes: 'State appeal dismissed. Acquittal upheld.',
    hearingHistory: [],
    createdAt: '2023-08-12',
    updatedAt: dateLastWeek,
  }
];

export const INITIAL_TRANSACTIONS: FeeTransaction[] = [
  {
    id: 'tx-1',
    caseId: 'case-101',
    caseNumber: 'WP (C) 4082/2025',
    caseTitle: 'Rajesh Malhotra vs. MCD',
    clientId: 'cli-1',
    clientName: 'Rajesh Malhotra',
    date: '2025-01-15',
    amount: 50000,
    type: 'Payment',
    paymentMethod: 'UPI / GPay',
    receiptNo: 'REC-2025-001',
    notes: 'Advance Retainer Fee',
  },
  {
    id: 'tx-2',
    caseId: 'case-102',
    caseNumber: 'OS 142/2024',
    caseTitle: 'Suman Sen Gupta vs. Anita Roy',
    clientId: 'cli-2',
    clientName: 'Suman Sen Gupta',
    date: '2025-02-01',
    amount: 30000,
    type: 'Payment',
    paymentMethod: 'Bank Transfer',
    receiptNo: 'REC-2025-002',
    notes: 'Evidence stage installment',
  },
  {
    id: 'tx-3',
    caseId: 'case-103',
    caseNumber: 'CC 8920/2024',
    caseTitle: 'TechCorp Solutions vs. Apex Infra',
    clientId: 'cli-3',
    clientName: 'Vikramaditya Rao',
    date: '2025-02-15',
    amount: 25000,
    type: 'Payment',
    paymentMethod: 'Cheque',
    receiptNo: 'REC-2025-003',
    notes: 'Filing and notice fees',
  },
  {
    id: 'tx-4',
    caseId: 'case-101',
    caseNumber: 'WP (C) 4082/2025',
    caseTitle: 'Rajesh Malhotra vs. MCD',
    clientId: 'cli-1',
    clientName: 'Rajesh Malhotra',
    date: '2025-02-20',
    amount: 3500,
    type: 'Court Fee Expense',
    paymentMethod: 'Cash',
    receiptNo: 'EXP-101',
    notes: 'Court stamps and process fee',
  }
];

// Storage Keys
const LOCAL_STORAGE_KEY = 'advocate_diary_app_state_v1';

export function loadAppState() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load advocate diary state from localStorage:', e);
  }
  return {
    cases: INITIAL_CASES,
    clients: INITIAL_CLIENTS,
    transactions: INITIAL_TRANSACTIONS,
    selectedDate: dateToday,
  };
}

export function saveAppState(state: { cases: Case[]; clients: Client[]; transactions: FeeTransaction[]; selectedDate?: string }) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function resetAppState() {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  return {
    cases: INITIAL_CASES,
    clients: INITIAL_CLIENTS,
    transactions: INITIAL_TRANSACTIONS,
    selectedDate: dateToday,
  };
}
