
import { User, UserRole, Entity, ContractStatus, RiskCategory, ContractData } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Sarah SCM', role: UserRole.SCM, entity: Entity.BRAZIL, isActive: true },
  { id: 'u3', name: 'Larry Legal', role: UserRole.CORPORATE_LEGAL, entity: Entity.LONDON, isActive: true },
  { id: 'u5', name: 'Chief CEO', role: UserRole.CEO, entity: Entity.LONDON, isActive: true },
  { id: 'u6', name: 'Adam Admin', role: UserRole.ADMIN, entity: Entity.LONDON, isActive: true },
];

export const INITIAL_TRIGGERS = [
  // Auto-detected
  { id: 't1', category: RiskCategory.FINANCIAL, description: 'OPEX > USD 1M', triggered: false },
  { id: 't2', category: RiskCategory.FINANCIAL, description: 'CAPEX > USD 5M', triggered: false },
  { id: 't3', category: RiskCategory.LEGAL, description: 'Liability cap < 100% contract value', triggered: false },
  { id: 't4', category: RiskCategory.OPERATIONAL, description: 'Contract > 3 years fixed', triggered: false },
  { id: 't5', category: RiskCategory.THIRD_PARTY, description: 'Subcontracting > 30% of scope', triggered: false },
  
  // Manual / Checklist
  { id: 't6', category: RiskCategory.THIRD_PARTY, description: 'Sole Source Supplier', triggered: false },
  { id: 't7', category: RiskCategory.ENVIRONMENTAL, description: 'Work involving hazardous materials', triggered: false },
  { id: 't8', category: RiskCategory.OPERATIONAL, description: 'Work in conflict zone / high security risk', triggered: false },
  { id: 't9', category: RiskCategory.LEGAL, description: 'High risk of IP infringement', triggered: false },
  { id: 't10', category: RiskCategory.FINANCIAL, description: 'Payment terms deviate from standard policy', triggered: false },
  { id: 't11', category: RiskCategory.ENVIRONMENTAL, description: 'Significant environmental impact potential', triggered: false },
];

export const EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.0,
  'BRL': 0.20, // 1 BRL = 0.20 USD
  'GBP': 1.27, // 1 GBP = 1.27 USD
  'XAF': 0.0016 // 1 XAF = 0.0016 USD
};

const createMockContract = (id: string, entity: Entity, status: ContractStatus, amount: number, title: string, project?: string): ContractData => {
  // Determine type: For mock purposes, large contracts are CAPEX, small are OPEX
  const contractType = amount > 5000000 ? 'CAPEX' : 'OPEX';
  
  const detectedTriggers = [];
  
  // Apply correct risk logic based on type
  if (contractType === 'OPEX' && amount > 1000000) {
    detectedTriggers.push({ id: 't1', category: RiskCategory.FINANCIAL, description: 'OPEX > USD 1M', triggered: true });
  }
  
  if (contractType === 'CAPEX' && amount > 5000000) {
    detectedTriggers.push({ id: 't2', category: RiskCategory.FINANCIAL, description: 'CAPEX > USD 5M', triggered: true });
  }
  
  const isHighRisk = detectedTriggers.length > 0;

  return {
    id,
    entity,
    department: 'Operations',
    title: title,
    project: project || 'General Operations',
    contractorName: `${title} Provider Ltd`,
    contractType,
    amount,
    currency: 'USD',
    originalAmount: amount,
    originalCurrency: 'USD',
    exchangeRate: 1.0,
    startDate: '2024-01-01',
    endDate: '2025-01-01',
    hasExtensionOptions: false,
    scopeOfWork: `Provision of ${title.toLowerCase()} services.`,
    backgroundNeed: 'Operational requirement.',
    tenderProcessSummary: 'Competitive tender.',
    specialConsiderations: 'None',
    technicalEvalSummary: 'Technically qualified.',
    commercialEvalSummary: 'Commercially aligned.',
    isStandardTerms: true,
    liabilityCapPercent: 100,
    isSubcontracting: false,
    subcontractingPercent: 0,
    riskDescription: 'Standard operational risks.',
    mitigationMeasures: 'Standard mitigation.',
    priceStructure: 'Fixed',
    status,
    submitterId: 'u1',
    submissionDate: Date.now() - Math.random() * 1000000000,
    detectedTriggers,
    isHighRisk,
    auditTrail: [],
    comments: [],
    hasUnreadComments: false,
    reviews: [],
    adHocReviewers: [],
    documents: [],
    aiRiskAnalysis: undefined,
    corporateApprovals: {},
    // Default DDQ for mocks
    ddqNumber: 'REEU3P-12345',
    ddqDate: '2023-06-15',
    ddqValidityDate: '2025-06-15',
    otherChecksDetails: 'Financial health check passed. QHSE audit score 92%.'
  };
};

export const MOCK_CONTRACTS: ContractData[] = [
  // EXISTING
  {
    id: 'CNT-2023-001',
    entity: Entity.BRAZIL,
    department: 'Drilling',
    title: 'Deepwater Rig Support',
    project: 'Pampo Enchova Redevelopment',
    contractorName: 'DeepSea Solutions',
    contractType: 'CAPEX',
    amount: 12000000,
    currency: 'USD',
    originalAmount: 60000000,
    originalCurrency: 'BRL',
    exchangeRate: 0.20,
    startDate: '2023-11-01',
    endDate: '2026-11-01',
    hasExtensionOptions: true,
    scopeOfWork: 'Provision of deepwater drilling rig support services.',
    backgroundNeed: 'Critical for Q4 campaign.',
    tenderProcessSummary: 'Competitive tender, 4 bidders.',
    specialConsiderations: 'None',
    technicalEvalSummary: 'Scored 85/100',
    commercialEvalSummary: 'Lowest compliant bidder',
    isStandardTerms: true,
    liabilityCapPercent: 100,
    isSubcontracting: false,
    subcontractingPercent: 0,
    riskDescription: 'Operational delays due to weather.',
    mitigationMeasures: 'Buffer built into schedule.',
    priceStructure: 'Fixed',
    status: ContractStatus.PENDING_CEO,
    submitterId: 'u1',
    submissionDate: Date.now() - 172800000,
    detectedTriggers: [
        { id: 't2', category: RiskCategory.FINANCIAL, description: 'CAPEX > USD 5M', triggered: true }
    ],
    isHighRisk: true,
    auditTrail: [
      { id: 'a1', timestamp: Date.now() - 172800000, userId: 'u1', userName: 'Sarah SCM', action: 'Submitted Contract' },
      { id: 'a3', timestamp: Date.now() - 85000000, userId: 'u3', userName: 'Larry Legal', action: 'Approved', details: 'Legal terms standard.' }
    ],
    comments: [
      { id: 'c2', userId: 'u1', userName: 'Sarah SCM', role: UserRole.SCM, text: 'Updated to standard 30 days net.', timestamp: Date.now() - 90000000 }
    ],
    hasUnreadComments: true,
    reviews: [
      { id: 'r2', reviewerId: 'u3', reviewerName: 'Larry Legal', role: UserRole.CORPORATE_LEGAL, decision: 'Approved', comment: 'Legal terms standard.', timestamp: Date.now() - 85000000 }
    ],
    adHocReviewers: [],
    documents: [
      { id: 'd1', name: 'Scope_Of_Work_vFinal.pdf', type: 'application/pdf', size: 1024000, uploadDate: Date.now() - 172800000 }
    ],
    aiRiskAnalysis: undefined,
    corporateApprovals: { legal: true },
    ddqNumber: 'REEU3P-98765',
    ddqDate: '2023-01-10',
    ddqValidityDate: '2025-01-10',
    otherChecksDetails: 'Standard technical qualification passed.'
  },
  {
    id: 'CNT-2023-002',
    entity: Entity.CONGO,
    department: 'Logistics',
    title: 'Routine Transport Services',
    project: 'Field Operations',
    contractorName: 'Local Transport Co',
    contractType: 'OPEX',
    amount: 800000,
    currency: 'USD',
    originalAmount: 500000000,
    originalCurrency: 'XAF',
    exchangeRate: 0.0016,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    hasExtensionOptions: false,
    scopeOfWork: 'Logistics support.',
    backgroundNeed: 'Routine transport.',
    tenderProcessSummary: 'Sole source justification provided.',
    specialConsiderations: 'None',
    technicalEvalSummary: 'Pass',
    commercialEvalSummary: 'Aligned with market rates',
    isStandardTerms: true,
    liabilityCapPercent: 100,
    isSubcontracting: true,
    subcontractingPercent: 10,
    riskDescription: 'Low risk.',
    mitigationMeasures: 'Standard insurance.',
    priceStructure: 'Fixed',
    status: ContractStatus.SUBMITTED,
    submitterId: 'u1',
    submissionDate: Date.now() - 3600000,
    detectedTriggers: [],
    isHighRisk: false,
    auditTrail: [
      { id: 'a4', timestamp: Date.now() - 3600000, userId: 'u1', userName: 'Sarah SCM', action: 'Submitted Contract' }
    ],
    comments: [],
    hasUnreadComments: false,
    reviews: [],
    adHocReviewers: [],
    documents: [],
    aiRiskAnalysis: undefined,
    corporateApprovals: {},
    ddqNumber: 'REEU3P-55555',
    ddqDate: '2023-08-20',
    ddqValidityDate: '2025-08-20',
    otherChecksDetails: 'Local compliance verification complete.'
  },
  
  // BRAZIL ADDITIONS (5)
  createMockContract('CNT-2023-003', Entity.BRAZIL, ContractStatus.APPROVED, 15000000, 'FPSO Maintenance', 'Pampo Enchova'),
  createMockContract('CNT-2023-004', Entity.BRAZIL, ContractStatus.SUBMITTED, 8000000, 'Support Vessel Charter', 'Offshore Logistics'),
  createMockContract('CNT-2023-005', Entity.BRAZIL, ContractStatus.REJECTED, 2000000, 'Offshore Catering', 'Pampo Enchova'),
  createMockContract('CNT-2023-006', Entity.BRAZIL, ContractStatus.DRAFT, 500000, 'Waste Management'),
  createMockContract('CNT-2023-007', Entity.BRAZIL, ContractStatus.PENDING_CEO, 45000000, 'Subsea Tree Installation', 'Pampo Enchova Revitalization'),

  // CONGO ADDITIONS (5)
  createMockContract('CNT-2023-008', Entity.CONGO, ContractStatus.APPROVED, 1200000, 'Road Maintenance'),
  createMockContract('CNT-2023-009', Entity.CONGO, ContractStatus.PENDING_CEO, 3000000, 'Site Security Services', 'Security Upgrade'),
  createMockContract('CNT-2023-010', Entity.CONGO, ContractStatus.CHANGES_REQUESTED, 5000000, 'Base Camp Construction', 'Moho Bilondo'),
  createMockContract('CNT-2023-011', Entity.CONGO, ContractStatus.SUBMITTED, 800000, 'Diesel Supply'),
  createMockContract('CNT-2023-012', Entity.CONGO, ContractStatus.APPROVED, 600000, 'Medical Services'),

  // EQUATORIAL GUINEA ADDITIONS (5)
  createMockContract('CNT-2023-013', Entity.EQUATORIAL_GUINEA, ContractStatus.PENDING_CEO, 12000000, 'Gas Turbine Overhaul', 'Zafiro Platform'),
  createMockContract('CNT-2023-014', Entity.EQUATORIAL_GUINEA, ContractStatus.APPROVED, 1500000, 'Scaffolding Services', 'Zafiro Platform'),
  createMockContract('CNT-2023-015', Entity.EQUATORIAL_GUINEA, ContractStatus.SUBMITTED, 900000, 'Paint & Blast', 'Jade Platform'),
  createMockContract('CNT-2023-016', Entity.EQUATORIAL_GUINEA, ContractStatus.DRAFT, 300000, 'Valve Supply'),
  createMockContract('CNT-2023-017', Entity.EQUATORIAL_GUINEA, ContractStatus.REJECTED, 2000000, 'Crane Rental', 'Serpentina'),

  // LONDON ADDITIONS (5)
  createMockContract('CNT-2023-018', Entity.LONDON, ContractStatus.PENDING_CEO, 5000000, 'ERP License Renewal', 'Corporate IT'),
  createMockContract('CNT-2023-019', Entity.LONDON, ContractStatus.APPROVED, 1000000, 'Global Audit Services', 'Finance'),
  createMockContract('CNT-2023-020', Entity.LONDON, ContractStatus.SUBMITTED, 2000000, 'Legal Counsel Retainer', 'Legal'),
  createMockContract('CNT-2023-021', Entity.LONDON, ContractStatus.PENDING_CEO, 8000000, 'New Office Lease', 'Facilities'),
  createMockContract('CNT-2023-022', Entity.LONDON, ContractStatus.CHANGES_REQUESTED, 1500000, 'IT Infrastructure Support', 'Corporate IT'),
];
