export type CaseStatus = 'Pending' | 'Disposed' | 'Stayed' | 'Reserved for Order' | 'Transferred';

export type CaseType = 
  | 'Civil Suit'
  | 'Criminal Case'
  | 'High Court Writ'
  | 'Bail Application'
  | 'Family Court / Matrimonial'
  | 'Consumer Forum'
  | 'Arbitration'
  | 'Labour / Industrial'
  | 'Revenue / Land'
  | 'Cheque Bounce (Sec 138)'
  | 'Motor Accident Claims (MACT)'
  | 'Other';

export interface HearingNote {
  id: string;
  caseId: string;
  date: string; // YYYY-MM-DD
  courtName: string;
  judge?: string;
  stage: string;
  orderSummary: string;
  nextDate?: string;
  costImposed?: number;
  actionItems?: string[];
  createdAt: string;
}

export interface CaseDocument {
  id: string;
  caseId: string;
  title: string;
  category: 'Scanned Document' | 'Petition / Plaint' | 'Court Order' | 'Vakalatnama' | 'Evidence' | 'Notice' | 'Other';
  dataUrl: string; // Base64 image
  capturedAt: string;
  notes?: string;
}

export interface Case {
  id: string;
  caseNumber: string; // e.g., "WP (C) 1204/2024" or "OS 45/2023"
  cnrNumber?: string; // Central National Record ID
  caseTitle: string; // e.g., "Ramesh Sharma vs. Union of India"
  caseType: CaseType;
  courtName: string; // e.g., "High Court Bench No. 3" or "District & Sessions Court, Hall 12"
  courtHall?: string; // e.g., "Court Hall 14"
  judgeName?: string; // e.g., "Hon'ble Mr. Justice R. K. Verma"
  itemNumber?: string; // e.g., "Item No. 24"
  clientRole: 'Petitioner/Plaintiff' | 'Respondent/Defendant' | 'Opposite Party' | 'Third Party';
  advocateFor?: string; // e.g. "OP 1", "OP 2", "OP 1 to 10", "Petitioner 1 & 2"
  clientId: string;
  clientName: string;
  clientPhone: string;
  oppositeParty: string;
  oppositeLawyer?: string;
  stage: string; // e.g., "Filing Reply", "Evidence", "Arguments", "Admission"
  status: CaseStatus;
  nextHearingDate: string; // YYYY-MM-DD
  previousHearingDate?: string;
  totalFee: number;
  paidFee: number;
  notes?: string;
  hearingHistory: HearingNote[];
  documents?: CaseDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  company?: string;
  notes?: string;
  createdAt: string;
}

export interface FeeTransaction {
  id: string;
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  clientId: string;
  clientName: string;
  date: string;
  amount: number;
  type: 'Payment' | 'Retainer' | 'Court Fee Expense' | 'Misc Expense';
  paymentMethod: 'Cash' | 'UPI / GPay' | 'Bank Transfer' | 'Cheque' | 'Card';
  receiptNo?: string;
  notes?: string;
}

export interface AppState {
  cases: Case[];
  clients: Client[];
  transactions: FeeTransaction[];
  selectedDate: string; // Current cause list date filter
}
