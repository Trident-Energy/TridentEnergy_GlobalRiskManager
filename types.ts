
export enum Entity {
  BRAZIL = 'Brazil',
  CONGO = 'Congo',
  EQUATORIAL_GUINEA = 'Equatorial Guinea',
  LONDON = 'London'
}

export enum UserRole {
  SCM = 'SCM',
  CORPORATE_LEGAL = 'Contracts Lead',
  CEO = 'CEO',
  ADMIN = 'Admin'
}

export enum ContractStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted', // Waiting for Corporate
  PENDING_CEO = 'Pending CEO Approval',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CHANGES_REQUESTED = 'Changes Requested'
}

export enum RiskCategory {
  FINANCIAL = 'Financial',
  LEGAL = 'Legal/Contractual',
  OPERATIONAL = 'Operational',
  ENVIRONMENTAL = 'Environmental/Regulatory',
  THIRD_PARTY = 'Third Party'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  entity: Entity;
  avatar?: string;
  isActive: boolean;
}

export interface RiskTrigger {
  id: string;
  category: RiskCategory;
  description: string;
  triggered: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  userId: string;
  userName: string;
  action: string;
  details?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  text: string;
  timestamp: number;
  likes?: string[]; // Array of User IDs who liked the comment
}

export interface ContractReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  role: UserRole;
  decision: 'Approved' | 'Rejected' | 'Changes Requested';
  comment: string; // Justification
  timestamp: number;
  isAdHoc?: boolean;
}

export interface ContractDocument {
  id: string;
  name: string;
  type: string;
  size: number; // in bytes
  uploadDate: number;
  base64?: string; // Data URL for AI analysis
}

export interface AdHocReviewer {
  userId: string;
  userName: string;
  role: UserRole;
  addedBy: string;
  addedAt: number;
}

export interface ContractData {
  id: string;
  // Section 1: Company Details
  entity: Entity;
  department: string;
  sapNumber?: string;
  
  // Vendor Qualification (DDQ)
  ddqNumber?: string;
  ddqDate?: string;
  ddqValidityDate?: string;
  otherChecksDetails?: string;

  // Section 2: Contract Info
  title: string;
  project?: string; // New Field
  contractorName: string;
  contractType: 'CAPEX' | 'OPEX' | 'MIXED'; 
  
  // Financials
  amount: number; // USD Equivalent (Used for risk logic)
  currency: string; // Usually 'USD' in the backend, but we keep it for reference
  
  originalAmount: number; // Amount in local currency
  originalCurrency: string; // 'USD', 'BRL', 'GBP', 'XAF'
  exchangeRate: number; // Rate used for conversion

  startDate: string;
  endDate: string;
  hasExtensionOptions: boolean;
  scopeOfWork: string;

  // Section 3: Executive Summary
  backgroundNeed: string;
  tenderProcessSummary: string;
  specialConsiderations: string;

  // Section 4: Evaluation
  technicalEvalSummary: string;
  commercialEvalSummary: string;

  // Section 5: T&Cs
  isStandardTerms: boolean;
  deviationsDescription?: string;
  liabilityCapPercent: number; // For trigger check

  // Section 6: Subcontracting
  isSubcontracting: boolean;
  subcontractingPercent: number;

  // Section 7: Risk
  riskDescription: string;
  mitigationMeasures: string;

  // Section 8: Pricing
  priceStructure: 'Fixed' | 'Time & Materials' | 'Mixed';
  
  // System Metadata
  status: ContractStatus;
  submitterId: string;
  submissionDate?: number;
  detectedTriggers: RiskTrigger[];
  isHighRisk: boolean;
  
  // Approvals/Comments/Docs
  auditTrail: AuditLog[];
  comments: Comment[];
  hasUnreadComments?: boolean;
  reviews: ContractReview[];
  adHocReviewers: AdHocReviewer[];
  documents: ContractDocument[];
  aiRiskAnalysis?: string;
  corporateApprovals: {
    legal?: boolean;
  };
}
