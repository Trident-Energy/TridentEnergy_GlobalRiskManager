
import { Risk, Country, RiskCategory, RiskStatus, ControlRating, ActionPlan, Comment, User, EscalationLevel } from './types';

// Country Config
export const COUNTRIES = [
  { code: Country.UK, label: 'United Kingdom', flagUrl: 'https://flagcdn.com/w80/gb.png' },
  { code: Country.BR, label: 'Brazil', flagUrl: 'https://flagcdn.com/w80/br.png' },
  { code: Country.GQ, label: 'Equatorial Guinea', flagUrl: 'https://flagcdn.com/w80/gq.png' }, // Updated flag and code
  { code: Country.CG, label: 'Congo', flagUrl: 'https://flagcdn.com/w80/cg.png' }
];

export const GROUPS = [
  { id: 'REG_BR', label: 'Country Risk Register BR' },
  { id: 'REG_GQ', label: 'Country Risk Register GQ' },
  { id: 'REG_CG', label: 'Country Risk Register CG' },
];

export const ESCALATION_LEVELS = [
  EscalationLevel.FUNCTIONAL_L1,
  EscalationLevel.COUNTRY_GM,
  EscalationLevel.TEML_L1,
  EscalationLevel.CEO
];

// Column Definitions for Visibility Toggling
export const AVAILABLE_COLUMNS = [
  { key: 'warning', label: 'Warnings', mandatory: true },
  { key: 'role', label: 'My Role' },
  { key: 'escalation', label: 'Escalation' },
  { key: 'comments', label: 'Comments' },
  { key: 'creationDate', label: 'Created Date' },
  { key: 'country', label: 'Country' },
  { key: 'register', label: 'Risk Register' },
  { key: 'id', label: 'Risk ID', mandatory: true },
  { key: 'trend', label: 'Trend' },
  { key: 'title', label: 'Risk Title', mandatory: true },
  { key: 'owner', label: 'Risk Owner' },
  { key: 'functionArea', label: 'Function/Area' },
  { key: 'inherentScore', label: 'Inherent Score' },
  { key: 'controlsRating', label: 'Controls Rating' },
  { key: 'residualScore', label: 'Residual Score' },
  { key: 'status', label: 'Status' },
  { key: 'lastReviewDate', label: 'Last Review Date' },
  { key: 'lastReviewer', label: 'Last Reviewer' },
];

// Options Configuration
export const IMPACT_OPTIONS = [
  { value: 1, label: '1 - Negligible' },
  { value: 2, label: '2 - Marginal' },
  { value: 3, label: '3 - Average' },
  { value: 4, label: '4 - Severe' },
  { value: 5, label: '5 - Catastrophic' },
];

export const LIKELIHOOD_OPTIONS = [
  { value: 1, label: '1 - Extremely Remote' },
  { value: 2, label: '2 - Remote' },
  { value: 3, label: '3 - Unlikely' },
  { value: 4, label: '4 - Likely' },
  { value: 5, label: '5 - Very Likely' },
];

export const PRINCIPAL_RISKS = [
  'Risk of asset integrity breach or major production failure',
  'Risk of failure to deliver operations, development and subsurface objectives',
  'Risk of major cyber attack and business continuity',
  'Lack of adherence to health, safety, environment and security policies',
  'Not Applicable'
];

// Full Risk Register to Function/Area Mapping
export const RISK_REGISTER_DATA = [
  { register: "CEO", functionArea: "Strategic and Entity Level risks (e.g. M&A)" },
  { register: "Business Development", functionArea: "Strategic and Entity Level risks (e.g. M&A)" },
  { register: "BR Country", functionArea: "Strategic and Entity Level risks (e.g. M&A)" },
  { register: "GQ Country", functionArea: "Strategic and Entity Level risks (e.g. M&A)" }, // Updated text
  { register: "Supply Chain", functionArea: "Supply Chain" },
  { register: "Comms", functionArea: "HR" },
  { register: "HR", functionArea: "HR" },
  { register: "IT", functionArea: "IT" },
  { register: "COO", functionArea: "Operations and Integrity" },
  { register: "Production", functionArea: "Operations and Integrity" },
  { register: "Subsurface", functionArea: "Operations and Integrity" },
  { register: "Operations", functionArea: "Operations and Integrity" },
  { register: "Group Drilling Manager", functionArea: "Operations and Integrity" },
  { register: "CTO", functionArea: "Projects" },
  { register: "Well decommissioning", functionArea: "Projects" },
  { register: "HSE", functionArea: "HSE" },
  { register: "Government relations", functionArea: "HSE" },
  { register: "Legal", functionArea: "Compliance" },
  { register: "CFO", functionArea: "Finance and Liquidity" },
  { register: "Finance", functionArea: "Finance and Liquidity" },
  { register: "Treasury", functionArea: "Finance and Liquidity" },
  { register: "Tax", functionArea: "Finance and Liquidity" },
  { register: "Integrity Brazil - Flag and Class including walkways Risk Register", functionArea: "Operations and Integrity" },
  { register: "Integrity Brazil - General Maintenance Risk Register", functionArea: "Operations and Integrity" },
  { register: "Integrity Brazil - SGIP (Well Integrity) Risk Register", functionArea: "Operations and Integrity" },
  { register: "Integrity Brazil - SGSO Risk Register", functionArea: "Operations and Integrity" },
  { register: "Integrity Brazil - SGSS ( Subsea & pipeline integrity) Risk Register", functionArea: "Operations and Integrity" },
  { register: "Integrity GQ - General Maintenance, SCE, Walkways, Accommodation Ceiba Risk Register", functionArea: "Operations and Integrity" }, // Updated
  { register: "Integrity GQ - General Maintenance, SCE, Walkways, Accommodation Okume Risk Register", functionArea: "Operations and Integrity" }, // Updated
  { register: "Integrity GQ - Subsea structures & Rotative equipment Risk Register", functionArea: "Operations and Integrity" }, // Updated
  { register: "Integrity GQ - Top side, pipeline and Marine Structural Risk Register", functionArea: "Operations and Integrity" }, // Updated
  { register: "Integrity GQ - Well integrity Risk Register", functionArea: "Operations and Integrity" }, // Updated
  { register: "GQ Drilling Campaign (Project)", functionArea: "Projects" }, // Updated
  { register: "Foxtrot Compression Project", functionArea: "Projects" },
  { register: "Integrity GQ - General Maintenance, SCE, Walkways, Accommodation Risk Register", functionArea: "Operations and Integrity" }, // Updated
  { register: "Environmental, Social, and Governance (ESG)", functionArea: "HSE" },
  { register: "Subsea decommissioning", functionArea: "Projects" },
  { register: "BRAVO FSO Project", functionArea: "Projects" },
  { register: "Offshore Structures Brazil", functionArea: "Operations and Integrity" },
  { register: "CG Country", functionArea: "Strategic and Entity Level risks (e.g. M&A)" },
  { register: "CG Deputy country", functionArea: "Strategic and Entity Level risks (e.g. M&A)" },
  { register: "TEdB Topside Projects", functionArea: "Operations and Integrity" },
  { register: "Well Services", functionArea: "Projects" },
  { register: "CG Integrity", functionArea: "Operations and Integrity" },
  { register: "P-65 Decommissioning", functionArea: "Projects" },
  { register: "FLNG", functionArea: "Projects" },
  { register: "BR Asset", functionArea: "Operations and Integrity" },
  // Fallbacks for existing mock data
  { register: "UK Corporate", functionArea: "Strategic and Entity Level risks (e.g. M&A)" },
  { register: "Corporate", functionArea: "Strategic and Entity Level risks (e.g. M&A)" }
].sort((a, b) => a.register.localeCompare(b.register));


// Calculation Logic
export const calculateRiskScore = (impact: number, likelihood: number): number => impact * likelihood;

/**
 * Calculates Risk Level based on the Heat Map Matrix.
 * Red (Significant): Score >= 15
 * Yellow (Moderate): Score >= 8 OR Impact == 5
 * Green (Low): Everything else
 */
export const getRiskLevel = (score: number, impact: number) => {
  if (score >= 15) return { label: 'Significant', color: 'bg-red-600 text-white', dot: 'bg-white' };
  
  // Moderate covers the 8-12 range, PLUS (5,1) which is score 5 but impact 5
  if (score >= 8 || impact === 5) return { label: 'Moderate', color: 'bg-yellow-400 text-slate-900', dot: 'bg-slate-900' };
  
  return { label: 'Low', color: 'bg-emerald-600 text-white', dot: 'bg-white' };
};

/**
 * Control Rating Classification Logic:
 * Adequate (Green): Excellent (5), Good (4)
 * Fair (Amber): Fair (3)
 * Inadequate (Red): Poor (2), Unsatisfactory (1)
 */
export const getControlRatingColor = (rating: string) => {
  switch (rating) {
    case ControlRating.EXCELLENT: 
    case ControlRating.GOOD: 
      return 'bg-green-600 text-white'; // Adequate
    case ControlRating.FAIR: 
      return 'bg-amber-400 text-slate-900'; // Fair
    case ControlRating.POOR: 
    case ControlRating.UNSATISFACTORY: 
      return 'bg-red-600 text-white'; // Inadequate
    default: return 'bg-slate-200 text-slate-600';
  }
};

// Mock Data - Updated with New Roles
export const MOCK_USERS: User[] = [
  { id: 'U1', name: 'Jane Doe', email: 'jane.doe@company.com', role: 'RMIA', groups: [] },
  { id: 'U2', name: 'Carlos Silva', email: 'carlos.silva@company.com', role: 'L2Manager', groups: ['REG_BR'] },
  { id: 'U3', name: 'Amara Ndiaye', email: 'amara.ndiaye@company.com', role: 'FunctionalManager', groups: ['REG_GQ'] },
  { id: 'U4', name: 'Jean-Luc M', email: 'jean.luc@company.com', role: 'CountryGM', groups: ['REG_CG'] },
  { id: 'U5', name: 'John Smith', email: 'john.smith@company.com', role: 'TEMLLeadership', groups: [] },
  { id: 'U6', name: 'Sarah Jenkins', email: 'sarah.jenkins@company.com', role: 'CEO', groups: [] },
  { id: 'U7', name: 'Francis Bidoul', email: 'francis.bidoul@company.com', role: 'L2Manager', groups: [] },
  { id: 'U8', name: 'Elodie Saurat', email: 'elodie.saurat@company.com', role: 'L2Manager', groups: [] },
];

export const MOCK_RISKS: Risk[] = [
  // Brazil Risks
  {
    id: 'BR-0001',
    creationDate: '2023-11-01',
    register: 'BR Asset',
    country: Country.BR,
    title: 'PCE-E3 - PROD - Export Oil Line Failure',
    description: 'Risk of unauthorized access to corporate networks through sophisticated phishing campaigns targeting finance department.',
    owner: 'Francis Bidoul',
    functionArea: 'Operations and Integrity',
    category: RiskCategory.OPERATIONAL,
    groupPrincipalRisk: 'Risk of asset integrity breach or major production failure',
    inherentImpact: 5,
    inherentLikelihood: 4, // 20
    controlsText: 'MFA enabled, quarterly training, email filtering.',
    controlsRating: ControlRating.EXCELLENT,
    residualImpact: 1,
    residualLikelihood: 1, // Score 1 (Low)
    status: RiskStatus.REVIEWED,
    lastReviewDate: '7/11/2025',
    lastReviewer: 'Elodie Saurat',
    collaborators: ['Mike Smith'],
    history: [
      { id: 'h1', date: '2023-11-01T08:00:00Z', user: 'Francis Bidoul', action: 'Risk Created', details: 'Initial risk creation' },
      { id: 'h2', date: '2024-05-12T14:30:00Z', user: 'Elodie Saurat', action: 'Residual Impact Changed', details: "From '3' to '1'" }, // Mock decrease
      { id: 'h2b', date: '2024-05-12T14:30:00Z', user: 'Elodie Saurat', action: 'Status Changed', details: 'From Open to Reviewed' }
    ],
    escalations: []
  },
  {
    id: 'BR-0002',
    creationDate: '2023-11-05',
    register: 'BR Asset',
    country: Country.BR,
    title: 'AII-E10 - CIM - O&G Import/Export Lines',
    description: 'Customs delays in Brazil impacting import of critical turbine spares leading to extended downtime.',
    owner: 'Francis Bidoul',
    functionArea: 'Operations and Integrity',
    category: RiskCategory.OPERATIONAL,
    groupPrincipalRisk: 'Risk of asset integrity breach or major production failure',
    inherentImpact: 4,
    inherentLikelihood: 5, // 20
    controlsText: 'Local warehousing of critical spares started.',
    controlsRating: ControlRating.FAIR,
    residualImpact: 3,
    residualLikelihood: 4, // Score 12 (Moderate)
    status: RiskStatus.REVIEWED,
    lastReviewDate: '',
    lastReviewer: 'Simon Grenville-Wood',
    collaborators: [],
    history: [
      { id: 'h3', date: '2023-11-05T09:15:00Z', user: 'Francis Bidoul', action: 'Risk Created', details: 'Initial risk creation' }
    ],
    escalations: [
       { level: EscalationLevel.FUNCTIONAL_L1, userId: 'U1', userName: 'Jane Doe', date: '2024-03-25T09:00:00Z' }
    ]
  },
  {
    id: 'BR-0003',
    creationDate: '2023-11-10',
    register: 'BR Asset',
    country: Country.BR,
    title: 'AII-E2 - CIM - Structural RTI / Audit Risk',
    description: 'Structural integrity issues identified during recent audit requiring immediate attention.',
    owner: 'Francis Bidoul',
    functionArea: 'Operations and Integrity',
    category: RiskCategory.OPERATIONAL, 
    groupPrincipalRisk: 'Risk of asset integrity breach or major production failure',
    inherentImpact: 5,
    inherentLikelihood: 4, // 20
    controlsText: 'Regular inspections scheduled.',
    controlsRating: ControlRating.POOR,
    residualImpact: 4,
    residualLikelihood: 4, // Score 16 (Significant)
    status: RiskStatus.REVIEWED,
    lastReviewDate: '7/11/2025',
    lastReviewer: 'Elodie Saurat',
    collaborators: [],
    history: [
      { id: 'h_inc1', date: '2024-06-01T09:00:00Z', user: 'Francis Bidoul', action: 'Residual Impact Changed', details: "From '3' to '4'" } // Mock Increase
    ]
  },
  // Added Mock Risk for Stable trend
   {
    id: 'BR-0004',
    creationDate: '2023-12-01',
    register: 'BR Asset',
    country: Country.BR,
    title: 'P-65 Production Bottleneck',
    description: 'Production limitation due to compressor availability.',
    owner: 'Francis Bidoul',
    functionArea: 'Operations and Integrity',
    category: RiskCategory.OPERATIONAL,
    groupPrincipalRisk: 'Risk of failure to deliver operations, development and subsurface objectives',
    inherentImpact: 4,
    inherentLikelihood: 3,
    controlsText: 'Maintenance overhaul planned.',
    controlsRating: ControlRating.GOOD,
    residualImpact: 3,
    residualLikelihood: 2,
    status: RiskStatus.REVIEWED,
    lastReviewDate: '2024-01-15',
    lastReviewer: 'Francis Bidoul',
    collaborators: [],
    history: [
       { id: 'h_stable', date: '2024-01-15T10:00:00Z', user: 'Francis Bidoul', action: 'Risk Reviewed', details: 'No changes to score.' }
    ]
  },
  
  // GQ Risks (Existing 2 + 2 New = 4 Total)
  {
    id: 'GQ-0001',
    creationDate: '2024-02-15',
    register: 'GQ Country',
    country: Country.GQ,
    title: 'Malabo Logistics Base Lease Renewal',
    description: 'Risk of significant rent increase or non-renewal of the primary logistics base lease in Malabo, potentially impacting supply chain continuity.',
    owner: 'Jane Doe',
    functionArea: 'Supply Chain',
    category: RiskCategory.STRATEGIC,
    groupPrincipalRisk: 'Risk of failure to deliver operations, development and subsurface objectives',
    inherentImpact: 4,
    inherentLikelihood: 3,
    controlsText: 'Early negotiations started. Alternative sites identified.',
    controlsRating: ControlRating.GOOD,
    residualImpact: 3,
    residualLikelihood: 2,
    status: RiskStatus.OPEN,
    lastReviewDate: '2024-02-20',
    lastReviewer: 'Jane Doe',
    collaborators: ['Amara Ndiaye'],
    history: [
      { id: 'h4', date: '2024-02-15T11:00:00Z', user: 'Jane Doe', action: 'Risk Created', details: 'Initial risk creation' },
      { id: 'h5', date: '2024-02-20T10:00:00Z', user: 'Amara Ndiaye', action: 'Controls Updated', details: 'Added alternative sites to mitigation strategy' }
    ]
  },
  {
    id: 'GQ-0002',
    creationDate: '2024-03-01',
    register: 'Integrity GQ - Well integrity Risk Register',
    country: Country.GQ,
    title: 'Zafiro Field - Aging Flowline Corrosion',
    description: 'Accelerated corrosion rates observed in sector 4 flowlines. Potential for leak if not replaced before next wet season.',
    owner: 'Amara Ndiaye',
    functionArea: 'Operations and Integrity',
    category: RiskCategory.OPERATIONAL,
    groupPrincipalRisk: 'Risk of asset integrity breach or major production failure',
    inherentImpact: 5,
    inherentLikelihood: 4,
    controlsText: 'Corrosion inhibitor injection increased. Inspection frequency doubled.',
    controlsRating: ControlRating.FAIR,
    residualImpact: 4,
    residualLikelihood: 3,
    status: RiskStatus.UPDATED,
    lastReviewDate: '2024-03-10',
    lastReviewer: 'Amara Ndiaye',
    collaborators: ['Jane Doe'],
    history: []
  },
  {
    id: 'GQ-0003',
    creationDate: '2024-03-15',
    register: 'Supply Chain',
    country: Country.GQ,
    title: 'Malabo Port Congestion',
    description: 'Increased vessel waiting times at Malabo port due to new customs clearance procedures, impacting critical material delivery.',
    owner: 'Jane Doe',
    functionArea: 'Supply Chain',
    category: RiskCategory.OPERATIONAL,
    groupPrincipalRisk: 'Risk of failure to deliver operations, development and subsurface objectives',
    inherentImpact: 3,
    inherentLikelihood: 4,
    controlsText: 'Fast-track clearance agent engaged. Inventory buffers increased.',
    controlsRating: ControlRating.GOOD,
    residualImpact: 3,
    residualLikelihood: 2,
    status: RiskStatus.OPEN,
    lastReviewDate: '2024-03-18',
    lastReviewer: 'Jane Doe',
    collaborators: [],
    history: []
  },
  {
    id: 'GQ-0004',
    creationDate: '2024-03-20',
    register: 'Legal',
    country: Country.GQ,
    title: 'Local Content Quota Update',
    description: 'Proposed legislative changes to increase local hiring quotas by 15% within 6 months.',
    owner: 'Amara Ndiaye',
    functionArea: 'Compliance',
    category: RiskCategory.COMPLIANCE,
    groupPrincipalRisk: 'Lack of adherence to health, safety, environment and security policies',
    inherentImpact: 4,
    inherentLikelihood: 3,
    controlsText: 'HR audit in progress. Recruitment drive planned.',
    controlsRating: ControlRating.FAIR,
    residualImpact: 3,
    residualLikelihood: 3,
    status: RiskStatus.OPEN,
    lastReviewDate: '',
    lastReviewer: '',
    collaborators: ['Jane Doe'],
    history: []
  },

  // CG Risks (Existing 2 + 2 New = 4 Total)
  {
    id: 'CG-0001',
    creationDate: '2024-02-18',
    register: 'CG Country',
    country: Country.CG,
    title: 'Regulatory Tax Audit - Pointe Noire',
    description: 'Upcoming comprehensive tax audit by local authorities. Potential for disputed interpretations of new tax code amendments.',
    owner: 'Jane Doe',
    functionArea: 'Finance and Liquidity',
    category: RiskCategory.FINANCIAL,
    groupPrincipalRisk: 'Lack of adherence to health, safety, environment and security policies',
    inherentImpact: 4,
    inherentLikelihood: 4,
    controlsText: 'External tax counsel engaged. Pre-audit internal review completed.',
    controlsRating: ControlRating.GOOD,
    residualImpact: 3,
    residualLikelihood: 3,
    status: RiskStatus.OPEN,
    lastReviewDate: '2024-02-25',
    lastReviewer: 'Jane Doe',
    collaborators: ['Jean-Luc M', 'Mike Smith'],
    history: []
  },
  {
    id: 'CG-0002',
    creationDate: '2024-03-05',
    register: 'CG Integrity',
    country: Country.CG,
    title: 'Dolphin Platform - Crane Reliability',
    description: 'Main deck crane experiencing intermittent hydraulic failures. Critical for upcoming maintenance campaign.',
    owner: 'Jean-Luc M',
    functionArea: 'Operations and Integrity',
    category: RiskCategory.OPERATIONAL,
    groupPrincipalRisk: 'Risk of asset integrity breach or major production failure',
    inherentImpact: 3,
    inherentLikelihood: 4,
    controlsText: 'Spare parts expedited. Specialist technician mobilized.',
    controlsRating: ControlRating.POOR,
    residualImpact: 3,
    residualLikelihood: 3,
    status: RiskStatus.OPEN,
    lastReviewDate: '2024-03-12',
    lastReviewer: 'Jean-Luc M',
    collaborators: ['Jane Doe', 'Sarah Jenkins'],
    history: []
  },
  {
    id: 'CG-0003',
    creationDate: '2024-03-25',
    register: 'Treasury',
    country: Country.CG,
    title: 'CEMAC Currency Restrictions',
    description: 'Stricter enforcement of central bank FX regulations delaying vendor payments.',
    owner: 'Jane Doe',
    functionArea: 'Finance and Liquidity',
    category: RiskCategory.FINANCIAL,
    groupPrincipalRisk: 'Risk of failure to deliver operations, development and subsurface objectives',
    inherentImpact: 4,
    inherentLikelihood: 4,
    controlsText: 'Meeting with Central Bank scheduled. Payment prioritization framework.',
    controlsRating: ControlRating.FAIR,
    residualImpact: 4,
    residualLikelihood: 3,
    status: RiskStatus.OPEN,
    lastReviewDate: '',
    lastReviewer: '',
    collaborators: [],
    history: []
  },
  {
    id: 'CG-0004',
    creationDate: '2024-03-28',
    register: 'HSE',
    country: Country.CG,
    title: 'Offshore Security Zone Encroachment',
    description: 'Increase in unauthorized fishing vessels entering exclusion zones around offshore assets.',
    owner: 'Jean-Luc M',
    functionArea: 'HSE',
    category: RiskCategory.STRATEGIC,
    groupPrincipalRisk: 'Lack of adherence to health, safety, environment and security policies',
    inherentImpact: 3,
    inherentLikelihood: 3,
    controlsText: 'Coast guard liaison strengthened. Radar monitoring enhanced.',
    controlsRating: ControlRating.GOOD,
    residualImpact: 2,
    residualLikelihood: 2,
    status: RiskStatus.OPEN,
    lastReviewDate: '',
    lastReviewer: '',
    collaborators: ['Jane Doe'],
    history: []
  }
];

// Generate limited UK mock data (Only 5 items)
for (let i = 0; i < 5; i++) {
  const seq = String(i + 1).padStart(4, '0');
  MOCK_RISKS.push({
    id: `UK-${seq}`,
    creationDate: '2024-03-01',
    register: 'UK Corporate',
    country: Country.UK,
    title: `UK Corporate Risk ${i + 1}`,
    description: 'Standard corporate risk entry for UK operations.',
    owner: 'System Admin',
    functionArea: 'Strategic and Entity Level risks (e.g. M&A)',
    category: i % 2 === 0 ? RiskCategory.OPERATIONAL : RiskCategory.FINANCIAL,
    groupPrincipalRisk: 'Not Applicable',
    inherentImpact: 3,
    inherentLikelihood: 3,
    controlsText: 'Standard controls.',
    controlsRating: ControlRating.GOOD,
    residualImpact: 2,
    residualLikelihood: 3,
    status: RiskStatus.OPEN,
    lastReviewDate: '2023-11-01',
    lastReviewer: 'System',
    collaborators: [],
    history: []
  });
}

export const MOCK_ACTIONS: ActionPlan[] = [
  {
    id: 'A-001',
    riskId: 'BR-0001', // Linked to BR-0001
    title: 'Identify Local Suppliers',
    description: 'Find alternate suppliers within Mercosur region to avoid trans-atlantic shipping delays.',
    owner: 'Carlos Silva',
    dueDate: '2023-12-31',
    status: 'Open',
    attachments: [
      {
        id: 'att-1',
        name: 'Supplier_Shortlist_v2.pdf',
        url: '#',
        type: 'application/pdf',
        size: 2048576,
        uploadDate: '2023-11-05T10:00:00Z'
      }
    ]
  },
   {
    id: 'A-002',
    riskId: 'BR-0002', // Linked to BR-0002
    title: 'Upgrade Firewall',
    description: 'Implement Next-Gen firewall with AI threat detection.',
    owner: 'Sarah Jenkins',
    dueDate: '2024-01-15',
    status: 'Open'
  },
  {
    id: 'A-003',
    riskId: 'BR-0003', // Linked to BR-0003
    title: 'Audit repair',
    description: 'Fix structural issues.',
    owner: 'Francis Bidoul',
    dueDate: '2025-01-15',
    status: 'Approved'
  },
  {
    id: 'A-004',
    riskId: 'BR-0002', // Linked to BR-0002 (O&G Import/Export)
    title: 'Order Spare',
    description: 'Order backup exchanger.',
    owner: 'Francis Bidoul',
    dueDate: '2025-02-01',
    status: 'Open'
  }
  // Risk 1059 intentionally has no actions for testing the warning icon
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'C-001',
    riskId: 'BR-0001', // Linked to BR-0001
    userId: 'U1',
    userName: 'Head of Ops',
    date: '2023-11-02T10:00:00Z',
    text: 'Please prioritize the local supplier search, downtime costs are rising.'
  },
  {
    id: 'C-002',
    riskId: 'BR-0001', // Linked to BR-0001
    userId: 'U2',
    userName: 'Carlos Silva',
    date: '2023-11-02T11:30:00Z',
    text: 'We are already in talks with three potential suppliers in Sao Paulo.',
    parentId: 'C-001'
  },
  {
    id: 'C-003',
    riskId: 'BR-0001', // Linked to BR-0001
    userId: 'U1',
    userName: 'Jane Doe',
    date: '2023-11-03T09:00:00Z',
    text: 'That sounds promising, Carlos. When can we expect a quote?',
    parentId: 'C-002'
  }
];
