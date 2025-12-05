
export enum Country {
  UK = 'UK',
  BR = 'BR',
  GQ = 'GQ', // Updated from EG
  CG = 'CG',
  ALL = 'ALL'
}

export enum RiskStatus {
  OPEN = 'Open',
  UPDATED = 'Updated',
  REVIEWED = 'Reviewed',
  CLOSED = 'Closed'
}

export enum RiskCategory {
  COMPLIANCE = 'Compliance Risk',
  FINANCIAL = 'Financial Risk',
  OPERATIONAL = 'Operational Risk',
  STRATEGIC = 'Strategic Risk'
}

export enum ControlRating {
  EXCELLENT = 'Excellent',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor',
  UNSATISFACTORY = 'Unsatisfactory'
}

export enum RiskLevel {
  LOW = 'Low',
  MODERATE = 'Moderate',
  SIGNIFICANT = 'Significant',
  EXTREME = 'Extreme'
}

export enum EscalationLevel {
  FUNCTIONAL_L1 = 'Functional Managers (L1)',
  COUNTRY_GM = 'Country GM Escalation',
  TEML_L1 = 'TEML L1 Escalation',
  CEO = 'CEO Escalation'
}

export type UserRole = 'RMIA' | 'L2Manager' | 'FunctionalManager' | 'CountryGM' | 'TEMLLeadership' | 'CEO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  groups: string[]; // e.g., "Country Risk Register BR"
  avatar?: string;
}

export interface Comment {
  id: string;
  riskId: string;
  userId: string;
  userName: string;
  date: string; // ISO date string
  text: string;
  parentId?: string; // ID of the parent comment if this is a reply
}

export interface Attachment {
  id: string;
  name: string;
  url: string; // In a real app, this is the cloud storage URL. For mock, it's a blob or placeholder.
  type: string;
  size: number;
  uploadDate: string;
}

export interface ActionPlan {
  id: string;
  riskId: string;
  title: string; // "Action"
  description: string; // "Detailed mitigation action plan"
  owner: string;
  dueDate: string;
  status: 'Open' | 'Closed' | 'Approved';
  attachments?: Attachment[];
}

export interface AuditLogEntry {
  id: string;
  date: string; // ISO date string
  user: string;
  action: string; // Short description e.g., "Status Changed"
  details: string; // Detailed change e.g., "From 'Open' to 'Reviewed'"
}

export interface EscalationEntry {
  level: EscalationLevel;
  userId: string;
  userName: string;
  date: string;
}

export interface Risk {
  id: string;
  creationDate: string; // ISO Date "YYYY-MM-DD"
  register: string; // e.g. "BR Asset", "UK Corporate"
  country: Country;
  title: string;
  description: string;
  owner: string;
  functionArea: string; // e.g. "Operations", "Finance"
  category: RiskCategory;
  groupPrincipalRisk: string;
  
  // Inherent
  inherentImpact: number; // 1-5
  inherentLikelihood: number; // 1-5
  
  // Residual
  controlsText: string;
  controlsRating: ControlRating;
  residualImpact: number; // 1-5
  residualLikelihood: number; // 1-5
  
  // Meta
  status: RiskStatus;
  lastReviewDate: string;
  lastReviewer: string;
  collaborators: string[];
  history?: AuditLogEntry[];
  
  // Escalation
  escalations?: EscalationEntry[];
}

// Helper types for charts
export interface RiskDistribution {
  name: string;
  value: number;
  color: string;
}
